const dictionary = new Set();
fetch('wordlist.txt')
    .then(response => response.text())
    .then(data => {
        const words = data.split('\n').map(word => word.trim());
        words.forEach(word => dictionary.add(word));
    })
    .catch(error => console.error('Error loading word list:', error));








