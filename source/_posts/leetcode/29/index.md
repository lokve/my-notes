---
title: 29. Divide Two Integers
tags: leetcode
date: 2024-1-8 16:00
---

## 题目

[地址](https://leetcode.com/problems/divide-two-integers/description/)

### 我的答案

使用加法累加，模拟乘法
未通过，时间不够

```js
/**
 * @param {number} dividend
 * @param {number} divisor
 * @return {number}
 */
var divide = function(dividend, divisor) {
    const symbol = dividend > 0 && divisor < 0 || dividend < 0 && divisor > 0 ? '-' : '';
    dividend = Math.abs(dividend)
    divisor = Math.abs(divisor);

    const max = Math.pow(2, 31) - 1;

    if (divisor === 1) {
       if (symbol === '' && dividend > max) {
           dividend = max;
       }

      return +`${symbol}${dividend}`
    }
    
    let sum = divisor;
    let time = 0;


    while (dividend - sum >= 0) {
        sum += divisor;
        time++;
    }


    return +`${symbol}${time}`
};
```

### 参考答案

使用位运算进行除法（知识面未覆盖）

位运算一次只能找以2为底的除数，先找到最大的以2为底的除数，标记到ans，
然后把这部分数值减去，在剩下的数中，再找到最大的以2为底的除数，以此类推，直到剩下的数小于被除数，ans的累积结果就是商

```js
/**
 * @param {number} dividend
 * @param {number} divisor
 * @return {number}
 */
var divide = function(A, B) {
    if (A === -2147483648 && B === -1) return 2147483647
    let ans = 0, sign = 1
    if (A < 0) A = -A, sign = -sign
    if (B < 0) B = -B, sign = -sign
    if (A === B) return sign
    for (let i = 0, val = B; A >= B; i = 0, val = B) {
        while (val > 0 && val <= A) val = B << ++i
        A -= B << i - 1, ans += 1 << i - 1
    }
    return sign < 0 ? -ans : ans
};
```