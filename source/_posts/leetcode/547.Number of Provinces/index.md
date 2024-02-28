---
title: 547.Number of Provinces
tags:
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/number-of-provinces/description/?source=submission-noac)

### 我的答案

有两种marked，一种是已被其他城市相连，一种是一个城市只需要标记一次

```js
/**
 * @param {number[][]} isConnected 连通矩阵，表示每个点是否与其它点相连
 * @return {number} 返回连通的圆的数量
 */
var findCircleNum = function (isConnected) {
  let ans = 0; // 记录连通圆的数量
  let n = isConnected.length; // 连通矩阵的行数
  let m = isConnected[0].length; // 连通矩阵的列数
  const marked = {}; // 记录已经访问过的点
  const trav = (i, j) => {
    marked[i] = true;
    marked[j] = true;
    isConnected[i][j] = 0; // 将相连的点标记为0
    isConnected[j][i] = 0; // 将相连的点标记为0
    for (let k = 0; k < m; k++) {
      if (j !== k && isConnected[j][k] === 1) {
        trav(j, k); // 递归访问相连的点
      }
    }
  };
  for (let i = 0; i < n; i++) {
    let hasMarked = false; // 记录当前连通圆是否已经访问过
    for (let j = 0; j < m; j++) {
      if (i !== j && isConnected[i][j] === 1) {
        trav(i, j); // 访问相连的点
        if (!hasMarked) {
          ans += 1; // 记录连通圆的数量
          hasMarked = true; // 标记当前连通圆已经访问过
        }
      }
    }
    if (!marked[i]) {
      ans += 1; // 记录连通圆的数量
    }
  }
  return ans;
};

```

### 参考答案

```js
function findCircleNum(M) {
    // 创建一个 Set 数据结构，用于存储已访问的节点
    const visited = new Set();
    // 创建一个变量，用于存储朋友圈的数量
    let circles = 0;
	
    // 遍历矩阵 M
    for (let i = 0; i < M.length; i++) {
        // 检查当前节点是否已访问过
        if (!visited.has(i)) {
            // 对当前节点进行深度优先搜索
            dfs(i);
            // 这是一个新的朋友圈
            circles++;
        }
    }
	
    return circles;
	
    // 辅助函数，用于进行深度优先搜索
    function dfs(i) {
        // 遍历当前节点的邻居节点
        for (let j = 0; j < M.length; j++) {
            // 检查当前节点是否是邻居节点，并且未被访问过
            if (M[i][j] === 1 && !visited.has(j)) {
                // 将邻居节点标记为已访问
                visited.add(j);
                // 对邻居节点进行深度优先搜索
                dfs(j);
            }
        }
    }
}

```