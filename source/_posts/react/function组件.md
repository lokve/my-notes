---
title: function组件
tags: react源码解析
categories:
  - react
date: 2020-9-9 14:00
---

### 从 beginWork 开始

```js
switch (workInProgress.tag) {
    case IndeterminateComponent: {
        // 2 function类型组件是这个tag
        return mountIndeterminateComponent(
            current,
            workInProgress,
            workInProgress.type,
            renderExpirationTime,
        );
    }
}
```

### mountIndeterminateComponent

```js
function mountIndeterminateComponent(_current, workInProgress, Component, renderExpirationTime) {
    if (_current !== null) {
        // An indeterminate component only mounts if it suspended inside a non-
        // concurrent tree, in an inconsistent state. We want to treat it like
        // a new mount, even though an empty version of it already committed.
        // Disconnect the alternate pointers.
        _current.alternate = null;
        workInProgress.alternate = null;
        // Since this is conceptually a new fiber, schedule a Placement effect
        workInProgress.effectTag |= Placement;
    }

    const props = workInProgress.pendingProps;
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, false);
    const context = getMaskedContext(workInProgress, unmaskedContext);

    prepareToReadContext(workInProgress, renderExpirationTime);
    // 以上都是和contetxt有关的处理
    let value;

    if (__DEV__) {
        // ...
    } else {
        value = renderWithHooks(
            // 返回reactnode对象
            null,
            workInProgress,
            Component,
            props,
            context,
            renderExpirationTime,
        );
    }
    // React DevTools reads this flag.
    workInProgress.effectTag |= PerformedWork;

    // class 或 function组件
    if (
        typeof value === 'object' &&
        value !== null &&
        typeof value.render === 'function' &&
        value.$$typeof === undefined
    ) {
        // Proceed under the assumption that this is a class instance
        workInProgress.tag = ClassComponent;

        // Throw out any hooks that were used.
        resetHooks();

        // Push context providers early to prevent context stack mismatches.
        // During mounting we don't know the child context yet as the instance doesn't exist.
        // We will invalidate the child context in finishClassComponent() right after rendering.
        let hasContext = false;
        if (isLegacyContextProvider(Component)) {
            hasContext = true;
            pushLegacyContextProvider(workInProgress);
        } else {
            hasContext = false;
        }

        workInProgress.memoizedState =
            value.state !== null && value.state !== undefined ? value.state : null;

        const getDerivedStateFromProps = Component.getDerivedStateFromProps;
        if (typeof getDerivedStateFromProps === 'function') {
            applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, props);
        }

        adoptClassInstance(workInProgress, value);
        mountClassInstance(workInProgress, Component, props, renderExpirationTime);
        return finishClassComponent(
            null,
            workInProgress,
            Component,
            true,
            hasContext,
            renderExpirationTime,
        );
    } else {
        // Proceed under the assumption that this is a function component
        workInProgress.tag = FunctionComponent;
        reconcileChildren(null, workInProgress, value, renderExpirationTime);
        return workInProgress.child;
    }
}
```

### renderWithHooks

```js
export function renderWithHooks(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    props: any,
    refOrContext: any,
    nextRenderExpirationTime: ExpirationTime,
): any {
    renderExpirationTime = nextRenderExpirationTime;
    currentlyRenderingFiber = workInProgress;
    nextCurrentHook = current !== null ? current.memoizedState : null;

    // The following should have already been reset
    // currentHook = null;
    // workInProgressHook = null;

    // remainingExpirationTime = NoWork;
    // componentUpdateQueue = null;

    // didScheduleRenderPhaseUpdate = false;
    // renderPhaseUpdates = null;
    // numberOfReRenders = 0;
    // sideEffectTag = 0;

    // TODO Warn if no hooks are used at all during mount, then some are used during update.
    // Currently we will identify the update render as a mount because nextCurrentHook === null.
    // This is tricky because it's valid for certain types of components (e.g. React.lazy)

    // Using nextCurrentHook to differentiate between mount/update only works if at least one stateful hook is used.
    // Non-stateful hooks (e.g. context) don't get added to memoizedState,
    // so nextCurrentHook would be null during updates and mounts.
    if (__DEV__) {
        // ...
    } else {
        ReactCurrentDispatcher.current =
            nextCurrentHook === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
    }

    // 执行函数，得到children
    let children = Component(props, refOrContext);

    if (didScheduleRenderPhaseUpdate) {
        do {
            didScheduleRenderPhaseUpdate = false;
            numberOfReRenders += 1;

            // Start over from the beginning of the list
            nextCurrentHook = current !== null ? current.memoizedState : null;
            nextWorkInProgressHook = firstWorkInProgressHook;

            currentHook = null;
            workInProgressHook = null;
            componentUpdateQueue = null;

            if (__DEV__) {
                // Also validate hook order for cascading updates.
                hookTypesUpdateIndexDev = -1;
            }

            ReactCurrentDispatcher.current = __DEV__
                ? HooksDispatcherOnUpdateInDEV
                : HooksDispatcherOnUpdate;

            children = Component(props, refOrContext);
        } while (didScheduleRenderPhaseUpdate);

        renderPhaseUpdates = null;
        numberOfReRenders = 0;
    }

    // We can assume the previous dispatcher is always this one, since we set it
    // at the beginning of the render phase and there's no re-entrancy.
    ReactCurrentDispatcher.current = ContextOnlyDispatcher;

    const renderedWork: Fiber = (currentlyRenderingFiber: any);

    // 存放了所有用到的hooks，能用next找到下一个
    renderedWork.memoizedState = firstWorkInProgressHook;
    renderedWork.expirationTime = remainingExpirationTime;
    renderedWork.updateQueue = (componentUpdateQueue: any);
    renderedWork.effectTag |= sideEffectTag;

    // This check uses currentHook so that it works the same in DEV and prod bundles.
    // hookTypesDev could catch more cases (e.g. context) but only in DEV bundles.
    const didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;

    renderExpirationTime = NoWork;
    currentlyRenderingFiber = null;

    currentHook = null;
    nextCurrentHook = null;
    firstWorkInProgressHook = null;
    workInProgressHook = null;
    nextWorkInProgressHook = null;

    remainingExpirationTime = NoWork;
    componentUpdateQueue = null;
    sideEffectTag = 0;

    // These were reset above
    // didScheduleRenderPhaseUpdate = false;
    // renderPhaseUpdates = null;
    // numberOfReRenders = 0;

    invariant(
        !didRenderTooFewHooks,
        'Rendered fewer hooks than expected. This may be caused by an accidental ' +
            'early return statement.',
    );

    return children;
}
```
