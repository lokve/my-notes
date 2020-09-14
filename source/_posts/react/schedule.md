### scheduleWork

```js
export function scheduleUpdateOnFiber(fiber: Fiber, expirationTime: ExpirationTime) {
    checkForNestedUpdates(); // 判断是否超出更新限制 50条，否则报错
    // 根节点：更新了fiber.stateNode的时间，返回fiber.stateNode，即FiberRoot
    // 子节点： 返回根节点
    const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);
    if (root === null) {
        return;
    }

    root.pingTime = NoWork;

    // 返回优先级,见常量 ReactPriorityLevel
    // 已知第一次渲染是97，setState是98，useState是98
    // TODO:currentPriorityLevel仅在flushTask李改变，目前还没找到什么时候调用过
    const priorityLevel = getCurrentPriorityLevel();

    if (expirationTime === Sync) {
        if (
            // Check if we're inside unbatchedUpdates 8 & 8 = 8 !== 0
            (executionContext & LegacyUnbatchedContext) !== NoContext &&
            // Check if we're not already rendering 8 & (16 | 32) = 0
            (executionContext & (RenderContext | CommitContext)) === NoContext
        ) {
            // This is a legacy edge case. The initial mount of a ReactDOM.render-ed
            // root inside of batchedUpdates should be synchronous, but layout updates
            // should be deferred until the end of the batch.
            let callback = renderRoot(root, Sync, true); // 返回commitRoot
            // 前景：react完成了fiber树的构建并已经执行了渲染前的状态合并(getDerivedStateFromProps等生命周期已执行)
            // fiber树里已经构建好了真实的dom节点，放在stateNode里，就差一步插入了
            // debugger
            while (callback !== null) {
                callback = callback(true);
            }
        } else {
            // setState, useState进这里
            scheduleCallbackForRoot(root, ImmediatePriority, Sync);
            if (executionContext === NoContext) {
                // Flush the synchronous work now, wnless we're already working or inside
                // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
                // scheduleCallbackForFiber to preserve the ability to schedule a callback
                // without immediately flushing it. We only do this for user-initated
                // updates, to preserve historical behavior of sync mode.
                flushSyncCallbackQueue();
            }
        }
    } else {
        scheduleCallbackForRoot(root, priorityLevel, expirationTime);
    }

    if (
        (executionContext & DiscreteEventContext) !== NoContext &&
        // Only updates at user-blocking priority or greater are considered
        // discrete, even inside a discrete event.
        (priorityLevel === UserBlockingPriority || priorityLevel === ImmediatePriority)
    ) {
        // This is the result of a discrete event. Track the lowest priority
        // discrete update per root so we can flush them early, if needed.
        if (rootsWithPendingDiscreteUpdates === null) {
            rootsWithPendingDiscreteUpdates = new Map([[root, expirationTime]]);
        } else {
            const lastDiscreteTime = rootsWithPendingDiscreteUpdates.get(root);
            if (lastDiscreteTime === undefined || lastDiscreteTime > expirationTime) {
                rootsWithPendingDiscreteUpdates.set(root, expirationTime);
            }
        }
    }
}
export const scheduleWork = scheduleUpdateOnFiber;
```

### markUpdateTimeFromFiberToRoot

```js
function markUpdateTimeFromFiberToRoot(fiber, expirationTime) {
    // Update the source fiber's expiration time
    // fiber.expirationTime默认是0
    if (fiber.expirationTime < expirationTime) {
        fiber.expirationTime = expirationTime;
    }
    let alternate = fiber.alternate;
    if (alternate !== null && alternate.expirationTime < expirationTime) {
        alternate.expirationTime = expirationTime;
    }
    // Walk the parent path to the root and update the child expiration time.
    let node = fiber.return;
    let root = null;
    if (node === null && fiber.tag === HostRoot) {
        // 3 === 3
        root = fiber.stateNode;
    } else {
        while (node !== null) {
            alternate = node.alternate;
            // 跟新childExpirationTime
            if (node.childExpirationTime < expirationTime) {
                node.childExpirationTime = expirationTime;
                if (alternate !== null && alternate.childExpirationTime < expirationTime) {
                    alternate.childExpirationTime = expirationTime;
                }
            } else if (alternate !== null && alternate.childExpirationTime < expirationTime) {
                alternate.childExpirationTime = expirationTime;
            }
            if (node.return === null && node.tag === HostRoot) {
                root = node.stateNode;
                break;
            }
            node = node.return;
        }
    }

    if (root !== null) {
        // 注释：跟新根节点的firstPendingTime和lastPendingTime
        // Update the first and last pending expiration times in this root
        const firstPendingTime = root.firstPendingTime;
        if (expirationTime > firstPendingTime) {
            root.firstPendingTime = expirationTime;
        }
        const lastPendingTime = root.lastPendingTime;
        if (lastPendingTime === NoWork || expirationTime < lastPendingTime) {
            root.lastPendingTime = expirationTime;
        }
    }

    return root;
}
```

