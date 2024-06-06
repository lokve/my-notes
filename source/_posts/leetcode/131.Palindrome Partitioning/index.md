---
title: 131.Palindrome Partitioning
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/palindrome-partitioning/)

### 我的答案

考虑所有可能的结果，如果是回文，就一步步切割下去

```js
/**
 * @param {string} s
 * @return {string[][]}
 */
var partition = function(s) {
        const rst = [];
        const memo = {};
        function dfs(s, path) {
            if (s.length === 0) {
                rst.push(path);
                return;
            }
            for (let i = 1; i <= s.length; i++) {
                const sub = s.substring(0, i);
                memo[sub] = memo[sub] !== undefined ? memo[sub] : isPalindrome(sub);
                if (memo[sub]) {
                    memo[sub] = true;
                    dfs(s.substring(i), path.concat(sub));
                }
            }
        }
        dfs(s, [])
        return rst;
    };

function isPalindrome(s) {
    let i = 0;
    let j = s.length - 1;
    while (i < j) {
        if (s[i] !== s[j]) {
            return false;
        }
        i++;
        j--;
    }
    return true;
}

console.log(partition('aab'));
```

### 参考答案

```js
var partition = function(s) {
    let res = [];
    let n = s.length;

    function isPalindrome(str) {
        let left = 0;
        let right = str.length - 1;
        while (left < right) {
            if (str[left] !== str[right]) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    function getAllPartitions(curInd, curList) {
        let isLastPalindrome = isPalindrome(curList[curList.length - 1]);
        if (curInd === n) {
            // 每一个组合都是回文
            if (isLastPalindrome) {
                res.push([...curList]);
            }
            return;
        }
        // 当前是回文，curInd+1往下走
        if (isLastPalindrome) {
            curList.push(s[curInd]);
            getAllPartitions(curInd + 1, curList);
            curList.pop();
        }
        // 回朔法拼接所有的组合
        curList[curList.length - 1] += s[curInd];
        getAllPartitions(curInd + 1, curList);
        curList[curList.length - 1] = curList[curList.length - 1].slice(0, -1);
    }

    getAllPartitions(1, [s[0]]);
    return res;
};
```