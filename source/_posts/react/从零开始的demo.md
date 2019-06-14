---
title:  文件执行
tags: react
date: 2019-2-12
---

在index.js打断点

``` index.js

import ...

debugger;

ReactDOM.render(<LocaleProvider locale={zhCN}><App /></LocaleProvider>, document.querySelector('#app'));
```

首先是把es6写法的react标签转化成了一个对象树，(react/src/ReactElement的createEmement)。
```
const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };
```

然后执行`ReactDOM.render`，(react-dom/src/client/ReactDOM.js?673)
```
render(
    element: React$Element<any>,
    container: DOMContainer,
    callback: ?Function,
  )
```
render有三个参数，element(被转换成对象的reactdom),container(react渲染根节点)，callback(回调函数)

```
render --> legacyRenderSubtreeIntoContainer --> legacyCreateRootFromDOMContainer --> ReactRoot --> createContainer(ReactFiberReconciler) --> createFiberRoot(ReactFiberRoot)
```

一长串的连续调用从`legacyRenderSubtreeIntoContainer`开始,到`legacyCreateRootFromDOMContainer`里基本是一些判断，最后return了`ReactRoot`
``` legacyCreateRootFromDOMContainer方法
const isConcurrent = false;
// div#app, false, false
return new ReactRoot(container, isConcurrent, shouldHydrate);
```
继续跟进
``` ReactDom
function ReactRoot(
  container: DOMContainer,
  isConcurrent: boolean,
  hydrate: boolean,
) {
  const root = createContainer(container, isConcurrent, hydrate);
  this._internalRoot = root;
}
```

``` ReactFiberReconciler
export function createContainer(
  containerInfo: Container,
  isConcurrent: boolean,
  hydrate: boolean,
): OpaqueRoot {
  return createFiberRoot(containerInfo, isConcurrent, hydrate);
}
export function createFiberRoot(
  containerInfo: any,
  isConcurrent: boolean,
  hydrate: boolean,
): FiberRoot {
  const uninitializedFiber = createHostRootFiber(isConcurrent);
  
  let root;
  if (enableSchedulerTracing) {
    root = {
      current: uninitializedFiber,
      ...
    };
  } else {
    root = {
      current: uninitializedFiber,
      ...
    }  
  }

  uninitializedFiber.stateNode = root;

  return ((root: any): FiberRoot);
}
```
uninitializedFiber是FiberNode
```
{
  alternate: null
  child: null
  childExpirationTime: 0
  contextDependencies: null
  effectTag: 0
  elementType: null
  expirationTime: 0
  firstEffect: null
  index: 0
  key: null
  lastEffect: null
  memoizedProps: null
  memoizedState: null
  mode: 0
  nextEffect: null
  pendingProps: null
  ref: null
  return: null
  sibling: null
  stateNode: null
  tag: 3
  type: null
  updateQueue: null
}
```
root的current是uninitializedFiber，uninitializedFiber的stateNode是root
``` legacyRenderSubtreeIntoContainer方法
  let root: Root = (container._reactRootContainer: any);
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Initial mount should not be batched.
    unbatchedUpdates(() => {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback,
        );
      } else {
        root.render(children, callback);
      }
    });
  } else {
    ...
  }

...

/*
_internalRoot:
containerInfo: div#app
context: null
current: FiberNode {tag: 3, key: null, elementType: null, type: null, stateNode: {…}, …}
didError: false
earliestPendingTime: 0
earliestSuspendedTime: 0
expirationTime: 0
finishedWork: null
firstBatch: null
hydrate: false
latestPendingTime: 0
latestPingedTime: 0
latestSuspendedTime: 0
nextExpirationTimeToWorkOn: 0
nextScheduledRoot: null
pendingChildren: null
pendingCommitExpirationTime: 0
pendingContext: null
pingCache: null
timeoutHandle: -1
 */
```
现在是第一次进入，还不存在container._reactRootContainer,所以进了if
执行函数，运行`root.render(children, callback)`，即`ReactRoot.render`

```
unbatchedUpdates -> root.render -> updateContainer -> updateContainerAtExpirationTime -> scheduleRootUpdate -> 
```

在updateContainer里面涉及到了reactfiber的任务时间调度
```
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): ExpirationTime {
  const current = container.current; // FiberNode
  const currentTime = requestCurrentTime(); // 当前时间
  const expirationTime = computeExpirationForFiber(currentTime, current); // 计算过期时间
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback,
  );
}
```

```
function scheduleRootUpdate(
  current: Fiber,
  element: ReactNodeList,
  expirationTime: ExpirationTime,
  callback: ?Function,
) {
  ...
  const update = createUpdate(expirationTime);
  // 返回了一个对象
  /*
  return {
    expirationTime: expirationTime,

    tag: UpdateState,
    payload: null,
    callback: null,

    next: null,
    nextEffect: null,
  };
   */


  // Caution: React DevTools currently depends on this property
  // being called "element".
  update.payload = {element};

  callback = callback === undefined ? null : callback;
  ...

  flushPassiveEffects(); // 现在什么都没做

  // 给current添加了updateQueue,updateQueue包含了firstUpdate和lastUpdate
  /**
  updateQueue:
    baseState: null
    firstCapturedEffect: null
    firstCapturedUpdate: null
    firstEffect: null
    firstUpdate: {expirationTime: 1073741823, tag: 0, payload: {…}, callback: ƒ, next: null, …}
    lastCapturedEffect: null
    lastCapturedUpdate: null
    lastEffect: null
    lastUpdate: {expirationTime: 1073741823, tag: 0, payload: {…}, callback: ƒ, next: null, …}
    __proto__: Object
   */
  enqueueUpdate(current, update);
  
  // TODO this look 
  scheduleWork(current, expirationTime);

  return expirationTime;
}
```