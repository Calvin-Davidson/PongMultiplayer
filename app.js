var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);


let width = 1250;
let height = 800;

let games = [];

let spelerSize = {};
spelerSize.width = 25;
spelerSize.height = 100;

makeGame = function() {
  let game = {};
  
  game.speler1 = {};
  game.speler1.id = null;
  game.speler1.x = 20;
  game.speler1.y = 250;
  game.speler1.score = 0;

  game.speler2 = {};
  game.speler2.id = null;
  game.speler2.x = width - 40;
  game.speler2.y = 250;
  game.speler2.score = 0;

  game.ball = {};
  game.ball.x = 200;
  game.ball.y = 200;
  game.ball.radius = 10;
  game.ball.speed = 45;
  game.ball.velY = -0.1;
  game.ball.velX = -0.1;

  game.ball.update = function() {
    for (let x = 0; x < this.speed; x++) {
      game.ball.collisionCheck();
      game.ball.x += this.velX;
    }
    for (let y = 0; y < this.speed; y++) {
      game.ball.collisionCheck();
      game.ball.y += game.ball.velY;
    }
  };

  game.ball.collisionCheck = function() {
    if (game.ball.y - game.ball.radius <= 0) {
      game.ball.velY = Math.abs(game.ball.velY);
    }

    if (game.ball.y + game.ball.radius >= height) {
      game.ball.velY = -Math.abs(game.ball.velY);
    }

    // wanneer er gescoord word.
    if (game.ball.x - game.ball.radius <= 0 || game.ball.x + game.ball.radius >= width) {

      if (game.ball.x - game.ball.radius <= 0) {
          game.speler2.score += 1;
          io.to(game.speler1.id).emit("scoreUpdate", game.speler1.score, game.speler2.score);
          io.to(game.speler2.id).emit("scoreUpdate", game.speler1.score, game.speler2.score);
          console.log(game.speler2.score);
        } else {
          game.speler1.score += 1;
          io.to(game.speler1.id).emit("scoreUpdate", game.speler1.score, game.speler2.score);
          io.to(game.speler2.id).emit("scoreUpdate", game.speler1.score, game.speler2.score);
          console.log(game.speler1.score);
        }

        game.ball.velY = -game.ball.velY;
        game.ball.velX = -game.ball.velX;
        game.ball.x = width / 2;
        game.ball.y = height / 2;
    }

    // De collisions van de speler zelf.
    if (
      game.ball.x - game.ball.radius >= parseInt(game.speler1.x) &&
      game.ball.x - game.ball.radius <=
        parseInt(game.speler1.x) + spelerSize.width
    ) {
      if (
        game.ball.y - game.ball.radius >= parseInt(game.speler1.y) &&
        game.ball.y - game.ball.radius <=
          parseInt(game.speler1.y) + spelerSize.height
      ) {
        game.ball.velX = Math.abs(game.ball.velX);
      }
    }

    if (
      game.ball.x + game.ball.radius >= parseInt(game.speler2.x) &&
      game.ball.x + game.ball.radius <=
        parseInt(game.speler2.x) + spelerSize.width
    ) {
      if (
        game.ball.y + game.ball.radius >= parseInt(game.speler2.y) &&
        game.ball.y + game.ball.radius <=
          parseInt(game.speler2.y) + spelerSize.height
      ) {
        game.ball.velX = -Math.abs(game.ball.velX);
      }
    }
  };

  games.push(game);
};

makeGame(); // standaard 1 game klaar!

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});

io.on("connection", function(socket) {
  // als de speler connect vind een game waar ze nog 1 / 2 spelers nodig hebben!
  console.log("Client connected with id " + socket.id);
  {
    let foundgame = false;
    for (let i = 0; i < games.length; i++) {
      if (foundgame != true) {
        if (games[i].speler1.id == null) {
          console.log(socket.id + "joined the game with id " + i + " player 1");
          games[i].speler1.id = socket.id;
          foundgame = true;
          io.to(socket.id).emit("setup", spelerSize, games[i].speler1, games[i].speler2, games[i].ball.x, games[i].ball.y, games[i].ball.radius);
        } else if (games[i].speler2.id == null) {
          console.log(socket.id + "joined the game with id " + i + " player 2");
          games[i].speler2.id = socket.id;
          foundgame = true;
          io.to(socket.id).emit("setup", spelerSize, games[i].speler1, games[i].speler2, games[i].ball.x, games[i].ball.y, games[i].ball.radius);
        }
      }
    }

    if (!(foundgame)) {
        makeGame();
        for (let i = 0; i < games.length; i++) {
          if (foundgame != true) {
            if (games[i].speler1.id == null) {
              console.log(socket.id + "joined the game with id " + i + " player 1");
              games[i].speler1.id = socket.id;
              io.to(socket.id).emit("setup", spelerSize, games[i].speler1, games[i].speler2, games[i].ball.x, games[i].ball.y, games[i].ball.radius);
            } else if (games[i].speler2.id == null) {
              console.log(socket.id + "joined the game with id " + i + " player 2");
              games[i].speler2.id = socket.id;
              io.to(socket.id).emit("setup", spelerSize, games[i].speler1, games[i].speler2, games[i].ball.x, games[i].ball.y, games[i].ball.radius);
            }
          }
        }
    }
  }



  socket.on("mousemove", function(y) {
    for (let i = 0; i < games.length; i++) {
      if (games[i].speler1.id == socket.id) {
        games[i].speler1.y = y;
      }

      if (games[i].speler2.id == socket.id) {
        games[i].speler2.y = y;
      }
    }
  });

  updateVariables = function() {
    for (let i = 0; i < games.length; i++) {
      // als de game genoeg spelers heeft.
      if (games[i].speler1.id != null && games[i].speler2.id != null) {
        
        games[i].ball.update();
        socket.to(games[i].speler1.id).emit("updateVariables", games[i].speler1.x, games[i].speler1.y, games[i].speler2.x, games[i].speler2.y, games[i].ball.x, games[i].ball.y);
        socket.to(games[i].speler2.id).emit("updateVariables", games[i].speler1.x, games[i].speler1.y, games[i].speler2.x, games[i].speler2.y, games[i].ball.x, games[i].ball.y);
    }
  }
}
setInterval(updateVariables, 10);

});