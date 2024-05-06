---
title: 79.Binary Tree Paths
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/binary-tree-paths/description/)

### 我的答案

```js
/**
 * @param {TreeNode} root
 * @return {string[]}
 */
var binaryTreePaths = function(root) {
    const rst = [];

    function dfs(node, path) {
        if (!node) {
            return;
        }
        if (node.left) {
            dfs(node.left, path + '->' + node.left.val);
        }
        if (node.right) {
            dfs(node.right, path + '->' + node.right.val);
        }
        if (!node.left && !node.right) {
            rst.push(path);
        }
    }

    dfs(root, root.val.toString());

    return rst;
};
```

### 参考答案

大差不差

```js
var binaryTreePaths = function(root) {
    const paths = [];

    function dfs(node, path) {
        if (!node) return;
        path.push(node.val.toString());
        if (!node.left && !node.right) {
            paths.push(path.join('->'));
        } else {
            dfs(node.left, path.slice()); // Copy the path array
            dfs(node.right, path.slice()); // Copy the path array
        }
    }
    
    dfs(root, []);
    return paths;
};
```