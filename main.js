'use strict';

var can = document.getElementById('can');
can.width = 1000;
can.height = 530;
var timerId;
var hasInteracted = false;

var ctx = can.getContext('2d');
ctx.imageSmoothingEnabled = true; // 画像スムージングを有効にする

var gameOver = false;
var hue = 0;
var invincibleTime = 2;
var count = document.getElementById('count');

// 難易度
var timeLeft = 20;
var ballSpead = 8;
var ballMax = 9;

// キャラのオブジェクト
var character = new Object();
character.img = new Image();
character.img.src = 'img/sora.png';
character.y = 230;
character.x = 450;

// 背景画像
var background = new Image();
background.src = 'img/universe_space04.png';

// キーのオブジェクト
var key = new Object();
key.up = false;
key.down = false;
key.right = false;
key.left = false;

// 球体
var balls = [];

// BGM, 効果音
var audios = [
  new Audio('audio/audio.mp3'),
  new Audio('audio/clear.mp3'),
  new Audio('audio/gameOver.mp3'),
  new Audio('audio/game.mp3')
];
var clearBgm = false;
var GameOverBgm = false;

// 戻る、もう一回ボタン
var rePage = document.getElementById('repage');
var reStart = document.getElementById('restart');

function time() {
  if (timeLeft > 0 && !gameOver) {
    timeLeft -= 1;
    count.textContent = "Time:" + timeLeft;
  } else {
    clearInterval(timerId);
    if (timeLeft <= 0) {
      timeLeft = 0;
      count.textContent = "Time:" + timeLeft;
    }
  }
}

window.onload = function() {
  clearBgm = false;
  GameOverBgm = false;
  count.textContent = "Time:" + timeLeft;
  main();
};

function main() {
  ctx.drawImage(background, 0, 0, can.width, can.height);
  ctx.drawImage(character.img, character.x, character.y, 70, 70);

  // 球体を生成、更新、描画
  if (balls.length < ballMax) createBall();  // 球体の数を制限
  updateBalls();
  drawBalls();

  if(key.left === true) {
    character.x -= 4;
    if(character.x < 0) character.x = 0;
  }
  if(key.up === true) {
    character.y -= 4;
    if(character.y < 0) character.y = 0;
  }
  if(key.right === true) {
    character.x += 4;
    if(character.x + 70 > can.width) character.x = can.width - 70;
  }
  if(key.down === true) {
    character.y += 4;
    if(character.y + 70 > can.height) character.y = can.height - 70;
  }

  hue = (hue + 1.5) % 360;

  if (invincibleTime > 0) {
    invincibleTime -= 1 / 60;
  } else {
    dis();
  }

  if (timeLeft === 0 || gameOver === true) {
    ctx.drawImage(background, 0, 0, can.width, can.height);
    ctx.font = "bold 170px Arial";
    ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
    if (audios[0] && !audios[0].paused) {
      stopAudio(0);
    }
    finish();
    if(timeLeft === 0) {
      if(!clearBgm){
        playAudio(1);
        clearBgm = true;
      }
      var textWidth = ctx.measureText("Clear!!").width;
      ctx.fillText("Clear!!", (can.width - textWidth) / 2, can.height / 2 + 30);
    } else {
      if(!GameOverBgm){
        if(hasInteracted === true) {
          playAudio(2);
        }
        GameOverBgm = true;
      }
      var textWidth = ctx.measureText("Game Over").width;
      ctx.fillText("Game Over", (can.width - textWidth) / 2, can.height / 2 + 30);
    }
  }
  requestAnimationFrame(main);
}
addEventListener('load', main, false);

addEventListener("keydown", keydownfunc);
addEventListener("keyup", keyupfunc);


// 球体生成
function createBall() {
  var ball = new Object();
  ball.img = new Image();
  ball.img.src = 'img/star.png';
  ball.x = Math.random() * can.width;
  ball.y = Math.random() * can.height;
  ball.speedX = (Math.random() - 0.5) * ballSpead;
  ball.speedY = (Math.random() - 0.5) * ballSpead;
  balls.push(ball);
}
// 球体を更新する関数
function updateBalls() {
  for (var i = 0; i < balls.length; i++) {
    balls[i].x += balls[i].speedX;
    balls[i].y += balls[i].speedY;

    // キャンバスの端に達したら反転させる
    if (balls[i].x < 0 || balls[i].x > can.width - 20) balls[i].speedX *= -1;
    if (balls[i].y < 0 || balls[i].y > can.height - 20) balls[i].speedY *= -1;
  }
}
// 球体を描画する関数
function drawBalls() {
  for (var i = 0; i < balls.length; i++) {
    ctx.drawImage(balls[i].img, balls[i].x, balls[i].y, 20, 20);
  }
}

// 衝突検出
function dis() {
  balls.forEach(ball => {
    var dis = Math.sqrt( (character.x + 35 - (ball.x + 10))**2 + (character.y + 35 - (ball.y + 10))**2 );
    if(dis < 45) {
      gameOver = true;
    }
  });
}

// ゲーム終了時(戻る、もう一回ボタンの表示)
function finish() {
  rePage.style.display = "block";
  reStart.style.display = "block";
}
rePage.onclick = function(){
  playAudio(3);
  setTimeout(link, 500);
}
reStart.onclick = function(){
  playAudio(3);
  setTimeout(function() {
    location.reload();
  }, 500);
}
function link(){
  location.href = "start.html";
}

// audioを再生する
function playAudio(index) {
  audios[index].play();
}
// audioを停止する 
function stopAudio(index) {
  audios[index].pause();
  audios[index].currentTime = 0;
}

// キーが押された時の関数
function keydownfunc(event){
  hasInteracted = true;
  var keyCode = event.keyCode;

  if (keyCode === 37 || keyCode === 38 || keyCode === 39 || keyCode === 40) {
    if (audios[0].currentTime === 0) {
      playAudio(0);
    }
    if (!timerId) {
      timerId = setInterval(time, 1000);
    }
  }

  if (keyCode === 37) key.left = true;
  if (keyCode === 38) key.up = true;
  if (keyCode === 39) key.right = true;
  if (keyCode === 40) key.down = true;
}
// キーが離された時の関数
function keyupfunc(event){
  var keyCode = event.keyCode;
  if (keyCode === 37) key.left = false;
  if (keyCode === 38) key.up = false;
  if (keyCode === 39) key.right = false;
  if (keyCode === 40) key.down = false;
}
