构建 fiber 树和 dom 树，互相对应为参数，能互相找到，并执行了渲染前的生命周期

### 然后是`renderRoot`

```js
function renderRoot(
    root: FiberRoot,
    expirationTime: ExpirationTime,
    isSync: boolean,
): SchedulerCallback | null {
    if (root.firstPendingTime < expirationTime) {
        // If there's no work left at this expiration time, exit immediately. This
        // happens when multiple callbacks are scheduled for a single root, but an
        // earlier callback flushes the work of a later one.
        return null;
    }

    // 在同步情况下，如果还存在待提交的处理，就先执行他
    if (isSync && root.finishedExpirationTime === expirationTime) {
        // false
        // There's already a pending commit at this expiration time.
        // TODO: This is poorly factored. This case only exists for the
        // batch.commit() API.
        return commitRoot.bind(null, root);
    }
    // debugger
    flushPassiveEffects(); // 第一次return false

    // If the root or expiration time have changed, throw out the existing stack
    // and prepare a fresh one. Otherwise we'll continue where we left off.
    if (root !== workInProgressRoot || expirationTime !== renderExpirationTime) {
        // 创建备份为当前执行工作（workInProgress）
        // 给root.current创建alternate,alternate和root.current拥有相同参数，并互相为对方的alternate
        prepareFreshStack(root, expirationTime);
        // 执行后workInProgressRoot就等于root.current.alternate
    } else {
        // ...
    }

    // If we have a work-in-progress fiber, it means there's still work to do
    // in this root.
    if (workInProgress !== null) {
        const prevExecutionContext = executionContext; // 8 记录状态
        executionContext |= RenderContext; // 添加RenderContext状态
        let prevDispatcher = ReactCurrentDispatcher.current;
        if (prevDispatcher === null) {
            // The React isomorphic package does not include a default dispatcher.
            // Instead the first renderer will lazily attach one, in order to give
            // nicer error messages.

            // ContextOnlyDispatcher错误提示对象函数
            // hooks报错函数对象
            prevDispatcher = ContextOnlyDispatcher;
        }
        ReactCurrentDispatcher.current = ContextOnlyDispatcher;

        // ...

        do {
            try {
                if (isSync) {
                    // 进这
                    workLoopSync();
                } else {
                    workLoop();
                }
                break;
            } catch (thrownValue) {
                // ...
            }
        } while (true);

        executionContext = prevExecutionContext;
        resetContextDependencies(); // 重置context相关
        ReactCurrentDispatcher.current = prevDispatcher;
        if (enableSchedulerTracing) {
            __interactionsRef.current = ((prevInteractions: any): Set<Interaction>);
        }

        if (workInProgress !== null) {
            // There's still work left over. Return a continuation.
            stopInterruptedWorkLoopTimer();
            if (expirationTime !== Sync) {
                startRequestCallbackTimer();
            }
            return renderRoot.bind(null, root, expirationTime);
        }
    }
    // debugger;
    // We now have a consistent tree. The next step is either to commit it, or, if
    // something suspended, wait to commit it after a timeout.
    stopFinishedWorkLoopTimer(); // __DEV__ ?

    root.finishedWork = root.current.alternate;
    root.finishedExpirationTime = expirationTime;

    const isLocked = resolveLocksOnRoot(root, expirationTime);
    if (isLocked) {
        // This root has a lock that prevents it from committing. Exit. If we begin
        // work on the root again, without any intervening updates, it will finish
        // without doing additional work.
        return null;
    }

    // Set this to null to indicate there's no in-progress render.
    workInProgressRoot = null;

    switch (workInProgressRootExitStatus) {
        case RootIncomplete: {
            invariant(false, 'Should have a work-in-progress.');
        }
        // Flow knows about invariant, so it compains if I add a break statement,
        // but eslint doesn't know about invariant, so it complains if I do.
        // eslint-disable-next-line no-fallthrough
        case RootErrored: {
            // An error was thrown. First check if there is lower priority work
            // scheduled on this root.
            const lastPendingTime = root.lastPendingTime;
            if (lastPendingTime < expirationTime) {
                // There's lower priority work. Before raising the error, try rendering
                // at the lower priority to see if it fixes it. Use a continuation to
                // maintain the existing priority and position in the queue.
                return renderRoot.bind(null, root, lastPendingTime);
            }
            if (!isSync) {
                // If we're rendering asynchronously, it's possible the error was
                // caused by tearing due to a mutation during an event. Try rendering
                // one more time without yiedling to events.
                prepareFreshStack(root, expirationTime);
                scheduleSyncCallback(renderRoot.bind(null, root, expirationTime));
                return null;
            }
            // If we're already rendering synchronously, commit the root in its
            // errored state.
            return commitRoot.bind(null, root);
        }
        case RootSuspended: {
            // We have an acceptable loading state. We need to figure out if we should
            // immediately commit it or wait a bit.

            // If we have processed new updates during this render, we may now have a
            // new loading state ready. We want to ensure that we commit that as soon as
            // possible.
            const hasNotProcessedNewUpdates =
                workInProgressRootLatestProcessedExpirationTime === Sync;
            if (hasNotProcessedNewUpdates && !isSync) {
                // If we have not processed any new updates during this pass, then this is
                // either a retry of an existing fallback state or a hidden tree.
                // Hidden trees shouldn't be batched with other work and after that's
                // fixed it can only be a retry.
                // We're going to throttle committing retries so that we don't show too
                // many loading states too quickly.
                let msUntilTimeout = globalMostRecentFallbackTime + FALLBACK_THROTTLE_MS - now();
                // Don't bother with a very short suspense time.
                if (msUntilTimeout > 10) {
                    if (workInProgressRootHasPendingPing) {
                        // This render was pinged but we didn't get to restart earlier so try
                        // restarting now instead.
                        prepareFreshStack(root, expirationTime);
                        return renderRoot.bind(null, root, expirationTime);
                    }
                    const lastPendingTime = root.lastPendingTime;
                    if (lastPendingTime < expirationTime) {
                        // There's lower priority work. It might be unsuspended. Try rendering
                        // at that level.
                        return renderRoot.bind(null, root, lastPendingTime);
                    }
                    // The render is suspended, it hasn't timed out, and there's no lower
                    // priority work to do. Instead of committing the fallback
                    // immediately, wait for more data to arrive.
                    root.timeoutHandle = scheduleTimeout(
                        commitRoot.bind(null, root),
                        msUntilTimeout,
                    );
                    return null;
                }
            }
            // The work expired. Commit immediately.
            return commitRoot.bind(null, root);
        }
        case RootSuspendedWithDelay: {
            if (!isSync) {
                // We're suspended in a state that should be avoided. We'll try to avoid committing
                // it for as long as the timeouts let us.
                if (workInProgressRootHasPendingPing) {
                    // This render was pinged but we didn't get to restart earlier so try
                    // restarting now instead.
                    prepareFreshStack(root, expirationTime);
                    return renderRoot.bind(null, root, expirationTime);
                }
                const lastPendingTime = root.lastPendingTime;
                if (lastPendingTime < expirationTime) {
                    // There's lower priority work. It might be unsuspended. Try rendering
                    // at that level immediately.
                    return renderRoot.bind(null, root, lastPendingTime);
                }

                let msUntilTimeout;
                if (workInProgressRootLatestSuspenseTimeout !== Sync) {
                    // We have processed a suspense config whose expiration time we can use as
                    // the timeout.
                    msUntilTimeout =
                        expirationTimeToMs(workInProgressRootLatestSuspenseTimeout) - now();
                } else if (workInProgressRootLatestProcessedExpirationTime === Sync) {
                    // This should never normally happen because only new updates cause
                    // delayed states, so we should have processed something. However,
                    // this could also happen in an offscreen tree.
                    msUntilTimeout = 0;
                } else {
                    // If we don't have a suspense config, we're going to use a heuristic to
                    // determine how long we can suspend.
                    const eventTimeMs: number = inferTimeFromExpirationTime(
                        workInProgressRootLatestProcessedExpirationTime,
                    );
                    const currentTimeMs = now();
                    const timeUntilExpirationMs =
                        expirationTimeToMs(expirationTime) - currentTimeMs;
                    let timeElapsed = currentTimeMs - eventTimeMs;
                    if (timeElapsed < 0) {
                        // We get this wrong some time since we estimate the time.
                        timeElapsed = 0;
                    }

                    msUntilTimeout = jnd(timeElapsed) - timeElapsed;

                    // Clamp the timeout to the expiration time.
                    // TODO: Once the event time is exact instead of inferred from expiration time
                    // we don't need this.
                    if (timeUntilExpirationMs < msUntilTimeout) {
                        msUntilTimeout = timeUntilExpirationMs;
                    }
                }

                // Don't bother with a very short suspense time.
                if (msUntilTimeout > 10) {
                    // The render is suspended, it hasn't timed out, and there's no lower
                    // priority work to do. Instead of committing the fallback
                    // immediately, wait for more data to arrive.
                    root.timeoutHandle = scheduleTimeout(
                        commitRoot.bind(null, root),
                        msUntilTimeout,
                    );
                    return null;
                }
            }
            // The work expired. Commit immediately.
            return commitRoot.bind(null, root);
        }
        case RootCompleted: {
            // The work completed. Ready to commit.
            if (
                !isSync &&
                workInProgressRootLatestProcessedExpirationTime !== Sync &&
                workInProgressRootCanSuspendUsingConfig !== null
            ) {
                // If we have exceeded the minimum loading delay, which probably
                // means we have shown a spinner already, we might have to suspend
                // a bit longer to ensure that the spinner is shown for enough time.
                const msUntilTimeout = computeMsUntilSuspenseLoadingDelay(
                    workInProgressRootLatestProcessedExpirationTime,
                    expirationTime,
                    workInProgressRootCanSuspendUsingConfig,
                );
                if (msUntilTimeout > 10) {
                    root.timeoutHandle = scheduleTimeout(
                        commitRoot.bind(null, root),
                        msUntilTimeout,
                    );
                    return null;
                }
            }
            return commitRoot.bind(null, root);
        }
        default: {
            invariant(false, 'Unknown root exit status.');
        }
    }
}
```

