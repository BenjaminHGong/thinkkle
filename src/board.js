const board = document.querySelector('.board');

// Assuming a 15x15 board
const rowLength = 15 
const columnLength = 15
const specialSquares = [

    // Center Star Square
    { row: 7, col: 7, type: 'star' }, 

    // Double Word Squares
    { row: 1, col: 1, type: 'double-word' },
    { row: 1, col: 13, type: 'double-word' },
    { row: 2, col: 2, type: 'double-word' },
    { row: 2, col: 12, type: 'double-word' },
    { row: 3, col: 3, type: 'double-word' },
    { row: 3, col: 11, type: 'double-word' },
    { row: 4, col: 4, type: 'double-word' },
    { row: 4, col: 10, type: 'double-word' },
    { row: 10, col: 4, type: 'double-word' },
    { row: 10, col: 10, type: 'double-word' },
    { row: 11, col: 3, type: 'double-word' },
    { row: 11, col: 11, type: 'double-word' },
    { row: 12, col: 2, type: 'double-word' },
    { row: 12, col: 12, type: 'double-word' },
    { row: 13, col: 1, type: 'double-word' },
    { row: 13, col: 13, type: 'double-word' },

    // Triple Word Squares
    { row: 0, col: 0, type: 'triple-word' },
    { row: 0, col: 7, type: 'triple-word' },
    { row: 0, col: 14, type: 'triple-word' },
    { row: 7, col: 0, type: 'triple-word' },
    { row: 7, col: 14, type: 'triple-word' },
    { row: 14, col: 0, type: 'triple-word' },
    { row: 14, col: 7, type: 'triple-word' },
    { row: 14, col: 14, type: 'triple-word' },

    // Double Letter Squares
    { row: 0, col: 3, type: 'double-letter' },
    { row: 0, col: 11, type: 'double-letter' },
    { row: 2, col: 6, type: 'double-letter' },
    { row: 2, col: 8, type: 'double-letter' },
    { row: 3, col: 0, type: 'double-letter' },
    { row: 3, col: 7, type: 'double-letter' },
    { row: 3, col: 14, type: 'double-letter' },
    { row: 6, col: 2, type: 'double-letter' },
    { row: 6, col: 6, type: 'double-letter' },
    { row: 6, col: 8, type: 'double-letter' },
    { row: 6, col: 12, type: 'double-letter' },
    { row: 7, col: 3, type: 'double-letter' },
    { row: 7, col: 11, type: 'double-letter' },
    { row: 8, col: 2, type: 'double-letter' },
    { row: 8, col: 6, type: 'double-letter' },
    { row: 8, col: 8, type: 'double-letter' },
    { row: 8, col: 12, type: 'double-letter' },
    { row: 11, col: 0, type: 'double-letter' },
    { row: 11, col: 7, type: 'double-letter' },
    { row: 11, col: 14, type: 'double-letter' },
    { row: 12, col: 6, type: 'double-letter' },
    { row: 12, col: 8, type: 'double-letter' },
    { row: 14, col: 3, type: 'double-letter' },
    { row: 14, col: 11, type: 'double-letter' },

    // Triple Letter Squares
    { row: 1, col: 5, type: 'triple-letter' },
    { row: 1, col: 9, type: 'triple-letter' },
    { row: 5, col: 1, type: 'triple-letter' },
    { row: 5, col: 5, type: 'triple-letter' },
    { row: 5, col: 9, type: 'triple-letter' },
    { row: 5, col: 13, type: 'triple-letter' },
    { row: 9, col: 1, type: 'triple-letter' },
    { row: 9, col: 5, type: 'triple-letter' },
    { row: 9, col: 9, type: 'triple-letter' },
    { row: 9, col: 13, type: 'triple-letter' },
    { row: 13, col: 5, type: 'triple-letter' },
    { row: 13, col: 9, type: 'triple-letter' }
];


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
    
    
            const tile = document.createElement('div');
            tile.classList.add('tile'); // Class for the tile
            tile.dataset.row = row;
            tile.dataset.col = col;
            square.appendChild(tile);
            board.appendChild(square);
        }
    }
}

setupBoard();
