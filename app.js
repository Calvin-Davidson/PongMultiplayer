var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let width = 750;
let height = 500;

let spelerSize = {}
spelerSize.width = 25;
spelerSize.height = 100;

let speler1 = {}
speler1.id = null;
speler1.x = 20;
speler1.y = 250;

let speler2 = {}
speler2.id = null;
speler2.x = width - 40;
speler2.y = 250;

let ball = {}
ball.x = 200;
ball.y = 200;
ball.radius = 10;
ball.speed = 30;
ball.velY = -0.1;
ball.velX = -0.1;

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

  if ((ball.y - ball.radius) <= 0) {
    ball.velY = Math.abs(ball.velY);
  }

  
  if ((ball.y + ball.radius) >= height) {
    ball.velY = -Math.abs(ball.velY);
  }

  // wanneer er gescoord word.  
  if ((ball.x - ball.radius) <= 0 || (ball.x + ball.radius) >= width) {
    ball.velY = -(ball.velY);
    ball.velX = -(ball.velX);
    ball.x = width/2;
    ball.y = height/2;
  }

  // De collisions van de speler zelf.
    if ((ball.x - ball.radius) >= parseInt(speler1.x) && (ball.x - ball.radius) <= parseInt(speler1.x) + spelerSize.width) {
      if ((ball.y - ball.radius) >= parseInt(speler1.y) && ((ball.y - ball.radius) <= parseInt(speler1.y) + spelerSize.height)) {
        ball.velX = Math.abs(ball.velX);
        }
      }

    if ((ball.x + ball.radius) >= parseInt(speler2.x) && (ball.x + ball.radius) <= parseInt(speler2.x) + spelerSize.width) {
      if ((ball.y + ball.radius) >= parseInt(speler2.y) && ((ball.y + ball.radius) <= parseInt(speler2.y) + spelerSize.height)) {
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
  if (speler1.id == null) speler1.id = socket.id;
  else if (speler2.id == null) speler2.id = socket.id;

  io.emit('setup', spelerSize);

  socket.on("mousemove", function(y) {
    if (speler1.id == socket.id) {
      speler1.y = y;
    }
    if (speler2.id == socket.id) {
      speler2.y = y;
    }
  });


  draw = function() {
    io.emit("clearScreen");
    io.emit("moveplayers", speler1, speler2);
    ball.update();
    io.emit("moveball", ball.x, ball.y, ball.radius);
  }

  setInterval(draw, 100);
});
