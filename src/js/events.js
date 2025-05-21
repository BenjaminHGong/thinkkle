import { getDirection, setDirection, moveIndicator, hideIndicator } from "./indicator.js"; // Import the indicator functions
import { getRackLetters, setRackLetters, addTileToRack, drawRack } from "./rack.js"; // Import rack functions
import { rowLength, columnLength } from './constants.js'; // Import constants for board dimensions
import { isFirstTurn, setFirstTurn, validateFirstTurn, validateSubsequentTurn} from "./wordcheck.js";
const squares = document.querySelectorAll(".square"); //Array of all cells in the board

squares.forEach(square => {
    const tile = square.querySelector('.tile');
    const tileInstance = square.tileInstance;
    const letterSpan = tile.querySelector('.tile-letter');
    letterSpan.contentEditable = true; // Make the letter editable

    letterSpan.addEventListener('beforeinput', (e) => {
        // Allow deletions
        if (e.inputType.startsWith("delete")) return;

        // If input is a single alphabetical character, allow it
        const text = e.data?.toUpperCase();
        const letter = letterSpan.textContent;
        let rackLetters = getRackLetters(); // Get the current letters in the rack
        if (!(/^[A-Z]$/.test(text) && rackLetters.includes(text))) {
            e.preventDefault(); // Block input
        } else if (square.classList.contains('empty') || tile.dataset.newlyPlaced === "true") {
            const index = rackLetters.indexOf(text);
            if (index !== -1) {
                rackLetters.splice(index, 1); // Remove from rackLetters
                const rackTile = document.querySelector(`.rack .tile:nth-child(${index + 1})`);
                if (rackTile) rackTile.remove(); // Remove from the rack display
                if (letter) addTileToRack(letter); // Add the letter back to the rack if it was already there
            }
            letterSpan.textContent = ""; // Clear the cell before setting the new value
            
        }
        setRackLetters(rackLetters); // Update the rack letters in the module
    });
    
    letterSpan.addEventListener("input", (e) => {
        if (square.classList.contains('filled') && tile.dataset.newlyPlaced === "false") {
            if (letterSpan.textContent !== tileInstance.getLetter()) {
                letterSpan.textContent = tileInstance.getLetter();
            }
        } 
        else {
            let inputLetter = letterSpan.textContent.slice(0, 1).toUpperCase();
            if (square.classList.contains('empty')) {
                tileInstance.setLetter(inputLetter); // Set the letter in the tile
                tile.dataset.newlyPlaced = "true"; // Mark the tile as newly placed

            }
            else if (tile.dataset.newlyPlaced === "true") {
                tileInstance.setLetter(inputLetter); // Set the letter in the tile
            }
        }
        
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
            const nextLetterSpan = nextTile.querySelector('.tile-letter');
            nextLetterSpan.focus();
            moveIndicator(nextTile);
        }
    });

    letterSpan.addEventListener('focus', () => {
        moveIndicator(tile);
    });

    // Prevent dragging and dropping text into the tile
    letterSpan.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // Prevent pasting
    letterSpan.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    // Delete cell content on Backspace or Delete key press
    letterSpan.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            if (tile.dataset.newlyPlaced !== "false") {
                const letter = letterSpan.textContent;
                if (letter) addTileToRack(letter); // Add the letter back to the rack
                tileInstance.clear(); // Clear the tile
            }
            e.preventDefault(); 
            const currentRow = parseInt(tile.dataset.row);
            const currentCol = parseInt(tile.dataset.col);
            const currentDirection = getDirection(); // Get the current direction from the indicator module
            let nextTile;
            if (currentDirection === 'right') {
                nextTile = document.querySelector(`.tile[data-row='${currentRow}'][data-col='${currentCol - 1}']`);
            } 
            else if (currentDirection === 'down') {
                nextTile = document.querySelector(`.tile[data-row='${currentRow - 1}'][data-col='${currentCol}']`);
            }
            if (nextTile) {
                const nextLetterSpan = nextTile.querySelector('.tile-letter');
                nextLetterSpan.focus();
                moveIndicator(nextTile);
            }
        }
    });

      // Handle navigation with arrow keys
    letterSpan.addEventListener('keydown', (e) => {
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
        if (nextTile) {
            const nextLetterSpan = nextTile.querySelector('.tile-letter');
            nextLetterSpan.focus();
        }
    });

    letterSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitButton.click(); // Trigger the submit button click event
            e.preventDefault(); // Prevent the default action of the Enter key
        }
    });

    letterSpan.addEventListener('blur', () => {
        hideIndicator(); // Hide the indicator when the tile loses focus
    });
});

const submitButton = document.querySelector("#submit-button");

submitButton.addEventListener("click", () => {
    let placedTiles = []
    document.querySelectorAll('.tile[data-newly-placed="true"]').forEach(tile => {
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        const letterSpan = tile.querySelector('.tile-letter');
        placedTiles.push({row, col, letter: letterSpan.textContent, element: tile});
    });

    let validationResult;
    if (isFirstTurn()) {
        validationResult = validateFirstTurn(placedTiles);
        if (validationResult.valid) {
            setFirstTurn(false); // Set first turn to false after validation
            // Proceed with the game logic for the first turn
            console.log("First turn is valid:", validationResult.message);
            placedTiles.forEach(tile => {
                tile.element.dataset.newlyPlaced = "false"; // Mark the tile as not newly placed
            });
            drawRack(); // Draw a new rack after the first turn
        } else {
            alert(validationResult.message); // Show error message to the user
        }
    }
    else {
        validationResult = validateSubsequentTurn(placedTiles);
        if (validationResult.valid) {
            // Proceed with the game logic for subsequent turns
            console.log("Subsequent turn is valid:", validationResult.message);
            placedTiles.forEach(tile => {
                tile.element.dataset.newlyPlaced = "false"; // Mark the tile as not newly placed
            });
            drawRack(); // Draw a new rack after the turn
        } else {
            alert(validationResult.message); // Show error message to the user
        }
    }
});
