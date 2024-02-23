/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNonDuplicate = function(nums) {
    let begin = 0, end = nums.length - 1;
    while (begin < end) {
        let mid = Math.floor((begin + end) / 2);
        if (mid % 2 === 1) mid--;
        if (nums[mid] === nums[mid + 1]) {
            begin = mid + 2;
        } else {
            end = mid;
        }
    }
    return nums[begin];
}

console.log(singleNonDuplicate([1,1,2,3,3,4,4,8,8]));
console.log(singleNonDuplicate([3,3,7,7,10,11,11]));
