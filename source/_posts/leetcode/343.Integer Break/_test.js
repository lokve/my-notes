/**
 * 2,1 × 1 = 1
 * 3,1 × 2 = 2
 * 4,2 × 2 = 4
 * 5,2 × 3 = 6
 * 6,3 × 3 = 9
 * 7,3 × 2 × 2 = 12
 * 8,3 × 3 × 2 = 18
 * 9,3 × 3 × 3 = 27
 * 10,3 × 3 × 2 × 2 = 36
 * 11,3 × 3 × 2 × 3 = 54
 * @param {number} n
 * @return {number}
 */
var integerBreak = function (n) {
  const dp = Array.from({ length: n + 1 }).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    for (let j = 1; j <= i - 1; j++) {
      const a = dp[i],
        b = j * dp[i - j],
        c = j * (i - j);
      dp[i] = Math.max(dp[i], Math.max(j * dp[i - j], j * (i - j)));
    }
  }
  return dp[n];
};

console.log(integerBreak(10));
