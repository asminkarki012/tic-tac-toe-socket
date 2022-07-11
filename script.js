const cellElements = document.querySelectorAll('[data-cell]');
let circleTurn;
const WINNING_COMBINATIONS = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]

];

const winningMessageText = document.querySelector('[data-winning-message-text]');

const winningMessageTextElement = document.getElementById('winning-message')
const restarttButton = document.getElementById('restartButton');
const X_CLASS = 'x';
const CIRCLE_CLASS = 'circle';
const board = document.getElementById('board')


startGame();

restarttButton.addEventListener('click',startGame);



function startGame(){
    circleTurn = false;
    cellElements.forEach(cell =>{
    
    
    cell.classList.remove(X_CLASS);
    cell.classList.remove(CIRCLE_CLASS);

    cell.removeEventListener('click',handleClick);
    cell.addEventListener('click',handleClick,{once:true});
    
    });
    setBoardHoverClass();
    winningMessageTextElement.classList.remove('show');

}

function handleClick(e){
    //place mark
    //switch turn
    //check for win
    //check for draw

    const cell = e.target;
    const currentClass = circleTurn ? CIRCLE_CLASS:X_CLASS;
    placeMark(cell,currentClass);
    if(checkWin(currentClass)){
    endGame(false);
    
    }else if(isDraw()){
        endGame(true);

    }else{

    swapTurn();
    setBoardHoverClass();
    }
}

function endGame(draw){

    if(draw){

        winningMessageText.innerText = 'Draw';

    }else{
        winningMessageText.innerText = `${circleTurn ? "X's":"O's"} Wins!`;
    }
    winningMessageTextElement.classList.add("show");

}

function isDraw(){
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    })
}


function placeMark(cell,currentClass){
   cell.classList.add(currentClass);


}


function swapTurn(){
    circleTurn = !circleTurn;
}


function setBoardHoverClass(){
    board.classList.remove(X_CLASS);
    board.classList.remove(CIRCLE_CLASS);

    if(circleTurn){
        board.classList.add(CIRCLE_CLASS);

    }else{
        board.classList.add(X_CLASS);
    }
}


function checkWin(currentClass){
   return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        })
   })
}