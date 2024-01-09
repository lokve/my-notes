

/**
 *
 * [2,4,5,1,3] -> [2,4,5,3,1] -> [2,5,1,3,4] -> [2,5,1,4,3] -> [2,5,3,1,4]
 *
 */

const oriNums = [1, 2, 5, 2, 1];
var nextPermutation = function (nums) {
  let ind1 = -1;
  let ind2 = -1;
  // step 1 find breaking point
    // 找到最后一个比前面小的
  for (let i = nums.length - 2; i >= 0; i--) {
    if (nums[i] < nums[i + 1]) {
      ind1 = i;
      break;
    }
  }
  // if there is no breaking  point
  if (ind1 === -1) {
    reverse(nums, 0);
  } else {
    // step 2 find next greater element and swap with ind2
    for (let i = nums.length - 1; i >= 0; i--) {
      if (nums[i] > nums[ind1]) {
        ind2 = i;
        break;
      }
    }

    swap(nums, ind1, ind2);
    // step 3 reverse the rest right half
    reverse(nums, ind1 + 1);
  }
};

function swap(nums, i, j) {
  let temp = nums[i];
  nums[i] = nums[j];
  nums[j] = temp;
}
function reverse(nums, start) {
  let i = start;
  let j = nums.length - 1;
  while (i < j) {
    swap(nums, i, j);
    i++;
    j--;
  }
}
nextPermutation(oriNums);

console.log(oriNums);
