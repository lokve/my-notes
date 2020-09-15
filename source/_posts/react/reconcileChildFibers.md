---
title: reconcileChildFibers
tags: react源码解析
date: 2020-9-9 14:00
---

根据实例构建 fiber

### reconcileChildFibers

```js
function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    expirationTime: ExpirationTime,
): Fiber | null {
    // This function is not recursive.
    // If the top level item is an array, we treat it as a set of children,
    // not as a fragment. Nested arrays on the other hand will be treated as
    // fragment nodes. Recursion happens at the normal flow.

    // Handle top level unkeyed fragments as if they were arrays.
    // This leads to an ambiguity between <>{[...]}</> and <>...</>.
    // We treat the ambiguous cases above the same.
    const isUnkeyedTopLevelFragment = // 是否fragment
        typeof newChild === 'object' &&
        newChild !== null &&
        newChild.type === REACT_FRAGMENT_TYPE &&
        newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
        newChild = newChild.props.children; // 如果是fragment取他的子节点
    }

    // Handle object types
    // newChild可能是一个children
    const isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
        switch (
            newChild.$$typeof // 子节点是单一的
        ) {
            case REACT_ELEMENT_TYPE:
                return placeSingleChild(
                    reconcileSingleElement(
                        returnFiber,
                        currentFirstChild,
                        newChild,
                        expirationTime,
                    ),
                );
            case REACT_PORTAL_TYPE:
                return placeSingleChild(
                    reconcileSinglePortal(returnFiber, currentFirstChild, newChild, expirationTime),
                );
        }
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
        return placeSingleChild(
            reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, expirationTime),
        );
    }

    if (isArray(newChild)) {
        // newChild是数组，多个子节点
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime);
    }

    if (getIteratorFn(newChild)) {
        return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, expirationTime);
    }

    if (isObject) {
        throwOnInvalidObjectType(returnFiber, newChild);
    }

    if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment) {
        // If the new child is undefined, and the return fiber is a composite
        // component, throw an error. If Fiber return types are disabled,
        // we already threw above.
        switch (returnFiber.tag) {
            case ClassComponent: {
            }
            // Intentionally fall through to the next case, which handles both
            // functions and classes
            // eslint-disable-next-lined no-fallthrough
            case FunctionComponent: {
                const Component = returnFiber.type;
            }
        }
    }

    // Remaining cases are all treated as empty.
    return deleteRemainingChildren(returnFiber, currentFirstChild);
}
```

### reconcileChildrenArray

```js
function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<*>,
    expirationTime: ExpirationTime,
): Fiber | null {
    // This algorithm can't optimize by searching from both ends since we
    // don't have backpointers on fibers. I'm trying to see how far we can get
    // with that model. If it ends up not being worth the tradeoffs, we can
    // add it later.

    // Even with a two ended optimization, we'd want to optimize for the case
    // where there are few changes and brute force the comparison instead of
    // going for the Map. It'd like to explore hitting that path first in
    // forward-only mode and only go for the Map once we notice that we need
    // lots of look ahead. This doesn't handle reversal as well as two ended
    // search but that's unusual. Besides, for the two ended optimization to
    // work on Iterables, we'd need to copy the whole set.

    // In this first iteration, we'll just live with hitting the bad case
    // (adding everything to a Map) in for every insert/move.

    // If you change this code, also update reconcileChildrenIterator() which
    // uses the same algorithm.

    let resultingFirstChild: Fiber | null = null;
    let previousNewFiber: Fiber | null = null;

    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
    // debugger
    // 第一轮遍历条件：存在原先的子节点且未遍历完需要更新的子节点
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
        if (oldFiber.index > newIdx) {
            nextOldFiber = oldFiber;
            oldFiber = null;
        } else {
            nextOldFiber = oldFiber.sibling;
        }
        const newFiber = updateSlot(
            // 老的和新的没对应上返回null
            returnFiber,
            oldFiber,
            newChildren[newIdx],
            expirationTime,
        );
        if (newFiber === null) {
            // 走出循环
            // TODO: This breaks on empty slots like null children. That's
            // unfortunate because it triggers the slow path all the time. We need
            // a better way to communicate whether this was a miss or null,
            // boolean, undefined, etc.
            if (oldFiber === null) {
                oldFiber = nextOldFiber;
            }
            break;
        }
        if (shouldTrackSideEffects) {
            if (oldFiber && newFiber.alternate === null) {
                // 没有复用，删除老的
                // We matched the slot, but we didn't reuse the existing fiber, so we
                // need to delete the existing child.
                deleteChild(returnFiber, oldFiber);
            }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
            // TODO: Move out of the loop. This only happens for the first run.
            resultingFirstChild = newFiber;
        } else {
            // TODO: Defer siblings if we're not at the right index for this slot.
            // I.e. if we had null values before, then we want to defer this
            // for each null value. However, we also don't want to call updateSlot
            // with the previous one.
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
    }

    if (newIdx === newChildren.length) {
        // 新节点已被遍历完全，删除剩下的节点（如果有），然后退出
        // We've reached the end of the new children. We can delete the rest.
        deleteRemainingChildren(returnFiber, oldFiber);
        return resultingFirstChild;
    }

    if (oldFiber === null) {
        // 没有oldFiber，全部插入
        // If we don't have any more existing children we can choose a fast path
        // since the rest will all be insertions.
        for (; newIdx < newChildren.length; newIdx++) {
            const newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime); // 更具element创建fiber
            if (newFiber === null) {
                continue;
            }
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
            if (previousNewFiber === null) {
                // TODO: Move out of the loop. This only happens for the first run.
                resultingFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber; // 建立兄弟节点，单向sibling
            }
            previousNewFiber = newFiber; // 记录上一个
        }
        return resultingFirstChild;
    }

    // Add all children to a key map for quick lookups.
    // 把老的fiber以key或index转为map 1 => one fiber ...
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            newChildren[newIdx],
            expirationTime,
        );
        if (newFiber !== null) {
            if (shouldTrackSideEffects) {
                if (newFiber.alternate !== null) {
                    // The new fiber is a work in progress, but if there exists a
                    // current, that means that we reused the fiber. We need to delete
                    // it from the child list so that we don't add it to the deletion
                    // list.
                    existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key);
                }
            }
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
            if (previousNewFiber === null) {
                resultingFirstChild = newFiber;
            } else {
                // 设置兄弟节点
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
    }

    if (shouldTrackSideEffects) {
        // Any existing children that weren't consumed above were deleted. We need
        // to add them to the deletion list.

        // 删除在新fiber李没有的老fiber， 给effectTag添加删除标记
        existingChildren.forEach((child) => deleteChild(returnFiber, child));
    }

    return resultingFirstChild;
}
```
