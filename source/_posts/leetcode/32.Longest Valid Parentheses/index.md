---
title: 32.Longest Valid Parentheses
tags: leetcode
categories:
  - leetcode
date: 2024-1-8 16:00
---

## 题目

[地址](https://leetcode.com/problems/longest-valid-parentheses/description/)

### 我的答案

遍历字符串，记住左括号的序号，如果有右括号，给这两个括号的位置标记1，然后去到这个左括号，
这样所有能互相匹配的括号都标记了1，最后就数最长的连续1是多少了

```js
/**
 * @param {string} s
 * @return {number}
 */
var longestValidParentheses = function(s) {
    const arr = Array.from({length: s.length}).fill(0);
    const left = [];

    for (let i = 0; i < s.length; i++) {
        const z = s[i];
        if (z === '(') {
            left.push(i);
        } else {
            const last = s[left[left.length - 1]];
            if (last === '(') {
                const index = left.pop()
                arr[i] = 1;
                arr[index] = 1;
            }
        }
    }

    console.log(arr);
    let max = 0;
    let sum = 0;
    arr.forEach(item => {
        if (item === 1) {
            sum += 1;
        } else {
            max = Math.max(sum, max)
            sum = 0;
        }
    })

    max = Math.max(sum, max)

    return max;

};
```