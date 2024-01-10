---
title: hooks
tags: react源码解析
categories:
  - react
date: 2020-9-9 14:00
---

在`renderWithHooks`中添加了方法,调用的 mount 或者 uodate 的 hooks 方法

```js
if (__DEV__) {
    // ...
} else {
    ReactCurrentDispatcher.current =
        nextCurrentHook === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
}

// 执行函数，得到children
let children = Component(props, refOrContext);
```

## 公共

### mountWorkInProgressHook

基于这个方法，所有的 hooks 都在一条链上

```js
function mountWorkInProgressHook(): Hook {
    const hook: Hook = {
        memoizedState: null,

        baseState: null,
        queue: null,
        baseUpdate: null,

        next: null,
    };

    if (workInProgressHook === null) {
        // This is the first hook in the list
        firstWorkInProgressHook = workInProgressHook = hook;
    } else {
        // Append to the end of the list
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}
```

### updateWorkInProgressHook

在跟新时都有用到，用来记录当前工作的 hook 和 next hook

并返回一个 clone hook

```js
function updateWorkInProgressHook(): Hook {
    // This function is used both for updates and for re-renders triggered by a
    // render phase update. It assumes there is either a current hook we can
    // clone, or a work-in-progress hook from a previous render pass that we can
    // use as a base. When we reach the end of the base list, we must switch to
    // the dispatcher used for mounts.
    if (nextWorkInProgressHook !== null) {
        // There's already a work-in-progress. Reuse it.
        workInProgressHook = nextWorkInProgressHook;
        nextWorkInProgressHook = workInProgressHook.next;

        currentHook = nextCurrentHook;
        nextCurrentHook = currentHook !== null ? currentHook.next : null;
    } else {
        // Clone from the current hook.
        invariant(nextCurrentHook !== null, 'Rendered more hooks than during the previous render.');
        currentHook = nextCurrentHook;

        const newHook: Hook = {
            memoizedState: currentHook.memoizedState,

            baseState: currentHook.baseState,
            queue: currentHook.queue,
            baseUpdate: currentHook.baseUpdate,

            next: null,
        };

        if (workInProgressHook === null) {
            // This is the first hook in the list.
            workInProgressHook = firstWorkInProgressHook = newHook;
        } else {
            // Append to the end of the list.
            workInProgressHook = workInProgressHook.next = newHook;
        }
        nextCurrentHook = currentHook.next;
    }
    return workInProgressHook;
}
```

### 方法绑定

```js
// 应该是错误处理
export const ContextOnlyDispatcher: Dispatcher = {
    readContext,

    useCallback: throwInvalidHookError,
    useContext: throwInvalidHookError,
    useEffect: throwInvalidHookError,
    useImperativeHandle: throwInvalidHookError,
    useLayoutEffect: throwInvalidHookError,
    useMemo: throwInvalidHookError,
    useReducer: throwInvalidHookError,
    useRef: throwInvalidHookError,
    useState: throwInvalidHookError,
    useDebugValue: throwInvalidHookError,
};

// 初始化用
const HooksDispatcherOnMount: Dispatcher = {
    readContext,

    useCallback: mountCallback,
    useContext: readContext,
    useEffect: mountEffect,
    useImperativeHandle: mountImperativeHandle,
    useLayoutEffect: mountLayoutEffect,
    useMemo: mountMemo,
    useReducer: mountReducer,
    useRef: mountRef,
    useState: mountState,
    useDebugValue: mountDebugValue,
};

// 跟新用
const HooksDispatcherOnUpdate: Dispatcher = {
    readContext,

    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
    useRef: updateRef,
    useState: updateState,
    useDebugValue: updateDebugValue,
};
```

## useRef

```js
function useRef(initialValue) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useRef(initialValue);
}

function resolveDispatcher() {
    var dispatcher = ReactCurrentDispatcher.current;
    !(dispatcher !== null)
        ? invariant(
              false,
              'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.',
          )
        : void 0;
    return dispatcher;
}
```

### 初始化

然后进入`dispatcher.useRef`即`mountRef`

#### mountRef

```js
function mountRef<T>(initialValue: T): {current: T} {
    const hook = mountWorkInProgressHook();
    const ref = {current: initialValue};
    hook.memoizedState = ref;
    return ref;
}
```

## useState

```js
function useState(initialState) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
}
```

### 初始化

开始都差不多，进入 `dispatcher.useState`即`mountState`

