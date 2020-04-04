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

function testmakeRulesMap() {
    let name = 'makeRulesMap';
    let lsys = new Lsys();
    let rulesArray = ['X =F[- X][+X]', 'F= F X'];
    let expectedMap = new Map([['X', 'F[-X][+X]'], ['F', 'FX']]);
    let expected = expectedMap.get('X') + ' ' + expectedMap.get('F');
    let resultMap = lsys.makeRulesMap(rulesArray);
    let result = resultMap.get('X') + ' ' + resultMap.get('F');
    test(name, expected, result);
}

function testmakeString() {
    let name = 'makeString';
    let lsys = new Lsys();
    let axiom = 'X';
    let rulesMap = new Map([['X', 'F[-X][+X]']]);
    let n = 2;
    let expected = 'F[-F[-X][+X]][+F[-X][+X]]';
    let result = lsys.makeString(axiom, rulesMap, n);
    test(name, expected, result);
}

function testmakePoints() {
    let name = 'makePoints';
    let lsys = new Lsys({ length: 10, angle: 90, iterations: 1 });
    let string = 'F[-X][+X]'; // T sharp
    let expected = '0:0,0 1:0,10 2:10,10 3:-10,10 width:20 height:10'; // format --> index : x , y ... width: number, height: number
    let res = lsys.makePoints(string); // {map,width,height}
    let p0 = res.map.get(0), p1 = res.map.get(1), p2 = res.map.get(2), p3 = res.map.get(3), width=res.width, height=res.height;
    let result = `0:${p0['x']},${p0['y']} 1:${p1['x']},${p1['y']} ` +
        `2:${p2['x']},${p2['y']} 3:${p3['x']},${p3['y']} width:${width} height:${height}`;
    test(name, expected, result);
}

function testtoPositive(){
    let name = 'toPositive';
    let lsys = new Lsys({rules: 'X=F[-X][+X]', length: 10, angle: 90, iterations: 1 }); // T sharp
    let expected = '3:0 minX:0';
    let res = lsys.toPositive(lsys.points);
    let p2 = res.map.get(3), minX = res.minX;
    let result = `3:${p2.x} minX:${minX}`;
    test(name, expected, result);
}

testmakeRulesMap();
testmakeString();
testmakePoints();
testtoPositive();

console.log(`Passed ${passed} of ${tested}`);

if (allPassed) {
    console.log('\x1b[32m%s\x1b[0m', '<<<< Test passed >>>>\n');
} else {
    console.log('\x1b[31m%s', '<<<< Test failed >>>>\n');
}