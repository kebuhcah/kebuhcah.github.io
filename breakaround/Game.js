BreakAround.Game = function () {
    this.paddle;
    this.ball;
    this.emojis;

    this.radius;
    this.graphics;

    this.score;
    this.highScore;
    this.bounces;
    this.leastBounces;
    this.scoreText;
    this.bounceText;
    this.velocityText;
    this.latestBounceText;

    this.alreadyIntersected;

    this.pointSound;
    this.bounceSound;
    this.deathSound;
    this.levelupSound;

    this.showTrajectory;

};

BreakAround.Game.prototype = {

    init: function () {

        radius = this.game.width / 2;

    },

    preload: function () {
        alreadyIntersected = false;
    },

    create: function () {
        var background = this.add.sprite(radius, radius, 'background');
        background.anchor.setTo(0.5, 0.5);

        paddle = this.add.sprite(radius, radius, 'hotdog');
        paddle.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(paddle, Phaser.Physics.ARCADE);

        ball = this.add.sprite(radius, radius, 'ball');
        ball.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.setCircle(BALL_SIZE);

        emojis = this.add.group();
        this.respawnEmoji();

        showTrajectory = false;
        var tKey = game.input.keyboard.addKey(Phaser.Keyboard.T);
        tKey.onDown.add(function () {
            showTrajectory = !showTrajectory;
        }, this);
        var downKey = game.input.keyboard.addKey(Phaser.Keyboard.OPEN_BRACKET);
        downKey.onDown.add(function () {
            var oldVelocity = BALL_VELOCITY;
            if (BALL_VELOCITY > 100)
                BALL_VELOCITY -= 50;
            ball.body.velocity.x = ball.body.velocity.x / oldVelocity * BALL_VELOCITY;
            ball.body.velocity.y = ball.body.velocity.y / oldVelocity * BALL_VELOCITY;
            velocityText.setText(BALL_VELOCITY + ' px/sec');
        }, this);
        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.CLOSED_BRACKET);
        upKey.onDown.add(function () {
            var oldVelocity = BALL_VELOCITY;
            if (BALL_VELOCITY < 400)
                BALL_VELOCITY += 50;
            ball.body.velocity.x = ball.body.velocity.x / oldVelocity * BALL_VELOCITY;
            ball.body.velocity.y = ball.body.velocity.y / oldVelocity * BALL_VELOCITY;
            velocityText.setText(BALL_VELOCITY + ' px/sec');
        }, this);


        var textStyle = {
            'fill': 'white',
            'font': '10pt Courier New'
        };

        score = 0;
        highScore = 0;
        bounces = 0;
        leastBounces = null;
        scoreText = this.add.text(10, 10, 'Score: 0\nHigh Score: 0', textStyle);
        bounceText = this.add.text(10, 590, 'Bounces: 0\nLeast Bounces/20: N/A', textStyle);
        bounceText.anchor.setTo(0, 1);
        velocityText = this.add.text(590, 10, BALL_VELOCITY + ' px/sec', textStyle);
        velocityText.anchor.setTo(1, 0);
        latestBounceText = this.add.text(radius, radius, "WAVE CLEARED\nIN XX BOUNCES", {
            'fill': 'yellow',
            'font': '50pt Impact',
            'align': 'center'
        });
        latestBounceText.anchor.setTo(0.5, 0.5);
        latestBounceText.alpha = 0;

        background.scale.x = 0.8;
        background.scale.y = 0.8;
        var tween = this.game.add.tween(background.scale).to({
            x: 1.1,
            y: 1.1
        }, 2000, "Linear", true, 0, -1);
        tween.yoyo(true, 0);

        this.game.input.x = radius;
        this.game.input.y = radius * 2;

        graphics = game.add.graphics(0, 0);

        pointSound = this.game.add.audio('point');
        bounceSound = this.game.add.audio('bounce');
        deathSound = this.game.add.audio('death');
        levelupSound = this.game.add.audio('levelup');

        var theta = this.rnd.realInRange(-Math.PI, Math.PI);
        ball.body.velocity.x = BALL_VELOCITY * Math.cos(theta);
        ball.body.velocity.y = BALL_VELOCITY * Math.sin(theta);

    },

    update: function () {

        ball.rotation += Math.PI / 10;

        var angleFromCenter = this.game.math.angleBetween(radius, radius,
            this.game.input.x, this.game.input.y);

        paddle.rotation = angleFromCenter - Math.PI / 2;

        paddle.x = radius + Math.cos(angleFromCenter) * (radius * 0.8);
        paddle.y = radius + Math.sin(angleFromCenter) * (radius * 0.8);


        var paddleCos = Math.cos(paddle.rotation) * 95;
        var paddleSin = Math.sin(paddle.rotation) * 95;
        var ballTheta = this.game.math.angleBetween(radius, radius, ball.x, ball.y);
        var ballCos = Math.cos(ballTheta) * BALL_SIZE;
        var ballSin = Math.sin(ballTheta) * BALL_SIZE;

        var paddleLine = new Phaser.Line(paddle.x - paddleCos, paddle.y - paddleSin, paddle.x + paddleCos, paddle.y + paddleSin);
        var ballLine = new Phaser.Line(ball.x - ballCos, ball.y - ballSin, ball.x + ballCos, ball.y + ballSin);

        if (ballLine.intersects(paddleLine)) {
            if (!alreadyIntersected) {

                var ballMovementLine = new Phaser.Line(0, 0, ball.body.velocity.x, ball.body.velocity.y);

                var reflectAngle = ballMovementLine.reflect(paddleLine);

                ball.body.velocity.x = BALL_VELOCITY * Math.cos(reflectAngle);
                ball.body.velocity.y = BALL_VELOCITY * Math.sin(reflectAngle);

                bounceSound.play();
                bounces++;
                bounceText.setText('Bounces: ' + bounces + '\nLeast Bounces/20: ' +
                    (leastBounces === null ? 'N/A' : leastBounces));

            }
            alreadyIntersected = true;
        } else {
            alreadyIntersected = false;
        }

        if (ball.x < 0 || ball.x > radius * 2 || ball.y < 0 || ball.y > radius * 2) {
            ball.x = radius;
            ball.y = radius;

            this.respawnEmoji();

            var theta = this.rnd.realInRange(-Math.PI, Math.PI);
            ball.body.velocity.x = BALL_VELOCITY * Math.cos(theta);
            ball.body.velocity.y = BALL_VELOCITY * Math.sin(theta);
            deathSound.play();
            game.camera.shake(0.05, 500);

            score = 0;
            scoreText.setText('Score: ' + score + '\nHigh Score: ' + highScore);
            bounces = 0;
            bounceText.setText('Bounces: ' + bounces + '\nLeast Bounces/20: ' +
                (leastBounces === null ? 'N/A' : leastBounces));
        }

        this.game.physics.arcade.overlap(emojis, ball, function (e, b) {
            b.kill();
            score++;
            pointSound.play();
        }, null, this);

        if (score > highScore) {
            highScore = score;
        }

        scoreText.setText('Score: ' + score + '\nHigh Score: ' + highScore);


        if (emojis.countLiving() === 0) {
            if (bounces < leastBounces || leastBounces === null) {
                leastBounces = bounces;
            }
            levelupSound.play();
            this.respawnEmoji();

            latestBounceText.setText('WAVE CLEARED\nIN ' + bounces + ' BOUNCES');
            latestBounceText.alpha = 0.1;
            latestBounceText.scale.x = 0.5;
            latestBounceText.scale.y = 0.5;
            if (bounces <= 5) {
                latestBounceText.fill = 'fuchsia';
            } else if (bounces <= 10) {
                latestBounceText.fill = 'lime';
            } else if (bounces <= 20) {
                latestBounceText.fill = 'yellow';
            } else {
                latestBounceText.fill = 'red';
            }
            var alphaAppear = this.game.add.tween(latestBounceText).to({
                alpha: 1
            }, 100, "Linear");
            var scaleAppear = this.game.add.tween(latestBounceText.scale).to({
                x: 1,
                y: 1
            }, 100, "Linear");
            var alphaFade = this.game.add.tween(latestBounceText).to({
                alpha: 0
            }, 1000, "Linear");
            var scaleFade = this.game.add.tween(latestBounceText.scale).to({
                x: 2,
                y: 2
            }, 1000, "Linear");
            alphaAppear.chain(alphaFade);
            scaleAppear.chain(scaleFade);
            alphaAppear.start();
            scaleAppear.start();

            bounces = 0;
            bounceText.setText('Bounces: ' + bounces + '\nLeast Bounces/20: ' +
                leastBounces);

        }
    },

    render: function () {
        graphics.clear();
        graphics.lineStyle(1, 0xcccccc, 1);
        graphics.moveTo(radius, radius);
        graphics.lineTo(paddle.x, paddle.y);

        /*
        graphics.lineStyle(10, 0xffff00, 1);
        graphics.moveTo(paddle.x - paddleCos, paddle.y - paddleSin);
        graphics.lineTo(paddle.x + paddleCos, paddle.y + paddleSin);

        var ballTheta = this.game.math.angleBetween(radius, radius, ball.x, ball.y);
        var ballCos = Math.cos(ballTheta) * BALL_SIZE;
        var ballSin = Math.sin(ballTheta) * BALL_SIZE;

        graphics.moveTo(ball.x - ballCos, ball.y - ballSin);
        graphics.lineTo(ball.x + ballCos, ball.y + ballSin);

        this.game.debug.body(paddle);
        this.game.debug.body(ball);*/

        if (showTrajectory) {
            var paddleCos = Math.cos(paddle.rotation) * 95;
            var paddleSin = Math.sin(paddle.rotation) * 95;
            var ballMovementLine = new Phaser.Line(ball.x, ball.y, ball.x + ball.body.velocity.x * 900, ball.y + ball.body.velocity.y * 900);
            var paddleLine = new Phaser.Line(paddle.x - paddleCos, paddle.y - paddleSin, paddle.x + paddleCos, paddle.y + paddleSin);

            var intersect = ballMovementLine.intersects(paddleLine, true);
            var reflect = ballMovementLine.reflect(paddleLine);

            graphics.lineStyle(1, 0xffff00, 0.5);
            if (intersect) {
                /* adjust because intersect point != turning point */
                intersect.x -= BALL_SIZE * ball.body.velocity.x / BALL_VELOCITY;
                intersect.y -= BALL_SIZE * ball.body.velocity.y / BALL_VELOCITY;

                graphics.moveTo(ball.x, ball.y);
                graphics.lineTo(intersect.x, intersect.y);
                graphics.lineTo(intersect.x + Math.cos(reflect) * 900, intersect.y + Math.sin(reflect) * 900);
            } else {
                graphics.moveTo(ball.x, ball.y);
                graphics.lineTo(ball.x + ball.body.velocity.x * 6, ball.y + ball.body.velocity.y * 6);
            }
        }

    },

    respawnEmoji: function () {
        emojis.removeAll();

        for (var i = 0; i < 20; i++) {
            var p = new Phaser.Point();
            var c = new Phaser.Circle(radius, radius, 450);
            c.random(p);
            var emoji = emojis.create(p.x, p.y, 'emoji');
            emoji.anchor.setTo(0.5, 0.5);
            this.game.physics.enable(emoji, Phaser.Physics.ARCADE);
            emoji.body.setCircle(25);
        }
    }

}
