---
title: connect
tags: react-redux
date: 2020-9-14 14:00
---

```js
/*
  connect is a facade over connectAdvanced. It turns its args into a compatible
  selectorFactory, which has the signature:

    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
  
  connect passes its args to connectAdvanced as options, which will in turn pass them to
  selectorFactory each time a Connect component instance is instantiated or hot reloaded.

  selectorFactory returns a final props selector from its mapStateToProps,
  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
  mergePropsFactories, and pure args.

  The resulting final props selector is called by the Connect component instance whenever
  it receives new props or store state.
 */

function match(arg, factories, name) {
    // 依次执行函数，直到有一个返回结果
    for (let i = factories.length - 1; i >= 0; i--) {
        const result = factories[i](arg);
        if (result) return result;
    }

    return (dispatch, options) => {
        throw new Error(
            `Invalid value of type ${typeof arg} for ${name} argument when connecting component ${
                options.wrappedComponentName
            }.`,
        );
    };
}

function strictEqual(a, b) {
    return a === b;
}

// createConnect with default args builds the 'official' connect behavior. Calling it with
// different options opens up some testing and extensibility scenarios
export function createConnect({
    connectHOC = connectAdvanced,
    mapStateToPropsFactories = defaultMapStateToPropsFactories,
    mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
    mergePropsFactories = defaultMergePropsFactories,
    selectorFactory = defaultSelectorFactory,
} = {}) {
    // 用户传递的参数
    return function connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps,
        // 比较方法
        {
            pure = true,
            areStatesEqual = strictEqual,
            areOwnPropsEqual = shallowEqual,
            areStatePropsEqual = shallowEqual,
            areMergedPropsEqual = shallowEqual,
            ...extraOptions
        } = {},
    ) {
        // 返回一个函数
        const initMapStateToProps = match(
            // mapStateToProps作为参数放到mapStateToPropsFactories[]执行，第三个是报错用
            mapStateToProps,
            mapStateToPropsFactories,
            'mapStateToProps',
        );
        // 返回一个函数
        const initMapDispatchToProps = match(
            mapDispatchToProps,
            mapDispatchToPropsFactories,
            'mapDispatchToProps',
        );
        // 返回一个函数
        const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');

        // 见connectAdvanced.md

        return connectHOC(selectorFactory, {
            // used in error messages
            // 用于错误消息
            methodName: 'connect',

            // used to compute Connect's displayName from the wrapped component's displayName.
            getDisplayName: (name) => `Connect(${name})`,

            // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
            shouldHandleStateChanges: Boolean(mapStateToProps),

            // passed through to selectorFactory
            initMapStateToProps,
            initMapDispatchToProps,
            initMergeProps,
            pure,
            areStatesEqual,
            areOwnPropsEqual,
            areStatePropsEqual,
            areMergedPropsEqual,

            // any extra options args can override defaults of connect or connectAdvanced
            ...extraOptions,
        });
    };
}

export default createConnect();
```

直接执行了`createConnect`,参数都取默认的

### mapStateToProps

判断用户的传递参数，对不同传递参数返回对应的结果

```js
// 当函数的时候
export function whenMapStateToPropsIsFunction(mapStateToProps) {
    return typeof mapStateToProps === 'function'
        ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
        : undefined;
}

// 当不传的时候
export function whenMapStateToPropsIsMissing(mapStateToProps) {
    return !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : undefined;
}

export default [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];
```

### wrapMapToProps

