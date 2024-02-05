/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {

  const len = prices.length;
  const dp = [];

  for (let i = 0; i < len; i++) {
    dp[i] = []
    dp[i][1] = []
    dp[i][2] = [];

    if (i === 0) {
      dp[i][1][0] = 0;
      dp[i][1][1] = -prices[i];
      dp[i][2][0] = 0;
      dp[i][2][1] = -prices[i];
    } else {
      dp[i][1][1] = Math.max(dp[i-1][1][1], 0 - prices[i])
      dp[i][1][0] = Math.max(dp[i-1][1][0], dp[i-1][1][1] + prices[i]);
      dp[i][2][1] = Math.max(dp[i-1][2][1], dp[i-1][1][0] - prices[i])
      dp[i][2][0] = Math.max(dp[i-1][2][0], dp[i-1][2][1] + prices[i]);
    }
  }

  return dp[len-1][2][0]
};

console.log(maxProfit([1,2,4,2,5,7,2,4,9,0]));
