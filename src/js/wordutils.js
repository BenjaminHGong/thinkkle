import { rowLength, columnLength, tileValues } from './constants.js';

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

function areTilesConnected(placedTiles, axis) {
    const indices = placedTiles.map(tile => tile[axis]).sort((a, b) => a - b);
    const fixed = axis === 'col' ? placedTiles[0].row : placedTiles[0].col;
    for (let i = indices[0]; i <= indices[indices.length - 1]; i++) {
        const isPlaced = placedTiles.some(tile => tile[axis] === i);
        const selector = axis === 'col'
            ? `.tile[data-row='${fixed}'][data-col='${i}']`
            : `.tile[data-row='${i}'][data-col='${fixed}']`;
        const tile = document.querySelector(selector);
        if (!isPlaced && (!tile || !tile.querySelector('.tile-letter')?.textContent)) {
            return false;
        }
    }
    return true;
}

function checkConnectedTiles(placedTiles, direction) {
    let words = [];
    if (direction === 'horizontal') {
        placedTiles.sort((a, b) => a.col - b.col);
        const mainWord = getWord(placedTiles[0].row, placedTiles[0].col, 0, 1);
        if (mainWord.length > 1) words.push(mainWord);
        addPerpendicularWords(words, placedTiles, 1, 0);
        if (!areTilesConnected(placedTiles, 'col')) {
            return { valid: false, message: "All tiles should be placed next to each other." };
        }
    } else if (direction === 'vertical') {
        placedTiles.sort((a, b) => a.row - b.row);
        const mainWord = getWord(placedTiles[0].row, placedTiles[0].col, 1, 0);
        if (mainWord.length > 1) words.push(mainWord);
        addPerpendicularWords(words, placedTiles, 0, 1);
        if (!areTilesConnected(placedTiles, 'row')) {
            return { valid: false, message: "All tiles should be placed next to each other." };
        }
    }
    return { valid: true, message: "Tiles are connected.", words: words };
}

function checkWord(placedTiles) {
    const allinSameRow = placedTiles.every(tile => tile.row === placedTiles[0].row);
    const allinSameCol = placedTiles.every(tile => tile.col === placedTiles[0].col);
    let ret = "";
    if (allinSameRow) {
        placedTiles.sort((a, b) => a.col - b.col);
        ret = checkConnectedTiles(placedTiles, 'horizontal'); 
    }    
    else if (allinSameCol) {
        placedTiles.sort((a, b) => a.row - b.row);
        ret = checkConnectedTiles(placedTiles, 'vertical');
    } 
    else {
        return { valid: false, message: "All tiles must be in the same row or column." };
    }
    
    if (!ret.valid) {
        return ret;
    }
    return { valid: true, message: "Words formed successfully.", words: ret.words };
}

export function calculateWordScore(wordTiles) {
    // wordTiles: array of {row, col, letter, element}
    let score = 0;
    let wordMultiplier = 1;

    wordTiles.forEach(tile => {
        let letterScore = tileValues[tile.letter.toUpperCase()] || 0;
        const square = tile.element.closest('.square');
        let letterMultiplier = 1;

        // Check for letter bonuses
        if (square.classList.contains('double-letter')) {
            letterMultiplier = 2;
        } else if (square.classList.contains('triple-letter')) {
            letterMultiplier = 3;
        }

        // Check for word bonuses
        if (square.classList.contains('double-word')) {
            wordMultiplier *= 2;
        } else if (square.classList.contains('triple-word')) {
            wordMultiplier *= 3;
        }

        score += letterScore * letterMultiplier;
    });

    return score * wordMultiplier;
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


