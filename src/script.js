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

let tileBag = {
    'A': 8, 
    'B': 2, 
    'C': 4, 
    'D': 4, 
    'E': 11,
    'F': 2,
    'G': 3,
    'H': 2,
    'I': 9,
    'J': 1,
    'K': 1,
    'L': 5,
    'M': 3,
    'N': 7,
    'O': 8,
    'P': 3,
    'Q': 1,
    'R': 7,
    'S': 9,
    'T': 7,
    'U': 3,
    'V': 1,
    'W': 1,
    'X': 1,
    'Y': 2,
    'Z': 1
};

const tileValues = {
    'A': 1, 
    'B': 4, 
    'C': 2, 
    'D': 2, 
    'E': 1,
    'F': 6,
    'G': 2,
    'H': 4,
    'I': 1,
    'J': 10,
    'K': 6,
    'L': 1,
    'M': 2,
    'N': 1,
    'O': 1,
    'P': 2,
    'Q': 10,
    'R': 1,
    'S': 1,
    'T': 1,
    'U': 2,
    'V': 6,
    'W': 6,
    'X': 10,
    'Y': 4,
    'Z': 8
}

const dictionary = new Set();
fetch('wordlist.txt')
    .then(response => response.text())
    .then(data => {
        const words = data.split('\n').map(word => word.trim());
        words.forEach(word => dictionary.add(word));
    })
    .catch(error => console.error('Error loading word list:', error));

function drawRack() {
    const rack = document.querySelector('.rack');
    rack.innerHTML = ''; // Clear the rack
    const letters = Object.keys(tileBag);
    const rackLetters = [];

    while (rackLetters.length < 7) {
        if (letters.length === 0) break; // Stop if the bag is empty

        // Pick a random letter
        const randomIndex = Math.floor(Math.random() * letters.length);
        const letter = letters[randomIndex];

        // Add the letter to the rack and decrement its count in the tile bag
        rackLetters.push(letter);
        tileBag[letter]--;
        if (tileBag[letter] === 0) {
            letters.splice(randomIndex, 1); // Remove letter if count reaches 0
        }

        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.classList.add('shadow'); // Class for rack tiles
        tile.textContent = letter;

        rack.appendChild(tile);
    }

    return rackLetters;
}

function addTileToRack(letter) {
    const rack = document.querySelector('.rack');
    const newTile = document.createElement('div');
    newTile.classList.add('tile');
    newTile.classList.add('shadow'); // Class for rack tiles
    newTile.textContent = letter;
    rack.appendChild(newTile);
    rackLetters.push(letter); // Add the letter back to the rackLetters array
}

let rackLetters = drawRack();

const indicator = document.getElementById('direction-indicator');
let currentDirection = 'right'; // Default direction
indicator.classList.add(currentDirection); // Set default direction

function moveIndicator(tile, direction) {
    const square = tile.closest('.square');
    const rect = square.getBoundingClientRect();
    let top = rect.top + window.scrollY || document.documentElement.scrollTop;
    let left = rect.left + window.scrollX || document.documentElement.scrollLeft;
    
    const size = rect.width;

    indicator.className = ''; // reset
    indicator.classList.add(direction);
    indicator.style.display = 'block';

    if (direction === 'right') {
        top += size / 2;
        left += size;
    } else if (direction === 'down') {
        top += size;
        left += size / 2;
    }

    indicator.style.top = `${top}px`;
    indicator.style.left = `${left}px`;
    indicator.style.visibility = 'visible'; // Show the indicator
}

function hideIndicator() {
    indicator.style.visibility = 'hidden';
}

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

const squares = document.querySelectorAll(".square"); //Array of all cells in the board