### scheduleCallbackForRoot

```js
// Use this function, along with runRootCallback, to ensure that only a single
// callback per root is scheduled. It's still possible to call renderRoot
// directly, but scheduling via this function helps avoid excessive callbacks.
// It works by storing the callback node and expiration time on the root. When a
// new callback comes in, it compares the expiration time to determine if it
// should cancel the previous one. It also relies on commitRoot scheduling a
// callback to render the next level, because that means we don't need a
// separate callback per expiration time.
function scheduleCallbackForRoot(
    root: FiberRoot,
    priorityLevel: ReactPriorityLevel,
    expirationTime: ExpirationTime,
) {
    const existingCallbackExpirationTime = root.callbackExpirationTime;
    if (existingCallbackExpirationTime < expirationTime) {
        // New callback has higher priority than the existing one.
        const existingCallbackNode = root.callbackNode;
        if (existingCallbackNode !== null) {
            cancelCallback(existingCallbackNode);
        }
        root.callbackExpirationTime = expirationTime;

        if (expirationTime === Sync) {
            // Sync React callbacks are scheduled on a special internal queue
            // 同步的放在一个队列中
            root.callbackNode = scheduleSyncCallback(
                runRootCallback.bind(null, root, renderRoot.bind(null, root, expirationTime)),
            );
        } else {
            let options = null;
            if (expirationTime !== Never) {
                let timeout = expirationTimeToMs(expirationTime) - now();
                options = {timeout};
            }

            root.callbackNode = scheduleCallback(
                priorityLevel,
                runRootCallback.bind(null, root, renderRoot.bind(null, root, expirationTime)),
                options,
            );
            if (
                enableUserTimingAPI &&
                expirationTime !== Sync &&
                (executionContext & (RenderContext | CommitContext)) === NoContext
            ) {
                // Scheduled an async callback, and we're not already working. Add an
                // entry to the flamegraph that shows we're waiting for a callback
                // to fire.
                startRequestCallbackTimer();
            }
        }
    }

    // Associate the current interactions with this new root+priority.
    schedulePendingInteractions(root, expirationTime);
}
```

### scheduleSyncCallback

```js
let syncQueue: Array<SchedulerCallback> | null = null;

export function scheduleSyncCallback(callback: SchedulerCallback) {
    // Push this callback into an internal queue. We'll flush these either in
    // the next tick, or earlier if something calls `flushSyncCallbackQueue`.
    if (syncQueue === null) {
        syncQueue = [callback];
        // Flush the queue in the next tick, at the earliest.
        immediateQueueCallbackNode = Scheduler_scheduleCallback(
            Scheduler_ImmediatePriority, // 立即优先级 1
            flushSyncCallbackQueueImpl, // 回调方法 执行syncQueue里的方法
        );
    } else {
        // Push onto existing queue. Don't need to schedule a callback because
        // we already scheduled one when we created the queue.
        syncQueue.push(callback);
    }
    return fakeCallbackNode;
}
```

### Scheduler_scheduleCallback

即`unstable_scheduleCallback`

