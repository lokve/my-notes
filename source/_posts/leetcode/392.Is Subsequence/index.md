---
title: 392.Is Subsequence
tags:
  - leetcode
  - 贪心算法
categories:
  - leetcode
  - 贪心算法
---

## 题目

[地址](https://leetcode.com/problems/is-subsequence/description/)

### 我的答案

挨个比过去就行

```js
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isSubsequence = function(s, t) {
        if (s === t) return true;
        let n = 0;
        for (let i = 0; i < t.length; i ++) {
            if (t[i] === s[n]) {
                n++
            }

            if (n === s.length) {
                return true;
            }
        }
        return false;
    };
```