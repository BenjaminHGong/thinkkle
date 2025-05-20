
import { rowLength, columnLength, specialSquares, tileValues} from './constants.js';

const board = document.querySelector('.board');

function setupBoard() {
    for (let row = 0; row < rowLength; row++) {
        for (let col = 0; col < columnLength; col++) {
            const square = document.createElement('div');
            const specialSquare = specialSquares.find(t => t.row === row && t.col === col);

            square.classList.add('square'); // Add class for each square
            square.classList.add('empty'); // Add class for empty squares 
    
            if (specialSquare) {
                if (specialSquare.type === 'star') {
                    square.textContent = '★';
                }
                else if (specialSquare.type === 'double-word') {
                    square.textContent = '2W';
                }
                else if (specialSquare.type === 'triple-word') {
                    square.textContent = '3W';
                }
                else if (specialSquare.type === 'double-letter') {
                    square.textContent = '2L';
                }
                else if (specialSquare.type === 'triple-letter') {
                    square.textContent = '3L';
                }
                square.classList.add(specialSquare.type); // Add class based on square type
                square.dataset.wordBonus = square.textContent
            }
            else {
                square.classList.add('normal'); // Add a class for normal squares
            }
            
            const tile = createTile();
            tile.dataset.row = row;
            tile.dataset.col = col;
            square.appendChild(tile);
            board.appendChild(square);
        }
    }
}

export function createTile(letter="") {
    const tile = document.createElement('div');
    tile.classList.add('tile'); // Class for the tile
    
    const letterSpan = document.createElement('span');
    letterSpan.textContent = letter;
    letterSpan.classList.add('tile-letter'); // Class for the letter
    tile.appendChild(letterSpan);

    const scoreSpan = document.createElement('span');
    scoreSpan.textContent = tileValues[letterSpan.textContent] || 0;
    scoreSpan.classList.add('tile-score'); // Class for the score
    tile.appendChild(scoreSpan);
    return tile;
}

setupBoard();
