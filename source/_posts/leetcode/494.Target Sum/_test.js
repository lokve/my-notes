/**
 * @param {number[]} nums
 * @param {number} S
 * @return {number}
 */
var findTargetSumWays = function(nums, S) {
    const sum = nums.reduce((x,y) => x + y);
    const W = (sum + S) / 2;
    if (Math.floor(W) !== W) return 0;
    const dp = Array(W+1).fill(0);
    dp[0] = 1;
    for (let num of nums) {
        for (let i = W; i >= num; i--) {
            dp[i] = dp[i] + dp[i - num]
        }
    }

    console.log(dp);
    return dp[W]
};

console.log(findTargetSumWays([1,1,1,1,1], 3));
