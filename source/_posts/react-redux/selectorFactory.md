---
title: selectorFactory
tags: react-redux
date: 2020-9-14 14:00
---

```js
import verifySubselectors from './verifySubselectors';

export function impureFinalPropsSelectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch,
) {
    return function impureFinalPropsSelector(state, ownProps) {
        return mergeProps(
            mapStateToProps(state, ownProps),
            mapDispatchToProps(dispatch, ownProps),
            ownProps,
        );
    };
}

export function pureFinalPropsSelectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch,
    {areStatesEqual, areOwnPropsEqual, areStatePropsEqual},
) {
    let hasRunAtLeastOnce = false;
    let state;
    let ownProps;
    let stateProps;
    let dispatchProps;
    let mergedProps;

    // 参数分别是当前store数据，父组件传递的props
    function handleFirstCall(firstState, firstOwnProps) {
        // 返回最终合并后的参数
        state = firstState;
        ownProps = firstOwnProps;
        // 这里执行的 connect.md proxy，最终也是用户的 renturn 结果
        stateProps = mapStateToProps(state, ownProps);
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        hasRunAtLeastOnce = true;
        return mergedProps;
    }

    function handleNewPropsAndNewState() {
        // 两个都不同
        stateProps = mapStateToProps(state, ownProps);

        if (mapDispatchToProps.dependsOnOwnProps)
            dispatchProps = mapDispatchToProps(dispatch, ownProps);

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        return mergedProps;
    }

    function handleNewProps() {
        // props不同看用户是否有用到第二个参数props,用到了就重新计算
        if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);

        if (mapDispatchToProps.dependsOnOwnProps)
            dispatchProps = mapDispatchToProps(dispatch, ownProps);

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        return mergedProps;
    }

    function handleNewState() {
        // 仅store变了
        const nextStateProps = mapStateToProps(state, ownProps);
        const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps); // 浅层比较新旧
        stateProps = nextStateProps;

        if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);

        return mergedProps;
    }

    function handleSubsequentCalls(nextState, nextOwnProps) {
        const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps); // props浅比较
        const stateChanged = !areStatesEqual(nextState, state); // store的值是全等比较
        state = nextState;
        ownProps = nextOwnProps;

        if (propsChanged && stateChanged) return handleNewPropsAndNewState();
        if (propsChanged) return handleNewProps();
        if (stateChanged) return handleNewState();
        return mergedProps;
    }

    // 两个参数分别是sotre.getState()和connect包裹组件的props
    return function pureFinalPropsSelector(nextState, nextOwnProps) {
        return hasRunAtLeastOnce // 默认false
            ? handleSubsequentCalls(nextState, nextOwnProps) // 后续
            : handleFirstCall(nextState, nextOwnProps); // 首次
    };
}

// TODO: Add more comments

// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.
export default function finalPropsSelectorFactory( // 即selectorFactory
    dispatch,
    {initMapStateToProps, initMapDispatchToProps, initMergeProps, ...options},
) {
    // 这里执行的 wrapMapToProps 的 initProxySelector
    // 见 connect.md wrapMapToPropsFunc
    const mapStateToProps = initMapStateToProps(dispatch, options);
    const mapDispatchToProps = initMapDispatchToProps(dispatch, options);
    const mergeProps = initMergeProps(dispatch, options);

    if (process.env.NODE_ENV !== 'production') {
        verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
    }

    const selectorFactory = options.pure // pure才会去比较，不然全部都执行
        ? pureFinalPropsSelectorFactory
        : impureFinalPropsSelectorFactory;

    // 返回的还是一个函数
    return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
}
```
