import { getDirection, setDirection, moveIndicator, hideIndicator } from "./indicator.js";
import { getRackLetters, removeTileFromRack, addTileToRack, drawRack, addTileToBag } from "./rack.js";
import { rowLength, columnLength } from './constants.js';
import { isFirstTurn, setFirstTurn, validateFirstTurn, validateSubsequentTurn} from "./wordutils.js";
const squares = document.querySelectorAll(".square");

squares.forEach(square => {
    const tileInstance = square.tileInstance;
    const letterSpan = tileInstance.getLetterSpan();
    letterSpan.contentEditable = true;

    letterSpan.addEventListener('beforeinput', (e) => {
        // Allow deletions
        if (e.inputType.startsWith("delete")) return;

        //Allow movement to the next tile on top of already placed tiles
        if (square.classList.contains('filled') && tileInstance.getData('newlyPlaced') === "false") return;

        // If input is a single alphabetical character, allow it
        const text = e.data?.toUpperCase();
        const letter = letterSpan.textContent;
        let rackLetters = getRackLetters(); // Get the current letters in the rack
        if (!(/^[A-Z]$/.test(text) && rackLetters.includes(text))) {
            e.preventDefault(); // Block input
        } else if (square.classList.contains('empty') || tileInstance.getData('newlyPlaced') === "true") {
            addTileToRack(letter);
            removeTileFromRack(text); // Remove the letter from the rack if it exists
            letterSpan.textContent = ""; // Clear the cell before setting the new value
        }
    });
    
    letterSpan.addEventListener("input", (e) => {
        if (square.classList.contains('filled') && tileInstance.getData('newlyPlaced') === "false") {
            if (letterSpan.textContent !== tileInstance.getLetter()) {
                letterSpan.textContent = tileInstance.getLetter();
            }
        } 
        else {
            let inputLetter = letterSpan.textContent.slice(0, 1).toUpperCase();
            if (square.classList.contains('empty')) {
                tileInstance.setLetter(inputLetter); // Set the letter in the tile
                tileInstance.setData('newlyPlaced', "true"); // Mark the tile as newly placed

            }
            else if (tileInstance.getData('newlyPlaced') === "true") {
                tileInstance.setLetter(inputLetter); // Set the letter in the tile
            }
        }
        
        const currentRow = parseInt(tileInstance.getData('row'));
        const currentCol = parseInt(tileInstance.getData('col'));

        let nextTileInstance;
        const currentDirection = getDirection(); // Get the current direction from the indicator module
        if (currentDirection === 'right') {
            nextTileInstance = getTileInstanceByCoords(currentRow, currentCol + 1);
        } 
        else if (currentDirection === 'down') {
            nextTileInstance = getTileInstanceByCoords(currentRow + 1, currentCol);
        }                

        if (nextTileInstance) {
            const nextLetterSpan = nextTileInstance.getLetterSpan();
            nextLetterSpan.focus();
            moveIndicator(nextTileInstance.getElement());
        }
    });

    letterSpan.addEventListener('focus', () => {
        moveIndicator(tileInstance.getElement());
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
            if (tileInstance.getData('newlyPlaced') !== "false") {
                const letter = letterSpan.textContent;
                if (letter) addTileToRack(letter); // Add the letter back to the rack
                tileInstance.clear(); // Clear the tile
            }
            e.preventDefault(); 
            const currentRow = parseInt(tileInstance.getData('row'));
            const currentCol = parseInt(tileInstance.getData('col'));
            const currentDirection = getDirection(); // Get the current direction from the indicator module
            let nextTileInstance;
            if (currentDirection === 'right') {
                nextTileInstance = getTileInstanceByCoords(currentRow, currentCol - 1);
            } 
            else if (currentDirection === 'down') {
                nextTileInstance = getTileInstanceByCoords(currentRow - 1, currentCol);
            }
            if (nextTileInstance) {
                const nextLetterSpan = nextTileInstance.getLetterSpan();
                nextLetterSpan.focus();
                moveIndicator(nextTileInstance.getElement());
            }
        }
    });

      // Handle navigation with arrow keys
    letterSpan.addEventListener('keydown', (e) => {
        const currentRow = parseInt(tileInstance.getData('row'));
        const currentCol = parseInt(tileInstance.getData('col'));
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
                moveIndicator(tileInstance.getElement());
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
                moveIndicator(tileInstance.getElement());
            }
        }
        else return;
    
        e.preventDefault(); // Stop default scrolling
    
        // Clamp the coordinates within board bounds
        if (newRow < 0 || newRow >= rowLength || newCol < 0 || newCol >= columnLength) return;
    
        const nextTileInstance = getTileInstanceByCoords(newRow, newCol);
        if (nextTileInstance) {
            const nextLetterSpan = nextTileInstance.getLetterSpan();
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

// Helper function to get tileInstance by row and col
function getTileInstanceByCoords(row, col) {
    const tileElem = document.querySelector(`.tile[data-row='${row}'][data-col='${col}']`);
    if (!tileElem) return null;
    return tileElem.tileInstance;
}

const submitButton = document.getElementById("submit-button");
const errorMessage = document.getElementById("error-message");
const turn = document.getElementById("turn");

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('fading-out');
    errorMessage.classList.add('fading-in');
    setTimeout(() => {
        errorMessage.classList.remove('fading-in');
        errorMessage.classList.add('fading-out');
        setTimeout(() => {
            errorMessage.textContent = "";
            errorMessage.classList.remove('fading-out');
            errorMessage.style.color = "red";
        }, 400);
    }, 1600);
}

submitButton.addEventListener("click", () => {
    let placedTiles = []
    document.querySelectorAll('.tile[data-newly-placed="true"]').forEach(tileElem => {
        const tileInstance = tileElem.tileInstance;
        const row = parseInt(tileInstance.getData('row'));
        const col = parseInt(tileInstance.getData('col'));
        const letterSpan = tileInstance.getLetterSpan();
        placedTiles.push({row, col, letter: letterSpan.textContent, instance: tileInstance});
    });

    let validationResult;
    if (isFirstTurn()) {
        validationResult = validateFirstTurn(placedTiles);
        if (validationResult.valid) {
            setFirstTurn(false);
        } else {
            showError(validationResult.message); // Show error message to the user
            return;
        }
    }
    else {
        validationResult = validateSubsequentTurn(placedTiles);
        if (!validationResult.valid) {
            showError(validationResult.message); // Show error message to the user
            return;
        }
    }
    placedTiles.forEach(tile => {
        tile.instance.setData('newlyPlaced', "false"); // Mark the tile as not newly placed
        tile.instance.getElement().classList.add('played');
        setTimeout(() => tile.instance.getElement().classList.remove('played'), 500);
        tile.instance.setData('newlyPlaced', "false");
    });

    drawRack(); // Draw a new rack after the first turn
    turn.textContent = `${parseInt(turn.textContent) + 1}` 

    const score = validationResult.score; // Update the score
    const scoreSpan = document.getElementById("score");
    scoreSpan.textContent = `${parseInt(scoreSpan.textContent) + score}`; // Update the score display 

    errorMessage.style.color = "green"; // Green for success
    showError(`${validationResult.message} (+${score} Points)`);
    

});

document.getElementById('redraw-button').addEventListener('click', () => {
    document.querySelectorAll('.tile[data-newly-placed="true"]').forEach(tileElem => {
        const tileInstance = tileElem.tileInstance;
        const letter = tileInstance.getLetter();
        if (letter) {
            addTileToRack(letter);
            tileInstance.clear(); // Clear the tile
        }
    });

    const rack = document.querySelector('.rack');
    const selectedTiles = Array.from(rack.querySelectorAll('.tile.selected-for-redraw'));
    if (selectedTiles.length === 0) return;

    let completed = 0;
    const total = selectedTiles.length;

    selectedTiles.forEach(tileElem => {
        const tileInstance = tileElem.tileInstance;
        const letterSpan = tileInstance.getLetterSpan();
        const letter = letterSpan.textContent[0]; // Assumes letter is first character
        tileElem.classList.add('fading-out');
        setTimeout(() => {
            addTileToBag(letter);
            removeTileFromRack(letter); // Remove the letter from the rackLetters array
            completed++;
            if (completed === total) {
                drawRack(); // Only redraw once, after all selected tiles are removed
            }
        }, 400);
    });

    turn.textContent = `${parseInt(turn.textContent) + 1}` 
});
