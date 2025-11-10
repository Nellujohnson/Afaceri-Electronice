// var var1 =1;
// let var2 =2;
// const var3 = 3;

// var1 =5;
// console.log(var1);
// var2 =5;
// console.log(var2);
// var3 =5;
// console.log(var3);

function testVariables(param) {
    if (param) {
        var var1 =1;
        let var2 =2;
        const var3 = 3;
    }

    console.log(var1);
    console.log(var2);
    console.log(var3);
}

testVariables(true);