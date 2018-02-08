(function () {

  //The board Element.
  let board;

  // //Keep Track of the player.
  // const firstPlayer = 'x';
  // const secondPlayer = 'o';

  // //keep track of chance of each player.
  let chance = true;

  //Winning Combinations.
  const winCombos = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [2, 5, 8],
    [3, 4, 5],
    [6, 7, 8],
    [1, 4, 7],
    [6, 4, 2]
  ];

  //Get all cell Index.
  const cell = document.querySelectorAll(".cell");

  //Make Socket connection.
  const socket = io.connect('http://localhost:3000');

  //Add Event Listener to Replay Button.
  document.querySelector(".btn").addEventListener('click', () => {
    socket.emit('restarted', {});
  });

  let firstPlayer = '';

  socket.on('assignment', (data) => {
    firstPlayer = data;

    if (firstPlayer === 'x') {
      chance = true;
    } else {
      chance = false;
    }
  });

  socket.on('restarted', () => {
    init();
  });

  socket.on('Tied', ()=>{
    gameTied();
  });

  function init() {

    //Initialize the board.
    board = Array.from(Array(9).keys());

    for (let i = 0; i < cell.length; i++) {
      cell[i].innerHTML = '';
      cell[i].style.background = '#fff';
      document.querySelector(".endgame").style.display = 'none';
      cell[i].addEventListener('click', turnclick);//Add EventListener to Each click event in the column.
    }
  }

  function turnclick(e) {
    if (typeof board[e.target.id] === 'number' && chance === true)
      turn(e.target.id, firstPlayer);

    if(checkTie() === true){
      socket.emit('Tied',{});
    }
  }

  function turn(id, player) {

    socket.emit('turn', {
      player: player,
      id: id
    });
    render(id, player);
  }

  function render(id, player) {

    chance = false;
    board[id] = player;
    let square = document.getElementById(id);
    square.innerHTML = player;
    let gameWon = checkWin(board, player);
    if (gameWon != null)
      gameOver(gameWon);
  }

  //Check if game is Won by Player or not.
  function checkWin(board, player) {
    let plays = '';
    board.forEach((value, index) => {
      if (value === player)
        plays += index;
    });
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
      if (win.every(ele => plays.indexOf(ele) > -1)) {
        gameWon = {
          index: index,
          player: player
        }
      }
    }
    return gameWon;
  }

  //Do something if game is Won by Player.
  function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
      cell[index].style.background = 'red';
    }

    for (let i = 0; i < cell.length; i++) {
      cell[i].removeEventListener('click', turnclick);
    }

    declareMessage(gameWon.player === firstPlayer ? "You Won" : "You Lost");
  }

  //Render Final DOM.
  function declareMessage(msg) {
    let text = document.querySelector('.text');
    document.querySelector(".endgame").style.display = 'block';
    text.style.display = 'block';
    text.innerHTML = msg;
  }

  function isEmpty() {
    let boardLength = emptySquares();
    if (boardLength === 0) {
      return false;
    } else {
      return true;
    }
  }

  function emptySquares() {
    return board.filter(ele => typeof ele === 'number');
  }

  function checkTie() {
    console.log(emptySquares().length + 'asd');
    if (emptySquares().length <= 0) {
      return true;
    }
    return false;
  }

  function gameTied(){
    for (let i = 0; i < cell.length; i++) {
      cell[i].style.background = 'green';
    }
    declareMessage("Game Tied");
  }

  function SecondPlayerSpot() {
    socket.on('turn', (data) => {
      render(data.id, data.player);
      if (data.player != firstPlayer) {
        chance = true;
      }
    });
  }

  //Call Initial Method.
  init();
  SecondPlayerSpot();

})
  ()