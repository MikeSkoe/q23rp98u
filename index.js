"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
exports.__esModule = true;
exports.docFn = function (str) { return document[str].bind(document); }, exports.q = exports.docFn('querySelector'), exports.c = exports.docFn('createElement'), exports.t = exports.docFn('createTextNode');
var insertAfter = function (oldEl, newEl) { return oldEl.parentNode.insertBefore(newEl, oldEl.nextSibling); };
var camelToDot = function (str) { return str.split('_'); };
var getArgs = function (fn) { return ('' + fn).match(/(\(|^)(?<a>.+?)[=\)]/).groups['a'].trim().split(', '); };
var notIn = function (arr) { return function (item) { return !arr.some(function (i) { return i.key === item.key; }); }; };
var getIn = function (arr, key) { return arr.find(function (i) { return i.key === key; }); };
var options = {
    'object': function (obj, el) { return el.appendChild(obj); },
    'string': function (str, el) { return options['object'](exports.t(str), el); }
};
var copyObject = function (obj) { return JSON.parse(JSON.stringify(obj)); };
exports.mount = function (el, selector) { return exports.q(selector).appendChild(el); };
exports.h = function (name, attrs) {
    if (attrs === void 0) { attrs = {}; }
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    var style = attrs.style, restAttrs = __rest(attrs, ["style"]);
    var el = Object.assign(exports.c(name), restAttrs);
    Object.assign(el.style, style);
    children.forEach(function (child) { return options[(typeof child)](child, el); });
    return el;
};
var initPubSub = function (callbacks, state) { return ({
    sub: function (keys, fn, unsub) {
        if (unsub === void 0) { unsub = false; }
        fn.args = keys;
        var unsubscribe = function () { return keys.forEach(function (key) {
            return callbacks[key] = callbacks[key].filter(function (f) { return f !== fn; });
        }); };
        keys.forEach(function (key) {
            callbacks[key] = callbacks[key] || [];
            unsub
                ? unsubscribe()
                : callbacks[key].push(fn);
        });
        // TODO: remove copypaste
        keys.concat(['ALL']).forEach(function (key) {
            (callbacks[key] || []).forEach(function (fn) {
                if (key === 'ALL') {
                    fn(state());
                }
                else {
                    fn.apply(void 0, (fn.args || [])
                        .map(function (arg) { return state(arg); }));
                }
            });
        });
        return unsubscribe;
    },
    pub: function (keys, fn) { return function () {
        state(fn(state()));
        keys.concat(['ALL']).forEach(function (key) {
            (callbacks[key] || []).forEach(function (fn) {
                if (key === 'ALL') {
                    fn(state());
                }
                else {
                    fn.apply(void 0, (fn.args || [])
                        .map(function (arg) { return state(arg); }));
                }
            });
        });
    }; }
}); };
var text = function (state, sub) { return function (fn) {
    var fnArgs = getArgs(fn);
    var textNode = exports.t(fn.apply(void 0, fnArgs.map(function (arg) { return state(arg); })));
    sub(fnArgs, function () {
        var stVals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stVals[_i] = arguments[_i];
        }
        return textNode.data = fn.apply(void 0, stVals);
    });
    return textNode;
}; };
var defaultShouldUpdate = function (pV, nV) {
    var prev = JSON.stringify(pV);
    var n = JSON.stringify(nV);
    return JSON.stringify(pV) !== JSON.stringify(nV);
};
var el = function (state, sub) { return function (keys, fn, lifeCycle) {
    if (lifeCycle === void 0) { lifeCycle = { shouldUpdate: defaultShouldUpdate }; }
    var fnArgs = keys;
    lifeCycle.onCreate && lifeCycle.onCreate.apply(lifeCycle, getArgs(lifeCycle.onCreate).map(function (arg) { return state(arg); }));
    var currEl = fn.apply(void 0, fnArgs.map(function (arg) { return state(arg); }));
    var prevVals = fnArgs.map(function (arg) { return state(arg); });
    var subscription = function () {
        var stVals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stVals[_i] = arguments[_i];
        }
        if (!lifeCycle.shouldUpdate
            || lifeCycle.shouldUpdate && lifeCycle.shouldUpdate(prevVals, stVals)) {
            var newEl = fn.apply(void 0, stVals);
            currEl.replaceWith(newEl);
            currEl = newEl;
            lifeCycle.onUpdate && lifeCycle.onUpdate.apply(lifeCycle, getArgs(lifeCycle.onUpdate).map(function (arg) { return state(arg); }));
        }
        prevVals = stVals.slice();
    };
    var unsub = sub(fnArgs, subscription);
    currEl.del = function () {
        lifeCycle.onRemove && lifeCycle.onRemove.apply(lifeCycle, getArgs(lifeCycle.onRemove).map(function (arg) { return state(arg); }));
        unsub();
        currEl.remove();
    };
    return currEl;
}; };
var getSetState = function (initialState) { return function (value) {
    return !value
        ? copyObject(initialState)
        : typeof value === 'string'
            ? camelToDot(value).reduce(function (acc, cur) { return acc[cur]; }, copyObject(initialState))
            : initialState = copyObject(value);
}; };
var map = function (state, sub) {
    return function (fn, shouldUpdate) {
        if (shouldUpdate === void 0) { shouldUpdate = function (pV, nV) { return JSON.stringify(pV) !== JSON.stringify(nV); }; }
        var _a;
        var fnArg = getArgs(fn)[0];
        var arr = state()[fnArg];
        var placeholder = exports.c('div');
        var items = (_a = [placeholder]).concat.apply(_a, arr.map(fn));
        sub([fnArg], function () {
            var stVals = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                stVals[_i] = arguments[_i];
            }
            var newArr = state()[fnArg];
            var addedVals = newArr.filter(function (item) { return !!item && notIn(arr)(item); });
            var removedVals = arr.filter(notIn(newArr));
            var oldWithoutRemoved = arr.filter(notIn(removedVals));
            var newWithoutAdded = newArr.filter(notIn(addedVals));
            var newItems = [];
            removedVals.forEach(function (val) {
                var deleted = getIn(items, val.key);
                deleted.del ? deleted.del() : deleted.remove();
            });
            newWithoutAdded.forEach(function (newVal, index) {
                if (newVal.key === oldWithoutRemoved[index].key
                    && !shouldUpdate(oldWithoutRemoved[index], newVal)) {
                    newItems.push(getIn(items, newVal.key));
                }
                else {
                    var newItem = fn(newVal);
                    var oldItem = getIn(items, oldWithoutRemoved[index].key);
                    insertAfter(oldItem, newItem);
                    newItems.push(newItem);
                    oldItem.del ? oldItem.del() : oldItem.remove();
                }
            });
            addedVals.forEach(function (newVal) {
                var indexOfAfter = newArr.findIndex(function (item) { return item.key === newVal.key; }) - 1;
                var newItem = fn(newVal, indexOfAfter + 1);
                var prevVal = newArr[indexOfAfter];
                insertAfter(prevVal ? getIn(newItems, prevVal.key) : placeholder, newItem);
                newItems.push(newItem);
            });
            items = newItems.length > 0 ? newItems : [placeholder];
            arr = newArr;
        });
        return items;
    };
};
var init = function (initialState) {
    var state = getSetState(initialState);
    var callbacks = {};
    var _a = initPubSub(callbacks, state), pub = _a.pub, sub = _a.sub;
    return {
        sub: sub,
        pub: pub,
        text: text(state, sub),
        el: el(state, sub),
        map: map(state, sub),
        h: exports.h
    };
};
exports["default"] = init;
