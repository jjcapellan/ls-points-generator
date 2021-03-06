class Gui extends Phaser.Scene {
    constructor() {
        super('gui');
    }

    create() {
        let t = this;
        let presets = {
            'binary_tree': {
                iterations: 10,
                minLength: 50,
                maxLength: 60,
                minAngle: 3,
                maxAngle: 34,
                branchFactor: 0.90,
                thick: 8,
                color0: [255, 255, 0],
                color1: [119, 250, 91],
                rule: 'F[-X][+X]'
            },
            'seaweed_1': {
                iterations: 4,
                minLength: 6,
                maxLength: 10,
                minAngle: 11,
                maxAngle: 15,
                branchFactor: 1,
                thick: 1,
                color0: [255, 255, 0],
                color1: [25, 185, 15],
                rule: 'X[+X]X[-X]X'
            },
            'seaweed_2': {
                iterations: 5,
                minLength: 4,
                maxLength: 8,
                minAngle: 20,
                maxAngle: 24,
                branchFactor: 0.96,
                thick: 1,
                color0: [255, 255, 0],
                color1: [22, 145, 14],
                rule: 'XX-[-X+X+X]+[+X-X-X]'
            },
            'koch_curve': {
                iterations: 4,
                minLength: 5,
                maxLength: 5,
                minAngle: 90,
                maxAngle: 90,
                branchFactor: 1,
                thick: 1,
                color0: [255, 255, 255],
                color1: [255, 255, 255],
                rule: 'X+X-X-X+X'
            },
            current: 'binary_tree',
            refresh: reset
        };

        let params = Object.assign({}, presets.binary_tree);

        params.refresh = reset;
        const gui = new dat.GUI({ with: 400 });
        const gui_iterations = gui.add(params, 'iterations', 1, 15).step(1);
        const gui_minAngle = gui.add(params, 'minAngle', 0, 360).step(1);
        const gui_maxAngle = gui.add(params, 'maxAngle', 0, 360).step(1);
        const gui_minLength = gui.add(params, 'minLength', 0, 100).step(1);
        const gui_maxLength = gui.add(params, 'maxLength', 0, 100).step(1);
        const gui_branchFactor = gui.add(params, 'branchFactor', 0.80, 1.2).step(0.01);
        const gui_thick = gui.add(params, 'thick', 1, 10).step(1);
        const gui_color0 = gui.addColor(params, 'color0');
        const gui_color1 = gui.addColor(params, 'color1');
        const gui_preset = gui.add(presets, 'current', ['binary_tree', 'seaweed_1', 'seaweed_2','koch_curve']);
        const gui_refresh = gui.add(params, 'refresh');

        gui_iterations.onFinishChange(reset);
        gui_minAngle.onFinishChange(reset);
        gui_maxAngle.onFinishChange(reset);
        gui_maxLength.onFinishChange(reset);
        gui_minLength.onFinishChange(reset);
        gui_branchFactor.onFinishChange(reset);
        gui_thick.onFinishChange(reset);
        gui_color0.onFinishChange(reset);
        gui_color1.onFinishChange(reset);
        gui_preset.onFinishChange(changePreset);

        function reset() {
            t.scene.stop('demo');
            t.scene.launch('demo', params);

        }

        function changePreset(preset) {
            copyProperties(presets[preset], params);
            updateGui();
            reset();
        }

        function updateGui() {
            for (let i in gui.__controllers) {
                gui.__controllers[i].updateDisplay();
            }
        }

        function copyProperties(source, target) {
            for (const prop in source) {
                target[prop] = source[prop];
            }
        }

        this.scene.launch('demo', params);
        t.scene.sendToBack('demo');
    }
}