#### mountState

```js
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
    return typeof action === 'function' ? action(state) : action;
}

function mountState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
    const hook = mountWorkInProgressHook();
    if (typeof initialState === 'function') {
        initialState = initialState();
    }
    // memoizedState 最新结果
    hook.memoizedState = hook.baseState = initialState;
    const queue = (hook.queue = {
        last: null,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: (initialState: any),
    });
    // 跟新方法
    const dispatch: Dispatch<BasicStateAction<S>> = (queue.dispatch = (dispatchAction.bind(
        null,
        // Flow doesn't know this is non-null, but we do.
        ((currentlyRenderingFiber: any): Fiber),
        queue,
    ): any));
    return [hook.memoizedState, dispatch];
}
```

### 执行

#### dispatchAction

```js
// Object.is polyfill
function is(x: any, y: any) {
    return (
        (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y) // eslint-disable-line no-self-compare
    );
}

// action 已经计算好的值，即setXXX的传参,
function dispatchAction<S, A>(fiber: Fiber, queue: UpdateQueue<S, A>, action: A) {
    const alternate = fiber.alternate;
    if (
        fiber === currentlyRenderingFiber ||
        (alternate !== null && alternate === currentlyRenderingFiber)
    ) {
        // This is a render phase update. Stash it in a lazily-created map of
        // queue -> linked list of updates. After this render pass, we'll restart
        // and apply the stashed updates on top of the work-in-progress hook.
        didScheduleRenderPhaseUpdate = true;
        const update: Update<S, A> = {
            expirationTime: renderExpirationTime,
            suspenseConfig: null,
            action,
            eagerReducer: null,
            eagerState: null,
            next: null,
        };
        if (renderPhaseUpdates === null) {
            renderPhaseUpdates = new Map();
        }
        const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
        if (firstRenderPhaseUpdate === undefined) {
            renderPhaseUpdates.set(queue, update);
        } else {
            // Append the update to the end of the list.
            let lastRenderPhaseUpdate = firstRenderPhaseUpdate;
            while (lastRenderPhaseUpdate.next !== null) {
                lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
            }
            lastRenderPhaseUpdate.next = update;
        }
    } else {
        if (revertPassiveEffectsChange) {
            flushPassiveEffects();
        }

        const currentTime = requestCurrentTime();
        const suspenseConfig = requestCurrentSuspenseConfig();
        const expirationTime = computeExpirationForFiber(currentTime, fiber, suspenseConfig);

        const update: Update<S, A> = {
            expirationTime,
            suspenseConfig,
            action,
            eagerReducer: null,
            eagerState: null,
            next: null,
        };

        // Append the update to the end of the list.
        const last = queue.last;
        if (last === null) {
            // This is the first update. Create a circular list.
            update.next = update;
        } else {
            const first = last.next;
            if (first !== null) {
                // Still circular.
                update.next = first;
            }
            last.next = update;
        }
        // queue里放着就数据，last是新数据
        queue.last = update;

        if (
            fiber.expirationTime === NoWork &&
            (alternate === null || alternate.expirationTime === NoWork)
        ) {
            // The queue is currently empty, which means we can eagerly compute the
            // next state before entering the render phase. If the new state is the
            // same as the current state, we may be able to bail out entirely.
            const lastRenderedReducer = queue.lastRenderedReducer;
            if (lastRenderedReducer !== null) {
                let prevDispatcher;
                try {
                    // 上一个值
                    const currentState: S = (queue.lastRenderedState: any);
                    // 最新值
                    const eagerState = lastRenderedReducer(currentState, action);
                    // Stash the eagerly computed state, and the reducer used to compute
                    // it, on the update object. If the reducer hasn't changed by the
                    // time we enter the render phase, then the eager state can be used
                    // without calling the reducer again.
                    update.eagerReducer = lastRenderedReducer;
                    update.eagerState = eagerState;
                    // 即Object.is,相同就return
                    if (is(eagerState, currentState)) {
                        // Fast path. We can bail out without scheduling React to re-render.
                        // It's still possible that we'll need to rebase this update later,
                        // if the component re-renders for a different reason and by that
                        // time the reducer has changed.
                        return;
                    }
                } catch (error) {
                    // Suppress the error. It will throw again in the render phase.
                } finally {
                    if (__DEV__) {
                        ReactCurrentDispatcher.current = prevDispatcher;
                    }
                }
            }
        }
        // 有跟新，就去scheduleWork
        scheduleWork(fiber, expirationTime);
    }
}
```

