import { Tile } from './tile.js';

let tileBag = {
    'A': 9, 
    'B': 2, 
    'C': 2, 
    'D': 4, 
    'E': 12,
    'F': 2,
    'G': 3,
    'H': 2,
    'I': 9,
    'J': 1,
    'K': 1,
    'L': 4,
    'M': 2,
    'N': 6,
    'O': 8,
    'P': 2,
    'Q': 1,
    'R': 6,
    'S': 4,
    'T': 6,
    'U': 4,
    'V': 2,
    'W': 2,
    'X': 1,
    'Y': 2,
    'Z': 1
};

let availableLetters = Object.keys(tileBag).filter(letter => tileBag[letter] > 0);
let rackLetters = []
drawRack(); 
let botRackLetters = [];
drawBotRack(); 

export function getBotRackLetters() {
    return botRackLetters;
}

export function drawBotRack() {
    while (botRackLetters.length < 7) {
        if (availableLetters.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        const letter = availableLetters[randomIndex];
        if (tileBag[letter] > 0) {
            botRackLetters.push(letter);
            tileBag[letter]--;
            if (tileBag[letter] === 0) {
                availableLetters.splice(randomIndex, 1);
            }
        } 
        else {
            availableLetters.splice(randomIndex, 1);
        }
    }
    return botRackLetters;
}

export function removeTileFromBotRack(letter) {
    const index = botRackLetters.indexOf(letter);
    if (index !== -1) {
        botRackLetters.splice(index, 1);
    }
}

export function redrawBotRack() {
    while (botRackLetters.length > 0) {
        const letter = botRackLetters[0];
        removeTileFromBotRack(letter); 
        addTileToBag(letter); 
    }
    drawBotRack(); 
}

export function getRackLetters() {
    return rackLetters;
}

export function drawRack() {
    const rack = document.querySelector('.rack');
    while (rackLetters.length < 7) {
        if (availableLetters.length === 0) break; 
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        const letter = availableLetters[randomIndex];
        if (tileBag[letter] > 0) {
            rackLetters.push(letter);
            tileBag[letter]--;
            if (tileBag[letter] === 0) {
                availableLetters.splice(randomIndex, 1); 
            }
            const tile = new Tile(letter);
            rack.appendChild(tile.element);
            tile.element.addEventListener('click', () => {
                tile.element.classList.toggle('selected-for-redraw');
            });
            tile.element.classList.add('fading-in');
            setTimeout(() => tile.element.classList.remove('fading-in'), 400);
        } 
        else {
            
            availableLetters.splice(randomIndex, 1);
        }
    }
    return rackLetters;
}

export function addTileToRack(letter) {
    if (!letter) return; 
    const rack = document.querySelector('.rack');
    const newTile = new Tile(letter);
    rack.appendChild(newTile.element);
    rackLetters.push(letter); 
    newTile.element.addEventListener('click', () => {
        newTile.element.classList.toggle('selected-for-redraw');
    });
}

export function removeTileFromRack(letter) {
    const index = rackLetters.indexOf(letter);
    if (index !== -1) {
        rackLetters.splice(index, 1); 
        const rack = document.querySelector('.rack');
        const rackTile = rack.querySelector(`.tile:nth-child(${index + 1})`);
        if (rackTile) rackTile.remove();
    }
}

export function addTileToBag(letter) {
    if (tileBag[letter] !== undefined) {
        tileBag[letter]++;
        availableLetters.push(letter);
    }
}

export function isGameOver() {
    const playerRack = getRackLetters();
    const botRack = getBotRackLetters();
    const bagEmpty = Object.values(tileBag).every(count => count === 0);
    return bagEmpty && (playerRack.length === 0 || botRack.length === 0);
}