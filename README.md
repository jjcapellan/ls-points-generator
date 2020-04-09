![GitHub tag (latest by date)](https://img.shields.io/github/tag-date/jjcapellan/ls-points-generator.svg)
![GitHub license](https://img.shields.io/github/license/jjcapellan/ls-points-generator.svg)
# LS-POINTS-GENERATOR
**LsPointsGenerator** is a javascript class to generate a 2d point map by introducing a randomness factor into a [Lindenmayer system](https://en.wikipedia.org/wiki/L-system).

Demo: https://jjcapellan.github.io/ls-points-generator/  

## **Installation**
There are two alternatives:
* Download the file [lspointsgenerator.js](https://cdn.jsdelivr.net/gh/jjcapellan/ls-points-generator/dist/lspointsgenerator.js) to your project folder and add a reference in your html:
```html
<script src = "lspointsgenerator.js"></script>
```
* Point a script tag to the CDN link:
```html
<script src = "https://cdn.jsdelivr.net/gh/jjcapellan/ls-points-generator/dist/lspointsgenerator.js"></script>
```  

## **How to use**
1. **Instantiate a LsPointsGenerator object**:  
The constructor uses a config object as argument with the following optional properties:
* **iterations** {number} [iterations = 2] : Number of iterations.
* **length** {(number | [max, min])} [length = 30] : The distance the pointer will travel in each movement. It can be an array containing the maximum and minimum value.
* **angle** {(number | [max, min])} [angle = 15] : Amount of degrees applied in each rotation. It can be an array containing the maximum and minimum value.
* **branchFactor** {number} [branchFactor = 1] : Multiplier that modifies the possible length in each new branching level. Example: 0.5 will halve the length in each new branching level.
* **maxPoints** {number} [maxPoints = 30000] : Limits the number of generated points. The amount of points that will be generated is precalculated, so if it exceed this parameter the number of iterations are adjusted.
2. **Call the method makePoints()** to get the points object. This method has two arguments:
* **axiom** {string} : string of symbols defining the initial state. [More info](#axiom)
* **rule** {string} : String by which each "X" will be replaced in each iteration. [More info](#rule)  
Example:
```javascript

const config = {
    iterations: 10,
    length: [50, 60],
    angle: [3, 34],
    branchFactor: 0.90
    }

const ls = LsPointsGenerator(config);


let axiom = 'X';
let rule = 'F[-X][+X]'; // representation of a binary tree

let pointsObject = ls.makePoints(axiom, rule);

```
3. **Get the map info**. The object returned by makePoints() has three properties:
* **map** : Map object containing the points.
* **width** : Width of the map.
* **height** : Heigth of the map.
Now we can access to the points and do something with them:
```javascript
// Using pointsObject obtained in previous example
const map = pointsObject.map;
const width = pointsObject.width;
const height = pointsObject.heigth;

// Access to the points
map.forEach((point, index) => {
    console.log(point); // {x,y,angle,level,index,parent}
});

```

## <a name="point"></a>**The point object**
In this class a point is an object with this properties:
* **x** : Horizontal position.
* **y** : Vertical position.
* **angle** : angle in radians with the previous point.
* **level** : number defining the branching level. Example: 0 is the level of the tree trunk points.
* **index** : number that identifies the point. This number matches its map key.
* **parent** : index of the previous point which is connected.  

## <a name="symbols"></a>**The symbols**
LsPointsGenerator uses the following set of six symbols (alphabet in l-system terminology):
* **F** : Moves the pointer.
* **X** : Determines how the map evolves in each iteration. Represents a growth point.
* **+** : right rotation.
* **-** : left rotation.
* **[** : saves a point in the stack. Is used to make branches.
* **]** : restores a point from the stack.

## <a name="axiom"></a>**The axiom**
The axiom defines the initial state. The axiom is built with the symbols described in the previous section.  
Since it is the first state, it must contain at least one "X".
Example:
```javascript
    axiom = 'F-F++X';    // Valid axiom
    axiom = 'F[+F][-F]'; // Incorrect axiom
```

## <a name="rule"></a>**The rule**
**LsPointsGenerator** supports in this version one rule.  
In each iteration the 'X' symbol is replaced by the **rule**.
The **rule** uses the same symbols as the **axiom**.  
Example:
```javascript
    rule = 'XX-[-X+F+X]+[+X-F-X]'; // Valid rule
    rule = 'D+++FF[X-X]'           // Incorrect rule
```

## <a name="License"></a>**License**  
**LsPointsGenerator** is licensed under the terms of the MIT open source license.

