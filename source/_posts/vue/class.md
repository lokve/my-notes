---
title: Vue源码阅读笔记 (class,style)
tags: Vue笔记
date: 2018-6-7 09:43
---

## 开始

在 parseHTML 首次处理 class,style
代码在 vue/src/compiler/parser/index.js

```
parseHTML(template, {
    ...
    start(tag, attrs, unary) {
        ...

        for (let i = 0; i < transforms.length; i++) {
          transforms[i](element, options)
        }

        ...
    }
}
```

transforms 里面包含了两个函数

## class

src/platforms/web/compiler/modules/class.js

```
function transformNode (el: ASTElement, options: CompilerOptions) {
  const warn = options.warn || baseWarn
  const staticClass = getAndRemoveAttr(el, 'class') // 获取class
  if (process.env.NODE_ENV !== 'production' && staticClass) {
    // 判断class="{{value}}"这种情况
    const expression = parseText(staticClass, options.delimiters)
    if (expression) {
      warn(
        `class="${staticClass}": ` +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.'
      )
    }
  }
  // 如果是静态class
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass)
  }
  // 判断:class这种情况
  const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
  if (classBinding) {
    el.classBinding = classBinding
  }
}

// vue/src/compiler/helpers.js
export function getBindingAttr (
  el: ASTElement,
  name: string,
  getStatic?: boolean
): ?string {
  const dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name)
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name)
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

// src/compiler/parser/filter-parser.js
export function parseFilters (exp: string): string {
  let inSingle = false
  let inDouble = false
  let inTemplateString = false
  let inRegex = false
  let curly = 0
  let square = 0
  let paren = 0
  let lastFilterIndex = 0
  let c, prev, i, expression, filters

  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
    if (inSingle) {
      // 0x27 '      0x5C \
      if (c === 0x27 && prev !== 0x5C) inSingle = false
    } else if (inDouble) {
      // 0x22 "
      if (c === 0x22 && prev !== 0x5C) inDouble = false
    } else if (inTemplateString) {
      // 0x60 `
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false
    } else if (inRegex) {
      // 0x2f /
      if (c === 0x2f && prev !== 0x5C) inRegex = false
    } else if (
      c === 0x7C && // pipe  0x7C |
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim()
      } else {
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {
    pushFilter()
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}
```

## style

src/platforms/web/compiler/modules/style.js

```
function transformNode (el: ASTElement, options: CompilerOptions) {
  const warn = options.warn || baseWarn
  const staticStyle = getAndRemoveAttr(el, 'style') // style
  if (staticStyle) {
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production') {
      // style="{{ val }}" 情况
      const expression = parseText(staticStyle, options.delimiters)
      if (expression) {
        warn(
          `style="${staticStyle}": ` +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.'
        )
      }
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
  }

  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}
```
