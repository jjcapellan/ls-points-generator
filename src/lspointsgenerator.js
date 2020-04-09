/**
 * @author       Juan Jose Capellan <soycape@hotmail.com>
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */


/**
 * The purpose of this class is to generate a map of points based on the L-system (Lindenmayer system).
 * @class
 */
class LsPointsGenerator {
    /**
     * Creates an instance of LsPointsGenerator.
     * @param  {configuration} configuration Contains initial settings 
     * @memberof ScrollingCamera
     */
    constructor({ length = 30, angle = 15, iterations = 2, branchFactor = 1, maxPoints = 30000 } = {}) {

        this.initHelpers();

        this.config = {};
        this.config.length = length;
        this.config.angle = angle;
        this.config.iterations = iterations;
        this.config.branchFactor = branchFactor;
        this.config.maxPoints = maxPoints;
    }

    makePoints(axiom, rules) {
        const VERTICAL = Math.PI / 2;
        const MAX_ITERATIONS = this.helpers.maxIterations(rules, this.config.maxPoints);
        const CONFIG = this.config;
        const LENGTH = this.helpers.validateLength(CONFIG.length);
        const ANGLE = this.helpers.validateAngle(CONFIG.angle);
        this.config.iterations = this.config.iterations > MAX_ITERATIONS ? MAX_ITERATIONS : this.config.iterations;
        const STRING = this.helpers.makeString(axiom, rules, CONFIG.iterations);

        let israngeLength = Array.isArray(LENGTH);
        let israngeAngle = Array.isArray(ANGLE);
        let state = this.helpers.initState(VERTICAL);
        let pointsMap = this.helpers.initPointsMap(VERTICAL);
        let distance = 0;
        let turnInRadians = 0;
        let bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        let pointsObject = {};

        for (let i = 0; i < STRING.length; i++) {
            let v = STRING.charAt(i);
            if (v == 'F' || v == 'X') {
                distance = this.helpers.getValueFromRange(LENGTH, israngeLength) * Math.pow(CONFIG.branchFactor, state.current.level);
                this.helpers.move(state, distance);
                this.helpers.savePoint(state, pointsMap);
                this.helpers.updateBounds(state.current, bounds);
                continue;
            }
            switch (v) {
                case '-':
                    turnInRadians = this.helpers.getValueFromRange(ANGLE, israngeAngle);
                    state.current.angle += turnInRadians;
                    break;

                case '+':
                    turnInRadians = this.helpers.getValueFromRange(ANGLE, israngeAngle);
                    state.current.angle -= turnInRadians;
                    break;

                case '[':
                    state.level++;
                    this.helpers.saveCurrent(state);
                    break;

                case ']':
                    state.level--;
                    this.helpers.restoreCurrent(state);
                    break;

                default:
                    break;
            };
        };

        pointsObject.map = pointsMap;
        pointsObject.width = bounds.maxX - bounds.minX;
        pointsObject.height = bounds.maxY - bounds.minY;
        pointsObject.minX = bounds.minX;
        pointsObject.minY = bounds.minY;

        return this.helpers.toPositive(pointsObject);
    }

