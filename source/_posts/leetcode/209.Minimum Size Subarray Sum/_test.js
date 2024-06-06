/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function(target, nums) {
    let rst = Infinity;
    let i = 0;
    let j = 0;
    let sum = 0;

    while (j < nums.length) {
        sum += nums[j];

        while (sum >= target) {
            rst = Math.min(rst, j - i + 1);
            sum -= nums[i];
            i++;
        }
        j++;
    }

    return rst === Infinity ? 0 : rst;
};

console.log(minSubArrayLen(7, [2,3,1,2,4,3]));