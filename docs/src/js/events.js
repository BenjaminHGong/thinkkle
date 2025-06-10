import { getDirection, setDirection, moveIndicator, hideIndicator } from "./indicator.js";
import { getRackLetters, removeTileFromRack, addTileToRack, drawRack, addTileToBag, getBotRackLetters, redrawBotRack, removeTileFromBotRack, drawBotRack, isGameOver } from "./rack.js";
import { rowLength, columnLength, specialSquares, tileValues } from './constants.js';
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
        handleEndOfGame();
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
    let placedTiles = [];
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
                placedTiles.push(tileElem.tileInstance);
            }
        }
    }
    placedTiles.forEach(tile => {
        tile.setData('newlyPlaced', "false");
        tile.getElement().classList.add('bot-animated');
        setTimeout(() => tile.getElement().classList.remove('bot-animated'), 500);
        tile.setData('newlyPlaced', "false");
    });
    drawBotRack();

    const botScoreSpan = document.getElementById("bot-score");
    botScoreSpan.textContent = `${parseInt(botScoreSpan.textContent) + score}`;
}

function showGameOverPopup(title, message) {
    const modal = document.getElementById("gameover-modal");
    document.getElementById("gameover-title").textContent = title;
    document.getElementById("gameover-message").textContent = message;
    modal.style.display = "flex";
    document.getElementById("gameover-close").onclick = () => {
        modal.style.display = "none";
    };
}

function handleEndOfGame() {
    if (isGameOver()) {
        let playerScore = parseInt(document.getElementById("score").textContent);
        let botScore = parseInt(document.getElementById("bot-score").textContent);
        const playerRackTiles = getRackLetters();
        const botRackTiles = getBotRackLetters();
        const playerRackValue = playerRackTiles.reduce((sum, letter) => sum + tileValues[letter], 0);
        const botRackValue = botRackTiles.reduce((sum, letter) => sum + tileValues[letter], 0);
        if (playerRackTiles.length === 0 && botRackTiles.length > 0) {
            playerScore += botRackValue;
        }
        else if (botRackTiles.length === 0 && playerRackTiles.length > 0) {
            botScore += playerRackValue;
        }
        document.getElementById("score").textContent = playerScore;
        document.getElementById("bot-score").textContent = botScore;

        let title, message;
        if (playerScore > botScore) {
            title = "You Win!";
            message = `Game Over! You win with ${playerScore} points!`;
        } 
        else if (botScore > playerScore) {
            title = "Bot Wins!";
            message = `Game Over! Bot wins with ${botScore} points!`;
        } 
        else {
            title = "It's a Tie!";
            message = "Game Over! It's a tie!";
        }

        showGameOverPopup(title, message);
        document.getElementById("submit-button").disabled = true;
        document.getElementById("redraw-button").disabled = true;
        document.querySelectorAll('.square').forEach(square => {
            const letterSpan = square.tileInstance.getLetterSpan();
            letterSpan.contentEditable = false;
        });
        return true
    }
    else {
        return false;
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
    drawRack();
    if (handleEndOfGame()) return;
    exportBoardToBot();
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
    setFirstTurn(false);
    if (handleEndOfGame()) return;
    exportBoardToBot();
    
});
