/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsetsWithDup = function(nums) {
    const rst = [];
    rst.push([]);
    nums.sort((a, b) => a - b)
    backtrack(nums, 0, [], rst);
    return rst;
};

function backtrack(nums, start, path, res) {
    for (let i = start; i < nums.length; i++) {
        if (i > start && nums[i] === nums[i - 1]) {
            continue;
        }
        path.push(nums[i]);
        res.push(path.slice());
        backtrack(nums, i + 1, path, res);
        path.pop();
    }
}


console.log(subsetsWithDup([1,2,2]));