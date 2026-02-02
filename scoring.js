// Fitness Challenge Scoring System
// Based on percentile rankings (1-25)
// =================================

// Scoring lookup tables from your spreadsheet
const scoringTables = {
    'pushups': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 3 },
            { rank: 2, value: 6 },
            { rank: 3, value: 9 },
            { rank: 4, value: 12 },
            { rank: 5, value: 15 },
            { rank: 6, value: 18 },
            { rank: 7, value: 21 },
            { rank: 8, value: 24 },
            { rank: 9, value: 27 },
            { rank: 10, value: 30 },
            { rank: 11, value: 33 },
            { rank: 12, value: 36 },
            { rank: 13, value: 39 },
            { rank: 14, value: 42 },
            { rank: 15, value: 45 },
            { rank: 16, value: 48 },
            { rank: 17, value: 51 },
            { rank: 18, value: 54 },
            { rank: 19, value: 57 },
            { rank: 20, value: 60 },
            { rank: 21, value: 63 },
            { rank: 22, value: 66 },
            { rank: 23, value: 69 },
            { rank: 24, value: 72 },
            { rank: 25, value: 75 }
        ]
    },
    'burpees': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 2 },
            { rank: 2, value: 4 },
            { rank: 3, value: 6 },
            { rank: 4, value: 8 },
            { rank: 5, value: 10 },
            { rank: 6, value: 12 },
            { rank: 7, value: 14 },
            { rank: 8, value: 16 },
            { rank: 9, value: 18 },
            { rank: 10, value: 20 },
            { rank: 11, value: 22 },
            { rank: 12, value: 24 },
            { rank: 13, value: 26 },
            { rank: 14, value: 28 },
            { rank: 15, value: 30 },
            { rank: 16, value: 32 },
            { rank: 17, value: 34 },
            { rank: 18, value: 36 },
            { rank: 19, value: 38 },
            { rank: 20, value: 40 },
            { rank: 21, value: 42 }
        ]
    },
    'plank': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 0.01 * 60 },  // Converting minutes to seconds
            { rank: 2, value: 0.07 * 60 },
            { rank: 3, value: 0.14 * 60 },
            { rank: 4, value: 0.21 * 60 },
            { rank: 5, value: 0.28 * 60 },
            { rank: 6, value: 0.35 * 60 },
            { rank: 7, value: 0.42 * 60 },
            { rank: 8, value: 0.49 * 60 },
            { rank: 9, value: 0.56 * 60 },
            { rank: 10, value: 1.00 * 60 },
            { rank: 11, value: 1.20 * 60 },
            { rank: 12, value: 1.40 * 60 },
            { rank: 13, value: 2.00 * 60 },
            { rank: 14, value: 2.20 * 60 },
            { rank: 15, value: 2.40 * 60 },
            { rank: 16, value: 3.00 * 60 },
            { rank: 17, value: 3.20 * 60 },
            { rank: 18, value: 3.40 * 60 },
            { rank: 19, value: 4.00 * 60 },
            { rank: 20, value: 4.20 * 60 },
            { rank: 21, value: 4.40 * 60 },
            { rank: 22, value: 5.00 * 60 },
            { rank: 23, value: 6.00 * 60 },
            { rank: 24, value: 7.00 * 60 },
            { rank: 25, value: 8.00 * 60 }
        ]
    },
    'run1500m': {
        type: 'lower-better',
        percentiles: [
            { rank: 1, value: 12.00 * 60 },  // Converting to seconds
            { rank: 2, value: 11.30 * 60 },
            { rank: 3, value: 11.00 * 60 },
            { rank: 4, value: 10.30 * 60 },
            { rank: 5, value: 10.00 * 60 },
            { rank: 6, value: 9.30 * 60 },
            { rank: 7, value: 9.00 * 60 },
            { rank: 8, value: 8.30 * 60 },
            { rank: 9, value: 8.00 * 60 },
            { rank: 10, value: 7.45 * 60 },
            { rank: 11, value: 7.30 * 60 },
            { rank: 12, value: 7.15 * 60 },
            { rank: 13, value: 7.00 * 60 },
            { rank: 14, value: 6.45 * 60 },
            { rank: 15, value: 6.30 * 60 },
            { rank: 16, value: 6.15 * 60 },
            { rank: 17, value: 6.00 * 60 },
            { rank: 18, value: 5.45 * 60 },
            { rank: 19, value: 5.30 * 60 },
            { rank: 20, value: 5.15 * 60 },
            { rank: 21, value: 5.00 * 60 },
            { rank: 22, value: 4.50 * 60 },
            { rank: 23, value: 4.40 * 60 },
            { rank: 24, value: 4.30 * 60 },
            { rank: 25, value: 4.20 * 60 }
        ]
    },
    'cdlmile': {
        type: 'lower-better',
        percentiles: [
            { rank: 1, value: 15.00 * 60 },
            { rank: 2, value: 14.00 * 60 },
            { rank: 3, value: 13.00 * 60 },
            { rank: 4, value: 12.00 * 60 },
            { rank: 5, value: 11.45 * 60 },
            { rank: 6, value: 11.20 * 60 },
            { rank: 7, value: 11.00 * 60 },
            { rank: 8, value: 10.40 * 60 },
            { rank: 9, value: 10.20 * 60 },
            { rank: 10, value: 10.00 * 60 },
            { rank: 11, value: 9.40 * 60 },
            { rank: 12, value: 9.20 * 60 },
            { rank: 13, value: 9.00 * 60 },
            { rank: 14, value: 8.40 * 60 },
            { rank: 15, value: 8.20 * 60 },
            { rank: 16, value: 8.00 * 60 },
            { rank: 17, value: 7.40 * 60 },
            { rank: 18, value: 7.20 * 60 },
            { rank: 19, value: 7.00 * 60 },
            { rank: 20, value: 6.40 * 60 },
            { rank: 21, value: 6.20 * 60 },
            { rank: 22, value: 6.00 * 60 },
            { rank: 23, value: 5.40 * 60 },
            { rank: 24, value: 5.20 * 60 },
            { rank: 25, value: 5.00 * 60 }
        ]
    },
    'beeptest': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 2.0 },
            { rank: 2, value: 2.5 },
            { rank: 3, value: 3.0 },
            { rank: 4, value: 3.5 },
            { rank: 5, value: 4.0 },
            { rank: 6, value: 4.5 },
            { rank: 7, value: 5.0 },
            { rank: 8, value: 5.5 },
            { rank: 9, value: 6.0 },
            { rank: 10, value: 6.5 },
            { rank: 11, value: 7.0 },
            { rank: 12, value: 7.5 },
            { rank: 13, value: 8.0 },
            { rank: 14, value: 8.5 },
            { rank: 15, value: 9.0 },
            { rank: 16, value: 9.5 },
            { rank: 17, value: 10.0 },
            { rank: 18, value: 10.5 },
            { rank: 19, value: 11.0 },
            { rank: 20, value: 11.5 },
            { rank: 21, value: 12.0 },
            { rank: 22, value: 13.0 },
            { rank: 23, value: 14.0 },
            { rank: 24, value: 15.0 },
            { rank: 25, value: 16.0 }
        ]
    },
    'sitreach': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 1 },
            { rank: 2, value: 5 },
            { rank: 3, value: 10 },
            { rank: 4, value: 14 },
            { rank: 5, value: 16 },
            { rank: 6, value: 18 },
            { rank: 7, value: 20 },
            { rank: 8, value: 22 },
            { rank: 9, value: 24 },
            { rank: 10, value: 26 },
            { rank: 11, value: 28 },
            { rank: 12, value: 30 },
            { rank: 13, value: 32 },
            { rank: 14, value: 34 },
            { rank: 15, value: 36 },
            { rank: 16, value: 38 },
            { rank: 17, value: 40 },
            { rank: 18, value: 43 },
            { rank: 19, value: 46 },
            { rank: 20, value: 49 },
            { rank: 21, value: 52 },
            { rank: 22, value: 55 },
            { rank: 23, value: 60 },
            { rank: 24, value: 65 },
            { rank: 25, value: 70 }
        ]
    },
    'sallythunderstruck': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 1 },
            { rank: 2, value: 2 },
            { rank: 3, value: 3 },
            { rank: 4, value: 4 },
            { rank: 5, value: 5 },
            { rank: 6, value: 6 },
            { rank: 7, value: 7 },
            { rank: 8, value: 8 },
            { rank: 9, value: 9 },
            { rank: 10, value: 10 },
            { rank: 11, value: 11 },
            { rank: 12, value: 12 },
            { rank: 13, value: 13 },
            { rank: 14, value: 14 },
            { rank: 15, value: 15 },
            { rank: 16, value: 16 },
            { rank: 17, value: 17 },
            { rank: 18, value: 18 },
            { rank: 19, value: 19 },
            { rank: 20, value: 20 },
            { rank: 21, value: 21 },
            { rank: 22, value: 22 },
            { rank: 23, value: 23 },
            { rank: 24, value: 24 },
            { rank: 25, value: 25 }
        ]
    },
    'crisscross': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 11 },
            { rank: 2, value: 12 },
            { rank: 3, value: 13 },
            { rank: 4, value: 14 },
            { rank: 5, value: 15 },
            { rank: 6, value: 16 },
            { rank: 7, value: 17 },
            { rank: 8, value: 18 },
            { rank: 9, value: 19 },
            { rank: 10, value: 20 },
            { rank: 11, value: 21 },
            { rank: 12, value: 22 },
            { rank: 13, value: 23 },
            { rank: 14, value: 24 },
            { rank: 15, value: 25 },
            { rank: 16, value: 26 },
            { rank: 17, value: 27 },
            { rank: 18, value: 28 },
            { rank: 19, value: 29 },
            { rank: 20, value: 30 },
            { rank: 21, value: 31 },
            { rank: 22, value: 32 },
            { rank: 23, value: 33 },
            { rank: 24, value: 34 },
            { rank: 25, value: 35 }
        ]
    },
    'longjump': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 0.30 * 100 },  // Converting meters to cm
            { rank: 2, value: 0.40 * 100 },
            { rank: 3, value: 0.50 * 100 },
            { rank: 4, value: 0.70 * 100 },
            { rank: 5, value: 0.80 * 100 },
            { rank: 6, value: 0.90 * 100 },
            { rank: 7, value: 1.00 * 100 },
            { rank: 8, value: 1.10 * 100 },
            { rank: 9, value: 1.20 * 100 },
            { rank: 10, value: 1.30 * 100 },
            { rank: 11, value: 1.40 * 100 },
            { rank: 12, value: 1.50 * 100 },
            { rank: 13, value: 1.60 * 100 },
            { rank: 14, value: 1.70 * 100 },
            { rank: 15, value: 1.80 * 100 },
            { rank: 16, value: 1.90 * 100 },
            { rank: 17, value: 2.00 * 100 },
            { rank: 18, value: 2.10 * 100 },
            { rank: 19, value: 2.20 * 100 },
            { rank: 20, value: 2.30 * 100 },
            { rank: 21, value: 2.40 * 100 },
            { rank: 22, value: 2.50 * 100 },
            { rank: 23, value: 2.60 * 100 },
            { rank: 24, value: 2.70 * 100 },
            { rank: 25, value: 2.80 * 100 }
        ]
    },
    'slackline': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 1 },
            { rank: 2, value: 2 },
            { rank: 3, value: 3 },
            { rank: 4, value: 4 },
            { rank: 5, value: 5 },
            { rank: 6, value: 6 },
            { rank: 7, value: 7 },
            { rank: 8, value: 8 },
            { rank: 9, value: 9 },
            { rank: 10, value: 10 },
            { rank: 11, value: 11 },
            { rank: 12, value: 12 },
            { rank: 13, value: 13 },
            { rank: 14, value: 14 },
            { rank: 15, value: 15 },
            { rank: 16, value: 16 },
            { rank: 17, value: 17 },
            { rank: 18, value: 18 },
            { rank: 19, value: 19 },
            { rank: 20, value: 20 },
            { rank: 21, value: 21 },
            { rank: 22, value: 22 },
            { rank: 23, value: 23 },
            { rank: 24, value: 24 },
            { rank: 25, value: 25 }
        ]
    },
    'sprint60m': {
        type: 'lower-better',
        percentiles: [
            { rank: 1, value: 15.00 },
            { rank: 2, value: 14.66 },
            { rank: 3, value: 14.33 },
            { rank: 4, value: 14.00 },
            { rank: 5, value: 13.66 },
            { rank: 6, value: 13.33 },
            { rank: 7, value: 13.00 },
            { rank: 8, value: 12.66 },
            { rank: 9, value: 12.33 },
            { rank: 10, value: 12.00 },
            { rank: 11, value: 11.66 },
            { rank: 12, value: 11.33 },
            { rank: 13, value: 11.00 },
            { rank: 14, value: 10.66 },
            { rank: 15, value: 10.33 },
            { rank: 16, value: 10.00 },
            { rank: 17, value: 9.66 },
            { rank: 18, value: 9.33 },
            { rank: 19, value: 9.00 },
            { rank: 20, value: 8.66 },
            { rank: 21, value: 8.33 },
            { rank: 22, value: 8.00 },
            { rank: 23, value: 7.66 },
            { rank: 24, value: 7.33 },
            { rank: 25, value: 7.00 }
        ]
    },
    'sprint100m': {
        type: 'lower-better',
        percentiles: [
            { rank: 1, value: 24.00 },
            { rank: 2, value: 22.75 },
            { rank: 3, value: 21.50 },
            { rank: 4, value: 20.25 },
            { rank: 5, value: 19.00 },
            { rank: 6, value: 18.75 },
            { rank: 7, value: 18.50 },
            { rank: 8, value: 18.25 },
            { rank: 9, value: 18.00 },
            { rank: 10, value: 17.75 },
            { rank: 11, value: 17.50 },
            { rank: 12, value: 17.25 },
            { rank: 13, value: 17.00 },
            { rank: 14, value: 16.75 },
            { rank: 15, value: 16.50 },
            { rank: 16, value: 16.25 },
            { rank: 17, value: 16.00 },
            { rank: 18, value: 15.75 },
            { rank: 19, value: 15.50 },
            { rank: 20, value: 15.25 },
            { rank: 21, value: 15.00 },
            { rank: 22, value: 14.75 },
            { rank: 23, value: 14.50 },
            { rank: 24, value: 14.25 },
            { rank: 25, value: 14.00 }
        ]
    },
    'griptest': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 2.00 },
            { rank: 2, value: 5.00 },
            { rank: 3, value: 10.00 },
            { rank: 4, value: 12.50 },
            { rank: 5, value: 15.00 },
            { rank: 6, value: 17.50 },
            { rank: 7, value: 20.00 },
            { rank: 8, value: 22.50 },
            { rank: 9, value: 25.00 },
            { rank: 10, value: 27.50 },
            { rank: 11, value: 30.00 },
            { rank: 12, value: 32.50 },
            { rank: 13, value: 35.00 },
            { rank: 14, value: 37.50 },
            { rank: 15, value: 40.00 },
            { rank: 16, value: 42.50 },
            { rank: 17, value: 45.00 },
            { rank: 18, value: 47.50 },
            { rank: 19, value: 50.00 },
            { rank: 20, value: 52.50 },
            { rank: 21, value: 55.00 },
            { rank: 22, value: 57.50 },
            { rank: 23, value: 60.00 },
            { rank: 24, value: 65.00 },
            { rank: 25, value: 70.00 }
        ]
    },
    'skipping': {
        type: 'higher-better',
        percentiles: [
            { rank: 1, value: 15 },
            { rank: 2, value: 20 },
            { rank: 3, value: 25 },
            { rank: 4, value: 30 },
            { rank: 5, value: 35 },
            { rank: 6, value: 40 },
            { rank: 7, value: 45 },
            { rank: 8, value: 50 },
            { rank: 9, value: 55 },
            { rank: 10, value: 60 },
            { rank: 11, value: 65 },
            { rank: 12, value: 70 },
            { rank: 13, value: 75 },
            { rank: 14, value: 80 },
            { rank: 15, value: 85 },
            { rank: 16, value: 90 },
            { rank: 17, value: 95 },
            { rank: 18, value: 100 },
            { rank: 19, value: 105 },
            { rank: 20, value: 110 },
            { rank: 21, value: 115 },
            { rank: 22, value: 120 },
            { rank: 23, value: 125 },
            { rank: 24, value: 130 },
            { rank: 25, value: 135 }
        ]
    }
};

