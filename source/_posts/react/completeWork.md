---
title: completeWork
tags: react源码解析
categories:
  - react
date: 2020-9-9 11:00
---

根据 fiber tag 创建 dom 节点

```js
function completeWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderExpirationTime: ExpirationTime,
): Fiber | null {
    const newProps = workInProgress.pendingProps;

    switch (workInProgress.tag) {
        case IndeterminateComponent:
            break;
        case LazyComponent:
            break;
        case SimpleMemoComponent:
        case FunctionComponent:
            break;
        case ClassComponent: {
            const Component = workInProgress.type;
            if (isLegacyContextProvider(Component)) {
                popLegacyContext(workInProgress);
            }
            break;
        }
        case HostRoot: {
            popHostContainer(workInProgress);
            popTopLevelLegacyContextObject(workInProgress);
            const fiberRoot = (workInProgress.stateNode: FiberRoot);
            if (fiberRoot.pendingContext) {
                fiberRoot.context = fiberRoot.pendingContext;
                fiberRoot.pendingContext = null;
            }
            if (current === null || current.child === null) {
                // If we hydrated, pop so that we can delete any remaining children
                // that weren't hydrated.
                popHydrationState(workInProgress);
                // This resets the hacky state to fix isMounted before committing.
                // TODO: Delete this when we delete isMounted and findDOMNode.
                workInProgress.effectTag &= ~Placement;
            }
            updateHostContainer(workInProgress);
            break;
        }
        case HostComponent: {
            // 5
            popHostContext(workInProgress);
            const rootContainerInstance = getRootHostContainer(); // 返回div#app
            const type = workInProgress.type;
            if (current !== null && workInProgress.stateNode != null) {
                updateHostComponent(
                    // 有stateNode（dom）,更新
                    current,
                    workInProgress,
                    type,
                    newProps,
                    rootContainerInstance,
                );

                if (current.ref !== workInProgress.ref) {
                    markRef(workInProgress);
                }
            } else {
                if (!newProps) {
                    invariant(
                        workInProgress.stateNode !== null,
                        'We must have new props for new mounts. This error is likely ' +
                            'caused by a bug in React. Please file an issue.',
                    );
                    // This can happen when we abort work.
                    break;
                }

                // 返回 http://www.w3.org/1999/xhtml
                const currentHostContext = getHostContext();
                // TODO: Move createInstance to beginWork and keep it on a context
                // "stack" as the parent. Then append children as we go in beginWork
                // or completeWork depending on we want to add then top->down or
                // bottom->up. Top->down is faster in IE11.
                let wasHydrated = popHydrationState(workInProgress);
                if (wasHydrated) {
                    // TODO: Move this and createInstance step into the beginPhase
                    // to consolidate.
                    if (
                        prepareToHydrateHostInstance(
                            workInProgress,
                            rootContainerInstance,
                            currentHostContext,
                        )
                    ) {
                        // If changes to the hydrated node needs to be applied at the
                        // commit-phase we mark this as such.
                        markUpdate(workInProgress);
                    }
                } else {
                    // debugger
                    // 根据fiber创建dom
                    // 返回创建的dom节点
                    let instance = createInstance(
                        type,
                        newProps,
                        rootContainerInstance,
                        currentHostContext,
                        workInProgress,
                    );

                    appendAllChildren(instance, workInProgress, false, false); // 添加child ?

                    // Certain renderers require commit-time effects for initial mount.
                    // (eg DOM renderer supports auto-focus for certain elements).
                    // Make sure such renderers get scheduled for later work.
                    if (
                        finalizeInitialChildren(
                            instance,
                            type,
                            newProps,
                            rootContainerInstance,
                            currentHostContext,
                        )
                    ) {
                        markUpdate(workInProgress);
                    }
                    workInProgress.stateNode = instance;
                }

                if (workInProgress.ref !== null) {
                    // If there is a ref on a host node we need to schedule a callback
                    markRef(workInProgress);
                }
            }
            break;
        }
        case HostText: {
            let newText = newProps;
            if (current && workInProgress.stateNode != null) {
                const oldText = current.memoizedProps;
                // If we have an alternate, that means this is an update and we need
                // to schedule a side-effect to do the updates.
                updateHostText(current, workInProgress, oldText, newText);
            } else {
                if (typeof newText !== 'string') {
                    invariant(
                        workInProgress.stateNode !== null,
                        'We must have new props for new mounts. This error is likely ' +
                            'caused by a bug in React. Please file an issue.',
                    );
                    // This can happen when we abort work.
                }
                const rootContainerInstance = getRootHostContainer();
                const currentHostContext = getHostContext();
                let wasHydrated = popHydrationState(workInProgress);
                if (wasHydrated) {
                    if (prepareToHydrateHostTextInstance(workInProgress)) {
                        markUpdate(workInProgress);
                    }
                } else {
                    workInProgress.stateNode = createTextInstance(
                        newText,
                        rootContainerInstance,
                        currentHostContext,
                        workInProgress,
                    );
                }
            }
            break;
        }
        case ForwardRef:
            break;
        case SuspenseComponent: {
            popSuspenseContext(workInProgress);
            const nextState: null | SuspenseState = workInProgress.memoizedState;
            if ((workInProgress.effectTag & DidCapture) !== NoEffect) {
                // Something suspended. Re-render with the fallback children.
                workInProgress.expirationTime = renderExpirationTime;
                // Do not reset the effect list.
                return workInProgress;
            }

            const nextDidTimeout = nextState !== null;
            let prevDidTimeout = false;
            if (current === null) {
                // In cases where we didn't find a suitable hydration boundary we never
                // downgraded this to a DehydratedSuspenseComponent, but we still need to
                // pop the hydration state since we might be inside the insertion tree.
                popHydrationState(workInProgress);
            } else {
                const prevState: null | SuspenseState = current.memoizedState;
                prevDidTimeout = prevState !== null;
                if (!nextDidTimeout && prevState !== null) {
                    // We just switched from the fallback to the normal children.
                    // Delete the fallback.
                    // TODO: Would it be better to store the fallback fragment on
                    // the stateNode during the begin phase?
                    const currentFallbackChild: Fiber | null = (current.child: any).sibling;
                    if (currentFallbackChild !== null) {
                        // Deletions go at the beginning of the return fiber's effect list
                        const first = workInProgress.firstEffect;
                        if (first !== null) {
                            workInProgress.firstEffect = currentFallbackChild;
                            currentFallbackChild.nextEffect = first;
                        } else {
                            workInProgress.firstEffect = workInProgress.lastEffect = currentFallbackChild;
                            currentFallbackChild.nextEffect = null;
                        }
                        currentFallbackChild.effectTag = Deletion;
                    }
                }
            }

            if (nextDidTimeout && !prevDidTimeout) {
                // If this subtreee is running in batched mode we can suspend,
                // otherwise we won't suspend.
                // TODO: This will still suspend a synchronous tree if anything
                // in the concurrent tree already suspended during this render.
                // This is a known bug.
                if ((workInProgress.mode & BatchedMode) !== NoMode) {
                    // TODO: Move this back to throwException because this is too late
                    // if this is a large tree which is common for initial loads. We
                    // don't know if we should restart a render or not until we get
                    // this marker, and this is too late.
                    // If this render already had a ping or lower pri updates,
                    // and this is the first time we know we're going to suspend we
                    // should be able to immediately restart from within throwException.
                    const hasInvisibleChildContext =
                        current === null &&
                        workInProgress.memoizedProps.unstable_avoidThisFallback !== true;
                    if (
                        hasInvisibleChildContext ||
                        hasSuspenseContext(
                            suspenseStackCursor.current,
                            (InvisibleParentSuspenseContext: SuspenseContext),
                        )
                    ) {
                        // If this was in an invisible tree or a new render, then showing
                        // this boundary is ok.
                        renderDidSuspend();
                    } else {
                        // Otherwise, we're going to have to hide content so we should
                        // suspend for longer if possible.
                        renderDidSuspendDelayIfPossible();
                    }
                }
            }

            if (supportsPersistence) {
                // TODO: Only schedule updates if not prevDidTimeout.
                if (nextDidTimeout) {
                    // If this boundary just timed out, schedule an effect to attach a
                    // retry listener to the proimse. This flag is also used to hide the
                    // primary children.
                    workInProgress.effectTag |= Update;
                }
            }
            if (supportsMutation) {
                // TODO: Only schedule updates if these values are non equal, i.e. it changed.
                if (nextDidTimeout || prevDidTimeout) {
                    // If this boundary just timed out, schedule an effect to attach a
                    // retry listener to the proimse. This flag is also used to hide the
                    // primary children. In mutation mode, we also need the flag to
                    // *unhide* children that were previously hidden, so check if the
                    // is currently timed out, too.
                    workInProgress.effectTag |= Update;
                }
            }
            break;
        }
        case Fragment:
            break;
        case Mode:
            break;
        case Profiler:
            break;
        case HostPortal:
            popHostContainer(workInProgress);
            updateHostContainer(workInProgress);
            break;
        case ContextProvider:
            // Pop provider fiber
            popProvider(workInProgress);
            break;
        case ContextConsumer:
            break;
        case MemoComponent:
            break;
        case IncompleteClassComponent: {
            // Same as class component case. I put it down here so that the tags are
            // sequential to ensure this switch is compiled to a jump table.
            const Component = workInProgress.type;
            if (isLegacyContextProvider(Component)) {
                popLegacyContext(workInProgress);
            }
            break;
        }
        case DehydratedSuspenseComponent: {
            if (enableSuspenseServerRenderer) {
                popSuspenseContext(workInProgress);
                if (current === null) {
                    let wasHydrated = popHydrationState(workInProgress);
                    invariant(
                        wasHydrated,
                        'A dehydrated suspense component was completed without a hydrated node. ' +
                            'This is probably a bug in React.',
                    );
                    if (enableSchedulerTracing) {
                        markDidDeprioritizeIdleSubtree();
                    }
                    skipPastDehydratedSuspenseInstance(workInProgress);
                } else if ((workInProgress.effectTag & DidCapture) === NoEffect) {
                    // This boundary did not suspend so it's now hydrated.
                    // To handle any future suspense cases, we're going to now upgrade it
                    // to a Suspense component. We detach it from the existing current fiber.
                    current.alternate = null;
                    workInProgress.alternate = null;
                    workInProgress.tag = SuspenseComponent;
                    workInProgress.memoizedState = null;
                    workInProgress.stateNode = null;
                }
            }
            break;
        }
        case SuspenseListComponent: {
            popSuspenseContext(workInProgress);

            if ((workInProgress.effectTag & DidCapture) === NoEffect) {
                // This is the first pass. We need to figure out if anything is still
                // suspended in the rendered set.
                const renderedChildren = workInProgress.child;
                // If new content unsuspended, but there's still some content that
                // didn't. Then we need to do a second pass that forces everything
                // to keep showing their fallbacks.
                const needsRerender = hasSuspendedChildrenAndNewContent(
                    workInProgress,
                    renderedChildren,
                );
                if (needsRerender) {
                    // Rerender the whole list, but this time, we'll force fallbacks
                    // to stay in place.
                    workInProgress.effectTag |= DidCapture;
                    // Reset the effect list before doing the second pass since that's now invalid.
                    workInProgress.firstEffect = workInProgress.lastEffect = null;
                    // Schedule work so we know not to bail out.
                    workInProgress.expirationTime = renderExpirationTime;
                    return workInProgress;
                }
            } else {
                workInProgress.effectTag &= ~DidCapture;
            }
            break;
        }
        case EventComponent: {
            if (enableEventAPI) {
                popHostContext(workInProgress);
                const rootContainerInstance = getRootHostContainer();
                const responder = workInProgress.type.responder;
                let eventComponentInstance: ReactEventComponentInstance | null =
                    workInProgress.stateNode;

                if (eventComponentInstance === null) {
                    let responderState = null;
                    if (__DEV__ && !responder.allowMultipleHostChildren) {
                        const hostChildrenCount = getEventComponentHostChildrenCount(
                            workInProgress,
                        );
                        warning(
                            (hostChildrenCount || 0) < 2,
                            'A "<%s>" event component cannot contain multiple host children.',
                            getComponentName(workInProgress.type),
                        );
                    }
                    if (responder.createInitialState !== undefined) {
                        responderState = responder.createInitialState(newProps);
                    }
                    eventComponentInstance = workInProgress.stateNode = {
                        currentFiber: workInProgress,
                        props: newProps,
                        responder,
                        rootEventTypes: null,
                        rootInstance: rootContainerInstance,
                        state: responderState,
                    };
                    markUpdate(workInProgress);
                } else {
                    // Update the props on the event component state node
                    eventComponentInstance.props = newProps;
                    // Update the root container, so we can properly unmount events at some point
                    eventComponentInstance.rootInstance = rootContainerInstance;
                    // Update the current fiber
                    eventComponentInstance.currentFiber = workInProgress;
                    updateEventComponent(eventComponentInstance);
                }
            }
            break;
        }
        case EventTarget: {
            if (enableEventAPI) {
                popHostContext(workInProgress);
                const type = workInProgress.type.type;
                const rootContainerInstance = getRootHostContainer();
                const shouldUpdate = handleEventTarget(
                    type,
                    newProps,
                    rootContainerInstance,
                    workInProgress,
                );
                // Update the latest props on the stateNode. This is used
                // during the event phase to find the most current props.
                workInProgress.stateNode.props = newProps;
                if (shouldUpdate) {
                    markUpdate(workInProgress);
                }
            }
            break;
        }
        default:
            invariant(
                false,
                'Unknown unit of work tag. This error is likely caused by a bug in ' +
                    'React. Please file an issue.',
            );
    }

    return null;
}
```

