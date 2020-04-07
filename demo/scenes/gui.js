class Gui extends Phaser.Scene {
    constructor() {
        super('gui');
    }

    create() {
        let t = this;
        let presets = {
            'binary_tree': {
                iterations: 12,
                minLength: 50,
                maxLength: 60,
                minAngle: 3,
                maxAngle: 34,
                branchFactor: 0.90,
                thick: 8,
                rule: 'F[-X][+X]'
            },
            'seaweed_1': {
                iterations: 6,
                minLength: 3,
                maxLength: 6,
                minAngle: 11,
                maxAngle: 15,
                branchFactor: 1,
                thick: 1,
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
                rule: 'XX-[-X+X+X]+[+X-X-X]'
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
        const gui_preset = gui.add(presets, 'current', ['binary_tree', 'seaweed_1', 'seaweed_2']);
        const gui_refresh = gui.add(params, 'refresh');

        gui_iterations.onFinishChange(reset);
        gui_minAngle.onFinishChange(reset);
        gui_maxAngle.onFinishChange(reset);
        gui_maxLength.onFinishChange(reset);
        gui_minLength.onFinishChange(reset);
        gui_branchFactor.onFinishChange(reset);
        gui_thick.onFinishChange(reset);
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