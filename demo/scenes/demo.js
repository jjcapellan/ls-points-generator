class Demo extends Phaser.Scene {
  constructor() {
    super('demo');
  }

  create(data) {
    const GAME_HEIGHT = this.game.config.height;
    const RULE = data.rule;    
    const BRANCH_FACTOR = data.branchFactor;
    const THICK = data.thick;
    const COLOR0 = data.color0;
    const COLOR1 = data.color1;
    const ITERATIONS = data.iterations;   

    const ANGLE = data.minAngle == data.maxAngle
      ? data.minAngle
      : [data.minAngle, data.maxAngle];

    const LENGTH = data.minLength == data.maxLength
      ? data.minLength
      : [data.minLength, data.maxLength];

    let ls = new LsPointsGenerator({ length: LENGTH, angle: ANGLE, branchFactor: BRANCH_FACTOR, iterations: ITERATIONS });
    let pointsObject = ls.makePoints('X', RULE);

    this.drawPoints(pointsObject, THICK, COLOR0, COLOR1);

    this.add.text(
      2,
      GAME_HEIGHT-2,
      `Axiom: X     Rule: ${RULE}`,
      { fontFamily: 'Arial', fontSize: 18, color: '#bbbbbb' }
    )
      .setOrigin(0, 1);
  }

  drawPoints(pointsObject, thick, color0, color1) {

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
    const maxLevel = MAP.get(MAP.size-1).level;
    const COLORS = this.makeColorsArray(color0, color1, maxLevel);

    let g = this.make.graphics({ add: false });

    if (this.textures.exists('lstexture')) {
      this.game.textures.remove('lstexture');
    };

    MAP.forEach((point, k) => {
      if (point.parent != -1) {
        let parent = MAP.get(point.parent);
        thick = INITIAL_THICK * Math.pow(0.80, parent.level);
        let color = COLORS[parent.level];
        g.lineStyle(thick, color);        
        
        // The following commented line has no effect with generateTexture. (https://github.com/photonstorm/phaser/issues/4383)
        // g.lineGradientStyle(thick, c0,c1,c0,c1,1);
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

  makeColorsArray(color0, color1, maxLevel){
    const C = Phaser.Display.Color;
    const COLOR0 = new C(color0[0], color0[1], color0[2]);
    const COLOR1 = new C(color1[0], color1[1], color1[2]);

    let colors = [this.rgbToHexStr(color0[0],color0[1],color0[2])];

    for(let i = 1; i <= maxLevel; i++){
      let step = Math.floor((i/(maxLevel + 1)) * 100);
      let color = C.Interpolate.ColorWithColor(COLOR0, COLOR1, 100, step);
      let hexColor = this.rgbToHexStr(color.r, color.g, color.b);
      console.log(step);
      colors.push(hexColor);
    }

    colors.push(this.rgbToHexStr(COLOR1.r, COLOR1.g, COLOR1.b));

    return colors;
  }

  rgbToHexStr(r,g,b){
    function numToHex(num){
      return num.toString(16).padStart(2, '0');
    }
    let strHex = '0x' + numToHex(Math.round(r)) + numToHex(Math.round(g)) + numToHex(Math.round(b)); 
    return strHex; 
  }

}