// Calculate percentile rank for a given result
function calculatePercentile(challengeId, result) {
    const table = scoringTables[challengeId];

    if (!table) {
        console.warn(`No scoring table found for challenge: ${challengeId}`);
        return { rank: 0, points: 0, color: 'gray' };
    }

    const percentiles = table.percentiles;
    const type = table.type;

    let rank = 1;

    if (type === 'higher-better') {
        // For higher-better, find the highest percentile where result >= value
        for (let i = percentiles.length - 1; i >= 0; i--) {
            if (result >= percentiles[i].value) {
                rank = percentiles[i].rank;
                break;
            }
        }
    } else {
        // For lower-better, find the highest percentile where result <= value
        for (let i = percentiles.length - 1; i >= 0; i--) {
            if (result <= percentiles[i].value) {
                rank = percentiles[i].rank;
                break;
            }
        }
    }

    // Determine color based on rank
    const color = getPercentileColor(rank);

    // Points = rank (1-25)
    const points = rank;

    return { rank, points, color };
}

// Get color based on percentile rank (matching your spreadsheet)
function getPercentileColor(rank) {
    if (rank >= 1 && rank <= 8) {
        return 'red'; // Low percentile
    } else if (rank >= 9 && rank <= 17) {
        return 'yellow'; // Mid percentile
    } else if (rank >= 18 && rank <= 25) {
        return 'blue'; // High percentile
    }
    return 'gray';
}

// Get CSS background color for percentile badge
function getPercentileBadgeColor(color) {
    switch (color) {
        case 'red':
            return '#dc3545';
        case 'yellow':
            return '#fbba07';
        case 'blue':
            return '#004587';
        default:
            return '#6c757d';
    }
}

// Get descriptive text for percentile
function getPercentileDescription(rank) {
    if (rank >= 23) {
        return 'Excellent';
    } else if (rank >= 18) {
        return 'Very Good';
    } else if (rank >= 13) {
        return 'Good';
    } else if (rank >= 9) {
        return 'Average';
    } else if (rank >= 5) {
        return 'Below Average';
    } else {
        return 'Needs Improvement';
    }
}

// Format percentile display for UI
function formatPercentileDisplay(percentileData) {
    const { rank, points, color } = percentileData;
    const description = getPercentileDescription(rank);
    const bgColor = getPercentileBadgeColor(color);

    return {
        rank,
        points,
        color,
        description,
        bgColor,
        html: `<span class="percentile-badge" style="background: ${bgColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-weight: 600;">${points} pts - ${description}</span>`
    };
}