### 先进入`workLoopSync`

```js
function workLoopSync() {
    // debugger;
    // 遍历
    // Already timed out, so perform work without checking if we need to yield.
    // 构建fiber树
    while (workInProgress !== null) {
        // 每次都返回他的子节点生层的fiber, 给workInProgress添加child的fiber
        // debugger
        workInProgress = performUnitOfWork(workInProgress);
    }
    // debugger;
}
```

`workInProgress`是 current.alternate

### performUnitOfWork

```js

function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = unitOfWork.alternate; // unitOfWork是备份，current是本体



    let next;
    ...
    else {
        next = beginWork(current, unitOfWork, renderExpirationTime); // 返回了当前子节点的fiber
    }

    unitOfWork.memoizedProps = unitOfWork.pendingProps; // 记住props
    if (next === null) {
        // 没有子节点了,就找兄弟节点，都没有，返回父节点的兄弟节点
        // If this doesn't spawn new work, complete the current work.
        next = completeUnitOfWork(unitOfWork);
    }

    ReactCurrentOwner.current = null; // 重置
    return next;
}
```

### beginWork

```js
function beginWork(
    current: Fiber | null, // 本体 （old）
    workInProgress: Fiber, // 备份 （new）
    renderExpirationTime: ExpirationTime,
): Fiber | null {
    const updateExpirationTime = workInProgress.expirationTime;

    //...

    // Before entering the begin phase, clear the expiration time.
    // 清除到期时间
    workInProgress.expirationTime = NoWork;

    // 按照tag的执行不同的方法
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
        case ClassComponent: {
            // 从这里开始和上一步不一样了
            const Component = workInProgress.type;
            const unresolvedProps = workInProgress.pendingProps;
            // 是否一样，不一样则合并defaultProps属性并返回结果
            const resolvedProps =
                workInProgress.elementType === Component
                    ? unresolvedProps
                    : resolveDefaultProps(Component, unresolvedProps);
            return updateClassComponent(
                // 返回child fiber
                current,
                workInProgress,
                Component,
                resolvedProps,
                renderExpirationTime,
            );
        }
        // 第一次执行的这个
        case HostRoot: // 3 根节点
            return updateHostRoot(current, workInProgress, renderExpirationTime);
        case HostComponent: // 5 子组件的根节点(最外层节点)
            return updateHostComponent(current, workInProgress, renderExpirationTime);
    }
}
```

