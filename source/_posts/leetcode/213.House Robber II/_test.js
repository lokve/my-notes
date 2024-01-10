/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function(nums) {
    if (nums.length <= 2) return Math.max(...nums);
    const rst1 = [nums[0], nums[1]];

    rst1[1] = Math.max(rst1[0], rst1[1]);
    for (let i = 2; i < nums.length - 1;i++) {
        rst1[i] = Math.max(rst1[i - 1], rst1[i - 2] + nums[i])
    }

    const rst2 = [0 , nums[1], nums[2]];
    rst2[2] = Math.max(rst2[1], rst2[2]);
    for (let i = 3; i < nums.length;i++) {
        rst2[i] = Math.max(rst2[i - 1], rst2[i - 2] + nums[i])
    }

    return Math.max(rst2[rst2.length - 1], rst1[rst1.length - 1])
};


// [1,1,1,2]
// [2,3,2]
// [1,2,3,1]
// [1,2,3]
console.log(rob([1,1,1,2]));