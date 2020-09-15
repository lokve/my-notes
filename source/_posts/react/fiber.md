---
title: fiber
tags: react源码解析
date: 2020-9-8 14:00
---

从 `ReactSyncRoot`开始

```js
// dom, 0, false
const root = createContainer(container, tag, hydrate); // FiberRootNode
this._internalRoot = root;
```

`createContainer`在`react-reconciler/inline.dom`,引用的`./src/ReactFiberReconciler`

```js
export function createContainer(
    containerInfo: Container,
    tag: RootTag,
    hydrate: boolean,
): OpaqueRoot {
    // 创建fiberroot
    return createFiberRoot(containerInfo, tag, hydrate);
}
```

```js
export function createFiberRoot(containerInfo: any, tag: RootTag, hydrate: boolean): FiberRoot {
    // 创建fiber对象
    const root: FiberRoot = (new FiberRootNode(containerInfo, tag, hydrate): any);

    // Cyclic construction. This cheats the type system right now because
    // stateNode is any.
    const uninitializedFiber = createHostRootFiber(tag);
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;

    return root;
}
```

创建`FiberRoot`

```js
// 在其他文件定义的常量
export const NoWork = 0;
export const noTimeout = -1;

// 下面有注释
function FiberRootNode(containerInfo, tag, hydrate) {
    this.tag = tag;
    this.current = null;
    this.containerInfo = containerInfo;
    this.pendingChildren = null;
    this.pingCache = null;
    this.finishedExpirationTime = NoWork;
    this.finishedWork = null;
    this.timeoutHandle = noTimeout; // -1
    this.context = null;
    this.pendingContext = null;
    this.hydrate = hydrate;
    this.firstBatch = null;
    this.callbackNode = null;
    this.callbackExpirationTime = NoWork;
    this.firstPendingTime = NoWork;
    this.lastPendingTime = NoWork;
    this.pingTime = NoWork;

    // false 无视
    if (enableSchedulerTracing) {
        this.interactionThreadID = unstable_getThreadID();
        this.memoizedInteractions = new Set();
        this.pendingInteractionMap = new Map();
    }
}
```

在`BaseFiberRootProperties`中有相关注释

```js
type BaseFiberRootProperties = {|
    // The type of root (legacy, batched, concurrent, etc.)
    // 类型0或1或2
    tag: RootTag,

    // Any additional information from the host associated with this root.
    // 根节点挂载元素
    containerInfo: any,
    // Used only by persistent updates.
    pendingChildren: any,
    // The currently active root fiber. This is the mutable root of the tree.
    current: Fiber,

    pingCache: WeakMap<Thenable, Set<ExpirationTime>> | Map<Thenable, Set<ExpirationTime>> | null,

    finishedExpirationTime: ExpirationTime,
    // A finished work-in-progress HostRoot that's ready to be committed.
    finishedWork: Fiber | null,
    // Timeout handle returned by setTimeout. Used to cancel a pending timeout, if
    // it's superseded by a new one.
    timeoutHandle: TimeoutHandle | NoTimeout,
    // Top context object, used by renderSubtreeIntoContainer
    context: Object | null,
    pendingContext: Object | null,
    // Determines if we should attempt to hydrate on the initial mount
    +hydrate: boolean,
    // List of top-level batches. This list indicates whether a commit should be
    // deferred. Also contains completion callbacks.
    // TODO: Lift this into the renderer
    firstBatch: Batch | null,
    // Node returned by Scheduler.scheduleCallback
    callbackNode: *,
    // Expiration of the callback associated with this root
    callbackExpirationTime: ExpirationTime,
    // The earliest pending expiration time that exists in the tree
    firstPendingTime: ExpirationTime,
    // The latest pending expiration time that exists in the tree
    lastPendingTime: ExpirationTime,
    // The time at which a suspended component pinged the root to render again
    pingTime: ExpirationTime,
|};
```

创建`RootFiber`