### updateHostRoot

```js
function updateHostRoot(current, workInProgress, renderExpirationTime) {
    // 把一些变量入栈了，放在了文件全局变量中,意义不明
    pushHostRootContext(workInProgress);
    // 跟新队列
    const updateQueue = workInProgress.updateQueue;

    // 从变量名得知意思
    const nextProps = workInProgress.pendingProps;
    const prevState = workInProgress.memoizedState;
    const prevChildren = prevState !== null ? prevState.element : null;

    // 可以理解为初始化赋值一些数据，如workInProgress.memoizedState等
    processUpdateQueue(workInProgress, updateQueue, nextProps, null, renderExpirationTime);

    const nextState = workInProgress.memoizedState; // 是一个ReactNode
    // Caution: React DevTools currently depends on this property
    // being called "element".
    const nextChildren = nextState.element;

    const root: FiberRoot = workInProgress.stateNode;
    if (
        (current === null || current.child === null) &&
        root.hydrate &&
        enterHydrationState(workInProgress)
    ) {
        // ...
    } else {
        // Otherwise reset hydration state in case we aborted and resumed another
        // root.
        // 给workInProgress添加了child属性
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        resetHydrationState(); // 重置了一些属性,目前意义未知
    }
    // 到这里就走完了一个循环，然后看child再来一个流程
    return workInProgress.child;
}
```

