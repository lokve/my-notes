/**
 * @param {number[][]} points
 * @return {number}
 */
var findMinArrowShots = function(points) {
    if (!points.length) return 0;
    points.sort((x,y) => x[1] - y[1]);
    let num = 1;
    let min = points[0][1];
    for (let i = 1; i < points.length; i++) {
        if (points[i][0] <= min) {
            continue;
        }
        num += 1;
        min = points[i][1];
    }

    return num;
};

console.log(findMinArrowShots([[1,2],[2,3],[3,4],[4,5]]));