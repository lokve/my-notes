/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {

  const len = prices.length;
  const dp = [];

  for (let i = 0; i < len; i++) {
    dp[i] = []
    if (i === 0) {
      dp[i][0] = 0;
      dp[i][1] = -prices[i];
    } else {
      dp[i][0] = Math.max(dp[i-1][0], dp[i-1][1] + prices[i]);
      dp[i][1] = Math.max(dp[i-1][1], dp[i-1][0] - prices[i])
    }
  }

  return dp[len-1][0]
};

console.log(maxProfit([7,1,5,3,6,4]));