squares.forEach(square => {
    const tile = square.querySelector('.tile');
    tile.addEventListener('beforeinput', (e) => {
        // Allow deletions, line breaks, etc.
        if (e.inputType.startsWith("delete") || e.inputType === "insertLineBreak") return;

        // If input is a single alphabetical character, allow it
        const text = e.data?.toUpperCase();
        const letter = tile.textContent;
        if (!rackLetters.includes(text)) {
            e.preventDefault(); // Block input
        } else {
            const index = rackLetters.indexOf(text);
            if (index !== -1) {
                rackLetters.splice(index, 1); // Remove from rackLetters
                const rackTile = document.querySelector(`.rack .tile:nth-child(${index + 1})`);
                if (rackTile) rackTile.remove(); // Remove from the rack display
                if (letter) addTileToRack(letter); // Add the letter back to the rack if it was already there
            }
            
            tile.textContent = ""; // Clear the cell before setting the new value
        }
    });

    // Prevent dragging and dropping text into the tile
    tile.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // Prevent pasting
    tile.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    // Delete cell content on Backspace or Delete key press
    tile.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault(); 
            square.classList.add('empty'); // Add empty class back when cleared
            square.classList.remove('filled'); // Remove filled class when cleared
            tile.dataset.newlyPlaced = "false"; // Mark the tile as not newly placed
            tile.classList.remove('shadow');
            const currentRow = parseInt(tile.dataset.row);
            const currentCol = parseInt(tile.dataset.col);
            const letter = tile.textContent;
            if (letter) addTileToRack(letter); // Add the letter back to the rack
            tile.textContent = "";
            let nextTile;
            if (currentDirection === 'right') {
                nextTile = document.querySelector(`.tile[data-row='${currentRow}'][data-col='${currentCol - 1}']`);
            } 
            else if (currentDirection === 'down') {
                nextTile = document.querySelector(`.tile[data-row='${currentRow - 1}'][data-col='${currentCol}']`);
            }
            if (nextTile) {
                nextTile.focus();
                moveIndicator(nextTile, currentDirection);
            }
        }
    });

      // Handle navigation with arrow keys
    tile.addEventListener('keydown', (e) => {
        const currentRow = parseInt(tile.dataset.row);
        const currentCol = parseInt(tile.dataset.col);
    
        let newRow = currentRow;
        let newCol = currentCol;
    
        if (e.key === 'ArrowUp') {
            currentDirection = 'down';
            newRow--;
        }
        else if (e.key === 'ArrowDown') {
            if (currentDirection === 'down') {
                newRow++;
            }
            else {
                currentDirection = 'down';
                moveIndicator(tile, currentDirection);
            }
        } 
        else if (e.key === 'ArrowLeft') {
            currentDirection = 'right';
            newCol--;
        }
        else if (e.key === 'ArrowRight') {
            if (currentDirection === 'right') {
                newCol++;
            }
            else {
                currentDirection = 'right';
                moveIndicator(tile, currentDirection);
            }
        }
        else return;
    
        e.preventDefault(); // Stop default scrolling
    
        // Clamp the coordinates within board bounds
        if (newRow < 0 || newRow >= rowLength || newCol < 0 || newCol >= columnLength) return;
    
        const nextTile = document.querySelector(`.tile[data-row='${newRow}'][data-col='${newCol}']`);
        if (nextTile) nextTile.focus();
    });

    tile.addEventListener('blur', () => {
        hideIndicator(); // Hide the indicator when the tile loses focus
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
                const letter = tile.textContent;
                if (letter) {
                    tile.style.fontSize = "4vmin";
                }
                square.classList.remove('empty'); // Remove empty class when a letter is added
                square.classList.add('filled'); // Add filled class when a letter is added
                tile.classList.add('shadow');

                const currentRow = parseInt(tile.dataset.row);
                const currentCol = parseInt(tile.dataset.col);

                let nextTile;
                if (currentDirection === 'right') {
                    nextTile = document.querySelector(`.tile[data-row='${currentRow}'][data-col='${currentCol + 1}']`);
                } 
                else if (currentDirection === 'down') {
                    nextTile = document.querySelector(`.tile[data-row='${currentRow + 1}'][data-col='${currentCol}']`);
                }                

                if (nextTile) {
                    nextTile.focus();
                    moveIndicator(nextTile, currentDirection);
                }
            });
            tile.addEventListener('focus', () => {
                moveIndicator(tile, currentDirection);
            });
        }
    });
});

window.addEventListener('resize', () => {
    const focused = document.activeElement;
    if (focused?.classList.contains('tile')) {
        moveIndicator(focused, currentDirection);
    }
});