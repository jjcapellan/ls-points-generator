function runGame() {
    var width = document.getElementById('container').clientWidth;
    var height = document.getElementById('container').clientHeight;
    var config = {
      type: Phaser.AUTO,
      scale: {
        parent: 'game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: width,
        height: height
      },
      scene: [LoadScreen, Demo, Gui]
    };
  
    new Phaser.Game(config);
  }
  
  window.onload = function () {
    runGame();
  };