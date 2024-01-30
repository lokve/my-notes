/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  const dp = Array(s.length + 1).fill(false)
  dp[0] = true;

  for (let i = 1; i <= s.length; i++) {
    for (let w of wordDict) {
      const len = w.length;
      if (i >= len && s.slice(i-len, i) === w) {
        dp[i] = dp[i] || dp[i-len];
      }
    }
  }

  return dp[s.length]
};

console.log(wordBreak("cbca", ["bc","ca"]));
console.log(wordBreak("aaaaaaa", ["aaaa", "aaa"]));
console.log(wordBreak("codeedd", ["edd","code"]));
console.log(wordBreak("cars", ["car","ca","rs"]));
