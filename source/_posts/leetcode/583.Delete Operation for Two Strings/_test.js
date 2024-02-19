/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function (word1, word2) {
    if (word1 === word2) return 0
  const len1 = word1.length;
  const len2 = word2.length;
  const dp = Array.from({ length: len1 + 1 }).map(() =>
    Array.from({ length: len2 + 1 }).fill(0)
  );

  for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (word1[i-1] === word2[j-1]) {
            dp[i][j] = dp[i-1][j-1] + 1;
        } else {
            dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
      }
  }

  return len1 + len2 - 2 * dp[len1][len2]
};

console.log(minDistance('asd', 'ad'));
