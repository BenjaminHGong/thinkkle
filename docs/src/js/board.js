
import { rowLength, columnLength, specialSquares} from './constants.js';
import { Tile } from './tile.js';

const board = document.querySelector('.board');

function setupBoard() {
    for (let row = 0; row < rowLength; row++) {
        for (let col = 0; col < columnLength; col++) {
            const square = document.createElement('div');
            const specialSquare = specialSquares.find(t => t.row === row && t.col === col);

            square.classList.add('square'); 
            
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
                square.classList.add(specialSquare.type);
                square.dataset.wordBonus = square.textContent
            }
            else {
                square.classList.add('normal'); 
            }

            square.classList.add('empty'); 

            const tile = new Tile("", row, col);
            const letterSpan = tile.element.querySelector('.tile-letter');
            letterSpan.contentEditable = true; 
            square.appendChild(tile.element);
            square.tileInstance = tile;
            board.appendChild(square);
        }
    }
}

setupBoard();

export function getBoardAs2DArray() {
    const boardArray = [];
    const squares = document.querySelectorAll('.square');

    for (let row = 0; row < rowLength; row++) {
        const rowArray = [];
        for (let col = 0; col < columnLength; col++) {
            const squareIndex = row * columnLength + col;
            const square = squares[squareIndex];
            if (square) {
                rowArray.push(square.tileInstance.getLetter());
            }
        }
        boardArray.push(rowArray);
    }

    return boardArray;
}