/**
 * @author       Juan Jose Capellan <soycape@hotmail.com>
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */


/**
 * The purpose of this class is to generate a map of points based on a L-system (Lindenmayer system).
 * @class
 */
class LsysPointsGen {
    /**
     * Creates an instance of LsysPointsGen.
     * @param  {configuration} configuration Contains initial settings 
     * @memberof ScrollingCamera
     */
    constructor({ axiom = 'X', rules = 'X=F[-X][+X]', length = 30, angle = 15, iterations = 2, branchFactor = 1 } = {}) {

        this.config = {};
        this.config.length = length;
        this.config.angle = angle * Math.PI / 180;
        this.config.iterations = iterations;
        this.config.branchFactor = branchFactor;
        this.config.axiom = axiom;
        this.initHelpers();
        // Map of rules. (key = X | F, value = expression)
        this.config.rules = this.makeRulesMap(Array.isArray(rules) ? rules : [rules]);

        // This string describes the lsystem
        this.string = this.makeString(axiom, this.config.rules, iterations);


        /**
         * Object containing the points map and other info to render 
         * @type  {pointsObject}
         * @public
         */
        this.points = this.makePoints(this.string);

    }

    makeRulesMap(rulesArray) {
        let rulesMap = new Map();
        for (let i = 0; i < rulesArray.length; i++) {
            rulesArray[i] = rulesArray[i].replace(/\s/g, '');
            let rule = rulesArray[i].split('=');
            rulesMap.set(rule[0], rule[1]);
        }
        return rulesMap;
    }

    makeString(axiom, rulesMap, n) {
        let str = axiom;
        let regex = this.helpers.makeRulesRegex(rulesMap);
        for (let i = 0; i < n; i++) {
            str = str.replace(regex, (match) => { return rulesMap.get(match); });
        }
        return str;
    }


    makePoints(str) {
        const VERTICAL = Math.PI / 2;

        let pointsObject = {};
        let state = this.helpers.initState(VERTICAL);
        let config = this.config;
        let length = config.length;
        let pointsMap = this.helpers.initPointsMap(VERTICAL);
        let bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

        str.split('').forEach( v => {
            switch (v) {
                case 'F':
                    this.helpers.move(state, length);
                    this.helpers.savePoint(state, pointsMap);
                    this.helpers.updateBounds(state.current, bounds);
                    break;

                case '+':
                    state.current.angle += config.angle;
                    break;

                case '-':
                    state.current.angle -= config.angle;
                    break;

                case '[':
                    state.level++;
                    this.helpers.saveCurrent(state);
                    length *= config.branchFactor;
                    break;

                case ']':
                    state.level--;
                    this.helpers.restoreCurrent(state);
                    length /= config.branchFactor;
                    break;

                case 'X':              // TODO: implement ends of branch
                    this.helpers.move(state, length);
                    this.helpers.savePoint(state, pointsMap);
                    this.helpers.updateBounds(state.current, bounds);
                    break;

                default:
                    break;
            } // end switch
        });

        pointsObject.map = pointsMap;
        pointsObject.width = bounds.maxX - bounds.minX;
        pointsObject.height = bounds.maxY - bounds.minY;
        pointsObject.minX = bounds.minX;
        pointsObject.minY = bounds.minY;

        return pointsObject;
    }


    /**
     * Returns a new pointsObject with all points moved to positive coordinates.
     * @param  {pointsObject} points
     * @returns {pointObject}
     * @memberof LsysPointsGen
     */
    toPositive(points) {
        let pointsMap = new Map();
        let minX = points.minX;
        let minY = points.minY;
        let isYneg = minY < 0;
        let isXneg = minX < 0;

        points.map.forEach((v, k) => {
            let point = Object.assign({}, v);
            if (isXneg) point.x += Math.abs(minX);
            if (isYneg) point.y += Math.abs(minY);
            pointsMap.set(k, point);
        });

        minX += isXneg ? Math.abs(minX) : 0;
        minY += isYneg ? Math.abs(minY) : 0;

        return { map: pointsMap, width: points.width, height: points.height, minX: minX, minY: minY };
    }

    initHelpers() {
        this.helpers = {
            // makeString()
            makeRulesRegex: (rulesMap) => {
                let strRegex = '';
                rulesMap.forEach((v, k) => {
                    strRegex += k + '|';
                });
                strRegex = strRegex[strRegex.length - 1] == '|' ? strRegex.slice(0, -1) : strRegex;
                return new RegExp(strRegex, 'g');
            },
            // makePoints()
            initState: (initialAngle) => {
                let state = {};
                // Object storing actual state
                state.current = { x: 0, y: 0, angle: initialAngle, level: 0, index: 0 };
                // Stack used to save and restore states
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
            }

        }
    }// end initHelpers

}

module.exports = LsysPointsGen;

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
 * @property  {number} minX Minimum value of x
 * @property  {number} minY Minimum value of y
 */

/**
 * Contains initial configuration settings
 * @typedef  {object} configuration
 * @property  {string} [axiom = 'X'] String of symbols from allowed symbols defining the initial state of the system.\n
 * Allowed symbols: X,F,\[,\],+,-
 * @property  {string | string[]} [rules = 'X=F[-X][+X]'] One rule (string) or two (string[]) which defines what happens in each iteration
 * @property  {number} [length = 30] Distance to cover in each movement (F or X symbols)
 * @property  {number} [angle = 15] Amount of degrees to turn in each '+' or '-' symbol
 * @property  {number} [iterations = 2] Number of iterations
 * @property  {number} [branchFactor = 1] Modify branch length based on deep level. (0-1)
 */