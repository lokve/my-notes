/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    const dp = Array.from({length: prices.length + 1}).fill(0);

    const behaviors = [-1, 1, 0];

    for (let i = 1; i <= prices.length; i++) {
    }
};