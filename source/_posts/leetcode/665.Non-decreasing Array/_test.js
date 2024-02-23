/**
 * @param {number[]} nums
 * @return {boolean}
 */
var checkPossibility = function (nums) {
  if (nums.length === 1) return true;
  let num = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < nums[i - 1]) {
      if (i > 1 && nums[i]< nums[i -2]) {
        nums[i] = nums[i - 1];
      } else {
        nums[i - 1] = nums[i];
      }
      num++;
      if (num > 1) return false;
    }
  }

  return true
};


console.log(checkPossibility([-1,4,2,3]));
console.log(checkPossibility([4,2,3]));
console.log(checkPossibility([4,2,1]));
console.log(checkPossibility([3,4,2,3]));