---
title: 64.Minimum Path Sum
tags: leetcode
categories:
  - leetcode
---


## 题目

[地址](https://leetcode.com/problems/minimum-path-sum/description/)

### 参考答案

最短路径

```js
/**
 * @param {number[][]} grid
 * @return {number}
 */
var minPathSum = function(grid) {
    const m = grid.length ;
    const n = grid[0].length ;
    for(let i = 0; i < m; i++){
	for(let j = 0; j < n; j++){
        if(i == 0 && j != 0) grid[i][j] += grid[i][j-1];
        if(i != 0 && j == 0) grid[i][j] += grid[i-1][j];
        if (i != 0 && j != 0) grid[i][j] += Math.min(grid[i-1][j], grid[i][j-1]);
        }
    }
return grid[m-1][n-1];
};
```
