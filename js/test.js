function add(num1) {
  return function (num2) {
    return num1 + num2;
  };
}

function log(value) {
  console.log(value);
}

const add5 = add(5);
const v = add5(3);
log(v);
