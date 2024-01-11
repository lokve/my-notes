/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    let max = nums[0]

    for (let i = 1; i < nums.length; i++) {
        const sum = nums[i - 1] + nums[i];
        nums[i] = nums[i] > sum ? nums[i] : sum
        max = Math.max(max, nums[i]);
    }

    return max;
};

console.log(maxSubArray([5,4,-1,7,8]));