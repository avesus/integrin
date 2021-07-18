const alu = ({s0, s1, s2, s3, b3, a3, b2, a2, b1, a1, b0, a0, m, $c_n}) => {

  const tmp2 = !(
    !b3&s1
    |
    b3&s0
    |
    a3
  );

  const y = !(
    tmp2
    |
    -
    |
    -
    |
    -
  );


  return {
    y: 0,
    $c_n_plus_4: 0,
    x: 0,
    f3: 0,
    f2: 0,
    a_eq_b: 0,
    f1: 0,
    f0: 0,
  };
};




const lacg = ({x3, y3, x2, y2, x1, y1, x0, y0, $c_n}) => {
  return {
    x: 0,
    y: 0,
    $c_n_plus_z: 0,
    $c_n_plus_y: 0,
    $c_n_plus_x: 0,
  };
};































const not = (a) => a?0:1;
const buf = (a) => a?1:0;

const xor = (a, b) => buf(b)?not(a):buf(a);

const or = (a, b) => a?1:b;

const y = () => not(or(or(buf(not())), or()))



export default {
  hi: () => {
    for (let a = 0; a <= 1; ++a) {
      for (let b = 0; b <= 1; ++b) {
         console.log(`${ a } ${ b } ${ xor(a, b) }`);
      }
    }
  }
};
