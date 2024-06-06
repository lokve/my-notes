/**
 * @param {number} k
 * @param {number} n
 * @return {number[][]}
 */
var combinationSum3 = function(k, n) {
    const rst = [];
    dfs(k, 1, n, [], rst);
    return rst;
};

function dfs(restNum, start, target, res, rst) {
    if (restNum === 0 && target === 0) {
        rst.push(res.slice());
        return;
    }
    if (target < 0 || restNum < 0) return;
    for (let i = start; i <= 9; i++) {
        res.push(i)
        dfs(restNum - 1, i + 1, target - i, res, rst)
        res.pop()
    }
}

console.log(combinationSum3(4,1));