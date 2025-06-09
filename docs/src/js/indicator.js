const indicator = document.getElementById('direction-indicator');

let currentDirection = 'right';
indicator.classList.add(currentDirection);

export function getDirection() {
    return currentDirection;
}

export function setDirection(direction) {
    currentDirection = direction;
    indicator.className = '';
    indicator.classList.add(currentDirection);
}

export function moveIndicator(tile) {
    const square = tile.closest('.square');
    const rect = square.getBoundingClientRect();
    let top = rect.top + window.scrollY || document.documentElement.scrollTop;
    let left = rect.left + window.scrollX || document.documentElement.scrollLeft;
    
    const size = rect.width;

    indicator.className = '';
    indicator.classList.add(currentDirection);
    indicator.style.display = 'block';

    if (currentDirection === 'right') {
        top += size / 2;
        left += size;
    } 
    else if (currentDirection === 'down') {
        top += size;
        left += size / 2;
    }

    indicator.style.top = `${top}px`;
    indicator.style.left = `${left}px`;
    indicator.style.visibility = 'visible';
}

export function hideIndicator() {
    indicator.style.visibility = 'hidden';
}

window.addEventListener('resize', () => {
    const focused = document.activeElement;
    if (focused?.classList.contains('tile-letter')) {
        moveIndicator(focused);
    }
});