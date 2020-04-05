/**
 * @author       Juan Jose Capellan <soycape@hotmail.com>
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */


/**
 * The purpose of this class is to generate a map of points based on a L-system (Lindenmayer system).
 * @class
 */
class LsPointsGenerator {
    /**
     * Creates an instance of LsPointsGenerator.
     * @param  {configuration} configuration Contains initial settings 
     * @memberof ScrollingCamera
     */
    constructor({ length = 30, angle = 15, iterations = 2, branchFactor = 1 } = {}) {

        this.initHelpers();

        this.config = {};
        this.config.length = length;
        this.config.angle = this.helpers.angleToRadians(angle);
        this.config.iterations = iterations;
        this.config.branchFactor = branchFactor;
    }

    makePoints(axiom, rules) {
        const VERTICAL = Math.PI / 2;

        let pointsObject = {};
        let state = this.helpers.initState(VERTICAL);
        let config = this.config;
        let israngeLength = Array.isArray(config.length);
        let distance = 0;
        let israngeAngle = Array.isArray(config.angle);
        let turnInRadians = 0;
        let pointsMap = this.helpers.initPointsMap(VERTICAL);
        let bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        let str = this.helpers.makeString(axiom, rules, config.iterations);

        str.split('').forEach(v => {
            if (v == 'F' || v == 'X') {
                distance = this.helpers.getValueFromRange(config.length, israngeLength) * Math.pow(config.branchFactor, state.current.level);
                this.helpers.move(state, distance);
                this.helpers.savePoint(state, pointsMap);
                this.helpers.updateBounds(state.current, bounds);
                return;
            }
            switch (v) {
                case '+':
                    turnInRadians = this.helpers.getValueFromRange(config.angle, israngeAngle);
                    state.current.angle += turnInRadians;
                    break;

                case '-':
                    turnInRadians = this.helpers.getValueFromRange(config.angle, israngeAngle);
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
            }
        });

        pointsObject.map = pointsMap;
        pointsObject.width = bounds.maxX - bounds.minX;
        pointsObject.height = bounds.maxY - bounds.minY;
        pointsObject.minX = bounds.minX;
        pointsObject.minY = bounds.minY;

        return this.helpers.toPositive(pointsObject);
    }

    print(pointsObject, rows, cols) {
        let board = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
        let map = pointsObject.map;
        map.forEach((v, k) => {
            board[rows - 1 - v.y][v.x] = 1;
        });
        console.log('-'.repeat(cols));
        board.forEach((rowArray, row) => {
            let str = '';
            rowArray.forEach((element, col) => {
                str += element ? 'X' : ' ';
            });
            console.log(str);
        });
        console.log('-'.repeat(cols));
    }

    initHelpers() {
        this.helpers = {
            initState: (initialAngle) => {
                let state = {};
                state.current = { x: 0, y: 0, angle: initialAngle, level: 0, index: 0 };
                state.stack = [{ x: 0, y: 0, angle: initialAngle, level: 0, index: 0 }];
                state.level = 0;
                state.index = 0;
                return state;
            },
            initPointsMap: (initialAngle) => {
                let pointsMap = new Map();
                pointsMap.set(0, { x: 0, y: 0, angle: initialAngle, level: 0, parent: -1, index: 0 });
                return pointsMap;
            },
            makeString: (axiom, rules, iterations) => {
                let str = axiom;
                for (let i = 0; i < iterations; i++) {
                    str = str.replace(/X/g, rules);
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
            getParent: (state) => {
                return state.stack[state.stack.length - 1].index;
            },
            savePoint: function (state, pointsMap) {
                let parentIndex = this.getParent(state);
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
 */