### processUpdateQueue

```js
export function processUpdateQueue<State>(
    workInProgress: Fiber,
    queue: UpdateQueue<State>,
    props: any,
    instance: any,
    renderExpirationTime: ExpirationTime,
): void {
    hasForceUpdate = false;

    // 克隆了queue(部分属性),执行后queue === workInProgress.updateQueue，好像并没有什么变化
    queue = ensureWorkInProgressQueueIsAClone(workInProgress, queue);

    // These values may change as we process the queue.
    let newBaseState = queue.baseState;
    let newFirstUpdate = null;
    let newExpirationTime = NoWork;

    // Iterate through the list of updates to compute the result.
    let update = queue.firstUpdate;
    let resultState = newBaseState;
    while (update !== null) {
        const updateExpirationTime = update.expirationTime;
        if (updateExpirationTime < renderExpirationTime) {
            // ...
        } else {
            // This update does have sufficient priority.

            // Mark the event time of this update as relevant to this render pass.
            // TODO: This should ideally use the true event time of this update rather than
            // its priority which is a derived and not reverseable value.
            // TODO: We should skip this update if it was already committed but currently
            // we have no way of detecting the difference between a committed and suspended
            // update here.
            // 不知道做了什么，因为第一次初始化时大部分都是null，仅仅是一些变量的初始化处理，下面也都是这样
            markRenderEventTimeAndConfig(updateExpirationTime, update.suspenseConfig);

            // Process it and compute a new result.
            // 更新组件state
            resultState = getStateFromUpdate(
                workInProgress,
                queue,
                update,
                resultState,
                props,
                instance,
            );
            const callback = update.callback;
            if (callback !== null) {
                workInProgress.effectTag |= Callback;
                // Set this to null, in case it was mutated during an aborted render.
                update.nextEffect = null;
                if (queue.lastEffect === null) {
                    queue.firstEffect = queue.lastEffect = update;
                } else {
                    queue.lastEffect.nextEffect = update;
                    queue.lastEffect = update;
                }
            }
        }
        // Continue to the next update.
        update = update.next; // 下一个更新
    }

    if (newFirstUpdate === null) {
        queue.lastUpdate = null;
    }
    if (newFirstCapturedUpdate === null) {
        queue.lastCapturedUpdate = null;
    } else {
        workInProgress.effectTag |= Callback;
    }
    if (newFirstUpdate === null && newFirstCapturedUpdate === null) {
        // We processed every update, without skipping. That means the new base
        // state is the same as the result state.
        newBaseState = resultState;
    }

    queue.baseState = newBaseState;
    queue.firstUpdate = newFirstUpdate;
    queue.firstCapturedUpdate = newFirstCapturedUpdate;

    // Set the remaining expiration time to be whatever is remaining in the queue.
    // This should be fine because the only two other things that contribute to
    // expiration time are props and context. We're already in the middle of the
    // begin phase by the time we start processing the queue, so we've already
    // dealt with the props. Context in components that specify
    // shouldComponentUpdate is tricky; but we'll have to account for
    // that regardless.
    workInProgress.expirationTime = newExpirationTime; // 剩余到期时间？
    workInProgress.memoizedState = resultState;
}
```

