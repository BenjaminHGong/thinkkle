import { getDirection, setDirection, moveIndicator, hideIndicator } from "./indicator.js"; // Import the indicator functions
import { getRackLetters, setRackLetters, addTileToRack } from "./rack.js"; // Import rack functions
import { rowLength, columnLength } from './constants.js'; // Import constants for board dimensions

const squares = document.querySelectorAll(".square"); //Array of all cells in the board

squares.forEach(square => {
    const tile = square.querySelector('.tile');
    tile.contentEditable = true; // Make the tile editable

    tile.addEventListener('beforeinput', (e) => {
        // Allow deletions, line breaks, etc.
        if (e.inputType.startsWith("delete") || e.inputType === "insertLineBreak") return;

        // If input is a single alphabetical character, allow it
        const text = e.data?.toUpperCase();
        const letter = tile.textContent;
        let rackLetters = getRackLetters(); // Get the current letters in the rack
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
        setRackLetters(rackLetters); // Update the rack letters in the module
    });
    
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
        const currentDirection = getDirection(); // Get the current direction from the indicator module
        if (currentDirection === 'right') {
            nextTile = document.querySelector(`.tile[data-row='${currentRow}'][data-col='${currentCol + 1}']`);
        } 
        else if (currentDirection === 'down') {
            nextTile = document.querySelector(`.tile[data-row='${currentRow + 1}'][data-col='${currentCol}']`);
        }                

        if (nextTile) {
            nextTile.focus();
            moveIndicator(nextTile);
        }
    });

    tile.addEventListener('focus', () => {
        moveIndicator(tile);
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
            const currentDirection = getDirection(); // Get the current direction from the indicator module
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
                moveIndicator(nextTile);
            }
        }
    });

      // Handle navigation with arrow keys
    tile.addEventListener('keydown', (e) => {
        const currentRow = parseInt(tile.dataset.row);
        const currentCol = parseInt(tile.dataset.col);
        const currentDirection = getDirection(); // Get the current direction from the indicator module
        let newRow = currentRow;
        let newCol = currentCol;
        if (e.key === 'ArrowUp') {
            setDirection('down'); 
            newRow--;
        }
        else if (e.key === 'ArrowDown') {
            if (currentDirection === 'down') {
                newRow++;
            }
            else {
                setDirection('down');
                moveIndicator(tile);
            }
        } 
        else if (e.key === 'ArrowLeft') {
            setDirection('right');
            newCol--;
        }
        else if (e.key === 'ArrowRight') {
            if (currentDirection === 'right') {
                newCol++;
            }
            else {
                setDirection('right');
                moveIndicator(tile);
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





