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

  //Listen for assigment of the player type.
  socket.on('assignment', (data) => {
    firstPlayer = data;

    if (firstPlayer === 'x') {
      chance = true;
    } else {
      chance = false;
    }
  });

  //Listen for restart of the game.
  socket.on('restarted', () => {
    init();
  });

  //Listen for the event of game Tied.
  socket.on('Tied', () => {
    gameTied();
  });

  //return document.querySelector() object.
  function $(value) {
    return document.querySelector(value);
  }

  function init() {

    //Initialize the board.
    board = Array.from(Array(9).keys());

    for (let i = 0; i < cell.length; i++) {
      cell[i].innerHTML = '';
      cell[i].style.background = '#fff';
      $(".endgame").style.display = 'none';
      cell[i].addEventListener('click', turnclick);//Add EventListener to Each click event in the column.
    }
  }

  function turnclick(e) {
    if (typeof board[e.target.id] === 'number' && chance === true)
      turn(e.target.id, firstPlayer);

    if (checkTie() === true) {
      socket.emit('Tied', {});
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
    let text = $('.text');
    $(".endgame").style.display = 'block';
    text.style.display = 'block';
    text.innerHTML = msg;
  }

  //Return true if there is no blank spot left on board.
  function isEmpty() {
    let boardLength = emptySquares();
    if (boardLength === 0) {
      return false;
    } else {
      return true;
    }
  }

  //return no of blank spots left on the board.
  function emptySquares() {
    return board.filter(ele => typeof ele === 'number');
  }

  //Check if game is Tied.
  function checkTie() {
    if (emptySquares().length <= 0) {
      return true;
    }
    return false;
  }

  //Do something if game is Tied.
  function gameTied() {
    for (let i = 0; i < cell.length; i++) {
      cell[i].style.background = 'green';
    }
    declareMessage("Game Tied");
  }

  //Main Function that listens for the second player.
  function SecondPlayerSpot() {
    socket.on('turn', (data) => {
      render(data.id, data.player);
      if (data.player != firstPlayer) {
        chance = true;
      }
    });
  }

  //Keep Track of your turn.
  setInterval(() => {
    $(".turn").innerHTML = chance;
  }, 2000);

  //Call Initial Method.
  init();
  SecondPlayerSpot();

})
  ()