/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function (word1, word2) {
    if (word1 === word2) return 0
    const len1 = word1.length;
    const len2 = word2.length;
    const dp = Array.from({ length: len1 + 1 }).map((_,i) =>
        Array.from({ length: len2 + 1 }).map((_,j) => {
            if (i === 0) {
                return j
            }
            return i;
        })
    );


    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (word1[i-1] === word2[j-1]) {
                dp[i][j] = dp[i-1][j-1];
            } else {
                dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1]+1);
            }
        }
    }


    return dp[len1][len2]

};

console.log(minDistance('sea', 'ate'));
console.log(minDistance('horse', 'ros'));
console.log(minDistance('intention', 'execution'));
