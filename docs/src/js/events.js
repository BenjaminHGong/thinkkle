import { getDirection, setDirection, moveIndicator, hideIndicator } from "./indicator.js";
import { getRackLetters, removeTileFromRack, addTileToRack, drawRack, addTileToBag, getBotRackLetters, redrawBotRack, removeTileFromBotRack, drawBotRack, isGameOver } from "./rack.js";
import { rowLength, columnLength, specialSquares } from './constants.js';
import { isFirstTurn, setFirstTurn, validateFirstTurn, validateSubsequentTurn} from "./wordutils.js";
import { getBoardAs2DArray } from './board.js';
const squares = document.querySelectorAll(".square");

squares.forEach(square => {
    const tileInstance = square.tileInstance;
    const letterSpan = tileInstance.getLetterSpan();
    letterSpan.contentEditable = true;

    letterSpan.addEventListener('beforeinput', (e) => {
        if (e.inputType.startsWith("delete")) return;
        if (square.classList.contains('filled') && tileInstance.getData('newlyPlaced') === "false") return;
        const text = e.data?.toUpperCase();
        const letter = letterSpan.textContent;
        let rackLetters = getRackLetters();
        if (!(/^[A-Z]$/.test(text) && rackLetters.includes(text))) {
            e.preventDefault();
        } 
        else if (square.classList.contains('empty') || tileInstance.getData('newlyPlaced') === "true") {
            addTileToRack(letter);
            removeTileFromRack(text);
            letterSpan.textContent = "";
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
                tileInstance.setLetter(inputLetter);
                tileInstance.setData('newlyPlaced', "true");
            }
            else if (tileInstance.getData('newlyPlaced') === "true") {
                tileInstance.setLetter(inputLetter);
            }
        }
        
        const currentRow = parseInt(tileInstance.getData('row'));
        const currentCol = parseInt(tileInstance.getData('col'));

        let nextTileInstance;
        const currentDirection = getDirection();
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

    letterSpan.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    letterSpan.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    letterSpan.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            if (tileInstance.getData('newlyPlaced') !== "false") {
                const letter = letterSpan.textContent;
                if (letter) addTileToRack(letter);
                tileInstance.clear();
            }
            e.preventDefault();
            const currentRow = parseInt(tileInstance.getData('row'));
            const currentCol = parseInt(tileInstance.getData('col'));
            const currentDirection = getDirection();
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

    letterSpan.addEventListener('keydown', (e) => {
        const currentRow = parseInt(tileInstance.getData('row'));
        const currentCol = parseInt(tileInstance.getData('col'));
        const currentDirection = getDirection();
        let newRow = currentRow;
        let newCol = currentCol;
        if (e.key === 'ArrowUp') {
            setDirection('down');
            moveIndicator(tileInstance.getElement());
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
            moveIndicator(tileInstance.getElement());
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
    
        e.preventDefault();
    
        if (newRow < 0 || newRow >= rowLength || newCol < 0 || newCol >= columnLength) return;
    
        const nextTileInstance = getTileInstanceByCoords(newRow, newCol);
        if (nextTileInstance) {
            const nextLetterSpan = nextTileInstance.getLetterSpan();
            nextLetterSpan.focus();
        }
    });

    letterSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
            e.preventDefault();
        }
    });

    letterSpan.addEventListener('blur', () => {
        hideIndicator();
    });
});

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

function exportBoardToBot() {
    const board = getBoardAs2DArray();
    const rack = getBotRackLetters();
    console.log("Exporting board to bot:", board, rack, specialSquares);
    fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board, rack, specialSquares })
    })
    .then(response => response.json())
    .then(data => {
        const bestMove = data.moves;
        console.log(bestMove);
        placeBotMove(bestMove);
    });
}

function placeBotMove(move) {
    const { word, row, col, direction, rack_positions, validation_message, score } = move;
    if (validation_message == "No valid moves found.") {
        redrawBotRack();
        showError("No valid moves found. Bot redrew its rack.");
        return;
    }
    const rackSet = new Set(rack_positions.map(([r, c]) => `${r},${c}`));
    for (let i = 0; i < word.length; i++) {
        let r = row, c = col;
        if (direction === 'horizontal') c += i;
        else r += i;
        if (rackSet.has(`${r},${c}`)) {
            const tileElem = document.querySelector(`.tile[data-row='${r}'][data-col='${c}']`);
            if (tileElem?.tileInstance) {
                tileElem.tileInstance.setLetter(word[i]);
                tileElem.classList.add('bot-played');
                tileElem.classList.remove('empty');
                tileElem.classList.add('filled');
                tileElem.setAttribute('data-newly-placed', "false");
                removeTileFromBotRack(word[i]);
            }
        }
    }
    drawBotRack();

    const botScoreSpan = document.getElementById("bot-score");
    botScoreSpan.textContent = `${parseInt(botScoreSpan.textContent) + score}`;
}

function handleEndOfGame() {
    if (isGameOver()) {
        const playerScore = parseInt(document.getElementById("score").textContent);
        const botScore = parseInt(document.getElementById("bot-score").textContent);
        if (playerScore > botScore) {
            showError(`Game Over! You win with ${playerScore} points!`);
        } 
        else if (botScore > playerScore) {
            showError(`Game Over! Bot wins with ${botScore} points!`);
        } 
        else {
            showError("Game Over! It's a tie!");
        }
        document.getElementById("submit-button").disabled = true;
        document.getElementById("redraw-button").disabled = true;
        document.querySelectorAll('.rack .tile').forEach(tile => {
            tile.setAttribute('disabled', 'true');
        });
    }
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
            showError(validationResult.message); 
            return;
        }
    }
    else {
        validationResult = validateSubsequentTurn(placedTiles);
        if (!validationResult.valid) {
            showError(validationResult.message); 
            return;
        }
    }
    placedTiles.forEach(tile => {
        tile.instance.setData('newlyPlaced', "false"); 
        tile.instance.getElement().classList.add('played');
        setTimeout(() => tile.instance.getElement().classList.remove('played'), 500);
        tile.instance.setData('newlyPlaced', "false");
    });

    
    turn.textContent = `${parseInt(turn.textContent) + 1}` 

    const score = validationResult.score; 
    const scoreSpan = document.getElementById("score");
    scoreSpan.textContent = `${parseInt(scoreSpan.textContent) + score}`;

    errorMessage.style.color = "green"; 
    showError(`${validationResult.message} (+${score} Points)`);
    
    exportBoardToBot(); 
    drawRack();

    handleEndOfGame();
});

document.getElementById('redraw-button').addEventListener('click', () => {
    document.querySelectorAll('.tile[data-newly-placed="true"]').forEach(tileElem => {
        const tileInstance = tileElem.tileInstance;
        const letter = tileInstance.getLetter();
        if (letter) {
            addTileToRack(letter);
            tileInstance.clear();
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
        const letter = letterSpan.textContent[0];
        tileElem.classList.add('fading-out');
        setTimeout(() => {
            addTileToBag(letter);
            removeTileFromRack(letter);
            completed++;
            if (completed === total) {
                drawRack();
            }
        }, 400);
    });

    turn.textContent = `${parseInt(turn.textContent) + 1}` 

    exportBoardToBot();
});
