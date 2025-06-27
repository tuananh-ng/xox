const gameInterface = ScreenController();
document.querySelector('#new-game').addEventListener('click', () => {
    gameInterface.clearGameState();
    gameInterface.createGame();
    gameInterface.playGame();
});

function Player(name, markType) {
    let isWinner = false;
    const getName = () => name;
    const getMarkType = () => markType;
    const getWinnerStatus = () => isWinner;
    const setWinner = () => isWinner = true;
    
    return {getName, getMarkType, getWinnerStatus, setWinner};
}

function Cell(location = {row: 0, column: 0}) {
    let value = null;
    const getLocation = () => location;
    const getMark = () => value;
    const setMark = (mark) => value = mark;

    return {getLocation, getMark, setMark};
}

function GameBoard(size = 3) {
    if (size < 2) {
        throw new Error('Not enough cells to draw a board!');
    }

    const board = [];
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i].push(Cell({row: i, column: j}));
        }
    }
    let numPlacedMarks = 0;

    const getNumPlacedMarks = () => numPlacedMarks
    const getBoard = () => board;
    const printBoard = () => {
        getBoard().map(
            (row) => console.log(row.map((cell) => cell.getMark()))
        );
    };

    const placeMark = (mark, row, column) => {
        if ((row < 0 || row >= size) || (column < 0 || column >= size)) {
            throw new Error('Invalid position!');
        }
        if (board[row][column].getMark() !== null) {
            throw new Error(`There is already a mark at row ${row} and column ${column}`);
        }

        board[row][column].setMark(mark);
        numPlacedMarks++;
    };

    return {getBoard, printBoard, placeMark, getNumPlacedMarks};
}

function GameController(gameSize = 3) {
    const board = GameBoard(gameSize);
    const players = [
        Player('Player One', 'x'),
        Player('Player Two', 'o'),
    ];

    let activePlayer = players[0];
    let latestMark = null;
    let winner = null;
    let tie = false;

    const getActivePlayer = () => activePlayer;
    const switchTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const printNewRound = () => {
        board.printBoard();
        console.log(`The current turn is for ${getActivePlayer().getName()}`);
    };

    const playRound = (row, column) => {
        if (getActivePlayer().getWinnerStatus()) {
            throw new Error(`The game has ended with the winner is ${getActivePlayer().getName()}`);
        }
        if (!getActivePlayer().getWinnerStatus() && tie) {
            throw new Error('The game has ended with a tie');
        }

        console.log(`Place the ${getActivePlayer().getName()}'s mark at row ${row} and column ${column}`);
        board.placeMark(getActivePlayer().getMarkType(), row, column);

        latestMark = {mark: getActivePlayer().getMarkType(), row, column};
        if (checkWinner()) {
            getActivePlayer().setWinner();

            let message = `${getActivePlayer().getName()} won!`;
            console.log(`${message}`);
            return message;
        }
        if (board.getNumPlacedMarks() === gameSize**2) {
            tie = true;
            let message = 'A tie!';
            console.log(`${message}`);
            return message;
        }

        switchTurn();
        printNewRound();
    };

    function checkWinner() {
        const directions = {
            top: initDirection(-1, 0),
            bottom: initDirection(1, 0),
            left: initDirection(0, -1),
            right: initDirection(0, 1),
            topLeft: initDirection(-1, -1),
            topRight: initDirection(-1, 1),
            bottomLeft: initDirection(1, -1),
            bottomRight: initDirection(1, 1),
        };

        for (const direction of Object.keys(directions)) {
            const nextPos = {
                row: latestMark.row + directions[direction].relativePos.row,
                column: latestMark.column + directions[direction].relativePos.column,
            };

            while ((nextPos.row >= 0 && nextPos.row < gameSize) && (nextPos.column >= 0 && nextPos.column < gameSize)) {
                if (board.getBoard()[nextPos.row][nextPos.column].getMark() === latestMark.mark) {
                    directions[direction].numMarks++;
                    nextPos.row = nextPos.row + directions[direction].relativePos.row;
                    nextPos.column = nextPos.column + directions[direction].relativePos.column;
                } else {
                    break;
                }
            }
        }
        
        if (directions.top.numMarks + directions.bottom.numMarks + 1 === gameSize ||
            directions.left.numMarks + directions.right.numMarks + 1 === gameSize ||
            directions.topLeft.numMarks + directions.bottomRight.numMarks + 1 === gameSize ||
            directions.topRight.numMarks + directions.bottomLeft.numMarks + 1 === gameSize
        ) {
            return true;
        }
        return false;

        function initDirection(relativePosRow, relativePosColumn) {
            return {
                numMarks: 0,
                relativePos: {row: relativePosRow, column: relativePosColumn},
            };
        }
    }

    printNewRound();
    return {getActivePlayer, playRound};
}

function ScreenController() {
    let gameController = null;
    let boardDisplay = null;

    const createGame = () => {
        for (const sizeOption of document.querySelectorAll('option')) {
            if (sizeOption.selected) {
                gameController = GameController(+sizeOption.value);
                boardDisplay = createBoardDisplay(+sizeOption.value);
                document.body.appendChild(boardDisplay);
                break;
            }
        }
    };

    const playGame = () => {
        if (!boardDisplay) {
            return;
        }
        displayActivePlayer();

        boardDisplay.addEventListener('click', () => {
            const activeCellLocation = event.target.getAttribute('id').split('-');
            const activePlayerMark = gameController.getActivePlayer().getMarkType();
            
            try {
                const gameMessage = gameController.playRound(+activeCellLocation[0], +activeCellLocation[1]);
                event.target.textContent = activePlayerMark;
                if (!gameMessage) {
                    displayActivePlayer();
                } else {
                    if (gameController.getActivePlayer().getWinnerStatus()) {
                        displayWinner();
                    }
                    alert(gameMessage);
                }
            } catch (error) {
                alert(error);
            }
        });
    };

    const clearGameState = () => {
        document.querySelector('#active-player').textContent = 'none';
        document.querySelector('#winner').textContent = 'none';
        if (gameController !== null) {
            gameController = null;
        }
        if (boardDisplay !== null) {
            document.body.removeChild(boardDisplay);
            boardDisplay = null;
        }
    };

    function createBoardDisplay(boardSize = 3) {
        const boardDisplay = document.createElement('div');
        boardDisplay.classList.toggle('board');
        boardDisplay.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        boardDisplay.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement('button');
                cell.classList.toggle('cell');
                cell.setAttribute('id', `${i}-${j}`); // attach the cell location
                boardDisplay.appendChild(cell);
            }
        }

        return boardDisplay;
    };

    function displayActivePlayer() {
        if (gameController !== null) {
            document.querySelector('#active-player').textContent = gameController.getActivePlayer().getName();
        }
    };

    function displayWinner() {
        if (gameController !== null && gameController.getActivePlayer().getWinnerStatus()) {
            document.querySelector('#winner').textContent = gameController.getActivePlayer().getName();
        }
    };

    return {createGame, playGame, clearGameState};
}