#### scheduleWork

见 schedule.md

### 跟新

跟新时 `dispatcher.useState` = `updateState`

#### updateState

```js
function updateState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
    return updateReducer(basicStateReducer, (initialState: any));
}

function updateReducer<S, I, A>(
    reducer: (S, A) => S,
    initialArg: I,
    init?: (I) => S,
): [S, Dispatch<A>] {
    const hook = updateWorkInProgressHook();
    const queue = hook.queue;
    invariant(
        queue !== null,
        'Should have a queue. This is likely a bug in React. Please file an issue.',
    );

    queue.lastRenderedReducer = reducer;

    if (numberOfReRenders > 0) {
        // This is a re-render. Apply the new render phase updates to the previous
        // work-in-progress hook.
        const dispatch: Dispatch<A> = (queue.dispatch: any);
        if (renderPhaseUpdates !== null) {
            // Render phase updates are stored in a map of queue -> linked list
            const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
            if (firstRenderPhaseUpdate !== undefined) {
                renderPhaseUpdates.delete(queue);
                let newState = hook.memoizedState;
                let update = firstRenderPhaseUpdate;
                do {
                    // Process this render phase update. We don't have to check the
                    // priority because it will always be the same as the current
                    // render's.
                    const action = update.action;
                    newState = reducer(newState, action);
                    update = update.next;
                } while (update !== null);

                // Mark that the fiber performed work, but only if the new state is
                // different from the current state.
                if (!is(newState, hook.memoizedState)) {
                    markWorkInProgressReceivedUpdate();
                }

                hook.memoizedState = newState;
                // Don't persist the state accumlated from the render phase updates to
                // the base state unless the queue is empty.
                // TODO: Not sure if this is the desired semantics, but it's what we
                // do for gDSFP. I can't remember why.
                if (hook.baseUpdate === queue.last) {
                    hook.baseState = newState;
                }

                queue.lastRenderedState = newState;

                return [newState, dispatch];
            }
        }
        return [hook.memoizedState, dispatch];
    }

    // The last update in the entire queue
    const last = queue.last;
    // The last update that is part of the base state.
    const baseUpdate = hook.baseUpdate;
    const baseState = hook.baseState;

    // Find the first unprocessed update.
    let first;
    if (baseUpdate !== null) {
        if (last !== null) {
            // For the first update, the queue is a circular linked list where
            // `queue.last.next = queue.first`. Once the first update commits, and
            // the `baseUpdate` is no longer empty, we can unravel the list.
            last.next = null;
        }
        first = baseUpdate.next;
    } else {
        first = last !== null ? last.next : null;
    }
    if (first !== null) {
        // 新 state 数据
        let newState = baseState;
        let newBaseState = null;
        let newBaseUpdate = null;
        let prevUpdate = baseUpdate;
        let update = first;
        let didSkip = false;
        do {
            const updateExpirationTime = update.expirationTime;
            if (updateExpirationTime < renderExpirationTime) {
                // Priority is insufficient. Skip this update. If this is the first
                // skipped update, the previous update/state is the new base
                // update/state.
                if (!didSkip) {
                    didSkip = true;
                    newBaseUpdate = prevUpdate;
                    newBaseState = newState;
                }
                // Update the remaining priority in the queue.
                if (updateExpirationTime > remainingExpirationTime) {
                    remainingExpirationTime = updateExpirationTime;
                }
            } else {
                // This update does have sufficient priority.

                // Mark the event time of this update as relevant to this render pass.
                // TODO: This should ideally use the true event time of this update rather than
                // its priority which is a derived and not reverseable value.
                // TODO: We should skip this update if it was already committed but currently
                // we have no way of detecting the difference between a committed and suspended
                // update here.
                markRenderEventTimeAndConfig(updateExpirationTime, update.suspenseConfig);

                // Process this update.
                if (update.eagerReducer === reducer) {
                    // If this update was processed eagerly, and its reducer matches the
                    // current reducer, we can use the eagerly computed state.
                    newState = ((update.eagerState: any): S);
                } else {
                    const action = update.action;
                    newState = reducer(newState, action);
                }
            }
            prevUpdate = update;
            update = update.next;
        } while (update !== null && update !== first);

        if (!didSkip) {
            newBaseUpdate = prevUpdate;
            newBaseState = newState;
        }

        // Mark that the fiber performed work, but only if the new state is
        // different from the current state.
        // 标记fiber已完成工作，前提是新旧数据不同，通过Object.is
        if (!is(newState, hook.memoizedState)) {
            markWorkInProgressReceivedUpdate();
        }

        hook.memoizedState = newState;
        hook.baseUpdate = newBaseUpdate;
        hook.baseState = newBaseState;

        queue.lastRenderedState = newState;
    }

    const dispatch: Dispatch<A> = (queue.dispatch: any);
    return [hook.memoizedState, dispatch];
}
```

