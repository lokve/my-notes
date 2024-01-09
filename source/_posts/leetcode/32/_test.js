/**
 * @param {string} s
 * @return {number}
 */
var longestValidParentheses = function(s) {
    const arr = Array.from({length: s.length}).fill(0);
    const left = [];

    let max = 0;
    let sum = 0;

    for (let i = 0; i < s.length; i++) {
        const z = s[i];
        if (z === '(') {
            left.push(i);
        } else {
            const last = s[left[left.length - 1]];
            if (last === '(') {
                const index = left.pop()
                arr[i] = 1;
                arr[index] = 1;
                sum += 2;
            } else {
                max = Math.max(sum, max)
                sum = 0;
            }
        }
    }
    //
    // console.log(arr);
    //
    // arr.forEach(item => {
    //     if (item === 1) {
    //         sum += 1;
    //     } else {
    //         max = Math.max(sum, max)
    //         sum = 0;
    //     }
    // })

    max = Math.max(sum, max)

    return max;

};

console.log(longestValidParentheses('(())(()'));