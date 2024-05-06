---
title: 417.Pacific Atlantic Water Flow
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/pacific-atlantic-water-flow/description/)

### 我的答案

需要记录已经访问的节点，防止死循环，速度很慢

```js
/**
 * @param {number[][]} heights
 * @return {number[][]}
 */
var pacificAtlantic = function(heights) {
        const m = heights.length;
        const n = heights[0].length;
        const res = [];
        const record = {}

        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                const r = record[i * n + j] = {
                    pacific: false,
                    atlantic: false
                }
                const atlantic = new Set();
                // const pacific = new Set();
                dfs(i, j, i * n + j,  record[i * n + j], atlantic, heights[i][j]);
                // dfs(i, j, i * n + j,  record[i * n + j], pacific, heights[i][j]);
                if (r.atlantic && r.pacific) {
                    res.push([i, j]);
                }
            }
        }


        function dfs(i, j, order, r, set, height) {
            if (i < 0 || j < 0 || i >= m || j >= n) {
                return;
            }
            const ii = i * n + j;
            if (set.has(ii)) {
                return;
            }

            if (heights[i][j] > height) {
                return;
            }

            if (i === 0 || j === 0) {
                r.pacific = true;
            }
            if (i === m - 1 || j === n - 1) {
                r.atlantic = true;
            }

            if (r.pacific && r.atlantic) {
                return;
            }

            if (order !== ii && record[ii] && record[ii].atlantic && record[ii].pacific) {
                r.pacific = true;
                r.atlantic = true;
                return;
            }

            set.add(ii)
            dfs(i + 1, j, order, r, set, heights[i][j]);
            dfs(i - 1, j, order, r, set, heights[i][j]);
            dfs(i, j + 1, order, r, set, heights[i][j]);
            dfs(i, j - 1, order, r, set, heights[i][j]);
        }

        return res;

    };


// console.log(pacificAtlantic(19,17,8,11],[4,11,10,0,1,18,11],[11,7,14,4,7,8,9],[12,0,0,3,6,2,12],[0,16,3,3,5,6,6],[6,11,17,12,18,5,15],[16,14,8,4,10,16,6],[9,7,2,13,5,5,5],[14,17,19,4,7,2,5],[11,16,18,14,8,10,12],[5,11,10,17,2,2,13],[7,6,12,3,5,3,12],[12,10,0,19,3,15,12],[13,2,12,1,1,15,19],[11,15,10,8,14,19,8],[16,2,2,16,5,15,16],[9,8,2,17,15,14,16],[17,2,17,17,0,6,3],[3,4,13,9,1,4,0],[1,3,13,10,14,9,4]]));
console.log(pacificAtlantic([[8,7],[11,2],[1,13],[14,15],[0,10],[19,9],[17,14],[10,10],[5,5],[15,3],[6,10],[11,10],[4,3],[12,13],[11,7],[0,9],[13,5],[11,18],[9,19],[10,11]]))
```

### 参考答案

```js
var pacificAtlantic = function(M) {
    if (!M.length) return M
    let y = M.length, x = M[0].length, ans = [],
        dp = new Uint8Array(x * y)
    const dfs = (i, j, w, h) => {
        let ij = i * x + j
        if ((dp[ij] & w) || M[i][j] < h) return
        dp[ij] += w, h = M[i][j]
        if (dp[ij] === 3) ans.push([i,j])
        if (i + 1 < y) dfs(i+1, j, w, h)
        if (i > 0) dfs(i-1, j, w, h)
        if (j + 1 < x) dfs(i, j+1, w, h)
        if (j > 0) dfs(i, j-1, w, h)
    }   
    for (let i = 0; i < y; i++) {
        dfs(i, 0, 1, M[i][0])
        dfs(i, x-1, 2, M[i][x-1])
    }
    for (let j = 0; j < x; j++) {
        dfs(0, j, 1, M[0][j])
        dfs(y-1, j, 2, M[y-1][j])
    }
    return ans
};
```

