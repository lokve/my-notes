/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var combinationSum4 = function(nums, target) {
  const dp = Array.from({ length: target + 1 }).fill(0);
  dp[0] = 1;
  for (let j = 1; j <= target; j++) {
    for (let coin of nums) {
      if (j >= coin) {
        dp[j] += dp[j - coin];
      }
    }
  }

  return dp[target];
};
console.log(combinationSum4([1, 2, 3], 4));

