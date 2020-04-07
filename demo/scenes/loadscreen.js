class LoadScreen extends Phaser.Scene {
    constructor() {
      super('loadScreen');
    }
  
    preload() {
      this.scene.start('gui');
  
      // For future load options
      this.load.on('complete',function(){
          this.scene.start('gui');
      }, this);  
      
      
      this.text_loading = this.add.text(this.game.config.width/2, this.game.config.height/2,'Loading ...');
      this.load.on('progress', this.updateText, this);
      
    }
  
    updateText(progress){
        this.text_loading.text = `Loading ... ${Math.round(progress*100)}%`;
    }
  }