/**
 * @param {string[]} strs
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
var findMaxForm = function (strs, m, n) {
  const dp = Array.from({ length: m + 1 }).map(() =>
    Array.from({ length: n + 1 }).fill(0)
  );

  for (let str of strs) {
    let _m = 0;
    let _n = 0;
    for (let s of str) {
      if (s === "0") {
        _m += 1;
      } else {
        _n += 1;
      }
    }

    for (let i = m; i >= _m; i--) {
      for (let j = n; j >= _n; j--) {
        dp[i][j] = Math.max(dp[i - _m][j - _n] + 1, dp[i][j]);
      }
    }
  }

  return dp[m][n];
};

console.log(findMaxForm(["10", "0001", "111001", "1", "0"], 5, 3));
