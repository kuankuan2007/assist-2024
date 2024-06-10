import KJSON from '../src/KJSON';
const str = KJSON.stringify(1)
console.log(str);
console.log(
  KJSON.parse(
    `[{"data":"1::object"},{"email":"2163826131@qq.com::string","pwd":"ee17febe2de744f15b527c64830ad86a21b7d01bcde0b90b2028eeb91f037797d7e201dccd9815795ed22632893450c1623fd4bcdf633f30237b3249a476f7c9::string"}]`
  )
);
setInterval(() => {}, 10000)