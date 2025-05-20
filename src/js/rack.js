import { createTile } from './board.js';

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

let rackLetters = []
drawRack(); // Initial draw of the rack

export function getRackLetters() {
    return rackLetters;
}

export function setRackLetters(letters) {
    rackLetters = letters;
}

export function drawRack() {
    const rack = document.querySelector('.rack');
    // Only include letters with count > 0
    let availableLetters = Object.keys(tileBag).filter(l => tileBag[l] > 0);

    while (rackLetters.length < 7 && availableLetters.length > 0) {
        // Pick a random letter
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        const letter = availableLetters[randomIndex];

        // Double-check the count before drawing
        if (tileBag[letter] > 0) {
            rackLetters.push(letter);
            tileBag[letter]--;
            if (tileBag[letter] === 0) {
                availableLetters.splice(randomIndex, 1); // Remove letter if count reaches 0
            }
            const tile = createTile(letter);
            rack.appendChild(tile);
        } else {
            // Remove letter if count is 0 (shouldn't happen, but safe)
            availableLetters.splice(randomIndex, 1);
        }
    }
    console.log(tileBag);
    return rackLetters;
    
}

export function addTileToRack(letter) {
    const rack = document.querySelector('.rack');
    const newTile = document.createElement('div');
    newTile.classList.add('tile');
    newTile.classList.add('shadow'); // Class for rack tiles
    newTile.textContent = letter;
    rack.appendChild(newTile);
    rackLetters.push(letter); // Add the letter back to the rackLetters array
}

