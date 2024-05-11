---
title: 40.combination-sum II
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/combination-sum-ii/)

### 我的答案

根据上一题的解法，只需要对candidates进行排序，然后去重即可。

```js
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum2 = function(candidates, target) {
    const rst = [];
    candidates.sort((a, b) => a - b)
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
        if (i > start && candidates[i] === candidates[i - 1]) {
            continue;
        }
        res.push(candidates[i])
        dfs(candidates, i + 1, target - candidates[i], res, rst)
        res.pop()
    }
}

console.log(combinationSum2([10,1,2,7,6,1,5], 8));

```