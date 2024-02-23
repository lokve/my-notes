---
title: 763.Partition Labels
tags:
  - leetcode
  - 贪心算法
categories:
  - leetcode
  - 贪心算法
---

## 题目

[地址](https://leetcode.com/problems/partition-labels/description/)

### 我的答案

这题完全没有get到(尽可能分组的)意思，不知道该如何下手，不过基于网友提示，得到下面答案

思路：先收集每个字符出现的位置间隔，然后排序。判断间隔重叠，则分为一组，否则分为两组

```js
/** 提示
 * Imo you can entirely approach this as an intervals question. You are merging the intervals of two letters if they overlap at all. "aaaab" is [4, 1] because the intervals are [[0, 3], [4, 4]] aka [[3 - 0 + 1], [4 - 4 + 1]], but "aaaaba" is [6] because the intervals are [[0, 6], [5,5]]. You do this for every letter.
 Note that "aaaabab" would be [[0, 6], [5, 7]] and thus merged to [0, 7] so you return [7 - 0 + 1] aka [8]
 */

/**
 * @param {string} s
 * @return {number[]}
 */
var partitionLabels = function(s) {
    const last = {};
    for (let i = 0; i < s.length; ++i) {
        if(!last[s[i]]) {
            last[s[i]] = [i, i]
        } else {
            last[s[i]][1] = i;
        }
    }

    const arr = Object.values(last).sort((x,y) => x[0] === y[0] ? y[1] - x[1] : x[0] - y[0])

    const rst = [];
    let max = arr[0][1];
    let start = 0;


    for (let i = 1; i < arr.length; i++) {
        const a = arr[i];

        if (max < a[0]) {
            rst.push(max - start + 1);
            start = max+1;
        }

        max = Math.max(a[1], max)

        if (i === arr.length - 1 && max >= a[0]) {
            rst.push(max - start + 1);
        }
    }

    return rst;

};

console.log(partitionLabels('eccbbbbdec'));
```

### 参考答案

字符串的顺序就是位置顺序，不需要额外排序；

```js
var partitionLabels = function (s, lastIdx = {}) {
  for (let i = 0; i < s.length; i++) {
    lastIdx[s[i]] = i;
  }
  let curLast = 0, res = [], accu = 0;
  for (let i = 0; i < s.length; i++) {
      // 取最大的最后出现位置
    curLast = Math.max(curLast, lastIdx[s[i]]);
    
    // 最后出现位置和序号一样，说明没有重叠了
    if (i === curLast) {
      res.push(i + 1 - accu);
      accu = i + 1;
    }
  }
  return res;
};
```