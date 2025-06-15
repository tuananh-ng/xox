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

    const placeMark = (mark, row, column) {
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