#### updateWorkInProgressHook

```js
function updateWorkInProgressHook(): Hook {
    // This function is used both for updates and for re-renders triggered by a
    // render phase update. It assumes there is either a current hook we can
    // clone, or a work-in-progress hook from a previous render pass that we can
    // use as a base. When we reach the end of the base list, we must switch to
    // the dispatcher used for mounts.
    if (nextWorkInProgressHook !== null) {
        // There's already a work-in-progress. Reuse it.
        workInProgressHook = nextWorkInProgressHook;
        nextWorkInProgressHook = workInProgressHook.next;

        currentHook = nextCurrentHook;
        nextCurrentHook = currentHook !== null ? currentHook.next : null;
    } else {
        // Clone from the current hook.
        invariant(nextCurrentHook !== null, 'Rendered more hooks than during the previous render.');
        currentHook = nextCurrentHook;

        // clone 当前 hook
        const newHook: Hook = {
            memoizedState: currentHook.memoizedState,

            baseState: currentHook.baseState,
            queue: currentHook.queue,
            baseUpdate: currentHook.baseUpdate,

            next: null,
        };

        if (workInProgressHook === null) {
            // This is the first hook in the list.
            workInProgressHook = firstWorkInProgressHook = newHook;
        } else {
            // Append to the end of the list.
            workInProgressHook = workInProgressHook.next = newHook;
        }
        nextCurrentHook = currentHook.next;
    }
    return workInProgressHook;
}
```

## useEffect

### 初始化

#### mountEffect 和 mountEffectImpl

```js
function mountEffect(create: () => (() => void) | void, deps: Array<mixed> | void | null): void {
    return mountEffectImpl(
        UpdateEffect | PassiveEffect, // 有这两种effect处理
        UnmountPassive | MountPassive, // 192
        create,
        deps,
    );
}
function mountEffectImpl(fiberEffectTag, hookEffectTag, create, deps): void {
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    sideEffectTag |= fiberEffectTag;
    hook.memoizedState = pushEffect(hookEffectTag, create, undefined, nextDeps);
}
```

#### pushEffect

```js
function pushEffect(tag, create, destroy, deps) {
    const effect: Effect = {
        tag,
        create,
        destroy,
        deps,
        // Circular
        next: (null: any),
    };
    if (componentUpdateQueue === null) {
        componentUpdateQueue = createFunctionComponentUpdateQueue();
        componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
        const lastEffect = componentUpdateQueue.lastEffect;
        if (lastEffect === null) {
            componentUpdateQueue.lastEffect = effect.next = effect;
        } else {
            const firstEffect = lastEffect.next;
            lastEffect.next = effect;
            effect.next = firstEffect;
            componentUpdateQueue.lastEffect = effect;
        }
    }
    return effect;
}
```

### 执行

从 `commitRoot`开始

```js
function commitRoot(root) {
    // 开始渲染流程
    // debugger;
    // 优先级相关，最后还是运行commitRootImpl
    runWithPriority(ImmediatePriority, commitRootImpl.bind(null, root)); // 渲染并执行componentDidMount
    // If there are passive effects, schedule a callback to flush them. This goes
    // outside commitRootImpl so that it inherits the priority of the render.
    if (rootWithPendingPassiveEffects !== null) {
        // debugger;
        // 这里是调度管理，先不看，直接进里面
        const priorityLevel = getCurrentPriorityLevel();
        scheduleCallback(priorityLevel, () => {
            // hooks的useEffect在这里执行,不过是在RequestAnimationFrame里,不好一步追踪到这，只能打断点反追
            flushPassiveEffects();
            return null;
        });
    }
    return null;
}
```

#### flushPassiveEffects

