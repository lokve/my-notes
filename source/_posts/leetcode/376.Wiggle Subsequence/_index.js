function wiggleMaxLength(nums) {
    if (nums == null || nums.length == 0) {
        return 0;
    }
    let up = 1, down = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] > nums[i - 1]) {
            up = down + 1;
        } else if (nums[i] < nums[i - 1]) {
            down = up + 1;
        }
    }
    return Math.max(up, down);
}

console.log(wiggleMaxLength([1,17,5,10,13,15,10,5,16,8]));
console.log(wiggleMaxLength([1,2,3,4,5,6,7,8,9]));