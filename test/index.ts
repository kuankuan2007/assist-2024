import kjson from '../src/kjson';
const v1 = {
  a1: 2,
  b1: 'b',
};
v1['c1'] = v1;
const data = {
  a: 1,
  b: 'b',
  c: null,
  d: [v1, '111', 21, new Date()],
  e: NaN,
};
data['d'].push(data);
data['f'] = v1;
const result = kjson.stringify(data,undefined,true);
console.log(result);
console.log(kjson.parse(result,true));
setInterval(() => {});
