---
title: 47.Permutations II
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/permutations-ii/description/)

### 我的答案

连续出现相同的数字，需要排除掉

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function(nums) {

        function dfs(nums, path, res) {
            if (nums.length === 0) {
                res.push(path);
                return;
            }

            for (let i = 0; i < nums.length; i++) {
                if (i > 0 && nums[i] === nums[i - 1]) {
                    continue;
                }
                dfs(nums.slice(0, i).concat(nums.slice(i + 1)), path.concat(nums[i]), res);
            }
        }

        nums.sort((a, b) => a - b);
        let res = [];
        dfs(nums, [], res);
        return res;

    };

console.log(permuteUnique([1,1,2]));
```
