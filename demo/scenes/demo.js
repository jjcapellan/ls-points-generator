class Demo extends Phaser.Scene {
  constructor() {
    super('demo');
  }

  create(data) {
    const RULES = {
      'binary_tree': 'F[-X][+X]',
      'seaweed_1': 'X[+X]X[-X]X',
      'seaweed_2': 'XX-[-X+X+X]+[+X-X-X]'
    }

    let rule = RULES[data.model];
    let iterations = data.iterations;
    let branchFactor = data.branchFactor;
    let thick = data.thick;

    let angle = 0;
    if (data.minAngle == data.maxAngle) {
      angle = data.minAngle;
    } else {
      angle = [data.minAngle, data.maxAngle];
    }
    
    let length = 0;
    if (data.minLength == data.maxLength) {
      length = data.minLength;
    } else {
      length = [data.minLength, data.maxLength];
    }

    let ls = new LsPointsGenerator({ length: length, angle: angle, branchFactor: branchFactor, iterations: iterations });
    let pointsObject = ls.makePoints('X', rule);
    this.drawPoints(pointsObject, thick);
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