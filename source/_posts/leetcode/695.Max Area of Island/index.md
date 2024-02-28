---
title: 695.Max Area of Island
tags:
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/max-area-of-island/description/)

### 我的答案

找到每一块大陆的大小，返回最大值，因为可能没有，所以初始化`[0]`

```js
/**
 * 计算岛屿的最大面积
 * @param {number[][]} grid - 二维数组表示的网格
 * @return {number} - 最大面积
 */
var maxAreaOfIsland = function(grid) {
    const marked = {}; // 用于标记已访问过的岛屿
    const rst = [0]; // 存储每个岛屿的面积

    // 遍历网格中的每个岛屿
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            // 如果当前岛屿未被访问过且为陆地（1）
            if (!marked[`${i}-${j}`] && grid[i][j] === 1) {
                marked[`${i}-${j}`] = true; // 标记为已访问
                rst.push(dfs(i-1, j) + dfs(i, j-1) + dfs(i+1, j) + dfs(i, j+1) + 1); // 计算当前岛屿的面积并添加到结果数组中
            }
        }
    }

    /**
     * 深度优先搜索（DFS）计算岛屿的面积
     * @param {number} i - 当前岛屿的行索引
     * @param {number} j - 当前岛屿的列索引
     * @return {number} - 当前岛屿的面积
     */
    function dfs(i, j) {
        // 如果当前岛屿未被访问过且为陆地（1）
        if (!marked[`${i}-${j}`] && grid[i] && grid[i][j] === 1) {
            marked[`${i}-${j}`] = true; // 标记为已访问
            return dfs(i-1, j) + dfs(i, j-1) + dfs(i+1, j) + dfs(i, j+1) + 1; // 递归计算相邻岛屿的面积并加上当前岛屿的面积
        }

        return 0; // 如果当前岛屿不是陆地（1），返回0
    }

    return Math.max(...rst); // 返回结果数组中的最大值
};

```

### 参考答案

看起来好像差不多，但速度快了有一倍

```js
// 计算岛屿的最大面积
var maxAreaOfIsland = function(grid) {
    let ans = 0, n = grid.length, m = grid[0].length
    // 定义递归函数，用于计算岛屿的面积
    const trav = (i, j) => {
        // 如果越界或者当前位置为水域，则返回0
        if (i < 0 || j < 0 || i >= n || j >= m || !grid[i][j]) return 0
        // 将当前位置标记为已访问
        grid[i][j] = 0
        // 递归计算上下左右四个方向的岛屿面积，并返回最大值
        return 1 + trav(i-1, j) + trav(i, j-1) + trav(i+1, j) + trav(i, j+1)
    }
    // 遍历整个岛屿，计算每个岛屿的面积，并更新最大面积
    for (let i = 0; i < n; i++) 
        for (let j = 0; j < m; j++)
            if (grid[i][j]) ans = Math.max(ans, trav(i, j))
    // 返回最大面积
    return ans
};

```
