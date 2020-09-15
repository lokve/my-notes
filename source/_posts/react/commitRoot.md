---
title: commitRoot
tags: react源码解析
date: 2020-9-9 11:00
---

### commitRoot

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
            // hooks的useEffect在这里执行
            flushPassiveEffects();
            return null;
        });
    }
    return null;
}
```

### commitRootImpl

```js
function commitRootImpl(root) {
    flushPassiveEffects();
    flushRenderPhaseStrictModeWarningsInDEV(); // __DEV__
    flushSuspensePriorityWarningInDEV(); // __DEV__

    invariant(
        (executionContext & (RenderContext | CommitContext)) === NoContext,
        'Should not already be working.',
    );

    const finishedWork = root.finishedWork;
    const expirationTime = root.finishedExpirationTime;
    if (finishedWork === null) {
        return null;
    }
    root.finishedWork = null;
    root.finishedExpirationTime = NoWork;

    invariant(
        finishedWork !== root.current,
        'Cannot commit the same tree as before. This error is likely caused by ' +
            'a bug in React. Please file an issue.',
    );

    // commitRoot never returns a continuation; it always finishes synchronously.
    // So we can clear these now to allow a new callback to be scheduled.
    root.callbackNode = null;
    root.callbackExpirationTime = NoWork;

    startCommitTimer(); //  也算是__DEV__

    // Update the first and last pending times on this root. The new first
    // pending time is whatever is left on the root fiber.
    const updateExpirationTimeBeforeCommit = finishedWork.expirationTime;
    const childExpirationTimeBeforeCommit = finishedWork.childExpirationTime;
    const firstPendingTimeBeforeCommit =
        childExpirationTimeBeforeCommit > updateExpirationTimeBeforeCommit
            ? childExpirationTimeBeforeCommit
            : updateExpirationTimeBeforeCommit;
    root.firstPendingTime = firstPendingTimeBeforeCommit;
    if (firstPendingTimeBeforeCommit < root.lastPendingTime) {
        // This usually means we've finished all the work, but it can also happen
        // when something gets downprioritized during render, like a hidden tree.
        root.lastPendingTime = firstPendingTimeBeforeCommit;
    }

    if (root === workInProgressRoot) {
        // We can reset these now that they are finished.
        workInProgressRoot = null;
        workInProgress = null;
        renderExpirationTime = NoWork;
    } else {
        // 超时？这里复制过来就是没代码的，只有注释
        // This indicates that the last root we worked on is not the same one that
        // we're committing now. This most commonly happens when a suspended root
        // times out.
    }

    // Get the list of effects.
    let firstEffect;
    if (finishedWork.effectTag > PerformedWork) {
        // A fiber's effect list consists only of its children, not itself. So if
        // the root has an effect, we need to add it to the end of the list. The
        // resulting list is the set that would belong to the root's parent, if it
        // had one; that is, all the effects in the tree including the root.
        if (finishedWork.lastEffect !== null) {
            finishedWork.lastEffect.nextEffect = finishedWork;
            firstEffect = finishedWork.firstEffect;
        } else {
            firstEffect = finishedWork;
        }
    } else {
        // There is no effect on the root.
        firstEffect = finishedWork.firstEffect;
    }

    if (firstEffect !== null) {
        const prevExecutionContext = executionContext;
        executionContext |= CommitContext;
        let prevInteractions: Set<Interaction> | null = null;
        if (enableSchedulerTracing) {
            prevInteractions = __interactionsRef.current;
            __interactionsRef.current = root.memoizedInteractions;
        }

        // Reset this to null before calling lifecycles
        ReactCurrentOwner.current = null;

        // The commit phase is broken into several sub-phases. We do a separate pass
        // of the effect list for each phase: all mutation effects come before all
        // layout effects, and so on.

        // commit阶段

        // The first phase a "before mutation" phase. We use this phase to read the
        // state of the host tree right before we mutate it. This is where
        // getSnapshotBeforeUpdate is called.

        // 第一个阶段，不知道在做什么，和snapshot有关
        startCommitSnapshotEffectsTimer(); // false
        prepareForCommit(root.containerInfo); // 准备
        nextEffect = firstEffect;
        do {
            if (__DEV__) {
                // ...
            } else {
                try {
                    commitBeforeMutationEffects();
                } catch (error) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            }
        } while (nextEffect !== null);
        stopCommitSnapshotEffectsTimer(); // false__DEV__

        if (enableProfilerTimer) {
            // false
            // Mark the current commit time to be shared by all Profilers in this
            // batch. This enables them to be grouped later.
            recordCommitTime();
        }

        // The next phase is the mutation phase, where we mutate the host tree.
        startCommitHostEffectsTimer(); // false__DEV__
        // 第二个阶段
        nextEffect = firstEffect;
        // debugger;
        do {
            if (__DEV__) {
                // ...
            } else {
                try {
                    commitMutationEffects(); // 渲染dom
                } catch (error) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            }
        } while (nextEffect !== null);
        stopCommitHostEffectsTimer(); // false
        resetAfterCommit(root.containerInfo); // 重置一些数据

        // The work-in-progress tree is now the current tree. This must come after
        // the mutation phase, so that the previous tree is still current during
        // componentWillUnmount, but before the layout phase, so that the finished
        // work is current during componentDidMount/Update.
        root.current = finishedWork;

        // The next phase is the layout phase, where we call effects that read
        // the host tree after it's been mutated. The idiomatic use case for this is
        // layout, but class component lifecycles also fire here for legacy reasons.
        startCommitLifeCyclesTimer(); // false
        nextEffect = firstEffect;
        do {
            if (__DEV__) {
                // ...
            } else {
                try {
                    // debugger
                    // 生命周期和ref
                    commitLayoutEffects(root, expirationTime);
                } catch (error) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            }
        } while (nextEffect !== null);
        stopCommitLifeCyclesTimer(); // false

        nextEffect = null;

        if (enableSchedulerTracing) {
            __interactionsRef.current = ((prevInteractions: any): Set<Interaction>);
        }
        executionContext = prevExecutionContext;
    } else {
        // No effects.
        root.current = finishedWork;
        // Measure these anyway so the flamegraph explicitly shows that there were
        // no effects.
        // TODO: Maybe there's a better way to report this.
        startCommitSnapshotEffectsTimer();
        stopCommitSnapshotEffectsTimer();
        if (enableProfilerTimer) {
            recordCommitTime();
        }
        startCommitHostEffectsTimer();
        stopCommitHostEffectsTimer();
        startCommitLifeCyclesTimer();
        stopCommitLifeCyclesTimer();
    }

    stopCommitTimer();

    const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;

    if (rootDoesHavePassiveEffects) {
        // This commit has passive effects. Stash a reference to them. But don't
        // schedule a callback until after flushing layout work.
        rootDoesHavePassiveEffects = false;
        rootWithPendingPassiveEffects = root;
        pendingPassiveEffectsExpirationTime = expirationTime;
    }

    // Check if there's remaining work on this root
    const remainingExpirationTime = root.firstPendingTime;
    if (remainingExpirationTime !== NoWork) {
        const currentTime = requestCurrentTime();
        const priorityLevel = inferPriorityFromExpirationTime(currentTime, remainingExpirationTime);

        if (enableSchedulerTracing) {
            if (didDeprioritizeIdleSubtree) {
                didDeprioritizeIdleSubtree = false;
                scheduleInteractions(root, Never, root.memoizedInteractions);
            }
        }

        // 到这, DidMount已执行
        // debugger;
        scheduleCallbackForRoot(root, priorityLevel, remainingExpirationTime);
    } else {
        // If there's no remaining work, we can clear the set of already failed
        // error boundaries.
        legacyErrorBoundariesThatAlreadyFailed = null;
    }

    if (enableSchedulerTracing) {
        if (!rootDidHavePassiveEffects) {
            // If there are no passive effects, then we can complete the pending interactions.
            // Otherwise, we'll wait until after the passive effects are flushed.
            // Wait to do this until after remaining work has been scheduled,
            // so that we don't prematurely signal complete for interactions when there's e.g. hidden work.
            finishPendingInteractions(root, expirationTime);
        }
    }

    onCommitRoot(finishedWork.stateNode, expirationTime); // 里面应该是dev-tool的处理，先不看

    if (remainingExpirationTime === Sync) {
        // Count the number of times the root synchronously re-renders without
        // finishing. If there are too many, it indicates an infinite update loop.
        if (root === rootWithNestedUpdates) {
            nestedUpdateCount++;
        } else {
            nestedUpdateCount = 0;
            rootWithNestedUpdates = root;
        }
    } else {
        nestedUpdateCount = 0;
    }

    if (hasUncaughtError) {
        hasUncaughtError = false;
        const error = firstUncaughtError;
        firstUncaughtError = null;
        throw error;
    }

    if ((executionContext & LegacyUnbatchedContext) !== NoContext) {
        // This is a legacy edge case. We just committed the initial mount of
        // a ReactDOM.render-ed root inside of batchedUpdates. The commit fired
        // synchronously, but layout updates should be deferred until the end
        // of the batch.
        return null;
    }

    // If layout work was scheduled, flush it now.
    flushSyncCallbackQueue();
    return null;
}
```

### prepareForCommit

```js
export function prepareForCommit(containerInfo: Container): void {
    eventsEnabled = ReactBrowserEventEmitterIsEnabled(); // 启用 _enabled
    selectionInformation = getSelectionInformation(); // 获取当前activeElement, 现在是body
    ReactBrowserEventEmitterSetEnabled(false); // 设为false, 对应上上 _enabled = false
}
```

### commitMutationEffects

```js
function commitMutationEffects() {
    // TODO: Should probably move the bulk of this function to commitWork.
    while (nextEffect !== null) {
        setCurrentDebugFiberInDEV(nextEffect); // __DEV__

        const effectTag = nextEffect.effectTag; // 将要执行的步骤状态

        if (effectTag & ContentReset) {
            commitResetTextContent(nextEffect);
        }

        if (effectTag & Ref) {
            const current = nextEffect.alternate;
            if (current !== null) {
                commitDetachRef(current);
            }
        }

        // The following switch statement is only concerned about placement,
        // updates, and deletions. To avoid needing to add a case for every possible
        // bitmap value, we remove the secondary effects from the effect tag and
        // switch on that value.
        // 新增 or 更新 or 删除
        let primaryEffectTag = effectTag & (Placement | Update | Deletion); // (2 | 4 | 8)
        switch (primaryEffectTag) {
            case Placement: {
                // debugger
                commitPlacement(nextEffect);
                // Clear the "placement" from effect tag so that we know that this is
                // inserted, before any life-cycles like componentDidMount gets called.
                // TODO: findDOMNode doesn't rely on this any more but isMounted does
                // and isMounted is deprecated anyway so we should be able to kill this.
                nextEffect.effectTag &= ~Placement;
                break;
            }
            case PlacementAndUpdate: {
                // 6
                // Placement
                commitPlacement(nextEffect); // 插入dom
                // Clear the "placement" from effect tag so that we know that this is
                // inserted, before any life-cycles like componentDidMount gets called.
                nextEffect.effectTag &= ~Placement;

                // Update
                const current = nextEffect.alternate;
                commitWork(current, nextEffect);
                break;
            }
            case Update: {
                const current = nextEffect.alternate;
                commitWork(current, nextEffect);
                break;
            }
            case Deletion: {
                commitDeletion(nextEffect);
                break;
            }
        }

        // TODO: Only record a mutation effect if primaryEffectTag is non-zero.
        recordEffect(); // __DEV__

        resetCurrentDebugFiberInDEV(); // __DEV__
        nextEffect = nextEffect.nextEffect;
    }
}
```

### commitWork

```js
function commitWork(current: Fiber | null, finishedWork: Fiber): void {
    switch (finishedWork.tag) {
        case FunctionComponent:
        case ForwardRef:
        case MemoComponent:
        case SimpleMemoComponent: {
            // Note: We currently never use MountMutation, but useLayout uses
            // UnmountMutation.
            commitHookEffectList(UnmountMutation, MountMutation, finishedWork);
            return;
        }
        case ClassComponent: {
            return;
        }
        case HostComponent: {
            const instance: Instance = finishedWork.stateNode;
            if (instance != null) {
                // Commit the work prepared earlier.
                const newProps = finishedWork.memoizedProps;
                // For hydration we reuse the update path but we treat the oldProps
                // as the newProps. The updatePayload will contain the real change in
                // this case.
                const oldProps = current !== null ? current.memoizedProps : newProps;
                const type = finishedWork.type;
                // TODO: Type the updateQueue to be specific to host components.
                const updatePayload: null | UpdatePayload = (finishedWork.updateQueue: any);
                finishedWork.updateQueue = null;
                // 更新
                if (updatePayload !== null) {
                    commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork);
                }
            }
            return;
        }
        case HostText: {
            invariant(
                finishedWork.stateNode !== null,
                'This should have a text node initialized. This error is likely ' +
                    'caused by a bug in React. Please file an issue.',
            );
            const textInstance: TextInstance = finishedWork.stateNode;
            const newText: string = finishedWork.memoizedProps;
            // For hydration we reuse the update path but we treat the oldProps
            // as the newProps. The updatePayload will contain the real change in
            // this case.
            const oldText: string = current !== null ? current.memoizedProps : newText;
            commitTextUpdate(textInstance, oldText, newText);
            return;
        }
        case EventTarget: {
            return;
        }
        case HostRoot: {
            return;
        }
        case Profiler: {
            return;
        }
        case SuspenseComponent: {
            commitSuspenseComponent(finishedWork);
            attachSuspenseRetryListeners(finishedWork);
            return;
        }
        case SuspenseListComponent: {
            attachSuspenseRetryListeners(finishedWork);
            return;
        }
        case IncompleteClassComponent: {
            return;
        }
        case EventComponent: {
            return;
        }
        default: {
            invariant(
                false,
                'This unit of work tag should not have side-effects. This error is ' +
                    'likely caused by a bug in React. Please file an issue.',
            );
        }
    }
}
```

### commitHookEffectList

见 `hooks.md` -> `useeffect`-> `commitHookEffectList`

### commitPlacement

```js
function commitPlacement(finishedWork: Fiber): void {
    if (!supportsMutation) {
        // supportsMutation固定true
        return;
    }

    // Recursively insert all host nodes into the parent.
    // 递归获得父节点fiber
    const parentFiber = getHostParentFiber(finishedWork);

    // Note: these two variables *must* always be updated together.
    let parent;
    let isContainer;

    switch (parentFiber.tag) {
        case HostComponent:
            parent = parentFiber.stateNode;
            isContainer = false;
            break;
        case HostRoot:
            parent = parentFiber.stateNode.containerInfo; // dom
            isContainer = true;
            break;
        case HostPortal:
            parent = parentFiber.stateNode.containerInfo;
            isContainer = true;
            break;
        default:
            invariant(
                false,
                'Invalid host parent fiber. This error is likely caused by a bug ' +
                    'in React. Please file an issue.',
            );
    }
    if (parentFiber.effectTag & ContentReset) {
        // Reset the text content of the parent before doing any insertions
        resetTextContent(parent);
        // Clear ContentReset from the effect tag
        parentFiber.effectTag &= ~ContentReset;
    }

    const before = getHostSibling(finishedWork); // 复用情况下找到下一个相邻节点
    // We only have the top Fiber that was inserted but we need to recurse down its
    // children to find all the terminal nodes.
    let node: Fiber = finishedWork;
    while (true) {
        if (node.tag === HostComponent || node.tag === HostText) {
            const stateNode = node.stateNode;
            if (before) {
                // 如果有相邻节点，插在前面
                // 这里都是插在before前面
                // 区别是insertInContainerBefore里面判断了parent是不是COMMENT_NODE
                if (isContainer) {
                    insertInContainerBefore(parent, stateNode, before);
                } else {
                    insertBefore(parent, stateNode, before);
                }
            } else {
                // 都是parent.appendChild(stateNode)
                // 区别同上
                if (isContainer) {
                    appendChildToContainer(parent, stateNode);
                } else {
                    appendChild(parent, stateNode);
                }
            }
        } else if (node.tag === HostPortal) {
            // If the insertion itself is a portal, then we don't want to traverse
            // down its children. Instead, we'll get insertions from each child in
            // the portal directly.
        } else if (node.child !== null) {
            node.child.return = node;
            node = node.child;
            continue;
        }
        if (node === finishedWork) {
            return;
        }
        while (node.sibling === null) {
            if (node.return === null || node.return === finishedWork) {
                return;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
}
```

## commitLayoutEffects

```js
function commitLayoutEffects(root: FiberRoot, committedExpirationTime: ExpirationTime) {
    // 生命周期和ref
    // TODO: Should probably move the bulk of this function to commitWork.
    while (nextEffect !== null) {
        setCurrentDebugFiberInDEV(nextEffect); // dev

        const effectTag = nextEffect.effectTag;

        if (effectTag & (Update | Callback)) {
            recordEffect(); // false
            const current = nextEffect.alternate;
            commitLayoutEffectOnFiber(
                // componentDidUpdate
                root,
                current,
                nextEffect,
                committedExpirationTime,
            );
        }

        if (effectTag & Ref) {
            recordEffect(); // false
            commitAttachRef(nextEffect);
        }

        if (effectTag & Passive) {
            rootDoesHavePassiveEffects = true;
        }

        resetCurrentDebugFiberInDEV();
        nextEffect = nextEffect.nextEffect;
    }
}
```

### commitLifeCycles

```js
function commitLifeCycles(
    finishedRoot: FiberRoot,
    current: Fiber | null,
    finishedWork: Fiber,
    committedExpirationTime: ExpirationTime,
): void {
    switch (finishedWork.tag) {
        case FunctionComponent:
        case ForwardRef:
        case SimpleMemoComponent: {
            commitHookEffectList(UnmountLayout, MountLayout, finishedWork);
            break;
        }
        case ClassComponent: {
            const instance = finishedWork.stateNode;
            if (finishedWork.effectTag & Update) {
                if (current === null) {
                    startPhaseTimer(finishedWork, 'componentDidMount'); // false
                    // We could update instance props and state here,
                    // but instead we rely on them being set during last render.
                    // TODO: revisit this when we implement resuming.

                    // debugger
                    instance.componentDidMount(); // 生命周期
                    stopPhaseTimer(); // false
                } else {
                    const prevProps =
                        finishedWork.elementType === finishedWork.type
                            ? current.memoizedProps
                            : resolveDefaultProps(finishedWork.type, current.memoizedProps);
                    const prevState = current.memoizedState;
                    startPhaseTimer(finishedWork, 'componentDidUpdate');
                    // We could update instance props and state here,
                    // but instead we rely on them being set during last render.
                    // TODO: revisit this when we implement resuming.

                    instance.componentDidUpdate(
                        prevProps,
                        prevState,
                        instance.__reactInternalSnapshotBeforeUpdate,
                    );
                    stopPhaseTimer();
                }
            }
            const updateQueue = finishedWork.updateQueue;
            if (updateQueue !== null) {
                // We could update instance props and state here,
                // but instead we rely on them being set during last render.
                // TODO: revisit this when we implement resuming.
                commitUpdateQueue(finishedWork, updateQueue, instance, committedExpirationTime);
            }
            return;
        }
        case HostRoot: {
            const updateQueue = finishedWork.updateQueue;
            if (updateQueue !== null) {
                let instance = null;
                if (finishedWork.child !== null) {
                    switch (finishedWork.child.tag) {
                        case HostComponent:
                            instance = getPublicInstance(finishedWork.child.stateNode);
                            break;
                        case ClassComponent:
                            instance = finishedWork.child.stateNode;
                            break;
                    }
                }
                commitUpdateQueue(finishedWork, updateQueue, instance, committedExpirationTime);
            }
            return;
        }
        case HostComponent: {
            const instance: Instance = finishedWork.stateNode;

            // Renderers may schedule work to be done after host components are mounted
            // (eg DOM renderer may schedule auto-focus for inputs and form controls).
            // These effects should only be committed when components are first mounted,
            // aka when there is no current/alternate.
            if (current === null && finishedWork.effectTag & Update) {
                const type = finishedWork.type;
                const props = finishedWork.memoizedProps;
                commitMount(instance, type, props, finishedWork);
            }

            return;
        }
        case HostText: {
            // We have no life-cycles associated with text.
            return;
        }
        case HostPortal: {
            // We have no life-cycles associated with portals.
            return;
        }
        case Profiler: {
            // ...
            return;
        }
        case SuspenseComponent:
        case SuspenseListComponent:
        case IncompleteClassComponent:
            return;
        case EventTarget: {
            // ...
            return;
        }
        case EventComponent: {
            if (enableEventAPI) {
                mountEventComponent(finishedWork.stateNode);
            }
            return;
        }
        default: {
            // ...
        }
    }
}
```