```js
export function createHostRootFiber(tag: RootTag): Fiber {
    let mode;
    if (tag === ConcurrentRoot) {
        mode = ConcurrentMode | BatchedMode | StrictMode; // 利用二进制特性,一个参数就能同时表示多种状态
    } else if (tag === BatchedRoot) {
        mode = BatchedMode | StrictMode;
    } else {
        mode = NoMode;
    }

    // 3, null, null, 0
    return createFiber(HostRoot, null, null, mode);
}
```

```js
function FiberNode(tag: WorkTag, pendingProps: mixed, key: null | string, mode: TypeOfMode) {
    // Instance
    this.tag = tag; // 标记不同的组件类型 3
    this.key = key; // ReactElement里面的key null
    this.elementType = null; // ReactElement.type，也就是我们调用`createElement`的第一个参数
    this.type = null; // 异步组件resolved之后返回的内容，一般是`function`或者`class`
    this.stateNode = null; // 跟当前Fiber相关本地状态（比如浏览器环境就是DOM节点）

    // Fiber
    this.return = null; // 指向他在Fiber节点树中的`parent`，用来在处理完这个节点之后向上返回
    this.child = null; // 单链表树结构 指向自己的第一个子节点
    this.sibling = null; // 指向自己的兄弟结构 兄弟节点的return指向同一个父节点
    this.index = 0;

    this.ref = null; // ref属性

    this.pendingProps = pendingProps; // 新的变动带来的新的props
    this.memoizedProps = null; // 上一次渲染完成之后的props
    this.updateQueue = null; // 该Fiber对应的组件产生的Update会存放在这个队列里面
    this.memoizedState = null; // 上一次渲染的时候的state
    this.contextDependencies = null; // 一个列表，存放这个Fiber依赖的context

    // 用来描述当前Fiber和他子树的`Bitfield`
    // 共存的模式表示这个子树是否默认是异步渲染的
    // Fiber被创建的时候他会继承父Fiber
    // 其他的标识也可以在创建的时候被设置
    // 但是在创建之后不应该再被修改，特别是他的子Fiber创建之前
    this.mode = mode;

    // Effects
    this.effectTag = NoEffect; // 用来记录Side Effect
    this.nextEffect = null; // 单链表用来快速查找下一个side effect

    this.firstEffect = null; // 子树中第一个side effect
    this.lastEffect = null; // 子树中最后一个side effect

    this.expirationTime = NoWork; // 代表任务在未来的哪个时间点应该被完成 不包括他的子树产生的任务
    this.childExpirationTime = NoWork; // 快速确定子树中是否有不在等待的变化

    // 在Fiber树更新的过程中，每个Fiber都会有一个跟其对应的Fiber
    // 我们称他为`current <==> workInProgress`
    // 在渲染完成之后他们会交换位置
    this.alternate = null;
}

// This is a constructor function, rather than a POJO constructor, still
// please ensure we do the following:
// 1) Nobody should add any instance methods on this. Instance methods can be
//    more difficult to predict when they get optimized and they are almost
//    never inlined properly in static compilers.
// 2) Nobody should rely on `instanceof Fiber` for type testing. We should
//    always know when it is a fiber.
// 3) We might want to experiment with using numeric keys since they are easier
//    to optimize in a non-JIT environment.
// 4) We can easily go from a constructor to a createFiber object literal if that
//    is faster.
// 5) It should be easy to port this to a C struct and keep a C implementation
//    compatible.
const createFiber = function (
    tag: WorkTag,
    pendingProps: mixed,
    key: null | string,
    mode: TypeOfMode,
): Fiber {
    // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
    return new FiberNode(tag, pendingProps, key, mode);
};
```

之后是两个对象的互相引用

```js
root.current = uninitializedFiber; // root即FiberRoot
uninitializedFiber.stateNode = root; // uninitializedFiber即RootFiber
```

`FiberRoot`更多的是和 dom 相关的作用
`RootFiber`更多的是一个虚拟 dom，他也有类似 dom 的树结构，每次 react 跟新，都先处理`RootFiber`，然后在作用于`FiberRoot`,最后更新 dom
