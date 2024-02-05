/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (k, prices) {
  const len = prices.length;
  const dp = [];

  for (let i = 0; i < len; i++) {
    dp[i] = [];
    for (let j = 0; j <= k; j++) {
      dp[i][j] = [];

      if (i === 0 || j === 0) {
        dp[i][j][0] = 0;
        dp[i][j][1] = -prices[i];
      } else {
        dp[i][j][1] = Math.max(
          dp[i - 1][j][1],
          dp[i - 1][j - 1][0] - prices[i]
        );
        dp[i][j][0] = Math.max(dp[i - 1][j][0], dp[i - 1][j][1] + prices[i]);
      }
    }
  }

  return dp[len - 1][k][0];
};

console.log(maxProfit(4, [1, 2, 4, 2, 5, 7, 2, 4, 9, 0]));
