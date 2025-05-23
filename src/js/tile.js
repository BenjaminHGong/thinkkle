import { tileValues } from './constants.js';

export class Tile {
    constructor(letter = "", row = -1, col = -1) {
        this.letter = letter;
        this.element = document.createElement('div');
        this.element.classList.add('tile', 'shadow'); 

        this.letterSpan = document.createElement('span');
        this.letterSpan.classList.add('tile-letter');
        this.letterSpan.textContent = letter;
        this.element.appendChild(this.letterSpan);

        this.scoreSpan = document.createElement('span');
        this.scoreSpan.classList.add('tile-score');
        this.scoreSpan.textContent = tileValues[letter] || 0;
        this.element.appendChild(this.scoreSpan);

        this.element.dataset.row = row;
        this.element.dataset.col = col;

        if (letter === "Q" || letter === "X") {
            this.letterSpan.style.paddingRight = "0.2em";
        }
    }

    getLetter() {
        return this.letter;
    }

    setLetter(letter) {
        this.letter = letter;
        this.letterSpan.textContent = letter;
        this.scoreSpan.textContent = tileValues[letter] || 0; // Update score based on the new letter
        if (letter === "Q" || letter === "X") {
            this.letterSpan.style.marginRight = "0.2em";
        }
        this.getSquare().classList.remove('empty'); 
        this.getSquare().classList.add('filled'); // Add filled class
    }

    clear() {
        this.setLetter("");
        this.element.dataset.newlyPlaced = "false"; 
        this.getSquare().classList.remove('filled'); 
        this.getSquare().classList.add('empty'); // Add empty class
    }

    getScore() {
        return this.score;
    }

    getSquare() {
        return this.element.parentElement; // Get the parent square of the tile
    }
}
