---
title: 90.Subsets II
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/subsets-ii/description/)

### 我的答案

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsetsWithDup = function(nums) {
    const rst = [];
    rst.push([]);
    nums.sort((a, b) => a - b)
    backtrack(nums, 0, [], rst);
    return rst;
};

function backtrack(nums, start, path, res) {
    for (let i = start; i < nums.length; i++) {
        if (i > start && nums[i] === nums[i - 1]) {
            continue;
        }
        path.push(nums[i]);
        res.push(path.slice());
        backtrack(nums, i + 1, path, res);
        path.pop();
    }
}

console.log(subsetsWithDup([1,2,2]));
```

### 参考答案

```js
var subsetsWithDup = function(nums) {
    const ans = [];
    nums.sort((a, b) => a - b);

    function f(index, t) {
        ans.push([...t]);

        for (let i = index; i < nums.length; i++) {
            if (i !== index && nums[i] === nums[i - 1]) continue;
            t.push(nums[i]);
            f(i + 1, t);
            t.pop();
        }
    }

    f(0, []);
    return ans;
};

```