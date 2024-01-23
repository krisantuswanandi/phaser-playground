import Phaser from "phaser";

let platforms: Phaser.Physics.Arcade.StaticGroup;
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;

let gameOver = false;
let score = 0;
let scoreText: Phaser.GameObjects.Text;

class Example extends Phaser.Scene {
  preload() {
    this.load.image("sky", "/assets/sky.png");
    this.load.image("ground", "/assets/platform.png");
    this.load.image("star", "/assets/star.png");
    this.load.image("bomb", "/assets/bomb.png");
    this.load.spritesheet("dude", "/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add.image(400, 300, "sky");

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, "ground").setScale(2).refreshBody();
    platforms.create(600, 400, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(750, 220, "ground");

    player = this.physics.add.sprite(100, 450, "dude");
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setGravityY(300);

    const stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });
    stars.children.iterate((child) => {
      const typedChild = child as Phaser.Physics.Arcade.Sprite;
      typedChild.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true;
    });

    const bombs = this.physics.add.group();
    bombs.create;

    scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      color: "#f00",
    });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(
      player,
      stars,
      (_player, star) => {
        const typedStar = star as Phaser.Physics.Arcade.Sprite;
        typedStar.disableBody(true, true);

        score += 10;
        scoreText.setText("Score: " + score);

        if (stars.countActive(true) === 0) {
          stars.children.iterate((child) => {
            const typedChild = child as Phaser.Physics.Arcade.Sprite;
            typedChild.enableBody(true, typedChild.x, 0, true, true);
            return true;
          });

          const x =
            player.x < 400
              ? Phaser.Math.Between(400, 800)
              : Phaser.Math.Between(0, 400);

          const bomb = bombs.create(x, 16, "bomb");
          bomb.setBounce(1);
          bomb.setCollideWorldBounds(true);
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
      },
      undefined,
      this
    );
    this.physics.add.collider(
      player,
      bombs,
      (player, _bomb) => {
        this.physics.pause();

        const typedPlayer =
          player as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        typedPlayer.setTint(0xff0000);
        typedPlayer.anims.play("turn");

        gameOver = true;
      },
      undefined,
      this
    );

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    if (this.input.keyboard) {
      cursors = this.input.keyboard.createCursorKeys();
    }
  }

  update() {
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);
      player.anims.play("turn");
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-500);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: Example,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
};

const game = new Phaser.Game(config);
