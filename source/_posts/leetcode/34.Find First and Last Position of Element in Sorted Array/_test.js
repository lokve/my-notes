/**
 * 在给定的有序数组中搜索指定目标值的范围。
 * @param {number[]} nums - 有序数组
 * @param {number} target - 目标值
 * @return {number[]} - 目标值在数组中的范围，如果不存在则返回 [-1, -1]
 */
var searchRange = function(nums, target) {
    let begin = 0, end = nums.length - 1;

    // 使用二分查找找到目标值的最左边位置
    while (begin < end) {
        const mid = Math.floor((begin + end) / 2);

        if (nums[mid] < target) {
            begin = mid + 1;
        } else {
            end = mid
        }
    }

    // 如果目标值不存在，则返回 [-1, -1]
    if (nums[begin] !== target) {
        return [-1, -1];
    }

    const first = begin;

    begin = 0, end = nums.length - 1;

    // 使用二分查找找到目标值的最右边位置
    while (begin < end) {
        const mid = Math.floor((begin + end) / 2);

        if (target >= nums[mid]) {
            begin = mid + 1;
        } else {
            end = mid - 1;
        }
    }

    // 如果目标值不存在，则将右边位置减去1
    if (nums[begin] !== target) {
        begin -= 1;
    }

    return [first, begin]
};

console.log(searchRange([2,2], 2)); // [0, 0]
console.log(searchRange([5,7,7,8,8,10], 8)); // [3, 3]
