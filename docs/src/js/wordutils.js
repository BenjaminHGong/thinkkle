import { rowLength, columnLength, tileValues } from './constants.js';

const dictionary = new Set();
fetch('wordlist.txt')
    .then(response => response.text())
    .then(data => {
        const words = data.split('\n').map(word => word.trim());
        words.forEach(word => dictionary.add(word));
    })
    .catch(error => console.error('Error loading word list:', error));

let firstTurn = true; 
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
        } 
        else {
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
        if (!isPlaced && (!tile?.querySelector('.tile-letter')?.textContent)) {
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
    } 
    else if (direction === 'vertical') {
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
        return { valid: false, message: "All tiles must be in the same row or column.", words: [] };
    }
    
    if (!ret.valid) {
        return { valid: false, message: ret.message, words: [] };
    }
    return { valid: true, message: "Words formed successfully.", words: ret.words };
}

export function calculateWordScore(wordTiles) {
    
    let score = 0;
    let wordMultiplier = 1;

    wordTiles.forEach(tile => {
        let letterScore = tileValues[tile.letter.toUpperCase()] || 0;
        const square = tile.element.closest('.square');
        let letterMultiplier = 1;

        
        if (tile.element.dataset.newlyPlaced === "true") {
            if (square.classList.contains('double-letter')) {
                letterMultiplier = 2;
            } 
            else if (square.classList.contains('triple-letter')) {
                letterMultiplier = 3;
            }
            
            if (square.classList.contains('double-word') || square.classList.contains('star')) {
                wordMultiplier *= 2;
            } 
            else if (square.classList.contains('triple-word')) {
                wordMultiplier *= 3;
            }
        }

        score += letterScore * letterMultiplier;
    });

    return score * wordMultiplier;
}

function getMoveCompliment(score) {
    if (score >= 100) return "Unbelievable move!";
    if (score >= 80) return "Legendary move!";
    if (score >= 60) return "Amazing move!";
    if (score >= 40) return "Great move!";
    if (score >= 25) return "Nice move!";
    if (score >= 10) return "Good move!";
    return "OK move!";
}
    
export function validateFirstTurn(placedTiles) {
    if (placedTiles.length < 2) {
        return { valid: false, message: "You must place at least two tiles on your first turn.", score: 0 };
    }
    
    const centerTile = placedTiles.find(tile => tile.row === 7 && tile.col === 7);
    if (!centerTile) {
        return { valid: false, message: "One tile must be on the center square.", score: 0 };
    }

    const ret = checkWord(placedTiles);
    if (!ret.valid) {
        return { valid: false, message: ret.message, score: 0 };
    }

    const word = ret.words[0].map(tile => tile.letter).join('');
    if (!dictionary.has(word)) {
        return { valid: false, message: `${word} is not in the dictionary.`, score: 0 };
    }
    let wordScore = calculateWordScore(ret.words[0]);

    
    if (placedTiles.length === 7) {
        wordScore += 50;
    }

    return { valid: true, message: getMoveCompliment(wordScore), score: wordScore };
}

export function validateSubsequentTurn(placedTiles) {
    if (placedTiles.length < 1) {
        return { valid: false, message: "You must place at least one tile.", score: 0 };
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
            if (!existingTile) return false;
            const existingLetterSpan = existingTile.querySelector('.tile-letter');
            return existingLetterSpan &&
                existingLetterSpan.textContent !== "" &&
                existingTile.dataset.newlyPlaced !== "true";
        });
    });
    if (!connectsToExistingTile) {
        return { valid: false, message: "At least one tile must connect to an existing tile.", score: 0 };
    }

    const ret = checkWord(placedTiles);
    if (!ret.valid) {
        return { valid: false, message: ret.message, score: 0 };
    }

    let totalWordScore = 0;
    for (const wordTiles of ret.words) {
        const word = wordTiles.map(tile => tile.letter).join('');
        if (!dictionary.has(word)) {
            return { valid: false, message: `${word} is not in the dictionary.`, score: 0 };
        }
        totalWordScore += calculateWordScore(wordTiles);
    }

    if (placedTiles.length === 7) {
        totalWordScore += 50;
    }

    return { valid: true, message: getMoveCompliment(totalWordScore), score: totalWordScore };
}