    initHelpers() {
        this.helpers = {
            initState: (initialAngle) => {
                let state = {};
                state.current = { x: 0, y: 0, angle: initialAngle, level: 0, index: 0 };
                state.stack = [{ x: 0, y: 0, angle: initialAngle, level: 0, index: 0 }];
                state.level = 0;
                state.index = 0;
                state.parent = 0;
                return state;
            },
            initPointsMap: (initialAngle) => {
                let pointsMap = new Map();
                pointsMap.set(0, { x: 0, y: 0, angle: initialAngle, level: 0, parent: -1, index: 0 });
                return pointsMap;
            },
            makeString: (axiom, rule, iterations) => {
                let str = axiom.toUpperCase();
                rule = rule.toUpperCase();
                for (let i = 0; i < iterations; i++) {
                    str = str.replace(/X/g, rule);
                }
                return str;
            },
            copyObject: (obj) => {
                return Object.assign({}, obj);
            },
            updateBounds: (current, bounds) => {
                if (current.x < bounds.minX) bounds.minX = current.x;
                if (current.x > bounds.maxX) bounds.maxX = current.x;
                if (current.y < bounds.minY) bounds.minY = current.y;
                if (current.y > bounds.maxY) bounds.maxY = current.y;
            },
            move: (state, distance) => {
                let x = state.current.x;
                let y = state.current.y;
                let angle = state.current.angle;

                let x1 = Math.round(x + distance * Math.cos(angle));
                let y1 = Math.round(y + distance * Math.sin(angle));

                state.current.x = x1;
                state.current.y = y1;

                state.parent = state.current.index;
                state.index++;
                state.current.index = state.index;
            },
            getValueFromRange: (value, isArray) => {
                let num = 0;
                if (isArray) {
                    num = Math.random() * (value[1] - value[0]) + value[0];
                } else {
                    num = value;
                }
                return num;
            },
            savePoint: function (state, pointsMap) {
                let parentIndex = state.parent;
                let point = this.copyObject(state.current);
                point.parent = parentIndex;
                pointsMap.set(state.index, point);
            },
            saveCurrent: function (state) {
                state.current.level = state.level;
                let newState = this.copyObject(state.current);
                state.stack.push(newState);
            },
            restoreCurrent: (state) => {
                state.current = state.stack.pop();
            },
            toPositive: (pointsObject) => {
                let pointsMap = new Map();
                let minX = pointsObject.minX;
                let minY = pointsObject.minY;
                let isYneg = minY < 0;
                let isXneg = minX < 0;

                pointsObject.map.forEach((v, k) => {
                    let point = Object.assign({}, v);
                    if (isXneg) point.x += Math.abs(minX);
                    if (isYneg) point.y += Math.abs(minY);
                    pointsMap.set(k, point);
                });

                minX += isXneg ? Math.abs(minX) : 0;
                minY += isYneg ? Math.abs(minY) : 0;

                return { map: pointsMap, width: pointsObject.width, height: pointsObject.height };
            },
            angleToRadians: (angle) => {
                const RADS_PER_DEGREE = Math.PI / 180;
                if (Array.isArray(angle)) {
                    angle[0] = angle[0] * RADS_PER_DEGREE;
                    angle[1] = angle[1] * RADS_PER_DEGREE;
                } else {
                    angle = angle * RADS_PER_DEGREE;
                }
                return angle;
            },
            validateLength: (length) => {
                if (Array.isArray(length)) {
                    length[0] = length[0] < 1 ? 1 : length[0];
                    length[1] = length[1] < 1 ? 1 : length[1];
                } else {
                    length = length < 1 ? 1 : length;
                }
                return length;
            },
            validateAngle: function (angle) {
                if (Array.isArray(angle)) {
                    angle[0] = angle[0] < 1 ? 1 : angle[0];
                    angle[0] = angle[0] > 359 ? 359 : angle[0];
                    angle[1] = angle[1] < 1 ? 1 : angle[1];
                    angle[1] = angle[1] > 359 ? 359 : angle[1];
                } else {
                    angle = angle < 1 ? 1 : angle;
                    angle = angle > 359 ? 359 : angle;
                }

                return this.angleToRadians(angle);
            },
            maxIterations: (rule, maxPoints) => {
                // Fs accumulated in last period = (Xs acumulated in last period / Xs first period) * Fs first period
                // Xs accumulated in last period = Xs first period * ((Xs first period)^(iterations)-1)/(Xs first period - 1)
                // Fs + Xs = maxPoints <---- iterations is the value to get
                const nX0 = (rule.match(/X/g) || []).length;
                const nF0 = (rule.match(/F/g) || []).length;

                let maxIterations = Math.round(Math.log(1 + ((nX0 - 1) * nX0 * maxPoints) / (nX0 * nF0 + nX0 * nX0)) / Math.log(nX0));
                return maxIterations;
            }

        }
    }

}
try {
    module.exports = LsPointsGenerator;
} catch (err) {

}

// ************************ TYPE DEFINITIONS *************************************
// *******************************************************************************

/**
 * Object containing the points map and other info to render
 * @typedef  {object} point
 * @property  {number} x Horizontal position
 * @property  {number} y Vertical position
 * @property  {number} angle Angle in radians towards next connected point
 * @property  {number} level Each time a branch is created ('[') level increments by one.
 * @property  {number} index Unique number which indentifies this point in the map of points.
 * @property  {number} parent Index of the previus connected point
 */

/**
 * Object containing the points map and other info to render
 * @typedef  {object} pointsObject
 * @property  {Map<point>} map Map of points
 * @property  {number} width
 * @property  {number} height
 */

/**
 * Contains initial configuration settings
 * @typedef  {object} configuration
 * @property  {(number | number[])} [length = 30] Distance to cover in each movement (F or X symbols).\n
 * It can be a number or an array representing a range of values ([min, max])
 * @property  {(number | number[])} [angle = 15] Amount of degrees to turn in each '+' or '-' symbol. \n
 * It can be a number or an array representing a range of values ([min, max])
 * @property  {number} [iterations = 2] Number of iterations
 * @property  {number} [branchFactor = 1] Modify branch length based on deep level. (0-1)
 * @property  {number} [maxPoints = 30000] Limits the number of generated points. The amount of points \n
 * that will be generated is precalculated, so if it exceed this \n
 * parameter the number of iterations are adjusted.
 */