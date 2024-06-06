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
            if (isLastPalindrome) {
                res.push([...curList]);
            }
            return;
        }
        if (isLastPalindrome) {
            curList.push(s[curInd]);
            getAllPartitions(curInd + 1, curList);
            curList.pop();
        }
        curList[curList.length - 1] += s[curInd];
        getAllPartitions(curInd + 1, curList);
        curList[curList.length - 1] = curList[curList.length - 1].slice(0, -1);
    }

    getAllPartitions(1, [s[0]]);
    return res;
};

console.log(partition('aab'));