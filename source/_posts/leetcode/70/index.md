---
title: 70. Climbing Stairs
tags: leetcode
date: 2024-1-9 10:00
---

## 题目

[地址](https://leetcode.com/problems/climbing-stairs/description/)

### 参考答案

斐波那契数列

学习算法思想（[动态规划算法](https://pdai.tech/md/algorithm/alg-core-dynamic.html)）的例题

```js
dq[n] = dq[n - 1] + dq[n- 2]
```
```js
/**
 * 用数组
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    var arr = [1, 2]
    var i = 2;
    for (; i < n; i++) {
        arr[i] = arr[i-1] + arr[i-2]
    }
    return arr[n-1];
};
```
```js
/**
 * 前后相加
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    if (n <= 2) return n;

    let step1 = 1;
    let step2 = 2;
    for (let i = 2; i < n;i++) {
        const sum = step1 + step2;
        step1 = step2;
        step2 = sum;
    }

    return step2
};
```