```js
function unstable_scheduleCallback(priorityLevel, callback, options) {
    var currentTime = getCurrentTime(); // 获取当前时间

    var startTime;
    var timeout;
    if (typeof options === 'object' && options !== null) {
        var delay = options.delay;
        if (typeof delay === 'number' && delay > 0) {
            startTime = currentTime + delay;
        } else {
            startTime = currentTime;
        }
        timeout =
            typeof options.timeout === 'number'
                ? options.timeout
                : timeoutForPriorityLevel(priorityLevel);
    } else {
        timeout = timeoutForPriorityLevel(priorityLevel);
        startTime = currentTime;
    }

    var expirationTime = startTime + timeout;

    var newTask = {
        callback,
        priorityLevel,
        startTime,
        expirationTime,
        next: null,
        previous: null,
    };

    if (startTime > currentTime) {
        // This is a delayed task.
        insertDelayedTask(newTask, startTime);
        if (firstTask === null && firstDelayedTask === newTask) {
            // All tasks are delayed, and this is the task with the earliest delay.
            if (isHostTimeoutScheduled) {
                // Cancel an existing timeout.
                cancelHostTimeout();
            } else {
                isHostTimeoutScheduled = true;
            }
            // Schedule a timeout.
            requestHostTimeout(handleTimeout, startTime - currentTime);
        }
    } else {
        insertScheduledTask(newTask, expirationTime);
        // Schedule a host callback, if needed. If we're already performing work,
        // wait until the next time we yield.
        if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true;
            requestHostCallback(flushWork);
        }
    }

    return newTask;
}
```

### timeoutForPriorityLevel

```js
固定参数见 `常量.md`->`优先级`
function timeoutForPriorityLevel(priorityLevel) {
  switch (priorityLevel) {
    case ImmediatePriority:
      return IMMEDIATE_PRIORITY_TIMEOUT;
    case UserBlockingPriority:
      return USER_BLOCKING_PRIORITY;
    case IdlePriority:
      return IDLE_PRIORITY;
    case LowPriority:
      return LOW_PRIORITY_TIMEOUT;
    case NormalPriority:
    default:
      return NORMAL_PRIORITY_TIMEOUT;
  }
}
```

### insertScheduledTask

```js
function insertScheduledTask(newTask, expirationTime) {
    // Insert the new task into the list, ordered first by its timeout, then by
    // insertion. So the new task is inserted after any other task the
    // same timeout
    if (firstTask === null) {
        // 第一个任务
        // This is the first task in the list.
        firstTask = newTask.next = newTask.previous = newTask;
    } else {
        var next = null;
        var task = firstTask;
        do {
            if (expirationTime < task.expirationTime) {
                // The new task times out before this one.
                next = task;
                break;
            }
            task = task.next;
        } while (task !== firstTask);

        if (next === null) {
            // No task with a later timeout was found, which means the new task has
            // the latest timeout in the list.
            next = firstTask;
        } else if (next === firstTask) {
            // The new task has the earliest expiration in the entire list.
            firstTask = newTask;
        }

        var previous = next.previous;
        previous.next = next.previous = newTask;
        newTask.next = next;
        newTask.previous = previous;
    }
}
```

### requestHostCallback

```js
requestHostCallback = function (callback) {
    if (scheduledHostCallback === null) {
        scheduledHostCallback = callback;
        if (!isAnimationFrameScheduled) {
            // If rAF didn't already schedule one, we need to schedule a frame.
            // TODO: If this rAF doesn't materialize because the browser throttles,
            // we might want to still have setTimeout trigger rIC as a backup to
            // ensure that we keep performing work.
            isAnimationFrameScheduled = true;
            requestAnimationFrameWithTimeout(animationTick);
        }
    }
};
```

### requestAnimationFrameWithTimeout

`equestAnimationFrame`在后台时会停止工作，所以需要`localSetTimeout`辅助

把渲染流程放在了`requestAnimationFrame`或`setTimeOut`里面

`requestAnimationFrame`使得在一次同步事件中的所有更改都一起处理

最后的处理就是`callback`了

```js
// requestAnimationFrame does not run when the tab is in the background. If
// we're backgrounded we prefer for that work to happen so that the page
// continues to load in the background. So we also schedule a 'setTimeout' as
// a fallback.
// TODO: Need a better heuristic for backgrounded work.
const ANIMATION_FRAME_TIMEOUT = 100;
let rAFID;
let rAFTimeoutID;
const requestAnimationFrameWithTimeout = function (callback) {
    // schedule rAF and also a setTimeout
    rAFID = localRequestAnimationFrame(function (timestamp) {
        // cancel the setTimeout
        localClearTimeout(rAFTimeoutID);
        callback(timestamp);
    });
    rAFTimeoutID = localSetTimeout(function () {
        // cancel the requestAnimationFrame
        localCancelAnimationFrame(rAFID);
        callback(getCurrentTime());
    }, ANIMATION_FRAME_TIMEOUT);
};
```

