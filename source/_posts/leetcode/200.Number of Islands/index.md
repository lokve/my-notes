---
title: 200.Number of Islands
tags:
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/number-of-islands/description/)

### 我的答案

答案同[题695](https://leetcode.com/problems/max-area-of-island/description/)

```js
var numIslands = function(grid) {
    let ans = 0, n = grid.length, m = grid[0].length;
    const trav = (i, j) => {
        if (i < 0 || j < 0 || i >= n || j >= m || grid[i][j] === '0') return 0
        grid[i][j] = '0'
        return 1 + trav(i-1, j) + trav(i, j-1) + trav(i+1, j) + trav(i, j+1)
    }
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (grid[i][j] === '1') {
                trav(i, j)
                ans += 1;
            }
        }
    }

    return ans;
};
```
