function lengthOfLIS(nums) {
    const n = nums.length;
    const tails = Array.from({length: n}).fill(0);
    let len = 0;
    for (let num of nums) {
        const index = binarySearch(tails, len, num);
        tails[index] = num;
        if (index === len) {
            len++;
        }
    }
    return len;
}

function binarySearch(tails, len, key) {
    let l = 0, h = len;
    while (l < h) {
        const mid = l + (h - l) / 2;
        if (tails[mid] === key) {
            return mid;
        } else if (tails[mid] > key) {
            h = mid;
        } else {
            l = mid + 1;
        }
    }
    return l;
}

console.log(lengthOfLIS([10,9,2,5,3,7,101,18]));
console.log(lengthOfLIS([0,1,0,3,2,3]));