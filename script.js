const cells = document.querySelectorAll(".board div"); //Array of all cells in the board

document.querySelectorAll('.board div').forEach(cell => {

    const rowLength = 15 // Assuming a 15x15 board
    
    cell.addEventListener('beforeinput', (e) => {
        // Allow deletions, line breaks, etc.
        if (e.inputType.startsWith("delete") || e.inputType === "insertLineBreak") return;
        
        // If input is a single alphabetical character, allow it
        const text = e.data;
        if (!/^[a-zA-Z]$/.test(text)) {
            e.preventDefault(); // Block input
        }
    });

    //Prevent pasting
    cell.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    //Delete cell content on Backspace or Delete key press
    cell.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            
            cell.textContent = "";
            e.preventDefault(); 
        }
    });

      // Handle navigation with arrow keys
    cell.addEventListener("keydown", (e) => {
        let newCell;
        let index = Array.from(cells).indexOf(cell); // Get the index of the current cell
        switch (e.key) {
        case "ArrowUp":
            if (index - rowLength >= 0) {
                newCell = cells[index - rowLength]; // Move up 
            }
            break;
        case "ArrowDown":
            if (index + rowLength < cells.length) {
                newCell = cells[index + rowLength]; // Move down
            }
            break;
        case "ArrowLeft":
            if (index % rowLength > 0) {
                newCell = cells[index - 1]; // Move left
            }
            break;
        case "ArrowRight":
            if (index % rowLength < rowLength - 1) {
                newCell = cells[index + 1]; // Move right
            }
            break;
        }
        if (newCell) {
            newCell.focus();
            e.preventDefault(); // Prevent the default behavior (scrolling or selection changes)
        }
    });
    
});


document.addEventListener("DOMContentLoaded", () => {

     // Make each cell editable and limit input to one character
    cells.forEach(cell => {
        cell.contentEditable = true;

        cell.addEventListener("input", () => {
            cell.textContent = cell.textContent.slice(0, 1).toUpperCase();
        });
    });
  });