import '../';
console.log(KJSON.stringify({
  a: 1,
  b: '2',
  c: true,
  d: null,
  e: undefined,
  f: [1, 2, 3],
  g: { h: 4, i: 5 },
  j: { k: [6, 7, 8, { l: 9 }] },
  m: new Date(),
}));