```js
export function flushPassiveEffects() {
    if (rootWithPendingPassiveEffects === null) {
        return false;
    }
    const root = rootWithPendingPassiveEffects;
    const expirationTime = pendingPassiveEffectsExpirationTime;
    rootWithPendingPassiveEffects = null;
    pendingPassiveEffectsExpirationTime = NoWork;

    let prevInteractions: Set<Interaction> | null = null;

    const prevExecutionContext = executionContext;
    executionContext |= CommitContext;

    // Note: This currently assumes there are no passive effects on the root
    // fiber, because the root is not part of its own effect list. This could
    // change in the future.
    let effect = root.current.firstEffect;
    while (effect !== null) {
        if (__DEV__) {
            // ...
        } else {
            try {
                commitPassiveHookEffects(effect);
            } catch (error) {
                invariant(effect !== null, 'Should be working on an effect.');
                captureCommitPhaseError(effect, error);
            }
        }
        effect = effect.nextEffect;
    }

    executionContext = prevExecutionContext;
    flushSyncCallbackQueue();

    // If additional passive effects were scheduled, increment a counter. If this
    // exceeds the limit, we'll fire a warning.
    nestedPassiveUpdateCount =
        rootWithPendingPassiveEffects === null ? 0 : nestedPassiveUpdateCount + 1;

    return true;
}
```

#### commitPassiveHookEffects

先执行卸载的`return`,在执行本体

```js
export function commitPassiveHookEffects(finishedWork: Fiber): void {
    commitHookEffectList(UnmountPassive, NoHookEffect, finishedWork);
    commitHookEffectList(NoHookEffect, MountPassive, finishedWork);
}
```

#### commitHookEffectList

这个方法在很多地方都有用到，目前已知的从`commitPassiveHookEffects`过来的是`useEffect`,其他未知

```js
function commitHookEffectList(unmountTag: number, mountTag: number, finishedWork: Fiber) {
    const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
    let lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
            if ((effect.tag & unmountTag) !== NoHookEffect) {
                // Unmount
                const destroy = effect.destroy;
                effect.destroy = undefined;
                if (destroy !== undefined) {
                    destroy();
                }
            }
            if ((effect.tag & mountTag) !== NoHookEffect) {
                // Mount
                const create = effect.create;
                // return就是destroy
                effect.destroy = create();
            }
            effect = effect.next;
        } while (effect !== firstEffect);
    }
}
```

### 更新

#### updateEffect

```js
function updateEffect(create: () => (() => void) | void, deps: Array<mixed> | void | null): void {
    return updateEffectImpl(
        UpdateEffect | PassiveEffect,
        UnmountPassive | MountPassive,
        create,
        deps,
    );
}
function updateEffectImpl(fiberEffectTag, hookEffectTag, create, deps): void {
    const hook = updateWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    let destroy = undefined;

    if (currentHook !== null) {
        const prevEffect = currentHook.memoizedState;
        destroy = prevEffect.destroy;
        // 判断依赖是否有变，
        if (nextDeps !== null) {
            const prevDeps = prevEffect.deps;
            //  循环依赖，用Object.is
            if (areHookInputsEqual(nextDeps, prevDeps)) {
                // 依赖不变，是NoHookEffect，所以useEffect不执行destroy和create
                pushEffect(NoHookEffect, create, destroy, nextDeps);
                return;
            }
        }
    }
    // 只有依赖有变或者没依赖才有fiberEffectTag标记，不过没发现有什么用
    sideEffectTag |= fiberEffectTag;
    hook.memoizedState = pushEffect(hookEffectTag, create, destroy, nextDeps);
}
```

## useContext

context 见 context.md

## useMome

### mountMemo

```js
function mountMemo<T>(nextCreate: () => T, deps: Array<mixed> | void | null): T {
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    const nextValue = nextCreate();
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
}
```

### updateMemo

```js
function updateMemo<T>(nextCreate: () => T, deps: Array<mixed> | void | null): T {
    const hook = updateWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    const prevState = hook.memoizedState;
    if (prevState !== null) {
        // Assume these are defined. If they're not, areHookInputsEqual will warn.
        if (nextDeps !== null) {
            // 依赖不变，就取旧值
            const prevDeps: Array<mixed> | null = prevState[1];
            if (areHookInputsEqual(nextDeps, prevDeps)) {
                return prevState[0];
            }
        }
    }
    // 否则重新执行获得最新值
    const nextValue = nextCreate();
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
}
```