### reconcileChildren -> reconcileChildFibers

```js
workInProgress.child = reconcileChildFibers(
    workInProgress,
    current.child,
    nextChildren,
    renderExpirationTime,
);

function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
    expirationTime: ExpirationTime,
): Fiber {
    const key = element.key;
    let child = currentFirstChild;
    while (child !== null) {
        // ...
    }

    if (element.type === REACT_FRAGMENT_TYPE) {
        // ...
    } else {
        // created是一个fiber
        // 更具element创建fiber
        const created = createFiberFromElement(element, returnFiber.mode, expirationTime);
        created.ref = coerceRef(returnFiber, currentFirstChild, element); // 处理ref,因为例子上没，先不看
        created.return = returnFiber; // 父节点
        return created;
    }
}

function placeSingleChild(newFiber: Fiber): Fiber {
    // This is simpler for the single child case. We only need to do a
    // placement for inserting new children.
    // shouldTrackSideEffects是直接传参为true（运行时）
    if (shouldTrackSideEffects && newFiber.alternate === null) {
        newFiber.effectTag = Placement; // 0 -> 2
    }
    return newFiber;
}

// This API will tag the children with the side-effect of the reconciliation
// itself. They will be added to the side-effect list as we pass through the
// children and the parent.
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
    // 是否fragment
    const isUnkeyedTopLevelFragment =
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
        }
    }
    // ...
}
```

### updateClassComponent

```js
function updateClassComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    nextProps,
    renderExpirationTime: ExpirationTime,
) {
    // Push context providers early to prevent context stack mismatches.
    // During mounting we don't know the child context yet as the instance doesn't exist.
    // We will invalidate the child context in finishClassComponent() right after rendering.
    // 是否有context
    let hasContext;
    if (isLegacyContextProvider(Component)) {
        hasContext = true;
        pushLegacyContextProvider(workInProgress);
    } else {
        hasContext = false;
    }
    // context相关,先不管
    prepareToReadContext(workInProgress, renderExpirationTime);

    const instance = workInProgress.stateNode;
    let shouldUpdate;
    if (instance === null) {
        if (current !== null) {
            // An class component without an instance only mounts if it suspended
            // inside a non- concurrent tree, in an inconsistent state. We want to
            // tree it like a new mount, even though an empty version of it already
            // committed. Disconnect the alternate pointers.
            current.alternate = null;
            workInProgress.alternate = null;
            // Since this is conceptually a new fiber, schedule a Placement effect
            workInProgress.effectTag |= Placement;
        }
        // In the initial pass we might need to construct the instance.
        // 构造实例
        constructClassInstance(workInProgress, Component, nextProps, renderExpirationTime);
        // 执行渲染前的生命周期
        mountClassInstance(workInProgress, Component, nextProps, renderExpirationTime);
        shouldUpdate = true;
    } else if (current === null) {
        // ...
    } else {
        // ...
    }
    const nextUnitOfWork = finishClassComponent(
        current,
        workInProgress,
        Component,
        shouldUpdate,
        hasContext,
        renderExpirationTime,
    );

    return nextUnitOfWork;
}
```

### constructClassInstance

