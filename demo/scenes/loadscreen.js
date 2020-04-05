class LoadScreen extends Phaser.Scene {
    constructor() {
      super('loadScreen');
    }
  
    preload() {
      let params = { 
        minLength: 50, 
        maxLength: 60, 
        minAngle: 3, 
        maxAngle: 41, 
        branchFactor: 0.90, 
        iterations: 4, 
        model: 'binary_tree',
        thick: 8
      };
      this.scene.launch('demo', params);
      this.scene.start('gui', params);
  
      this.load.on('complete',function(){
          this.scene.start('demo');
      }, this);  
      
      
      this.text_loading = this.add.text(this.game.config.width/2, this.game.config.height/2,'Loading ...');
      this.load.on('progress', this.updateText, this);
      
    }
  
    updateText(progress){
        this.text_loading.text = `Loading ... ${Math.round(progress*100)}%`;
    }
  }