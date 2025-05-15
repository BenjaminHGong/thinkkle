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
    const letters = Object.keys(tileBag);

    while (rackLetters.length < 7) {
        if (letters.length === 0) break; // Stop if the bag is empty

        // Pick a random letter
        const randomIndex = Math.floor(Math.random() * letters.length);
        const letter = letters[randomIndex];

        // Add the letter to the rack and decrement its count in the tile bag
        rackLetters.push(letter);
        tileBag[letter]--;
        if (tileBag[letter] === 0) {
            letters.splice(randomIndex, 1); // Remove letter if count reaches 0
        }

        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.classList.add('shadow'); // Class for rack tiles
        tile.textContent = letter;

        rack.appendChild(tile);
    }

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

