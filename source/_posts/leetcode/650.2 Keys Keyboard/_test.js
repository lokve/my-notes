/**
 * 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
 * 0, 2, 3, 4, 5, 5, 7, 6, 6, 7
 * @param {number} n
 * @return {number}
 */
var minSteps = function (n) {
  const dp = Array.from({ length: n + 1 }).fill(0);
  for (let i = 2; i <= n; i++) {
    dp[i] = i;
    for (let j = 1; j <= i; j++) {
      if (i % j === 0) {
        dp[i] = Math.min(dp[i], dp[j] + i / j);
      }
    }
  }

  return dp[n];
};

console.log(minSteps(1));
console.log(minSteps(2));
console.log(minSteps(3));
console.log(minSteps(5));
