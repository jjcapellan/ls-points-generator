class Demo extends Phaser.Scene {
  constructor() {
    super('demo');
  }

  create(data) {
    const GAME_HEIGHT = this.game.config.height;

    let rule = data.rule;
    let iterations = data.iterations;
    let branchFactor = data.branchFactor;
    let thick = data.thick;

    let angle = data.minAngle == data.maxAngle
      ? data.minAngle
      : [data.minAngle, data.maxAngle];

    let length = data.minLength == data.maxLength
      ? data.minLength
      : [data.minLength, data.maxLength];

    let ls = new LsPointsGenerator({ length: length, angle: angle, branchFactor: branchFactor, iterations: iterations });
    let pointsObject = ls.makePoints('X', rule);

    this.drawPoints(pointsObject, thick);

    this.add.text(
      2,
      GAME_HEIGHT-2,
      `Axiom: X     Rule: ${rule}`,
      { fontFamily: 'Arial', fontSize: 18, color: '#bbbbbb' }
    )
      .setOrigin(0, 1);
  }

  drawPoints(pointsObject, thick) {

    const MAP = pointsObject.map;
    const MAP_HEIGHT = pointsObject.height;
    const GAME_WIDTH = this.game.config.width;
    const GAME_HEIGHT = this.game.config.height;
    const INITIAL_THICK = thick;
    const BOTTOM_MARGIN = 20;
    const offsetX = GAME_WIDTH / 2 - MAP.get(0).x;
    const offsetY = MAP_HEIGHT > GAME_HEIGHT
      ? GAME_HEIGHT - MAP_HEIGHT - BOTTOM_MARGIN
      : (GAME_HEIGHT - MAP_HEIGHT) / 2;

    let g = this.make.graphics({ add: false });

    if (this.textures.exists('lstexture')) {
      this.game.textures.remove('lstexture');
    };

    MAP.forEach((point, k) => {
      if (point.parent != -1) {
        let parent = MAP.get(point.parent);
        thick = INITIAL_THICK * Math.pow(0.80, parent.level);
        g.lineStyle(thick, 0xFFFFFF);
        g.lineBetween(
          point.x + offsetX,
          MAP_HEIGHT - point.y + offsetY,
          parent.x + offsetX,
          MAP_HEIGHT - parent.y + offsetY);
      }
    });

    g.generateTexture('lstexture', GAME_WIDTH, GAME_HEIGHT);
    this.add.image(0, 0, 'lstexture').setOrigin(0);
  }

}