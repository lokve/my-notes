/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
var uniquePaths = function(m, n) {
    let S = m + n - 2;  // 总共的移动次数
    let D = m - 1;      // 向下的移动次数
    let ret = 1;
    for (let i = 1; i <= D; i++) {
        ret = ret * (S - D + i) / i;
    }
    return ret;
};

console.log(uniquePaths(8,3));

var uniquePaths2 = function(S, D) {
    let rst = 1;
    for (let i = 1; i <= D; i++) {
        rst = rst * (S - i + 1)/i
    }
    return rst;
};

var uniquePaths3 = function(S, D) {
    let ret = 1;
    for (let i = 1; i <= D; i++) {
        ret = ret * (S - D + i) / i;
    }
    return ret;
};

console.log(uniquePaths2(7,3), uniquePaths3(7,3));
