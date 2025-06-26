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
        if (winner !== null) {
            let message = `The game has ended with the winner is ${winner.getName()}`;
            console.log(`${message}`);
            return message;
        }
        if (winner === null && tie) {
            let message = 'The game has ended with a tie';
            console.log(`${message}`);
            return message;
        }

        console.log(`Place the ${getActivePlayer().getName()}'s mark at row ${row} and column ${column}`);
        try {
            board.placeMark(getActivePlayer().getMarkType(), row, column);
        } catch (error) {
            console.log(`${error.message}`);
            return error.message;
        }

        latestMark = {mark: getActivePlayer().getMarkType(), row, column};
        if (checkWinner()) {
            getActivePlayer().setWinner();
            winner = getActivePlayer();

            let message = `${winner.getName()} won!`;
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

function GameBoardDisplayer() {
    const cellStore = [];

    const createBoard = (boardSize = 3) => {
        const board = document.createElement('div');
        board.classList.toggle('board');

        if (cellStore.length !== 0) {
            cellStore.splice(0, cellStore.length); // remove all existing cells
        }

        for (let i = 0; i < boardSize; i++) {
            cellStore[i] = [];
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement('button');
                cell.classList.toggle('cell');
                cellStore[i].push(cell);
                board.appendChild(cell);
            }
        }

        return board;
    };

    const drawOnBoard = (row, column, mark) => {
        cellStore[row][column].textContent = mark;
    };

    return {createBoard, drawOnBoard};
}