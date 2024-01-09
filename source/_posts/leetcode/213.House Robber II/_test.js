/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function(nums) {
    if (nums.length <= 2) return Math.max(...nums);
    const isFirst = nums[0] > nums[1]
    nums[1] = Math.max(nums[0], nums[1]);
    for (let i = 2; i < nums.length;i++) {
        if (i === nums.length - 1) {
            if (isFirst) {
                nums[i] = Math.max(nums[i - 1], nums[i - 2], nums[i])
            } else {
                nums[i] = Math.max(nums[i - 1], nums[i - 2] + nums[i], nums[i])
            }
        } else {
            nums[i] = Math.max(nums[i - 1], nums[i - 2] + nums[i])
        }
    }

    return nums[nums.length - 1]
};


console.log(rob([1,2,1,1]));