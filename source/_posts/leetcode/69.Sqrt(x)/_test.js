/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
    let n =  Math.ceil(x/2);
    let half = Math.ceil(n/2);
    while (!(n * n <= x && (n+1)*(n+1) > x)) {
        if (n * n < x) {
            n += half;
        } else {
            n -= half;
        }
        half = Math.ceil(half/2);
    }
    return n;
};

console.log(mySqrt(15129));
