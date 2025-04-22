document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".board div");
  
    cells.forEach(cell => {
      cell.contentEditable = true;
  
      cell.addEventListener("input", () => {
        cell.textContent = cell.textContent.slice(0, 1).toUpperCase();
      });
    });
  });