```js
function constructClassInstance(
    workInProgress: Fiber,
    ctor: any,
    props: any,
    renderExpirationTime: ExpirationTime,
): any {
    let isLegacyContextConsumer = false;
    let unmaskedContext = emptyContextObject;
    let context = null;
    const contextType = ctor.contextType;

    // 到这 前景：从root -> LocaleProvider,一层层下去
    // debugger
    // 获取context ? context相关，先不看
    if (typeof contextType === 'object' && contextType !== null) {
        context = readContext((contextType: any));
    } else {
        unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
        const contextTypes = ctor.contextTypes;
        isLegacyContextConsumer = contextTypes !== null && contextTypes !== undefined;
        context = isLegacyContextConsumer
            ? getMaskedContext(workInProgress, unmaskedContext)
            : emptyContextObject;
    }

    // new 当前组件（class）,获得实例
    const instance = new ctor(props, context);
    const state = (workInProgress.memoizedState =
        instance.state !== null && instance.state !== undefined ? instance.state : null);
    // workInProgress和instance互相添加为属性，stateNode和_reactInternalFiber，能够让双方互相找到
    // 更新了instance的updater方法（直接被替换了一个新的）
    adoptClassInstance(workInProgress, instance);

    // Cache unmasked context so we can avoid recreating masked context unless necessary.
    // ReactFiberContext usually updates this cache but can't for newly-created instances.
    // 在contextType有数据时是true
    if (isLegacyContextConsumer) {
        cacheContext(workInProgress, unmaskedContext, context);
    }

    return instance;
}
```

### mountClassInstance

```js
// Invokes the mount life-cycles on a previously never rendered instance.
function mountClassInstance(
    workInProgress: Fiber,
    ctor: any,
    newProps: any,
    renderExpirationTime: ExpirationTime,
): void {
    // 更新state等数据
    const instance = workInProgress.stateNode;
    instance.props = newProps;
    instance.state = workInProgress.memoizedState;
    instance.refs = emptyRefsObject;

    const contextType = ctor.contextType;

    // context
    if (typeof contextType === 'object' && contextType !== null) {
        instance.context = readContext(contextType);
    } else {
        const unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
        instance.context = getMaskedContext(workInProgress, unmaskedContext);
    }

    let updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null) {
        processUpdateQueue(workInProgress, updateQueue, newProps, instance, renderExpirationTime);
        instance.state = workInProgress.memoizedState;
    }

    // 处理getDerivedStateFromProps，第一个看到的生命周期处理
    // getDerivedStateFromProps 有返回值，做Object.assign处理，否则返回原state
    // workInProgress.memoizedState被更新了
    // 现在还处于渲染前
    const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
    if (typeof getDerivedStateFromProps === 'function') {
        applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, newProps);
        instance.state = workInProgress.memoizedState;
    }

    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    // 如果使用了新的生命周期函数，就不调用老的不安全的生命周期函数componentWillMount
    if (
        typeof ctor.getDerivedStateFromProps !== 'function' &&
        typeof instance.getSnapshotBeforeUpdate !== 'function' &&
        (typeof instance.UNSAFE_componentWillMount === 'function' ||
            typeof instance.componentWillMount === 'function')
    ) {
        // 调用componentWillMount、UNSAFE_componentWillMount
        callComponentWillMount(workInProgress, instance);
        // If we had additional state updates during this life-cycle, let's
        // process them now.
        updateQueue = workInProgress.updateQueue;
        if (updateQueue !== null) {
            processUpdateQueue(
                workInProgress,
                updateQueue,
                newProps,
                instance,
                renderExpirationTime,
            );
            instance.state = workInProgress.memoizedState;
        }
    }

    if (typeof instance.componentDidMount === 'function') {
        workInProgress.effectTag |= Update; // effectTag添加Update
    }
}
```

### finishClassComponent

```js
function finishClassComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    shouldUpdate: boolean,
    hasContext: boolean,
    renderExpirationTime: ExpirationTime,
) {
    // Refs should update even if shouldComponentUpdate returns false
    // 标记ref,表示workInProgress上存在ref属性，通过effectTag
    // debugger
    markRef(current, workInProgress);
    //  是否包含DidCapture标记
    const didCaptureError = (workInProgress.effectTag & DidCapture) !== NoEffect;

    if (!shouldUpdate && !didCaptureError) {
        // Context providers should defer to sCU for rendering
        if (hasContext) {
            invalidateContextProvider(workInProgress, Component, false);
        }

        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
    }

    const instance = workInProgress.stateNode;

    // Rerender
    ReactCurrentOwner.current = workInProgress;
    let nextChildren;
    // 包含DidCapture标记 && getDerivedStateFromError不是函数
    if (didCaptureError && typeof Component.getDerivedStateFromError !== 'function') {
        // If we captured an error, but getDerivedStateFrom catch is not defined,
        // unmount all the children. componentDidCatch will schedule an update to
        // re-render a fallback. This is temporary until we migrate everyone to
        // the new API.
        // TODO: Warn in a future release.
        nextChildren = null;

        if (enableProfilerTimer) {
            stopProfilerTimerIfRunning(workInProgress);
        }
    } else {
        // 正常渲染
        if (__DEV__) {
            // ...
        } else {
            // debugger
            // 执行render, 即React.createElement
            // 把es6模板转成React.createElement应该是loader完成的,具体怎么转的就先不管了
            // 见createElement.md
            nextChildren = instance.render();
        }
    }

    // React DevTools reads this flag.
    // React DevTools需要
    workInProgress.effectTag |= PerformedWork;
    if (current !== null && didCaptureError) {
        // ...
    } else {
        // 和reconcileChildFibers代码一样，唯一区别是调用时shouldTrackSideEffects为false
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
    }

    // Memoize state using the values we just used to render.
    // TODO: Restructure so we never read values from the instance.
    // 记住state, 这个是preState?
    workInProgress.memoizedState = instance.state;

    // The context might have changed so we need to recalculate it.
    if (hasContext) {
        invalidateContextProvider(workInProgress, Component, true);
    }

    return workInProgress.child;
}
```

