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