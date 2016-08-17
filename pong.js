(function(){
    class Entity {
        constructor(x, y, draw, tick) {
            this.x = x;
            this.y = y;
            this.draw = draw;
            this.tick = tick;
        }
    }

    class Paddle extends Entity {
        constructor(x, y, tick) {
            var draw = function(context) {
                context.fillStyle = "black";
                context.fillRect(this.x - 10, this.y - 50, 20, 100);
            };

            super(x, y, draw, tick);
        }
    }

    function playerPaddleTick(delta, keys, ball) {
        if (keys.indexOf(keyCodes.arrowUp) != -1)
            this.y = Math.max(this.y - delta, 60);

        if (keys.indexOf(keyCodes.arrowDown) != -1)
            this.y = Math.min(this.y + delta, 440);
    }

    function enemyPaddleTick(delta, keys, ball) {
		if (!this.velocityY)
			this.velocityY = 0;

		this.velocityY += (ball.y - this.y) / 8
		this.velocityY = Math.min(Math.max(this.velocityY, -100), 100);

		this.y += this.velocityY * (delta/150);

		if (this.y < 60 || 440 < this.y) {
			this.velocityY /= 2;
			this.y = Math.min(Math.max(this.y, 60), 440);
		}
    }

    var playerPaddle = new Paddle(50, 240, playerPaddleTick);
    var enemyPaddle  = new Paddle(750, 240, enemyPaddleTick);

    var playerWins = 0;
    var enemyWins = 0;

    class Ball extends Entity {
        constructor() {
            super(0, 0, function(){}, function(){});

            this.reset();

            this.draw = function(context) {
                context.beginPath();

                context.arc(this.x - 7, this.y - 7, 14, 0, 2*Math.PI);

                context.closePath();

                context.strokeStyle = 'black';
                context.lineWidth = 4;

                context.stroke();
            }

            this.tick = function(delta) {
				if (!this.stopped) {
					this.x += this.velocityX * delta;
					this.y += this.velocityY * delta;

					if (this.y >= (500 - 7)) {
						this.velocityY *= -1;
						this.y = 500 - 7;
					}

					if (this.y <= 7) {
						this.velocityY *= -1;
						this.y = 7;
					}

					if (this.x >= (800 - 7)) {
						playerWins++;
						this.y = -10;
						this.stopped = true;
						window.setTimeout(function(b){b.reset()}, 500, this);
					}

					if (this.x <= 0) {
						enemyWins++;
						this.y = -10;
						this.stopped = true;
						window.setTimeout(function(b){b.reset()}, 500, this);
					}

					function checkCollision(paddle, side) {
						if (Math.abs(paddle.x - this.x) <= (10 + 7 + 2) &&
							Math.abs(paddle.y - this.y) <= (50 + 7 + 2)) {

							this.velocityX *= -1;
							this.velocityX += 0.1 * Math.sign(this.velocityX);

							this.velocityY += (Math.random() / 3 - 0.1) * Math.sign(this.velocityY);
							
							if (side == "right")
								this.x = paddle.x + (10 + 7);
							else if (side == "left")
								this.x = paddle.x - (10 + 7)
						}
					}

					checkCollision.call(this, playerPaddle, "right");
					checkCollision.call(this, enemyPaddle, "left");
				}
            } 
        }

        reset() {
            this.x = 400;
            this.y = 250;
            this.velocityX = 0.4 * Math.sign(Math.random() - 0.5);
            this.velocityY = 0.4 * Math.sign(Math.random() - 0.5);
			this.stopped = false;
        }
    }

    var keys = [];

    var keyCodes = {
        arrowUp: 38,
        arrowDown: 40
    }

    window.onkeydown = function(e) {
        var code = e.keyCode;

        if (keys.indexOf(code) == -1)
            keys.push(code);
    }

    window.onkeyup = function(e) {
        var index = keys.indexOf(e.keyCode);

        if (index != -1)
            keys.splice(index, 1);
    }

	var ball = new Ball(100, 100, 0.8, 0.8);

    entities = [
        playerPaddle,
        enemyPaddle,
		ball
    ];

    window.onload = function() {
        var canvas = document.getElementById("canvas");

        canvas.width = 800;
        canvas.height = 500;

        var context = canvas.getContext("2d");

        var lastTime = 0;

        function redraw(timestamp) {
            if (timestamp) {
                context.clearRect(0, 0, canvas.width, canvas.height);

				var score = playerWins + " - " + enemyWins;
				context.font = 'bold 16pt sans-serif';
				context.textBaseline = 'bottom';
				context.fillText(score, 400 - (context.measureText(score).width / 2), 60);

                for (var i = 0; i < entities.length; i++)
                    entities[i].draw(context);

                for (var i = 0; i < entities.length; i++)
                    entities[i].tick(timestamp - lastTime, keys, ball);
                
                lastTime = timestamp;
            }

            requestAnimationFrame(redraw);
        }

        redraw();
    }
})();
