import { Tile } from './tile.js';

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

let availableLetters = Object.keys(tileBag).filter(letter => tileBag[letter] > 0);
let rackLetters = []
drawRack(); // Initial draw of the rack

export function getRackLetters() {
    return rackLetters;
}

export function drawRack() {
    const rack = document.querySelector('.rack');
    while (rackLetters.length < 7) {
        if (availableLetters.length === 0) break; // Stop if the bag is empty

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
            const tile = new Tile(letter);
            rack.appendChild(tile.element);
            tile.element.addEventListener('click', () => {
                tile.element.classList.toggle('selected-for-redraw');
            });
            tile.element.classList.add('fading-in');
            setTimeout(() => tile.element.classList.remove('fading-in'), 400);
        } else {
            // Remove letter if count is 0 (shouldn't happen, but safe)
            availableLetters.splice(randomIndex, 1);
        }
    }
    return rackLetters;
}

export function addTileToRack(letter) {
    if (!letter) return; // Prevent adding empty tiles
    const rack = document.querySelector('.rack');
    const newTile = new Tile(letter);
    rack.appendChild(newTile.element);
    rackLetters.push(letter); // Add the letter back to the rackLetters array
    newTile.element.addEventListener('click', () => {
        newTile.element.classList.toggle('selected-for-redraw');
    });
    console.log(rackLetters)
}

export function removeTileFromRack(letter) {
    // Find the index of the letter in rackLetters
    const index = rackLetters.indexOf(letter);
    if (index !== -1) {
        rackLetters.splice(index, 1); // Remove from rackLetters

        // Remove the corresponding tile element from the rack DOM
        const rack = document.querySelector('.rack');
        // Find the nth tile (index + 1 because nth-child is 1-based)
        const rackTile = rack.querySelector(`.tile:nth-child(${index + 1})`);
        if (rackTile) rackTile.remove();
    }
    console.log(rackLetters);
}

export function addTileToBag(letter) {
    if (tileBag[letter] !== undefined) {
        tileBag[letter]++;
        availableLetters.push(letter);
    }
}

