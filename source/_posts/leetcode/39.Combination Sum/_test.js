/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
    const rst = [];
    dfs(candidates, 0, target, [], rst);
    return rst;
};

function dfs(candidates, start, target, res, rst) {
    if (target === 0) {
        rst.push(res.slice());
        return;
    }
    if (target < 0) return;
    for (let i = start; i < candidates.length; i++) {
        res.push(candidates[i])
        dfs(candidates, i, target - candidates[i], res, rst)
        res.pop()
    }
}

console.log(combinationSum([2,3,6,7], 7));
console.log(combinationSum([2,3,5], 8));