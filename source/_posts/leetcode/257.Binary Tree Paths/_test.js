function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}

/**
 * @param {TreeNode} root
 * @return {string[]}
 */
var binaryTreePaths = function(root) {
    const rst = [];

    function dfs(node, path) {
        if (!node) {
            return;
        }
        if (node.left) {
            dfs(node.left, path + '->' + node.left.val);
        }
        if (node.right) {
            dfs(node.right, path + '->' + node.right.val);
        }
        if (!node.left && !node.right) {
            rst.push(path);
        }
    }

    dfs(root, root.val.toString());

    return rst;
};