### reconcileChildFibers 和 mountChildFibers

```js
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);

export function reconcileChildren(
    current: Fiber | null,
    workInProgress: Fiber,
    nextChildren: any,
    renderExpirationTime: ExpirationTime,
) {
    if (current === null) {
        // If this is a fresh new component that hasn't been rendered yet, we
        // won't update its child set by applying minimal side-effects. Instead,
        // we will add them all to the child before it gets rendered. That means
        // we can optimize this reconciliation pass by not tracking side-effects.
        workInProgress.child = mountChildFibers(
            workInProgress,
            null,
            nextChildren,
            renderExpirationTime,
        );
    } else {
        // If the current child is the same as the work in progress, it means that
        // we haven't yet started any work on these children. Therefore, we use
        // the clone algorithm to create a copy of all the current children.

        // If we had any progressed work already, that is invalid at this point so
        // let's throw it out.

        // 把子节点转换成一个fiber
        // debugger;
        workInProgress.child = reconcileChildFibers(
            workInProgress,
            current.child,
            nextChildren,
            renderExpirationTime,
        );
    }
}
```

### updateHostComponent

```js
function updateHostComponent(current, workInProgress, renderExpirationTime) {
    // debugger
    pushHostContext(workInProgress);

    if (current === null) {
        tryToClaimNextHydratableInstance(workInProgress);
    }

    const type = workInProgress.type;
    const nextProps = workInProgress.pendingProps;
    const prevProps = current !== null ? current.memoizedProps : null;

    let nextChildren = nextProps.children;
    const isDirectTextChild = shouldSetTextContent(type, nextProps); // 子节点是文本节点

    if (isDirectTextChild) {
        // 如果是文本节点
        // We special case a direct text child of a host node. This is a common
        // case. We won't handle it as a reified child. We will instead handle
        // this in the host environment that also have access to this prop. That
        // avoids allocating another HostText fiber and traversing it.
        nextChildren = null;
    } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
        // If we're switching from a direct text child to a normal child, or to
        // empty, we need to schedule the text content to be reset.
        workInProgress.effectTag |= ContentReset;
    }

    markRef(current, workInProgress);

    // Check the host config to see if the children are offscreen/hidden.
    if (
        workInProgress.mode & ConcurrentMode &&
        renderExpirationTime !== Never &&
        shouldDeprioritizeSubtree(type, nextProps)
    ) {
        // ...
    }

    reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
    return workInProgress.child;
}
```

### reconcileChildFibers（详细）

见 reconcileChildFibers.md

### completeUnitOfWork

