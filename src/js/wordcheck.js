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

function formWord(row, col, dy, dx) {
    let tiles = [];
    let currentRow = row;
    let currentCol = col;

    while (currentRow >= 0 && currentCol >= 0 && currentRow < rowLength && currentCol < columnLength) {
        const tile = document.querySelector(`.tile[data-row='${currentRow}'][data-col='${currentCol}']`);
        const letterSpan = tile.querySelector('.tile-letter');
        if (tile && letterSpan.textContent !== "") {
            tiles.push({
                row: currentRow,
                col: currentCol,
                letter: letterSpan.textContent,
                element: tile
            });
        } else {
            break;
        }
        currentRow += dy;
        currentCol += dx;
    }

    return tiles;
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
        const prevLetterSpan = prevTile.querySelector('.tile-letter');
        if (!prevTile || prevLetterSpan.textContent === "") break;
        currentRow -= dy;
        currentCol -= dx;
    }
    return formWord(currentRow, currentCol, dy, dx);
}

function addPerpendicularWords(words, placedTiles, dy, dx) {
    placedTiles.forEach(tile => {
        let startRow = tile.row;
        let startCol = tile.col;
        // Find the start of the perpendicular word
        while (
            startRow - dy >= 0 &&
            startCol - dx >= 0 &&
            document.querySelector(`.tile[data-row='${startRow - dy}'][data-col='${startCol - dx}']`)?.querySelector('.tile-letter')?.textContent
        ) {
            startRow -= dy;
            startCol -= dx;
        }
        const perpWord = formWord(startRow, startCol, dy, dx);
        if (perpWord.length > 1 && !words.includes(perpWord)) {
            words.push(perpWord);
        }
    });
}

function checkConnectedTiles(placedTiles, direction) {
    let words = [];
    if (direction === 'horizontal') {
        placedTiles.sort((a, b) => a.col - b.col);
        const mainWord = getWord(placedTiles[0].row, placedTiles[0].col, 0, 1);
        if (mainWord.length > 1) words.push(mainWord);
        addPerpendicularWords(words, placedTiles, 1, 0);
    } else if (direction === 'vertical') {
        placedTiles.sort((a, b) => a.row - b.row);
        const mainWord = getWord(placedTiles[0].row, placedTiles[0].col, 1, 0);
        if (mainWord.length > 1) words.push(mainWord);
        addPerpendicularWords(words, placedTiles, 0, 1);
    }
    return words;
}

function checkWord(placedTiles) {
    const allinSameRow = placedTiles.every(tile => tile.row === placedTiles[0].row);
    const allinSameCol = placedTiles.every(tile => tile.col === placedTiles[0].col);
    let words = [];
    if (allinSameRow) {
        placedTiles.sort((a, b) => a.col - b.col);
        words = checkConnectedTiles(placedTiles, 'horizontal'); 
    }    
    else if (allinSameCol) {
        placedTiles.sort((a, b) => a.row - b.row);
        words = checkConnectedTiles(placedTiles, 'vertical');
    } 
    else {
        return { valid: false, message: "All tiles must be in the same row or column." };
    }
    return { valid: true, message: "Words formed successfully.", words: words };
}
    
export function validateFirstTurn(placedTiles) {
    if (placedTiles.length < 2) {
        return { valid: false, message: "You must place at least two tiles on your first turn." };
    }
    
    const centerTile = placedTiles.find(tile => tile.row === 7 && tile.col === 7);
    if (!centerTile) {
        return { valid: false, message: "One tile must be on the center square." };
    }

    const ret = checkWord(placedTiles);
    if (!ret.valid) {
        return ret;
    }

    const word = ret.words[0].map(tile => tile.letter).join('');
    if (!dictionary.has(word)) {
        return { valid: false, message: "The word is not in the dictionary." };
    }

    return { valid: true, message: "Valid first turn." };
}

export function validateSubsequentTurn(placedTiles) {
    if (placedTiles.length < 1) {
        return { valid: false, message: "You must place at least one tile." };
    }

    const connectsToExistingTile = placedTiles.some(tile => {
        const adjacentTiles = [
            { row: tile.row - 1, col: tile.col },
            { row: tile.row + 1, col: tile.col },
            { row: tile.row, col: tile.col - 1 },
            { row: tile.row, col: tile.col + 1 }
        ];
        return adjacentTiles.some(adjTile => {
            const existingTile = document.querySelector(`.tile[data-row='${adjTile.row}'][data-col='${adjTile.col}']`);
            const existingLetterSpan = existingTile.querySelector('.tile-letter');
            return existingTile && existingLetterSpan.textContent !== "" && existingTile.dataset.newlyPlaced !== "true";
        });
    });
    if (!connectsToExistingTile) {
        return { valid: false, message: "At least one tile must connect to an existing tile." };
    }

    const ret = checkWord(placedTiles);
    if (!ret.valid) {
        return ret;
    }

    for (const wordTiles of ret.words) {
        const word = wordTiles.map(tile => tile.letter).join('');
        if (!dictionary.has(word)) {
            return { valid: false, message: "The word is not in the dictionary." };
        }
    }

    return { valid: true, message: "Valid subsequent turn." };
}