### animationTick

```js
const animationTick = function (rafTime) {
    if (scheduledHostCallback !== null) {
        // Eagerly schedule the next animation callback at the beginning of the
        // frame. If the scheduler queue is not empty at the end of the frame, it
        // will continue flushing inside that callback. If the queue *is* empty,
        // then it will exit immediately. Posting the callback at the start of the
        // frame ensures it's fired within the earliest possible frame. If we
        // waited until the end of the frame to post the callback, we risk the
        // browser skipping a frame and not firing the callback until the frame
        // after that.
        requestAnimationFrameWithTimeout(animationTick);
    } else {
        // No pending work. Exit.
        isAnimationFrameScheduled = false;
        return;
    }

    let nextFrameTime = rafTime - frameDeadline + activeFrameTime;
    if (nextFrameTime < activeFrameTime && previousFrameTime < activeFrameTime && !fpsLocked) {
        if (nextFrameTime < 8) {
            // Defensive coding. We don't support higher frame rates than 120hz.
            // If the calculated frame time gets lower than 8, it is probably a bug.
            nextFrameTime = 8;
        }
        // If one frame goes long, then the next one can be short to catch up.
        // If two frames are short in a row, then that's an indication that we
        // actually have a higher frame rate than what we're currently optimizing.
        // We adjust our heuristic dynamically accordingly. For example, if we're
        // running on 120hz display or 90hz VR display.
        // Take the max of the two in case one of them was an anomaly due to
        // missed frame deadlines.
        activeFrameTime = nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime;
    } else {
        previousFrameTime = nextFrameTime;
    }
    frameDeadline = rafTime + activeFrameTime;
    if (!isMessageEventScheduled) {
        isMessageEventScheduled = true;
        port.postMessage(undefined);
    }
};
```

### flushSyncCallbackQueue

`callback`看上方`scheduleCallbackForRoot`里面

```js
export function flushSyncCallbackQueue() {
    if (immediateQueueCallbackNode !== null) {
        Scheduler_cancelCallback(immediateQueueCallbackNode);
    }
    flushSyncCallbackQueueImpl();
}

function flushSyncCallbackQueueImpl() {
    if (!isFlushingSyncQueue && syncQueue !== null) {
        // Prevent re-entrancy.
        isFlushingSyncQueue = true;
        let i = 0;
        try {
            const isSync = true;
            for (; i < syncQueue.length; i++) {
                let callback = syncQueue[i];
                do {
                    callback = callback(isSync);
                } while (callback !== null);
            }
            syncQueue = null;
        } catch (error) {
            // If something throws, leave the remaining callbacks on the queue.
            if (syncQueue !== null) {
                syncQueue = syncQueue.slice(i + 1);
            }
            // Resume flushing in the next tick
            Scheduler_scheduleCallback(Scheduler_ImmediatePriority, flushSyncCallbackQueue);
            throw error;
        } finally {
            isFlushingSyncQueue = false;
        }
    }
}
```

### runRootCallback

`runRootCallback`里面又执行了`renderRoot`

```js
function runRootCallback(root, callback, isSync) {
    debugger;
    const prevCallbackNode = root.callbackNode;
    let continuation = null;
    try {
        continuation = callback(isSync);
        if (continuation !== null) {
            return runRootCallback.bind(null, root, continuation);
        } else {
            return null;
        }
    } finally {
        // If the callback exits without returning a continuation, remove the
        // corresponding callback node from the root. Unless the callback node
        // has changed, which implies that it was already cancelled by a high
        // priority update.
        if (continuation === null && prevCallbackNode === root.callbackNode) {
            root.callbackNode = null;
            root.callbackExpirationTime = NoWork;
        }
    }
}
```

### renderRoot

见 renderRoot.md

之后就是渲染那一套
