/**
 * @param {number[]} nums
 * @return {boolean}
 */
var canPartition = function(nums) {
    if (nums.length === 1) return false;
    const sum = nums.reduce((x,y) => x + y, 0);
    if (sum % 2 !== 0) return false;
    const W = sum / 2;
    const dp = Array(W + 1).fill(false);
    dp[0] = true;
    // nums.sort((x,y) => y - x)
    for (let num of nums) {                 // 0-1 背包一个物品只能用一次
        for (let i = W; i >= num; i--) {   // 从后往前，先计算 dp[i] 再计算 dp[i-num]
            dp[i] = dp[i] || dp[i - num];
        }
    }
    console.log(dp);
    return dp[W];
};

console.log(canPartition([1,2,5,10]));
