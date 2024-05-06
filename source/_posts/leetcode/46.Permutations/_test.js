/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {

    function dfs(nums, path, res) {
        if (nums.length === 0) {
            res.push(path);
            return;
        }
        for (let i = 0; i < nums.length; i++) {
            dfs(nums.slice(0, i).concat(nums.slice(i + 1)), path.concat(nums[i]), res);
        }
    }

    let res = [];
    dfs(nums, [], res);
    return res;

};

console.log(permute([1,2,3]));