```js
function completeUnitOfWork(unitOfWork: Fiber): Fiber | null {
    // Attempt to complete the current unit of work, then move to the next
    // sibling. If there are no more siblings, return to the parent fiber.
    // 翻译：结束当前的工作单元，然后移动到下一个兄弟。如果没有，返回父fiber
    workInProgress = unitOfWork;
    do {
        // The current, flushed, state of this fiber is the alternate. Ideally
        // nothing should rely on this, but relying on it here means that we don't
        // need an additional field on the work in progress.
        const current = workInProgress.alternate;
        const returnFiber = workInProgress.return;

        // Check if the work completed or if something threw.
        if ((workInProgress.effectTag & Incomplete) === NoEffect) {
            let next;
            if (!enableProfilerTimer || (workInProgress.mode & ProfileMode) === NoMode) {
                next = completeWork(current, workInProgress, renderExpirationTime);
            } else {
                startProfilerTimer(workInProgress);
                next = completeWork(current, workInProgress, renderExpirationTime);
                // Update render duration assuming we didn't error.
                stopProfilerTimerIfRunningAndRecordDelta(workInProgress, false);
            }
            resetChildExpirationTime(workInProgress); // 重置时间

            if (next !== null) {
                // Completing this fiber spawned new work. Work on that next.
                return next;
            }

            if (
                returnFiber !== null &&
                // Do not append effects to parents if a sibling failed to complete
                (returnFiber.effectTag & Incomplete) === NoEffect
            ) {
                // Append all the effects of the subtree and this fiber onto the effect
                // list of the parent. The completion order of the children affects the
                // side-effect order.
                if (returnFiber.firstEffect === null) {
                    returnFiber.firstEffect = workInProgress.firstEffect;
                }
                if (workInProgress.lastEffect !== null) {
                    if (returnFiber.lastEffect !== null) {
                        returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
                    }
                    returnFiber.lastEffect = workInProgress.lastEffect;
                }

                // If this fiber had side-effects, we append it AFTER the children's
                // side-effects. We can perform certain side-effects earlier if needed,
                // by doing multiple passes over the effect list. We don't want to
                // schedule our own side-effect on our own list because if end up
                // reusing children we'll schedule this effect onto itself since we're
                // at the end.
                const effectTag = workInProgress.effectTag;

                // Skip both NoWork and PerformedWork tags when creating the effect
                // list. PerformedWork effect is read by React DevTools but shouldn't be
                // committed.
                // debugger
                // effect添加，
                if (effectTag > PerformedWork) {
                    if (returnFiber.lastEffect !== null) {
                        returnFiber.lastEffect.nextEffect = workInProgress;
                    } else {
                        returnFiber.firstEffect = workInProgress;
                    }
                    returnFiber.lastEffect = workInProgress;
                }
            }
        } else {
            // This fiber did not complete because something threw. Pop values off
            // the stack without entering the complete phase. If this is a boundary,
            // capture values if possible.
            const next = unwindWork(workInProgress, renderExpirationTime);

            // Because this fiber did not complete, don't reset its expiration time.

            if (enableProfilerTimer && (workInProgress.mode & ProfileMode) !== NoMode) {
                // Record the render duration for the fiber that errored.
                stopProfilerTimerIfRunningAndRecordDelta(workInProgress, false);

                // Include the time spent working on failed children before continuing.
                let actualDuration = workInProgress.actualDuration;
                let child = workInProgress.child;
                while (child !== null) {
                    actualDuration += child.actualDuration;
                    child = child.sibling;
                }
                workInProgress.actualDuration = actualDuration;
            }

            if (next !== null) {
                // If completing this work spawned new work, do that next. We'll come
                // back here again.
                // Since we're restarting, remove anything that is not a host effect
                // from the effect tag.
                // TODO: The name stopFailedWorkTimer is misleading because Suspense
                // also captures and restarts.
                stopFailedWorkTimer(workInProgress);
                next.effectTag &= HostEffectMask;
                return next;
            }
            stopWorkTimer(workInProgress);

            if (returnFiber !== null) {
                // Mark the parent fiber as incomplete and clear its effect list.
                returnFiber.firstEffect = returnFiber.lastEffect = null;
                returnFiber.effectTag |= Incomplete;
            }
        }

        const siblingFiber = workInProgress.sibling; // 返回相邻节点
        if (siblingFiber !== null) {
            // If there is more work to do in this returnFiber, do that next.
            return siblingFiber;
        }
        // Otherwise, return to the parent 没有就从父节点中找相邻节点
        workInProgress = returnFiber;
    } while (workInProgress !== null);

    // We've reached the root.
    if (workInProgressRootExitStatus === RootIncomplete) {
        workInProgressRootExitStatus = RootCompleted;
    }
    return null;
}
```
