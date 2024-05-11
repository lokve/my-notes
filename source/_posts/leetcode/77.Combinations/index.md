---
title: 77.combinations
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/combinations/description/)

### 我的答案


```js
/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function(n, k) {

    const arr = Array.from({length: n}).map((_, i) => i + 1);
    const res = [];
    const dfs = (arr, path, start) => {
        if (path.length === k) {
            res.push([...path]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            path.push(arr[i]);
            dfs(arr, path, i + 1);
            path.pop();
        }
    }
    dfs(arr, [], 0);
    return res;
};

console.log(combine(5, 3));
```

### 参考答案



```js
/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function(n, k) {
    const result = [];
    generateCombinations(1, n, k, [], result);
    return result;
};

function generateCombinations(start, n, k, combination, result) {
    if (k === 0) {
        result.push([...combination]);
        return;
    }
    for (let i = start; i <= n; ++i) {
        combination.push(i);
        generateCombinations(i + 1, n, k - 1, combination, result);
        combination.pop();
    }
}
```

