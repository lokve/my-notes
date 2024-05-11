---
title: 39.combination-sum
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/combination-sum/)

### 我的答案

按顺序递归，但数字可以重复，如果每次都全部循环的话，会出现顺序不同但结果相同的情况，所以需要start来避免结果重复

```js
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
    const rst = [];
    dfs(candidates, 0, target, [], rst);
    return rst;
};

function dfs(candidates, start, target, res, rst) {
    if (target === 0) {
        rst.push(res.slice());
        return;
    }
    if (target < 0) return;
    for (let i = start; i < candidates.length; i++) {
        res.push(candidates[i])
        dfs(candidates, i, target - candidates[i], res, rst)
        res.pop()
    }
}

console.log(combinationSum([2,3,6,7], 7));
console.log(combinationSum([2,3,5], 8));
```