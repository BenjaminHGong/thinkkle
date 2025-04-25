const board = document.querySelector('.board');

// Assuming a 15x15 board
const rowLength = 15 
const columnLength = 15
const specialTiles = [

    // Center Star Tile
    { row: 7, col: 7, type: 'star' }, 

    // Double Word Tiles
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

    // Triple Word Tiles
    { row: 0, col: 0, type: 'triple-word' },
    { row: 0, col: 7, type: 'triple-word' },
    { row: 0, col: 14, type: 'triple-word' },
    { row: 7, col: 0, type: 'triple-word' },
    { row: 7, col: 14, type: 'triple-word' },
    { row: 14, col: 0, type: 'triple-word' },
    { row: 14, col: 7, type: 'triple-word' },
    { row: 14, col: 14, type: 'triple-word' },

    // Double Letter Tiles
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

    // Triple Letter Tiles
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
        const tile = document.createElement('div');
        const specialTile = specialTiles.find(t => t.row === row && t.col === col);

        if (specialTile) {
            if (specialTile.type === 'star') {
                tile.textContent = '★';
            }
            else if (specialTile.type === 'double-word') {
                tile.textContent = '2W';
            }
            else if (specialTile.type === 'triple-word') {
                tile.textContent = '3W';
            }
            else if (specialTile.type === 'double-letter') {
                tile.textContent = '2L';
            }
            else if (specialTile.type === 'triple-letter') {
                tile.textContent = '3L';
            }
            tile.classList.add(specialTile.type); // Add class based on tile type
            tile.dataset.wordBonus = tile.textContent
        }
        else {
            tile.classList.add('normal'); // Add a class for normal tiles
        }

        board.appendChild(tile);
    }
}

const cells = document.querySelectorAll(".board div"); //Array of all cells in the board

cells.forEach(cell => {
    cell.addEventListener('beforeinput', (e) => {
        // Allow deletions, line breaks, etc.
        if (e.inputType.startsWith("delete") || e.inputType === "insertLineBreak") return;
        
        // If input is a single alphabetical character, allow it
        const text = e.data;
        if (!/^[a-zA-Z]$/.test(text)) {
            e.preventDefault(); // Block input
        }
        else {
            cell.textContent = ""; // Clear the cell before setting the new value
        }
    });

    // Prevent pasting
    cell.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    // Delete cell content on Backspace or Delete key press
    cell.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            const wordBonus = cell.dataset.wordBonus;
            cell.textContent = wordBonus || "";
            if (wordBonus !== "★") {
                cell.style.fontSize = "2vmin";
            }
            e.preventDefault(); 
        }
    });

      // Handle navigation with arrow keys
    cell.addEventListener("keydown", (e) => {
        let newCell;
        let index = Array.from(cells).indexOf(cell); // Get the index of the current cell
        switch (e.key) {
        case "ArrowUp":
            if (index - rowLength >= 0) {
                newCell = cells[index - rowLength]; // Move up 
            }
            break;
        case "ArrowDown":
            if (index + rowLength < cells.length) {
                newCell = cells[index + rowLength]; // Move down
            }
            break;
        case "ArrowLeft":
            if (index % rowLength > 0) {
                newCell = cells[index - 1]; // Move left
            }
            break;
        case "ArrowRight":
            if (index % rowLength < rowLength - 1) {
                newCell = cells[index + 1]; // Move right
            }
            break;
        }
        if (newCell) {
            newCell.focus();
            e.preventDefault(); // Prevent the default behavior (scrolling or selection changes)
        }
    });
    
});


document.addEventListener("DOMContentLoaded", () => {

     // Make each cell editable and limit input to one character
    cells.forEach(cell => {
        cell.contentEditable = true;

        cell.addEventListener("input", () => {
            cell.textContent = cell.textContent.slice(0, 1).toUpperCase();
            const letter = cell.textContent
            if (letter) {
                cell.style.fontSize = "4vmin";
            }
        });
    });
  });