### createInstance

```js
export function createInstance(
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object,
): Instance {
    let parentNamespace: string;
    if (__DEV__) {
        // ...
    } else {
        parentNamespace = ((hostContext: any): HostContextProd);
    }
    // 获得当前的dom实例 createElement结果
    const domElement: Instance = createElement(type, props, rootContainerInstance, parentNamespace);
    // 给dom添加属性指向对应fiber
    precacheFiberNode(internalInstanceHandle, domElement);
    // 给dom添加属性指向对应props
    updateFiberProps(domElement, props);
    return domElement;
}
```

### appendAllChildren

```js
// 在浏览器环境中他固定为true
if (supportsMutation) {
    // Mutation mode

    appendAllChildren = function (
        parent: Instance,
        workInProgress: Fiber,
        needsVisibilityToggle: boolean,
        isHidden: boolean,
    ) {
        // We only have the top Fiber that was created but we need recurse down its
        // children to find all the terminal nodes.
        let node = workInProgress.child;
        while (node !== null) {
            if (node.tag === HostComponent || node.tag === HostText) {
                appendInitialChild(parent, node.stateNode);
            } else if (node.tag === HostPortal) {
                // If we have a portal child, then we don't want to traverse
                // down its children. Instead, we'll get insertions from each child in
                // the portal directly.
            } else if (node.child !== null) {
                node.child.return = node;
                node = node.child;
                continue;
            }
            if (node === workInProgress) {
                return;
            }
            while (node.sibling === null) {
                if (node.return === null || node.return === workInProgress) {
                    return;
                }
                node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
        }
    };
}
```

