import { COLORS } from './constants.js';

// 0 = Empty, 1-6 = Colors
// We can use a map function to randomize or specify exact colors.
// For simplicity, let's use strings where 'R'=Red, 'B'=Blue etc. or just numbers.
// Let's use numbers 1-6 mapped to COLORS index.

export const LEVELS = [
    {
        id: 1,
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [2, 2, 2, 2, 2, 2, 2, 2, 2],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [4, 4, 4, 4, 4, 4, 4, 4, 4]
        ]
    },
    {
        id: 2,
        layout: [
            [5, 0, 5, 0, 5, 0, 5, 0, 5, 0],
            [0, 6, 0, 6, 0, 6, 0, 6, 0],
            [5, 0, 5, 0, 5, 0, 5, 0, 5, 0],
            [0, 6, 0, 6, 0, 6, 0, 6, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },
    {
        id: 3,
        layout: [
            [1, 2, 3, 4, 5, 6, 1, 2, 3, 4],
            [4, 3, 2, 1, 6, 5, 4, 3, 2],
            [1, 2, 3, 4, 5, 6, 1, 2, 3, 4],
            [4, 3, 2, 1, 6, 5, 4, 3, 2],
            [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
            [0, 2, 2, 0, 0, 0, 0, 2, 2]
        ]
    }
];
