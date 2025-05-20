import { rowLength, columnLength } from './constants.js';

const dictionary = new Set();
fetch('wordlist.txt')
    .then(response => response.text())
    .then(data => {
        const words = data.split('\n').map(word => word.trim());
        words.forEach(word => dictionary.add(word));
    })
    .catch(error => console.error('Error loading word list:', error));

let firstTurn = true; // Flag to check if it's the first turn
export function isFirstTurn() {
    return firstTurn;
}
export function setFirstTurn(value) {
    firstTurn = value;
}

function checkConnectedTiles(placedTiles, direction) {
    let words = [];

    // Main word
    if (direction === 'horizontal') {
        placedTiles.sort((a, b) => a.col - b.col);

        // Perpendicular words for each placed tile
        placedTiles.forEach(tile => {
            // Find the start of the perpendicular word
            let startRow = tile.row;
            let startCol = tile.col;
            while (
                startRow - 1 >= 0 &&
                document.querySelector(`.tile[data-row='${startRow - 1}'][data-col='${startCol}']`)?.textContent
            ) {
                startRow--;
            }
            const perpWord = formWord(startRow, startCol, 1, 0);
            if (
                perpWord.length > 1 &&
                !words.includes(perpWord)
            ) {
                words.push(perpWord);
            }
        });
        // Check for connectivity
        const cols = placedTiles.map(tile => tile.col).sort((a, b) => a - b);
        for (let i = cols[0]; i <= cols[cols.length - 1]; i++) {
            if (
                !placedTiles.some(tile => tile.col === i) &&
                !document.querySelector(`.tile[data-row='${placedTiles[0].row}'][data-col='${i}']`)?.textContent
            ) {
                return { valid: false, message: "All tiles should be placed next to each other." };
            }
        }
    } else if (direction === 'vertical') {
        placedTiles.sort((a, b) => a.row - b.row);

        // Perpendicular words for each placed tile
        placedTiles.forEach(tile => {
            // Find the start of the perpendicular word
            let startRow = tile.row;
            let startCol = tile.col;
            while (
                startCol - 1 >= 0 &&
                document.querySelector(`.tile[data-row='${startRow}'][data-col='${startCol - 1}']`)?.textContent
            ) {
                startCol--;
            }
            const perpWord = formWord(startRow, startCol, 0, 1);
            if (
                perpWord.length > 1 &&
                !words.includes(perpWord)
            ) {
                words.push(perpWord);
            }
        });
        // Check for connectivity
        const rows = placedTiles.map(tile => tile.row).sort((a, b) => a - b);
        for (let i = rows[0]; i <= rows[rows.length - 1]; i++) {
            if (
                !placedTiles.some(tile => tile.row === i) &&
                !document.querySelector(`.tile[data-row='${i}'][data-col='${placedTiles[0].col}']`)?.textContent
            ) {
                return { valid: false, message: "All tiles should be placed next to each other." };
            }
        }
    }

    return { valid: true, message: "Tiles are connected.", words: words };
}

export function validateFirstTurn(placedTiles) {
    if (placedTiles.length < 2) {
        return { valid: false, message: "You must place at least two tiles on your first turn." };
    }

    const allinSameRow = placedTiles.every(tile => tile.row === placedTiles[0].row);
    const allinSameCol = placedTiles.every(tile => tile.col === placedTiles[0].col);
    let word = "";
    if (allinSameRow) {
        placedTiles.sort((a, b) => a.col - b.col);
        const ret = checkConnectedTiles(placedTiles, 'horizontal');
        if (!ret.valid) {
            return ret;
        }
        word = formWord(placedTiles[0].row, placedTiles[0].col, 0, 1);
    }
        
    else if (allinSameCol) {
        placedTiles.sort((a, b) => a.row - b.row);
        const ret = checkConnectedTiles(placedTiles, 'vertical');
        if (!ret.valid) {
            return ret;
        }
        word = formWord(placedTiles[0].row, placedTiles[0].col, 1, 0);
    }
    else {
        return { valid: false, message: "All tiles must be in the same row or column." };
    }
    
    const centerTile = placedTiles.find(tile => tile.row === 7 && tile.col === 7);
    if (!centerTile) {
        return { valid: false, message: "One tile must be on the center square." };
    }

    if (!dictionary.has(word)) {
        return { valid: false, message: "The word is not in the dictionary." };
    }

    return { valid: true, message: "Valid first turn." };
}

export function validateSubsequentTurn(placedTiles) {
    if (placedTiles.length < 1) {
        return { valid: false, message: "You must place at least one tile." };
    }
    const allinSameRow = placedTiles.every(tile => tile.row === placedTiles[0].row);
    const allinSameCol = placedTiles.every(tile => tile.col === placedTiles[0].col);
    let ret = "";
    if (allinSameRow) {
        placedTiles.sort((a, b) => a.col - b.col);
        ret = checkConnectedTiles(placedTiles, 'horizontal');
        if (!ret.valid) {
            return ret;
        }
        const word = getWord(placedTiles[0].row, placedTiles[0].col, 0, 1);
        if (word.length > 1) {
            ret.words.push(word);
        }
    }
        
    else if (allinSameCol) {
        placedTiles.sort((a, b) => a.row - b.row);
        ret = checkConnectedTiles(placedTiles, 'vertical');
        if (!ret.valid) {
            return ret;
        }
        const word = getWord(placedTiles[0].row, placedTiles[0].col, 1, 0);
        if (word.length > 1) {
            ret.words.push(word);
        }
    }
    else {
        return { valid: false, message: "All tiles must be in the same row or column." };
    }
    console.log(ret.words);
    const connectsToExistingTile = placedTiles.some(tile => {
        const adjacentTiles = [
            { row: tile.row - 1, col: tile.col },
            { row: tile.row + 1, col: tile.col },
            { row: tile.row, col: tile.col - 1 },
            { row: tile.row, col: tile.col + 1 }
        ];
        return adjacentTiles.some(adjTile => {
            const existingTile = document.querySelector(`.tile[data-row='${adjTile.row}'][data-col='${adjTile.col}']`);
            return existingTile && existingTile.textContent !== "" && existingTile.dataset.newlyPlaced !== "true";
        });
    });

    if (!connectsToExistingTile) {
        return { valid: false, message: "At least one tile must connect to an existing tile." };
    }
    for (const word of ret.words) {
        if (!dictionary.has(word)) {
            return { valid: false, message: "The word is not in the dictionary." };
        }
    }

    return { valid: true, message: "Valid subsequent turn." };
}
function getWord(row, col, dy, dx) {
    let currentRow = row;
    let currentCol = col;
    while (
        currentRow - dy >= 0 &&
        currentCol - dx >= 0 &&
        currentRow - dy < rowLength &&
        currentCol - dx < columnLength
    ) {
        const prevTile = document.querySelector(`.tile[data-row='${currentRow - dy}'][data-col='${currentCol - dx}']`);
        if (!prevTile || prevTile.textContent === "") break;
        currentRow -= dy;
        currentCol -= dx;
    }
    return formWord(currentRow, currentCol, dy, dx);
}

function formWord(row, col, dy, dx) {
    let word = "";
    let currentRow = row;
    let currentCol = col;

    while (currentRow >= 0 && currentCol >= 0 && currentRow < rowLength && currentCol < columnLength) {
        const tile = document.querySelector(`.tile[data-row='${currentRow}'][data-col='${currentCol}']`);
        if (tile && tile.textContent !== "") {
            word += tile.textContent;
        } else {
            break;
        }
        currentRow += dy;
        currentCol += dx;
    }

    return word;
}






