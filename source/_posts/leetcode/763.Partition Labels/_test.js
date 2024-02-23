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
    // const arr = Object.values(last).sort((x,y) => x[1] - y[1])

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