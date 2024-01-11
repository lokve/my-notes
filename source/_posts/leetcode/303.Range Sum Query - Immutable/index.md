---
title: 303.Range Sum Query - Immutable
tags: leetcode
categories:
  - leetcode
---

## 题目

[地址](https://leetcode.com/problems/range-sum-query-immutable/description/)

### 我的答案

```js


/**
 * @param {number[]} nums
 */
var NumArray = function(nums) {
    this.nums = nums;
};

/**
 * @param {number} left
 * @param {number} right
 * @return {number}
 */
NumArray.prototype.sumRange = function(left, right) {
    const arr = this.nums;
    let sum = 0;
    for (let i = left; i <= right; i++) {
        sum += arr[i]
    }
    return sum
};

const a  = new NumArray([-2,0,3,-5,2,-1])

console.log(a.sumRange(0,2));
```

### 参考答案

本来以为这题目没什么好说的，没想到用空间换时间，先算好和，在多次执行的时候速度大大提高

```js
var NumArray = function(nums) {
    
    this.size = nums.length; //stores length of array
    this.prefixSum = Array( nums.length ).fill( 0 );//empty array
    this.prefixSum[0] = nums[0];//first value of prefix sum is the same as that of the first element of nums
    
    for( let i = 1; i < this.size ; i++ ){//traverse from left to right of array nums
        this.prefixSum[i] = this.prefixSum[i-1] + nums[i];
        /*stores sum of current value(nums) + previous sum value 
        at the index before it(prefixsum)*/
    }
    
    
};

/** 
 * @param {number} left 
 * @param {number} right
 * @return {number}
 */
NumArray.prototype.sumRange = function(left, right) {
    
    if( left == 0 ){
        /* if left index isnt mentioned then we return the 
        sum up till the right index from the prefix sum array */
        return this.prefixSum[right];
    }else{
        //if the left index is given, then return the sum up 
        //till the right index minus the value of prefix sum at 
        //the index before the given left index i.e. value 
        //at the (left - 1) index
        return this.prefixSum[right] - this.prefixSum[left-1];
    }
    
    
};

```
