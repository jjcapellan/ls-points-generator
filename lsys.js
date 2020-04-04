/**
 * @author       Juan Jose Capellan <soycape@hotmail.com>
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */


/**
 * The purpose of this class is to produce 2D point maps in a format that can be used by 
 * other programs to generate various procedural elements such as images, game levels, 
 * object placement, etc ....
 * This class implements in a limited way the Lindenmayer system, commonly used to 
 * describe the growth of different organisms.
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
        // Map of rules. (key = X | F, value = expression)
        this.config.rules = this.makeRulesMap(Array.isArray(rules) ? rules : [rules]);

        // This string describes the lsystem
        this.string = this.makeString(axiom, this.config.rules, iterations);


        /**
         * Object containing the points map and other info to render 
         * @type  {pointsObject}
         * @public
         */
        this.points = this.parseString(this.string);

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
        let regex = makeRulesRegex(rulesMap);
        for (let i = 0; i < n; i++) {
            str = str.replace(regex, applyRules);
        }
        return str;

        //// HELPER FUNCTIONS ////

        function makeRulesRegex(rulesMap) {
            let strRegex = '';
            rulesMap.forEach((v, k) => {
                strRegex += k + '|';
            });
            strRegex = strRegex[strRegex.length - 1] == '|' ? strRegex.slice(0, -1) : strRegex;
            return new RegExp(strRegex, 'g');
        }

        function applyRules(match) {
            return rulesMap.get(match);
        }
        //// END HELPER FUNCTIONS ////

    } // end makeString() 


    parseString(str) {
        const VERTICAL = Math.PI / 2;

        let pointsObject = {}; // { pointsMap:map, width:number, height:number}
        let state = initState();
        let config = this.config;
        let length = config.length;
        let pointsMap = initPointsMap();

        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;

        for (let i = 0; i < str.length; i++) {
            let token = str[i];
            switch (token) {
                case 'F':
                    move();
                    savePoint();
                    checkPosition();
                    break;

                case '+':
                    state.current.angle += config.angle;
                    break;

                case '-':
                    state.current.angle -= config.angle;
                    break;

                case '[':
                    saveCurrent();
                    length *= config.branchFactor;
                    break;

                case ']':
                    restoreCurrent();
                    length /= config.branchFactor;
                    break;

                case 'X':              // TODO: implement ends of branch
                    move();
                    savePoint();
                    checkPosition();
                    break;

                default:
                    break;
            } // end switch

        }

        //// HELPER FUNCTIONS ////
        function initState(initialAngle) {
            let _state = {};
            // Object storing actual state
            _state.current = { x: 0, y: 0, angle: VERTICAL, level: 0, index: 0 };
            // Stack used to save and restore states
            _state.stack = [{ x: 0, y: 0, angle: VERTICAL, level: 0, index: 0 }];
            // Represents the branch deep
            _state.level = 0;
            // Current index. One unique index for each point.
            _state.index = 0;
            return _state;
        }

        function initPointsMap() {
            let _pointsMap = new Map();
            _pointsMap.set(0, { x: 0, y: 0, angle: VERTICAL, level: 0, parent: -1, index: 0 });
            return _pointsMap;
        }

        function copyCurrent() {
            return Object.assign({}, state.current);
        }

        function checkPosition() {
            if (state.current.x < minX) minX = state.current.x;
            if (state.current.x > maxX) maxX = state.current.x;
            if (state.current.y < minY) minY = state.current.y;
            if (state.current.y > maxY) maxY = state.current.y;
        }

        function move() {
            let x = state.current.x;
            let y = state.current.y;
            let angle = state.current.angle;

            let x1 = Math.round(x + length * Math.cos(angle));
            let y1 = Math.round(y + length * Math.sin(angle));

            state.current.x = x1;
            state.current.y = y1;

            state.index++;
            state.current.index = state.index;
        }

        function savePoint() {
            let parentIndex = getParent();
            let point = copyCurrent();
            point.parent = parentIndex;
            pointsMap.set(state.index, point);
        }

        function getParent() {
            return state.stack[state.stack.length - 1].index;
        }

        function getWidth() {
            return maxX - minX;
        }

        function getHeight() {
            return maxY - minY;
        }

        function saveCurrent() {
            state.level++;
            state.current.level = state.level;
            let newState = copyCurrent();
            state.stack.push(newState);
        }

        function restoreCurrent() {
            state.level--;
            state.current = state.stack.pop();
        }

        //// END HELPER FUNCTIONS ////

        pointsObject.map = pointsMap;
        pointsObject.width = getWidth();
        pointsObject.height = getHeight();
        pointsObject.minX = minX;
        pointsObject.minY = minY;

        return pointsObject;

        //console.log(this.points);
    } // end parseString


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