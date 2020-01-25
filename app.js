var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let width = 500;
let height = 500;

let speler1 = {}
speler1.x = 100;
speler1.y = 100;
speler1.width = 25;
speler1.height = 100;

let speler2 = {}
speler2.x = 100;
speler2.y = 100;
speler2.width = 25;
speler2.height = 100;


let ball = {}
ball.x = 200;
ball.y = 200;
ball.radius = 10;
ball.speed = 300;
ball.velY = 0.01;
ball.velX = 0.01;

ball.update = function() {
  for(let x = 0; x < this.speed; x++) {
    ball.collisionCheck();
    ball.x += this.velX;
  }
  for(let y = 0; y < this.speed; y++) {
    ball.collisionCheck();
    ball.y += ball.velY;
  }
}

ball.collisionCheck = function() {

    if ((ball.x - ball.radius) <= 0) {
      ball.x = width/2;
      ball.y = height/2;
    }
    if ((ball.x - ball.radius) >= width) {
      ball.x = width/2;
      ball.y = height/2;
    }

    if ((ball.x - ball.radius) >= parseInt(speler1.x) && (ball.x - ball.radius) <= parseInt(speler1.x) + width) {
      if ((ball.y - ball.radius) >= parseInt(speler1.y) && ((ball.y - ball.radius) <= parseInt(speler1.y) + height)) {
        ball.velX = Math.abs(ball.velX);
        }
      }
        if ((ball.x + ball.radius) >= parseInt(speler2.x) && (ball.x + ball.radius) <= parseInt(speler2.x) + width) {
          if ((ball.y + ball.radius) >= parseInt(speler2.y) && ((ball.y - ball.radius) <= parseInt(speler2.y) + height)) {
            ball.velX = -Math.abs(ball.velX);
            }
  }
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  draw = function() {
    io.emit("clearScreen");
    io.emit("moveplayers", speler1, speler2);
    ball.update();
    io.emit("moveball", ball);
  }

  setInterval(draw, 10);
});
