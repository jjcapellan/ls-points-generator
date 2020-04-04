const Lsys = require('./lsys');


let tested = 0;
let passed = 0;
let allPassed = true;

function succes(funcName,result) {
    console.log('%s\x1b[32m%s\x1b[0m', funcName + ': ', 'passed');
    console.log('Result: ' + result);
    passed++;
}

function fail(funcName, expected, result) {
    console.log('%s\x1b[31m%s\x1b[0m', funcName + ': ', 'failed');
    console.log('Expected: ' + expected);
    console.log('Result: ' + result + '\n');
    allPassed = false;
}

function test(funcName, expected, result) {
    expected == result ? succes(funcName, result) : fail(funcName, expected, result);
    tested++;
}

function testmakeString() {
    let name = 'makeString';
    let lsys = new Lsys();
    let axiom = 'X';
    let rules = 'F[-X][+X]';
    let n = 2;
    let expected = 'F[-F[-X][+X]][+F[-X][+X]]';
    let result = lsys.helpers.makeString(axiom, rules, n);
    test(name, expected, result);
}

function testmakePoints() {
    let name = 'makePoints';
    let lsys = new Lsys({ length: 10, angle: 90, iterations: 1 });
    let axiom = 'X';
    let rules = 'F[-X][+X]'; // T sharp
    let expected = '0:10,0 1:10,10 2:20,10 3:0,10 width:20 height:10'; // format --> index : x , y ... width: number, height: number
    let res = lsys.makePoints(axiom, rules); // {map,width,height,...}
    let p0 = res.map.get(0), p1 = res.map.get(1), p2 = res.map.get(2), p3 = res.map.get(3), width=res.width, height=res.height;
    let result = `0:${p0['x']},${p0['y']} 1:${p1['x']},${p1['y']} ` +
        `2:${p2['x']},${p2['y']} 3:${p3['x']},${p3['y']} width:${width} height:${height}`;
    test(name, expected, result);
}

function testtoPositive(){
    let name = 'toPositive';
    let lsys = new Lsys({length: 10, angle: 90, iterations: 1 }); // T sharp
    let expected = '3:0 minX:0';
    let pointsMap = new Map([ // F[-X][+X]
        [0, {x:0, y:0}],
        [1, {x:0, y:10}],
        [2, {x:10, y:10}],
        [3, {x: -10, y: 10}]
    ]);
    let pointsObject = {map: pointsMap, width: 20, height: 10, minX: -10, minY: 0};
    let res = lsys.helpers.toPositive(pointsObject);
    let p2 = res.map.get(3), minX = res.minX;
    let result = `3:${p2.x} minX:${minX}`;
    test(name, expected, result);
}

function testprint(){
    let lsys = new Lsys({length: [2,4], angle: 90, iterations: 1 }); // T sharp
    let pointsObject = lsys.makePoints('X', 'F[-X][+X]');
    lsys.print(pointsObject, 10, 10);
}

function testgetDistance(){
    let name = 'getDistance';
    let lsys = new Lsys();
    let expected = true;
    let res = lsys.helpers.getDistance([10,20],true);
    let result = (res >= 10 && res <= 20);
    test(name, expected, result);

    expected = 20;
    result = lsys.helpers.getDistance(20, false);
    test(name, expected, result);
}


testprint(); // visual testing
testmakeString();
testmakePoints();
testtoPositive();
testgetDistance();

console.log(`Passed ${passed} of ${tested}`);

if (allPassed) {
    console.log('\x1b[32m%s\x1b[0m', '<<<< Test passed >>>>\n');
} else {
    console.log('\x1b[31m%s', '<<<< Test failed >>>>\n');
}