---
title: 216.Combination Sum III
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/combination-sum-iii/description/)

### 我的答案

根据题39的解法，稍作修改即可。

```js
/**
 * @param {number} k
 * @param {number} n
 * @return {number[][]}
 */
var combinationSum3 = function(k, n) {
        const rst = [];
        dfs(k, 1, n, [], rst);
        return rst;
    };

function dfs(restNum, start, target, res, rst) {
    if (restNum === 0 && target === 0) {
        rst.push(res.slice());
        return;
    }
    if (target < 0 || restNum < 0) return;
    for (let i = start; i <= 9; i++) {
        res.push(i)
        dfs(restNum - 1, i + 1, target - i, res, rst)
        res.pop()
    }
}

console.log(combinationSum3(4,1));
```

### 参考答案

```js
/**
 * @param {number} k
 * @param {number} n
 * @return {number[][]}
 */
var combinationSum3 = function (k, n) {
  let res = [];

  let backtracking = (currentDigit, sum, elements) => {
    if (currentDigit > 9) return;
    if (sum > n) return;
    if (elements.length > k) return;

    if (sum === n && elements.length === k) {
      res.push(elements);
      return;
    }

    for (let i = currentDigit + 1; i <= 9; i++) {
      backtracking(i, sum + i, [...elements, i]);
    }
  }

  backtracking(0, 0, [])

  return res;
};
```