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

        const tileBack = document.createElement('div');
        tileBack.classList.add('tile-back');

        const tile = document.createElement('div');
        tile.classList.add('tile'); // Class for the tile
        tile.dataset.row = row;
        tile.dataset.col = col;
        square.appendChild(tileBack);
        square.appendChild(tile);
        board.appendChild(square);
    }
}

const squares = document.querySelectorAll(".square"); //Array of all cells in the board

squares.forEach(square => {
    const tile = square.querySelector('.tile');
    tile.addEventListener('beforeinput', (e) => {
        // Allow deletions, line breaks, etc.
        if (e.inputType.startsWith("delete") || e.inputType === "insertLineBreak") return;
        
        // If input is a single alphabetical character, allow it
        const text = e.data;
        if (!/^[a-zA-Z]$/.test(text)) {
            e.preventDefault(); // Block input
        }
        else {
            tile.textContent = ""; // Clear the cell before setting the new value
        }
    });

    // Prevent pasting
    tile.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    // Delete cell content on Backspace or Delete key press
    tile.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            const wordBonus = tile.dataset.wordBonus;
            square.classList.add('empty'); // Add empty class back when cleared
            square.classList.remove('filled'); // Remove filled class when cleared
            tile.textContent = wordBonus || "";
            e.preventDefault(); 
        }
    });

      // Handle navigation with arrow keys
    tile.addEventListener('keydown', (e) => {
        const currentRow = parseInt(tile.dataset.row);
        const currentCol = parseInt(tile.dataset.col);
    
        let newRow = currentRow;
        let newCol = currentCol;
    
        if (e.key === 'ArrowUp') newRow--;
        else if (e.key === 'ArrowDown') newRow++;
        else if (e.key === 'ArrowLeft') newCol--;
        else if (e.key === 'ArrowRight') newCol++;
        else return;
    
        e.preventDefault(); // Stop default scrolling
    
        // Clamp the coordinates within board bounds
        if (newRow < 0 || newRow >= rowLength || newCol < 0 || newCol >= columnLength) return;
    
        const nextTile = document.querySelector(`.tile[data-row='${newRow}'][data-col='${newCol}']`);
        if (nextTile) nextTile.focus();
    });
});

document.addEventListener("DOMContentLoaded", () => {

     // Make each cell editable and limit input to one character
    squares.forEach(square => {
        const tile = square.querySelector('.tile');
        if (tile) {
            tile.contentEditable = true;
            tile.addEventListener("input", () => {
                tile.textContent = tile.textContent.slice(0, 1).toUpperCase();
                const letter = tile.textContent
                if (letter) {
                    tile.style.fontSize = "4vmin";
                }
                square.classList.remove('empty'); // Remove empty class when a letter is added
                square.classList.add('filled'); // Add filled class when a letter is added
            });
        }
    });
  });