
// Generate PDF Report
async function generatePDFReport() {
    try {
        showLoading(true);

        const currentUser = getCurrentUser();
        const allSubmissions = await getAllSubmissions();
        const mySubmissions = allSubmissions.filter(sub =>
            sub.StudentEmail === currentUser.email &&
            (sub.VerificationStatus === 'Approved' || sub.SubmittedBy === 'Admin')
        );

        if (mySubmissions.length === 0) {
            showToast('No approved submissions to include in report', 'info');
            showLoading(false);
            return;
        }

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add header with logo/title
        doc.setFillColor(0, 69, 135); // Nord Anglia blue
        doc.rect(0, 0, 210, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('FITNESS CHALLENGE REPORT', 105, 15, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(currentUser.name, 105, 25, { align: 'center' });

        const reportDate = new Date().toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        doc.setFontSize(10);
        doc.text(reportDate, 105, 30, { align: 'center' });

        // Reset text color
        doc.setTextColor(0, 0, 0);

        // Calculate overall stats
        let totalPoints = 0;
        const challengeResults = {};

        mySubmissions.forEach(sub => {
            const points = parseInt(sub.Points) || 0;

            if (!challengeResults[sub.Challenge] ||
                shouldReplaceBest(parseFloat(sub.Result), challengeResults[sub.Challenge].result, sub.Challenge)) {

                if (challengeResults[sub.Challenge]) {
                    totalPoints -= challengeResults[sub.Challenge].points;
                }

                challengeResults[sub.Challenge] = {
                    result: parseFloat(sub.Result),
                    unit: sub.Unit,
                    points: points,
                    date: sub.Timestamp
                };

                totalPoints += points;
            }
        });

        const challengesCompleted = Object.keys(challengeResults).length;

        // Overall Summary Box
        doc.setFillColor(240, 248, 255);
        doc.rect(15, 40, 180, 25, 'F');
        doc.setDrawColor(0, 69, 135);
        doc.setLineWidth(0.5);
        doc.rect(15, 40, 180, 25);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 69, 135);
        doc.text('OVERALL PERFORMANCE', 105, 48, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Points: ${totalPoints} | Challenges Completed: ${challengesCompleted} / 15`, 105, 58, { align: 'center' });

        // Detailed Results Table
        doc.setFontSize(12);
        doc.setTextColor(0, 69, 135);
        doc.setFont(undefined, 'bold');
        doc.text('Challenge Results', 15, 75);

        const tableData = [];
        Object.entries(challengeResults).forEach(([challengeId, data]) => {
            const challenge = challenges.find(c => c.id === challengeId);
            const percentileData = calculatePercentile(challengeId, data.result);
            const percentileBand = percentileData.percentile >= 17 ? '🔵 Excellent/Very Good' :
                percentileData.percentile >= 9 ? '🟡 Average/Good' : '🔴 Needs Improvement';

            tableData.push([
                challenge?.name || challengeId,
                `${data.result} ${data.unit}`,
                data.points.toString(),
                percentileBand
            ]);
        });

        doc.autoTable({
            startY: 80,
            head: [['Challenge', 'Result', 'Points', 'Performance']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [0, 69, 135],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            bodyStyles: {
                fontSize: 9
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 40 },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 55 }
            }
        });

        // Performance Legend
        const finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 69, 135);
        doc.text('Performance Levels:', 15, finalY);

        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.text('🔵 Excellent/Very Good (17-25 points) | 🟡 Average/Good (9-16 points) | 🔴 Needs Improvement (1-8 points)', 15, finalY + 5);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Nord Anglia Education - Fitness Challenge Tracker', 105, 285, { align: 'center' });
        doc.text('Generated on ' + new Date().toLocaleString(), 105, 290, { align: 'center' });

        // Save PDF with format: "Name fitness scores Month Year"
        const now = new Date();
        const month = now.toLocaleDateString('en-US', { month: 'long' });
        const year = now.getFullYear();
        const fileName = `${currentUser.name} fitness scores ${month} ${year}.pdf`;
        doc.save(fileName);

        showToast('PDF report generated successfully!', 'success');
        showLoading(false);

    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Failed to generate PDF report', 'error');
        showLoading(false);
    }
}
