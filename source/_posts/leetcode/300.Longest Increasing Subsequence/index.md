---
title: 300.Longest Increasing Subsequence
tags: 
  - leetcode 
  - 动态规划 
  - DP
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/longest-increasing-subsequence/description/)

### 我的答案

把所有的情况都列出来，答案应该是对的，但是超时了

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var lengthOfLIS = function(nums) {
    if (!nums.length) return 0;
    if (nums.length === 1) return 1;
    const dp = [[nums[0]]];
    let max = 1;
    for (let i = 1; i <= nums.length - 1; i++) {
        let has = false;
        for (let j = 0; j < dp.length; j++) {
            if (nums[i] > dp[j][dp[j].length - 1]) {
                dp.push([...dp[j], nums[i]])
                has = true;
                max = Math.max(max, dp[j].length + 1)
            }
        }

        if (!has) {
            dp.push([nums[i]])
        }
    }

    return max;
};

console.log(lengthOfLIS([10,9,2,5,3,7,101,18]));
console.log(lengthOfLIS([0,1,0,3,2,3]));
```

- 这位老哥说的好，在明确知道使用dp来解决后，dp[i]其实都是有迹可循的

```markdown
Here is an confusion fo mine when understanding what really the dp[i] is in the method, hope it might help the people who face the same problem like me.

When you do DP/Max-Travese method, actually your steps is like this:
First, give a start, here '[1] * len(nums)', becasue for each points in array, at least itself is a increasing subsequence;
Then, use DP/Max-Travese method to fill in the DP[] step by step, here comes what confused me.

**What really DP[i] represents? **
You might say, ''DP[i] represents LIS of the array[start to i]'', but this kind of saying is only partly right, which is the key point of confusing, it needed to be added a constrain, together should be like this, ''DP[i] represents 'fake LIS' which ended by array[i] of the array [start to i]''.

Now let me explain with an example array, [2,5,4,3,1], and the related DP array is dp[],
if you consider the 'dp[i] represents LIS of the array[start to i]', the related dp[] should be,[1,2,2,2,2];
if you consider the 'dp[i] represents 'fake LIS' which ended by array[i] of the array[start to i]', dp[], should be [1,2,2,2,1], and only by this is realy what the code says.

This 'fake LIS' is really important, for it can help you to store an 'fake LIS' ended by array[i],
so you can use it later to see if you can get a longer array after. But a 'real LIS' can't help store the result needed.

Thanks for your reading.
```

每次循环，但凡前面出现比`nums[i]`小的值，`dp[i]`至少是`dp[j]+1`，然后是他们中的最大一个

```js
/** [10,9,2,5,3,7,101,18]
 *  [1, 1,1,2,2,3,4  ,4]
 *
 *  [0,1,0,3,2,3]
 *  [1,2,1,3,3,4]
 *
 *  [0,7,8,9,1,2,3,4]
 *  [1,2,3,4,2,3,4,5]
 * @param {number[]} nums
 * @return {number}
 */
var lengthOfLIS = function(nums) {
    if (!nums.length) return 0;
    if (nums.length === 1) return 1;
    const dp = [1];
    let max = 1;
    for (let i = 1; i <= nums.length - 1; i++) {
        dp[i] = 1;
        for (let j = i - 1; j >= 0; j--) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1)
            }
        }
        max = Math.max(dp[i], max)
    }

    return max;
};

console.log(lengthOfLIS([10,9,2,5,3,7,101,18]));
console.log(lengthOfLIS([0,1,0,3,2,3]));
```