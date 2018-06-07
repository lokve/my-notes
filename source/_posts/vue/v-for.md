---
title:  Vue源码阅读笔记 (v-for)
tags: Vue笔记
date: 2018-6-7 11:08
---

## 开始

在parseHTML首次处理v-for
代码在 vue/src/compiler/parser/index.js

```
parseHTML(template, {
    ...
    start(tag, attrs, unary) {
        ...

        processFor(element);

        ...
    }
}
```

## processFor

代码在 vue/src/compiler/parser/index.js
```
function processFor (el) {
  let exp
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    // forAliasRE /(.*?)\s+(?:in|of)\s+(.*)/ 匹配 * in或者of *
    const inMatch = exp.match(forAliasRE)
    if (!inMatch) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid v-for expression: ${exp}`
      )
      return
    }
    el.for = inMatch[2].trim() // i in 9里面的 9
    const alias = inMatch[1].trim() // i in 9里面的 i

    // forIteratorRE /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/
    const iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      el.alias = iteratorMatch[1].trim() // i
      el.iterator1 = iteratorMatch[2].trim() // 第二个参数
      if (iteratorMatch[3]) {
        el.iterator2 = iteratorMatch[3].trim() // 对象遍历可带第三个参数
      }
    } else {
      el.alias = alias
    }
  }
}
```

element多几个属性

```
element = {
  ...
  alias:"i",
  for:"9",
  iterator1:"index" // 可能有
}
```

## processKey

```
function processKey (el) {
  const exp = getBindingAttr(el, 'key')
  if (exp) {
    if (process.env.NODE_ENV !== 'production' && el.tag === 'template') {
      // template不能加key
      warn(`<template> cannot be keyed. Place the key on real elements instead.`)
    }
    el.key = exp
  }
}

element = {
  ...
  key:"i"
}
```


未完待续