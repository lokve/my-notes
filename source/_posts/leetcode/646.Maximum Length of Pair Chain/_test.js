/**
 * @param {number[][]} pairs
 * @return {number}
 */
var findLongestChain = function(pairs) {
    if (!pairs.length) return 0;
    if (pairs.length === 1) return 1;
    pairs.sort((x,y) => x[0] - y[0]);

    const dp = [1];
    let max = 1;
    for (let i = 1; i <= pairs.length - 1; i++) {
        dp[i] = 1;
        for (let j = i - 1; j >= 0; j--) {
            if (pairs[i][0] > pairs[j][1]) {
                dp[i] = Math.max(dp[i], dp[j] + 1)
            }
        }
        max = Math.max(dp[i], max)
    }

    return max;

};

console.log(findLongestChain([[1,2],[2,3],[3,4]]));