```js
export function wrapMapToPropsConstant(getConstant) {
    return function initConstantSelector(dispatch, options) {
        const constant = getConstant(dispatch, options);

        function constantSelector() {
            return constant;
        }
        constantSelector.dependsOnOwnProps = false;
        return constantSelector;
    };
}

// dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
// whether mapToProps needs to be invoked when props have changed.
//
// A length of one signals that mapToProps does not depend on props from the parent component.
// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
// therefore not reporting its length accurately..
export function getDependsOnOwnProps(mapToProps) {
    return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined
        ? Boolean(mapToProps.dependsOnOwnProps)
        : mapToProps.length !== 1;
}

// Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
// this function wraps mapToProps in a proxy function which does several things:
//
//  * Detects whether the mapToProps function being called depends on props, which
//    is used by selectorFactory to decide if it should reinvoke on props changes.
//
//  * On first call, handles mapToProps if returns another function, and treats that
//    new function as the true mapToProps for subsequent calls.
//
//  * On first call, verifies the first result is a plain object, in order to warn
//    the developer that their mapToProps function is not returning a valid result.
//
export function wrapMapToPropsFunc(mapToProps, methodName) {
    // mapToProps是用户在connect传进来的函数
    return function initProxySelector(dispatch, {displayName}) {
        const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
            // state或dispatch
            return proxy.dependsOnOwnProps
                ? proxy.mapToProps(stateOrDispatch, ownProps)
                : proxy.mapToProps(stateOrDispatch);
        };

        // allow detectFactoryAndVerify to get ownProps
        proxy.dependsOnOwnProps = true; // 是否依赖组件传进来的参数

        proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
            // 这里的 mapToProps 是用户传递的 conncet 的参数
            proxy.mapToProps = mapToProps;
            proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps); // mapToProps的参数数量 !== 1

            // 这里执行第二遍proxy, 此时的mapToProps已经是用户传进来的mapToProps了，所以这里的返回对象是用户的返回
            let props = proxy(stateOrDispatch, ownProps);

            // 如果用户返回函数，就执行他
            if (typeof props === 'function') {
                proxy.mapToProps = props;
                proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
                props = proxy(stateOrDispatch, ownProps);
            }

            if (process.env.NODE_ENV !== 'production')
                verifyPlainObject(props, displayName, methodName);

            // 最后返回的用户返回的对象或者用户返回的函数的执行结果
            return props;
        };

        return proxy;
    };
}
```

### mapDispatchToProps

```js
import {bindActionCreators} from 'redux';
import {wrapMapToPropsConstant, wrapMapToPropsFunc} from './wrapMapToProps';

// 传了函数
export function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
    return typeof mapDispatchToProps === 'function'
        ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps')
        : undefined;
}

// 没穿
export function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
    return !mapDispatchToProps ? wrapMapToPropsConstant((dispatch) => ({dispatch})) : undefined;
}

// 传了对象
// 这里mapDispatchToProps即action合集
export function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
    return mapDispatchToProps && typeof mapDispatchToProps === 'object'
        ? wrapMapToPropsConstant((dispatch) => bindActionCreators(mapDispatchToProps, dispatch))
        : undefined;
}

export default [
    whenMapDispatchToPropsIsFunction,
    whenMapDispatchToPropsIsMissing,
    whenMapDispatchToPropsIsObject,
];
```

### mergeProps

```js
export function defaultMergeProps(stateProps, dispatchProps, ownProps) {
    return {...ownProps, ...stateProps, ...dispatchProps};
}

export function wrapMergePropsFunc(mergeProps) {
    return function initMergePropsProxy(dispatch, {displayName, pure, areMergedPropsEqual}) {
        let hasRunOnce = false;
        let mergedProps;

        return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
            const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

            if (hasRunOnce) {
                // 后续
                // pure下才去比较
                if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps))
                    // 浅层比较新旧
                    mergedProps = nextMergedProps;
            } else {
                // 第一次
                hasRunOnce = true;
                mergedProps = nextMergedProps;

                if (process.env.NODE_ENV !== 'production')
                    verifyPlainObject(mergedProps, displayName, 'mergeProps');
            }

            return mergedProps;
        };
    };
}

// 传了函数
export function whenMergePropsIsFunction(mergeProps) {
    return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
}

// 没传直接合并3个参数{...,...,...}
export function whenMergePropsIsOmitted(mergeProps) {
    return !mergeProps ? () => defaultMergeProps : undefined;
}

export default [whenMergePropsIsFunction, whenMergePropsIsOmitted];
```
