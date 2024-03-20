document.addEventListener('DOMContentLoaded', function() {
    let gridSize = 0;
    let numMines = 0;
    let size = 0;
    const grid = document.querySelector('.container');
    let mineLocations = [];
    let firstMove = true;
    let remainingCells = 0;

    function initializeGame() {
        let validInput = false;
        while (!validInput) {
            size = parseInt(prompt("Ingrese el tamaño del tablero (mínimo 5x5):"));
            numMines = parseInt(prompt("Ingrese la cantidad de minas:"));
            if (size >= 5 && numMines < size * size) {
                validInput = true;
                gridSize = size * size;
                mineLocations = [];
                firstMove = true;
                createGrid();
            } else {
                alert("Ingrese un tamaño válido para el tablero (mínimo 5x5) y una cantidad de minas menor al tamaño del tablero.");
            }
        }
    }

    function createGrid() {
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${size}, 30px)`;
        grid.style.gridTemplateRows = `repeat(${size}, 30px)`;
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', 'hidden');
            cell.dataset.index = i;
            cell.addEventListener('click', handleClick);
            cell.addEventListener('contextmenu', handleRightClick); // Agregar evento de clic derecho
            grid.appendChild(cell);
        }
        remainingCells = size * size - numMines;
    }

    function placeMines(firstIndex) {
        const excludedIndexes = [firstIndex];
        for (let i = 0; i < numMines; i++) {
            let location = Math.floor(Math.random() * (size * size));
            while (mineLocations.includes(location) || excludedIndexes.includes(location)) {
                location = Math.floor(Math.random() * (size * size));
            }
            mineLocations.push(location);
        }
    }
    function handleClick(event) {
        if (event.button === 0) {
            const index = parseInt(event.target.dataset.index);
            if (firstMove) {
                placeMines(index);
                firstMove = false;
            }
    
            if (mineLocations.includes(index)) {
                event.target.classList.add('mine');
                revealMines();
                gameOver(false); 
            } else {
                const adjacentMines = countAdjacentMines(index);
                if (adjacentMines > 0) {
                    event.target.textContent = adjacentMines;
                    event.target.classList.add('number');
                } else {
                    revealEmptyCells(index);
                }
                remainingCells--;
                checkForWin(); // Verificar si el jugador ha ganado después de cada movimiento
            }
            event.target.classList.remove('hidden');
        }
        event.preventDefault();
    }
    function checkForWin() {
        const remainingHiddenCells = document.querySelectorAll('.cell.hidden:not(.flag)').length;
        if (remainingHiddenCells === numMines) {
            gameOver(true);
        }
    }
    
    function gameOver(win) {
        if (win) {
            alert('¡Felicidades, has ganado!');
            const resetButton = document.getElementById('resetButton');
            resetButton.style.display = 'inline-block'; 
        } else {
            const lossMessage = document.getElementById('lossMessage');
            lossMessage.style.display = 'block'; 
            const resetButton = document.getElementById('resetButton');
            resetButton.style.display = 'inline-block'; 
        }
        // Resto del código de la función gameOver...
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.removeEventListener('click', handleClick);
            cell.removeEventListener('contextmenu', handleRightClick);
        });
        const revealedCells = document.querySelectorAll('.cell:not(.hidden)');
        revealedCells.forEach(cell => cell.classList.remove('hidden'));
    }

    function handleRightClick(event) {
        const cell = event.target;
        if (!cell.classList.contains('hidden')) return; 
        if (!cell.classList.contains('flag')) {
            cell.classList.add('flag');
        } else {
            cell.classList.remove('flag');
        }
        event.preventDefault();
    }

    function countAdjacentMines(index) {
        const row = Math.floor(index / size);
        const col = index % size;
        let count = 0;
        for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, size - 1); i++) {
            for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, size - 1); j++) {
                const currentIndex = i * size + j;
                if (mineLocations.includes(currentIndex)) {
                    count++;
                }
            }
        }
        return count;
    }

    function revealEmptyCells(index) {
        const row = Math.floor(index / size);
        const col = index % size;
        const visited = new Set();
        const queue = [index];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const currentRow = Math.floor(current / size);
            const currentCol = current % size;

            if (visited.has(current)) continue;

            const adjacentMines = countAdjacentMines(current);
            if (adjacentMines === 0) {
                const cell = grid.children[current];
                cell.classList.remove('hidden');
                visited.add(current);
                for (let i = Math.max(0, currentRow - 1); i <= Math.min(currentRow + 1, size - 1); i++) {
                    for (let j = Math.max(0, currentCol - 1); j <= Math.min(currentCol + 1, size - 1); j++) {
                        const nextIndex = i * size + j;
                        if (!visited.has(nextIndex)) {
                            queue.push(nextIndex);
                        }
                    }
                }
            } else {
                const cell = grid.children[current];
                cell.textContent = adjacentMines;
                cell.classList.remove('hidden');
                cell.classList.add('number');
            }
        }
    }

    function revealMines() {
        mineLocations.forEach(location => {
            const cell = grid.children[location];
            cell.classList.remove('hidden');
            cell.classList.add('mine');
        });
    }



    initializeGame();

    // Agregar el evento de clic para el botón de reinicio
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', function() {
        initializeGame();
        const lossMessage = document.getElementById('lossMessage');
        lossMessage.style.display = 'none'; // Ocultar el mensaje de pérdida al reiniciar el juego
        resetButton.style.display = 'none'; // Ocultar el botón de reinicio al reiniciar el juego
    });
});
