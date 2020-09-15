---
title: Provider
tags: react-redux
date: 2020-9-14 10:00
---

### Provider

Provider 接收 3 个参数，context 也可以自定义

```js
function Provider({store, context, children}) {
    const contextValue = useMemo(() => {
        const subscription = new Subscription(store); // 初始化订阅
        subscription.onStateChange = subscription.notifyNestedSubs; // this.listeners.notify();
        return {
            store,
            subscription,
        };
    }, [store]);

    // 返回store数据
    const previousState = useMemo(() => store.getState(), [store]);

    useEffect(() => {
        const {subscription} = contextValue;
        subscription.trySubscribe(); // 尝试订阅，订阅函数初始化

        if (previousState !== store.getState()) {
            subscription.notifyNestedSubs(); // 遍历执行listener，第一次是空
        }
        return () => {
            subscription.tryUnsubscribe(); // 解绑
            subscription.onStateChange = null;
        };
    }, [contextValue, previousState]);

    const Context = context || ReactReduxContext; // 默认的React.createContext

    // 以react context的方式传递value, Context相关可看react context.md
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
```
