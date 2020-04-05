class Demo extends Phaser.Scene {
    constructor() {
      super('demo');
    }
  
    create(data) {
      const rules = {
        'binary_tree':'F[-X][+X]',
        'seaweed_1':'X[+X]X[-X]X',
        'seaweed_2':'XX-[-X+X+X]+[+X-X-X]'
      }
      let rule = rules[data.model];
      let iterations = data.iterations;
      let branchFactor = data.branchFactor;
      let thick = data.thick;
      let angle = 0;
      if(data.minAngle == data.maxAngle){
        angle = data.minAngle;
      } else {
        angle = [data.minAngle, data.maxAngle];
      }
      let length = 0;
      if(data.minLength == data.maxLength){
        length = data.minLength;
      } else {
        length = [data.minLength, data.maxLength];
      }

      let ls = new LsPointsGenerator({ length: length, angle: angle, branchFactor: branchFactor, iterations: iterations});
      let pointsObject = ls.makePoints('X',rule);
      this.drawPoints(pointsObject, 
        this.game.config.width/2, 
        this.game.config.height,
        thick
        );
    }
    
    drawPoints(pointsObject, x, y, thick){
      this.game.textures.remove('lstexture');
      let g = this.make.graphics({add: false});;
      let m = pointsObject.map;
      let width = pointsObject.width;
      let height = pointsObject.height;
      let initialThick = thick;
      const textureMaxSize = 2000;
      const bottomMargin = 20;

      if(width > 2000){
        width = this.game.config.width;
      }
      if(height > 2000){
        height = this.game.config.height;
      }
      
      m.forEach((point,k) => {
        if(point.parent != -1){
          let parent = m.get(point.parent);                   
          thick = initialThick * Math.pow(0.80, parent.level);
          g.lineStyle(thick, 0xFFFFFF);
        g.lineBetween(point.x, height - point.y, parent.x, height - parent.y);
        }
      });
      
      g.generateTexture('lstexture', width, height);

      this.add.image(x,y-bottomMargin,'lstexture').setOrigin(0.5,1);
    }    
  
  }