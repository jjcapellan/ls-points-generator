class Gui extends Phaser.Scene {
    constructor() {
        super('gui');
    }

    create(data) {
        let t = this;
        let params = data;
        params.refresh = reset;
        const gui = new dat.GUI({ with: 400 });
        const gui_iterations = gui.add(params, 'iterations', 1, 15).step(1);
        const gui_minAngle = gui.add(params, 'minAngle', 0, 360).step(1);
        const gui_maxAngle = gui.add(params, 'maxAngle', 0, 360).step(1);
        const gui_maxLength = gui.add(params, 'maxLength', 0, 100).step(1);
        const gui_minLength = gui.add(params, 'minLength', 0, 100).step(1);
        const gui_branchFactor = gui.add(params, 'branchFactor', 0.80, 1.2).step(0.01);
        const gui_thick = gui.add(params, 'thick', 2, 10).step(1);
        const gui_model = gui.add(params, 'model', ['binary_tree','seaweed_1','seaweed_2']);
        const gui_refresh = gui.add(params, 'refresh');

        gui_iterations.onFinishChange(reset);
        gui_minAngle.onFinishChange(reset);
        gui_maxAngle.onFinishChange(reset);
        gui_maxLength.onFinishChange(reset);
        gui_minLength.onFinishChange(reset);
        gui_branchFactor.onFinishChange(reset);
        gui_thick.onFinishChange(reset);
        gui_model.onFinishChange(reset);

        function reset(){
            t.scene.stop('demo');
            t.scene.launch('demo', params)
        }        
    }
}