---
title: 79.Word Search
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/word-search/description/)

### 我的答案

但是时间不够，特别在重复字母很多的时候

```js
/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
var exist = function (board, word) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      const record = {};
      if (dfs(i, j, 0, record)) {
        return true;
      }
    }
  }

  function dfs(i, j, index, record) {
    if (record[`${i}${j}`]) {
      return false;
    }
    if (index === word.length) {
      return true;
    }
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) {
      return false;
    }
    record[`${i}${j}`] = true;
    return (
      board[i][j] === word[index] &&
      (dfs(i - 1, j, index + 1, {...record}) ||
        dfs(i + 1, j, index + 1, {...record}) ||
        dfs(i, j - 1, index + 1, {...record}) ||
        dfs(i, j + 1, index + 1, {...record}))
    );
  }

  return false;
};
```

勉强通过了，不懂上面为什么超时

```js
/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
var exist = function (board, word) {

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (dfs(i, j, 0, {})) {
                return true;
            }
        }
    }

    function dfs(i, j, index, record) {
        if (index === word.length) {
            return true;
        }
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || board[i][j] !== word[index] || record[`${i}${j}`]) {
            return false;
        }
        record[`${i}${j}`] = true;

        if (dfs(i - 1, j, index + 1, record) ||
            dfs(i + 1, j, index + 1, record) ||
            dfs(i, j - 1, index + 1, record) ||
            dfs(i, j + 1, index + 1, record)) {
            return true
        }

        record[`${i}${j}`] = false;

        return false;
    }

    return false;
};

console.log(
    exist(
        [["A","A","A","A","A","A"],["A","A","A","A","A","A"],["A","A","A","A","A","A"],["A","A","A","A","A","A"],["A","A","A","A","A","A"],["A","A","A","A","A","A"]],
        "AAAAAAAAAAAAAAB"
    )
);

console.log(
    exist(
        [
            ['a', 'b'],
            ['c', 'd'],
        ],
        'cdba'
    )
);

```

### 参考答案

根据参考答案，引入额外的空间记录访问的节点，确实会增加运行时间（1200 -> 350）

```js
var exist = function(board, word) {
    const m = board.length;
    const n = board[0].length;
    
    const backtrack = (i, j, k) => {
        if (k === word.length) {
            return true;
        }
        if (i < 0 || i >= m || j < 0 || j >= n || board[i][j] !== word.charAt(k)) {
            return false;
        }
        
        const temp = board[i][j];
        board[i][j] = '\0'; 
        
        const result = backtrack(i + 1, j, k + 1) || 
                       backtrack(i - 1, j, k + 1) || 
                       backtrack(i, j + 1, k + 1) || 
                       backtrack(i, j - 1, k + 1);
        
        board[i][j] = temp; 
        return result;
    };
    
    for (let i = 0; i < m; ++i) {
        for (let j = 0; j < n; ++j) {
            if (backtrack(i, j, 0)) {
                return true;
            }
        }
    }
    return false;
};
```