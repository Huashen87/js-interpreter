function add(a) {
  return function (b) {
    return a + b;
  };
}

add(1)(4);
