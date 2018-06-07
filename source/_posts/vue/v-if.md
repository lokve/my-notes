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

        processIf(element);

        ...
    }
}
```

## processIf

代码在 vue/src/compiler/parser/index.js
```
function processIf (el) {
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
    addIfCondition(el, {
      exp: exp,
      block: el
    })
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true
    }
    const elseif = getAndRemoveAttr(el, 'v-else-if')
    if (elseif) {
      el.elseif = elseif
    }
  }
}

function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  el.ifConditions.push(condition)
}
```

element多几个属性

```
element = {
  ...
  if:"i % 2 === 0",
  ifConditions: [{
    block: el, // 所在元素，就是element
    exp: "i % 2 === 0"
  }]

}
```

未完待续