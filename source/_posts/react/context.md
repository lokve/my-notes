## 创建

### createContext

```js
export function createContext<T>(
    defaultValue: T,
    calculateChangedBits: ?(a: T, b: T) => number,
): ReactContext<T> {
    if (calculateChangedBits === undefined) {
        calculateChangedBits = null;
    } else {
        if (__DEV__) {
            warningWithoutStack(
                calculateChangedBits === null || typeof calculateChangedBits === 'function',
                'createContext: Expected the optional second argument to be a ' +
                    'function. Instead received: %s',
                calculateChangedBits,
            );
        }
    }

    const context: ReactContext<T> = {
        $$typeof: REACT_CONTEXT_TYPE,
        _calculateChangedBits: calculateChangedBits,
        // As a workaround to support multiple concurrent renderers, we categorize
        // some renderers as primary and others as secondary. We only expect
        // there to be two concurrent renderers at most: React Native (primary) and
        // Fabric (secondary); React DOM (primary) and React ART (secondary).
        // Secondary renderers store their context values on separate fields.
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        // Used to track how many concurrent renderers this context currently
        // supports within in a single renderer. Such as parallel server rendering.
        _threadCount: 0,
        // These are circular
        Provider: (null: any),
        Consumer: (null: any),
    };

    context.Provider = {
        $$typeof: REACT_PROVIDER_TYPE,
        _context: context,
    };

    let hasWarnedAboutUsingNestedContextConsumers = false;
    let hasWarnedAboutUsingConsumerProvider = false;

    if (__DEV__) {
        // ...
    } else {
        context.Consumer = context;
    }

    return context;
}
```

## 跟新数据

### updateContextProvider

处理 fiber 时

```js
// case ContextProvider:
//      return updateContextProvider(current, workInProgress, renderExpirationTime);

function updateContextProvider(
    current: Fiber | null,
    workInProgress: Fiber,
    renderExpirationTime: ExpirationTime,
) {
    const providerType: ReactProviderType<any> = workInProgress.type;
    const context: ReactContext<any> = providerType._context;

    const newProps = workInProgress.pendingProps;
    const oldProps = workInProgress.memoizedProps;

    const newValue = newProps.value;

    pushProvider(workInProgress, newValue);

    if (oldProps !== null) {
        const oldValue = oldProps.value;
        const changedBits = calculateChangedBits(context, newValue, oldValue);
        if (changedBits === 0) {
            // No change. Bailout early if children are the same.
            if (oldProps.children === newProps.children && !hasLegacyContextChanged()) {
                return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime);
            }
        } else {
            // The context value changed. Search for matching consumers and schedule
            // them to update.
            propagateContextChange(workInProgress, context, changedBits, renderExpirationTime);
        }
    }

    const newChildren = newProps.children;
    reconcileChildren(current, workInProgress, newChildren, renderExpirationTime);
    return workInProgress.child;
}
```

### pushProvider

context.\_currentValue = nextValue;

```js
export function pushProvider<T>(providerFiber: Fiber, nextValue: T): void {
    const context: ReactContext<T> = providerFiber.type._context;

    if (isPrimaryRenderer) {
        push(valueCursor, context._currentValue, providerFiber);

        context._currentValue = nextValue;
    } else {
        push(valueCursor, context._currentValue2, providerFiber);

        context._currentValue2 = nextValue;
    }
}
```

### propagateContextChange

```js
export function propagateContextChange(
    workInProgress: Fiber,
    context: ReactContext<mixed>,
    changedBits: number,
    renderExpirationTime: ExpirationTime,
): void {
    let fiber = workInProgress.child;
    if (fiber !== null) {
        // Set the return pointer of the child to the work-in-progress fiber.
        fiber.return = workInProgress;
    }
    while (fiber !== null) {
        let nextFiber;

        // Visit this fiber.
        const list = fiber.contextDependencies;
        if (list !== null) {
            nextFiber = fiber.child;

            let dependency = list.first;
            while (dependency !== null) {
                // Check if the context matches.
                if (
                    dependency.context === context &&
                    (dependency.observedBits & changedBits) !== 0
                ) {
                    // Match! Schedule an update on this fiber.

                    if (fiber.tag === ClassComponent) {
                        // Schedule a force update on the work-in-progress.
                        const update = createUpdate(renderExpirationTime, null);
                        update.tag = ForceUpdate;
                        // TODO: Because we don't have a work-in-progress, this will add the
                        // update to the current fiber, too, which means it will persist even if
                        // this render is thrown away. Since it's a race condition, not sure it's
                        // worth fixing.
                        enqueueUpdate(fiber, update);
                    }

                    if (fiber.expirationTime < renderExpirationTime) {
                        fiber.expirationTime = renderExpirationTime;
                    }
                    let alternate = fiber.alternate;
                    if (alternate !== null && alternate.expirationTime < renderExpirationTime) {
                        alternate.expirationTime = renderExpirationTime;
                    }

                    scheduleWorkOnParentPath(fiber.return, renderExpirationTime);

                    // Mark the expiration time on the list, too.
                    if (list.expirationTime < renderExpirationTime) {
                        list.expirationTime = renderExpirationTime;
                    }

                    // Since we already found a match, we can stop traversing the
                    // dependency list.
                    break;
                }
                dependency = dependency.next;
            }
        } else if (fiber.tag === ContextProvider) {
            // Don't scan deeper if this is a matching provider
            nextFiber = fiber.type === workInProgress.type ? null : fiber.child;
        } else if (enableSuspenseServerRenderer && fiber.tag === DehydratedSuspenseComponent) {
            // If a dehydrated suspense component is in this subtree, we don't know
            // if it will have any context consumers in it. The best we can do is
            // mark it as having updates on its children.
            if (fiber.expirationTime < renderExpirationTime) {
                fiber.expirationTime = renderExpirationTime;
            }
            let alternate = fiber.alternate;
            if (alternate !== null && alternate.expirationTime < renderExpirationTime) {
                alternate.expirationTime = renderExpirationTime;
            }
            // This is intentionally passing this fiber as the parent
            // because we want to schedule this fiber as having work
            // on its children. We'll use the childExpirationTime on
            // this fiber to indicate that a context has changed.
            scheduleWorkOnParentPath(fiber, renderExpirationTime);
            nextFiber = fiber.sibling;
        } else {
            // Traverse down.
            nextFiber = fiber.child;
        }

        if (nextFiber !== null) {
            // Set the return pointer of the child to the work-in-progress fiber.
            nextFiber.return = fiber;
        } else {
            // No child. Traverse to next sibling.
            nextFiber = fiber;
            while (nextFiber !== null) {
                if (nextFiber === workInProgress) {
                    // We're back to the root of this subtree. Exit.
                    nextFiber = null;
                    break;
                }
                let sibling = nextFiber.sibling;
                if (sibling !== null) {
                    // Set the return pointer of the sibling to the work-in-progress fiber.
                    sibling.return = nextFiber.return;
                    nextFiber = sibling;
                    break;
                }
                // No more siblings. Traverse up.
                nextFiber = nextFiber.return;
            }
        }
        fiber = nextFiber;
    }
}
```

