document.querySelectorAll('.board div').forEach(cell => {
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
  });


document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".board div");

    // Make each cell editable and limit input to one character
    cells.forEach(cell => {
      cell.contentEditable = true;
  
      cell.addEventListener("input", () => {
        cell.textContent = cell.textContent.slice(0, 1).toUpperCase();
      });
    });
  });