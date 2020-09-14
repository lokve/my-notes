### createElement

```js
export function createElement(
    type: string,
    props: Object,
    rootContainerElement: Element | Document,
    parentNamespace: string,
): Element {
    let isCustomComponentTag;

    // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
    // 所属节点(应该就是父节点)
    const ownerDocument: Document = getOwnerDocumentFromRootContainer(rootContainerElement);
    let domElement: Element;
    let namespaceURI = parentNamespace;
    if (namespaceURI === HTML_NAMESPACE) {
        // svg/math/html
        namespaceURI = getIntrinsicNamespace(type);
    }
    // html
    if (namespaceURI === HTML_NAMESPACE) {
        // script 标签
        if (type === 'script') {
            // Create the script via .innerHTML so its "parser-inserted" flag is
            // set to true and it does not execute
            const div = ownerDocument.createElement('div');
            div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
            // This is guaranteed to yield a script element.
            const firstChild = ((div.firstChild: any): HTMLScriptElement);
            domElement = div.removeChild(firstChild);
        } else if (typeof props.is === 'string') {
            // $FlowIssue `createElement` should be updated for Web Components
            domElement = ownerDocument.createElement(type, {is: props.is});
        } else {
            // Separate else branch instead of using `props.is || undefined` above because of a Firefox bug.
            // See discussion in https://github.com/facebook/react/pull/6896
            // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
            domElement = ownerDocument.createElement(type);
            // Normally attributes are assigned in `setInitialDOMProperties`, however the `multiple` and `size`
            // attributes on `select`s needs to be added before `option`s are inserted.
            // This prevents:
            // - a bug where the `select` does not scroll to the correct option because singular
            //  `select` elements automatically pick the first item #13222
            // - a bug where the `select` set the first item as selected despite the `size` attribute #14239
            // See https://github.com/facebook/react/issues/13222
            // and https://github.com/facebook/react/issues/14239

            // select标签
            if (type === 'select') {
                const node = ((domElement: any): HTMLSelectElement);
                if (props.multiple) {
                    node.multiple = true;
                } else if (props.size) {
                    // Setting a size greater than 1 causes a select to behave like `multiple=true`, where
                    // it is possible that no option is selected.
                    //
                    // This is only necessary when a select in "single selection mode".
                    node.size = props.size;
                }
            }
        }
    } else {
        domElement = ownerDocument.createElementNS(namespaceURI, type);
    }

    return domElement;
}
```
