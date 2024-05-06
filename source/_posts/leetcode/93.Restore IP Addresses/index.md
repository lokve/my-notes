---
title: 93.Restore IP Addresses
tags: 
  - leetcode
  - DFS
categories:
  - leetcode
  - DFS
---

## 题目

[地址](https://leetcode.com/problems/restore-ip-addresses/description/)

### 我的答案

要注意 '000'、'00'、'0' 需要额外判断

```js
/**
 * @param {string} s
 * @return {string[]}
 */
var restoreIpAddresses = function(s) {
    const rst = [];
    function dfs(str, res) {
        if (res.length === 4 && !str.length) {
            rst.push(res.join('.'));
            return;
        }
        for (let i = 1; i <= Math.min(str.length, 3); i++) {
            const numStr = str.slice(0, i);
            const num = +numStr;
            if (numStr && num >= 0 && num <= 255 && num.toString().length === numStr.length && res.length < 4) {
                dfs(str.slice(i), res.concat(numStr))
            }
        }
    }

    dfs(s, [])

    return rst;
};

console.log(restoreIpAddresses('25525511135'));
console.log(restoreIpAddresses('0000'));
console.log(restoreIpAddresses('101023'));
```

### 参考答案

```ts
function restoreIpAddresses(s: string): string[] {
    let result:string[] = [];
    const DFS  = (ip:string,index:number,octet:number) => {
        if(index >= s.length){
            return;
        }
        // last octet check
        if(octet == 3){
            //check if last digit is valid
            if(s.substring(index, index+1) != "0" || index+1 == s.length){
                if(Number(s.substring(index)) < 256){
                    ip += '.'
                    ip += s.substring(index);
                    result.push(ip)
                }
            }
            return
        }
        for(let i = 1; i <= 3 && index+i < s.length; i++){
            if(Number(s.substring(index, index+i)) < 256){
                DFS(ip + '.'+ s.substring(index, index+i),index+i, octet + 1);
            }
            //check for leading zero
            if(s.substring(index, index+1) == "0"){
                break;
            }
        }
    }
    for(let i = 1; i <= 3 && i < s.length ; i++){
        if(Number(s.substring(0, i)) < 256){
            DFS(s.substring(0, i), i, 1);
        }
        //check for leading zero
        if(s[0] == "0"){
                break;
        }
    }
    return result
};
```