## 读取

在 function 组件中

### useContext

```js
export function useContext<T>(
    Context: ReactContext<T>,
    unstable_observedBits: number | boolean | void,
) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useContext(Context, unstable_observedBits);
}
```

useContext 是只读的，用于获取 context 数据

在 class 组件中

```js
if (typeof contextType === 'object' && contextType !== null) {
    context = readContext((contextType: any));
}

// ctor即class定义
const instance = new ctor(props, context);

function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    // If a component has string refs, we will assign a different object later.
    this.refs = emptyObject;
    // We initialize the default updater but the real one gets injected by the
    // renderer.
    this.updater = updater || ReactNoopUpdateQueue;
}
```

### readContext

读取 `context._currentValue`

```js
export function readContext<T>(context: ReactContext<T>, observedBits: void | number | boolean): T {
    if (lastContextWithAllBitsObserved === context) {
        // Nothing to do. We already observe everything in this context.
    } else if (observedBits === false || observedBits === 0) {
        // Do not observe any updates.
    } else {
        let resolvedObservedBits; // Avoid deopting on observable arguments or heterogeneous types.
        if (typeof observedBits !== 'number' || observedBits === MAX_SIGNED_31_BIT_INT) {
            // Observe all updates.
            lastContextWithAllBitsObserved = ((context: any): ReactContext<mixed>);
            resolvedObservedBits = MAX_SIGNED_31_BIT_INT;
        } else {
            resolvedObservedBits = observedBits;
        }

        let contextItem = {
            context: ((context: any): ReactContext<mixed>),
            observedBits: resolvedObservedBits,
            next: null,
        };

        if (lastContextDependency === null) {
            invariant(
                currentlyRenderingFiber !== null,
                'Context can only be read while React is rendering. ' +
                    'In classes, you can read it in the render method or getDerivedStateFromProps. ' +
                    'In function components, you can read it directly in the function body, but not ' +
                    'inside Hooks like useReducer() or useMemo().',
            );

            // This is the first dependency for this component. Create a new list.
            lastContextDependency = contextItem;
            currentlyRenderingFiber.contextDependencies = {
                first: contextItem,
                expirationTime: NoWork,
            };
        } else {
            // Append a new context item.
            lastContextDependency = lastContextDependency.next = contextItem;
        }
    }
    return isPrimaryRenderer ? context._currentValue : context._currentValue2;
}
```

### Context.Consumer

还是执行 readContext 获取，然后 child(value)

```js
function updateContextConsumer(
    current: Fiber | null,
    workInProgress: Fiber,
    renderExpirationTime: ExpirationTime,
) {
    let context: ReactContext<any> = workInProgress.type;
    // The logic below for Context differs depending on PROD or DEV mode. In
    // DEV mode, we create a separate object for Context.Consumer that acts
    // like a proxy to Context. This proxy object adds unnecessary code in PROD
    // so we use the old behaviour (Context.Consumer references Context) to
    // reduce size and overhead. The separate object references context via
    // a property called "_context", which also gives us the ability to check
    // in DEV mode if this property exists or not and warn if it does not.
    const newProps = workInProgress.pendingProps;
    const render = newProps.children;

    prepareToReadContext(workInProgress, renderExpirationTime);
    const newValue = readContext(context, newProps.unstable_observedBits);
    let newChildren;
    if (__DEV__) {
        ReactCurrentOwner.current = workInProgress;
        setCurrentPhase('render');
        newChildren = render(newValue);
        setCurrentPhase(null);
    } else {
        newChildren = render(newValue);
    }

    // React DevTools reads this flag.
    workInProgress.effectTag |= PerformedWork;
    reconcileChildren(current, workInProgress, newChildren, renderExpirationTime);
    return workInProgress.child;
}
```
