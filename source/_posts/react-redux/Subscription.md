---
title: selectorFactory
tags: react-redux
date: 2020-9-14 14:00
---

redux 订阅管理

redux 默认 batch 来源

```js
export {unstable_batchedUpdates} from 'react-dom';
setBatch(unstable_batchedUpdates);
```

batchedUpdates, 涉及到 react 跟新机制，在执行 listeners 后，执行同步队列，统一跟新

```js
export function batchedUpdates<A, R>(fn: (A) => R, a: A): R {
    const prevExecutionContext = executionContext;
    executionContext |= BatchedContext;
    try {
        return fn(a);
    } finally {
        executionContext = prevExecutionContext;
        if (executionContext === NoContext) {
            // Flush the immediate callbacks that were scheduled during this batch
            flushSyncCallbackQueue();
        }
    }
}
```

```js
// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

const CLEARED = null;
const nullListeners = {notify() {}};

function createListenerCollection() {
    const batch = getBatch();
    // the current/next pattern is copied from redux's createStore code.
    // TODO: refactor+expose that code to be reusable here?
    let current = [];
    let next = [];

    return {
        clear() {
            next = CLEARED;
            current = CLEARED;
        },

        notify() {
            const listeners = (current = next);
            batch(() => {
                for (let i = 0; i < listeners.length; i++) {
                    listeners[i]();
                }
            });
        },

        get() {
            return next;
        },

        subscribe(listener) {
            let isSubscribed = true;
            if (next === current) next = current.slice();
            next.push(listener);

            return function unsubscribe() {
                if (!isSubscribed || current === CLEARED) return;
                isSubscribed = false;

                if (next === current) next = current.slice();
                next.splice(next.indexOf(listener), 1);
            };
        },
    };
}

export default class Subscription {
    constructor(store, parentSub) {
        // store详细见createStore.md
        this.store = store;
        this.parentSub = parentSub;
        this.unsubscribe = null;
        this.listeners = nullListeners;

        this.handleChangeWrapper = this.handleChangeWrapper.bind(this);
    }

    addNestedSub(listener) {
        this.trySubscribe();
        return this.listeners.subscribe(listener);
    }

    notifyNestedSubs() {
        this.listeners.notify();
    }

    handleChangeWrapper() {
        if (this.onStateChange) {
            // onStateChange = notifyNestedSubs
            this.onStateChange();
        }
    }

    isSubscribed() {
        return Boolean(this.unsubscribe);
    }

    trySubscribe() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.parentSub
                ? this.parentSub.addNestedSub(this.handleChangeWrapper)
                : this.store.subscribe(this.handleChangeWrapper); //  createStore的subscribe，返回一个函数unsubscribe

            this.listeners = createListenerCollection();
        }
    }

    tryUnsubscribe() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
            this.listeners.clear();
            this.listeners = nullListeners;
        }
    }
}
```
