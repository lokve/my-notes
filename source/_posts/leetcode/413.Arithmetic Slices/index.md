---
title: 413.Arithmetic Slices
tags:
  - leetcode
  - 动态规划
  - DP
categories:
  - leetcode
  - 动态规划
---

## 题目

[地址](https://leetcode.com/problems/arithmetic-slices/description/)

### 我的答案

先计算每一项之间的差，然后根据差相同的个数计算数量

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var numberOfArithmeticSlices = function (nums) {
    if (nums.length < 3) {
        return 0;
    }

    const arr = [];
    let sum = 0;

    for (let i = 1; i < nums.length; i++) {
        arr.push(nums[i] - nums[i - 1])
    }


    let last = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] !== arr[last]) {
            sum += getNum(i - last + 1)
            last = i;
        }
    }

    sum += getNum(arr.length - last + 1)

    return sum;
};

function getNum(len) {
    // let sum = 0;
    // for (let i = 0; i < len - 2; i++) {
    //     sum += len - i - 2;
    // }
    //
    // return sum;
    // 根据数学推到得出
    if (len >= 3) {
        return (len - 1) * (len - 2) / 2;
    }
    return 0;
}

```

优化一下

很奇怪，就一次循环，时间居然才超过8.23%

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var numberOfArithmeticSlices = function (nums) {
    if (nums.length < 3) {
        return 0;
    }

    let sum = 0;
    let sameNum = 1;
    let diff = nums[1] - nums[0]

    for (let i = 2; i < nums.length; i++) {
        const di = nums[i] - nums[i - 1];
        if (di !== diff) {
            sum += getNum(sameNum + 1);
            diff = di;
            sameNum = 1;
        }  else {
            sameNum += 1;
        }
    }

    sum += getNum(sameNum + 1)

    return sum;
};

function getNum(len) {
    if (len >= 3) {
        return (len - 1) * (len - 2) / 2;
    }
    return 0;
}
```

### 参考答案

用table记住数量，每多一个相同的数，就会多前一个数量+1，是一个数学关系，把上面的getNum拆分到了每一步中计算了

```js
var numberOfArithmeticSlices = function(nums) {
    let ans = 0;
    const table = new Array(nums.length).fill(0);

    for (let i = 2, n = nums.length; i < n; i++){
        let diff1 = nums[i] - nums[i-1];
        let diff2 = nums[i-1] - nums[i-2];

        if (diff1 == diff2){
            table[i] = table[i-1] + 1;
            ans += table[i-1] + 1;
        }
    }

    return ans;

};
```