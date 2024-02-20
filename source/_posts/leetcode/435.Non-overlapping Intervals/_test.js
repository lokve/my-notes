/**
 * @param {number[][]} intervals
 * @return {number}
 */
var eraseOverlapIntervals = function(intervals) {
    intervals.sort((x,y) => x[1] - y[1]);
    console.log(intervals);
    let num = 0;
    let max = intervals[0][1];
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < max) {
            num += 1;
        } else {
            max = intervals[i][1];
        }
    }

    return num;
};


console.log(eraseOverlapIntervals([[1,2],[1,2],[1,2]]));