### finalizeInitialChildren

```js
export function finalizeInitialChildren(
    domElement: Instance,
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
): boolean {
    setInitialProperties(domElement, type, props, rootContainerInstance);
    // 判断是否需要autoFocus
    return shouldAutoFocusHostComponent(type, props);
}
```

### setInitialProperties

```js
export function setInitialProperties(
    domElement: Element,
    tag: string,
    rawProps: Object,
    rootContainerElement: Element | Document,
): void {
    const isCustomComponentTag = isCustomComponent(tag, rawProps); // 是否自定义标签

    // TODO: Make sure that we check isMounted before firing any of these events.
    let props: Object;
    switch (
        tag // 给以下特殊标签添加默认事件
    ) {
        case 'iframe':
        case 'object':
        case 'embed':
            trapBubbledEvent(TOP_LOAD, domElement);
            props = rawProps;
            break;
        case 'video':
        case 'audio':
            // Create listener for each media event
            for (let i = 0; i < mediaEventTypes.length; i++) {
                trapBubbledEvent(mediaEventTypes[i], domElement);
            }
            props = rawProps;
            break;
        case 'source':
            trapBubbledEvent(TOP_ERROR, domElement);
            props = rawProps;
            break;
        case 'img':
        case 'image':
        case 'link':
            trapBubbledEvent(TOP_ERROR, domElement);
            trapBubbledEvent(TOP_LOAD, domElement);
            props = rawProps;
            break;
        case 'form':
            trapBubbledEvent(TOP_RESET, domElement);
            trapBubbledEvent(TOP_SUBMIT, domElement);
            props = rawProps;
            break;
        case 'details':
            trapBubbledEvent(TOP_TOGGLE, domElement);
            props = rawProps;
            break;
        case 'input':
            ReactDOMInputInitWrapperState(domElement, rawProps);
            props = ReactDOMInputGetHostProps(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, 'onChange');
            break;
        case 'option':
            ReactDOMOptionValidateProps(domElement, rawProps);
            props = ReactDOMOptionGetHostProps(domElement, rawProps);
            break;
        case 'select':
            ReactDOMSelectInitWrapperState(domElement, rawProps);
            props = ReactDOMSelectGetHostProps(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, 'onChange');
            break;
        case 'textarea':
            ReactDOMTextareaInitWrapperState(domElement, rawProps);
            props = ReactDOMTextareaGetHostProps(domElement, rawProps);
            trapBubbledEvent(TOP_INVALID, domElement);
            // For controlled components we always need to ensure we're listening
            // to onChange. Even if there is no listener.
            ensureListeningTo(rootContainerElement, 'onChange');
            break;
        default:
            props = rawProps;
    }

    assertValidProps(tag, props); // 判断props合法
    setInitialDOMProperties(
        // 根据props设置dom属性, 事件绑定的开始
        tag,
        domElement,
        rootContainerElement,
        props,
        isCustomComponentTag,
    );

    switch (tag) {
        case 'input':
            // TODO: Make sure we check if this is still unmounted or do any clean
            // up necessary since we never stop tracking anymore.
            track((domElement: any));
            ReactDOMInputPostMountWrapper(domElement, rawProps, false);
            break;
        case 'textarea':
            // TODO: Make sure we check if this is still unmounted or do any clean
            // up necessary since we never stop tracking anymore.
            track((domElement: any));
            ReactDOMTextareaPostMountWrapper(domElement, rawProps);
            break;
        case 'option':
            ReactDOMOptionPostMountWrapper(domElement, rawProps);
            break;
        case 'select':
            ReactDOMSelectPostMountWrapper(domElement, rawProps);
            break;
        default:
            if (typeof props.onClick === 'function') {
                // TODO: This cast may not be sound for SVG, MathML or custom elements.
                trapClickOnNonInteractiveElement(((domElement: any): HTMLElement));
            }
            break;
    }
}
```
