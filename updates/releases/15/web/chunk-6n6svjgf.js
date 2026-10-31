var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  if (mod && typeof mod === "object" || typeof mod === "function") {
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
  }
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __esm = (fn, res, err) => () => {
  if (fn)
    try {
      res = fn(fn = 0);
    } catch (e) {
      err = [e];
    }
  if (err)
    throw err[0];
  return res;
};
var __exportCjs = (target, getters, setters) => {
  for (var name in getters)
    __defProp(target, name, {
      get: getters[name],
      set: setters[name],
      enumerable: true,
      configurable: true
    });
};

// node_modules/.bun/react@19.2.7/node_modules/react/cjs/react.production.js
var exports_react_production = {};
__exportCjs(exports_react_production, {
  Activity: () => $Activity,
  Children: () => $Children,
  Component: () => $Component,
  Fragment: () => $Fragment,
  Profiler: () => $Profiler,
  PureComponent: () => $PureComponent,
  StrictMode: () => $StrictMode,
  Suspense: () => $Suspense,
  __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: () => $__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  __COMPILER_RUNTIME: () => $__COMPILER_RUNTIME,
  cache: () => $cache,
  cacheSignal: () => $cacheSignal,
  cloneElement: () => $cloneElement,
  createContext: () => $createContext,
  createElement: () => $createElement,
  createRef: () => $createRef,
  forwardRef: () => $forwardRef,
  isValidElement: () => $isValidElement,
  lazy: () => $lazy,
  memo: () => $memo,
  startTransition: () => $startTransition,
  unstable_useCacheRefresh: () => $unstable_useCacheRefresh,
  use: () => $use,
  useActionState: () => $useActionState,
  useCallback: () => $useCallback,
  useContext: () => $useContext,
  useDebugValue: () => $useDebugValue,
  useDeferredValue: () => $useDeferredValue,
  useEffect: () => $useEffect,
  useEffectEvent: () => $useEffectEvent,
  useId: () => $useId,
  useImperativeHandle: () => $useImperativeHandle,
  useInsertionEffect: () => $useInsertionEffect,
  useLayoutEffect: () => $useLayoutEffect,
  useMemo: () => $useMemo,
  useOptimistic: () => $useOptimistic,
  useReducer: () => $useReducer,
  useRef: () => $useRef,
  useState: () => $useState,
  useSyncExternalStore: () => $useSyncExternalStore,
  useTransition: () => $useTransition,
  version: () => $version
}, {
  Activity: (value) => $Activity = value,
  Children: (value) => $Children = value,
  Component: (value) => $Component = value,
  Fragment: (value) => $Fragment = value,
  Profiler: (value) => $Profiler = value,
  PureComponent: (value) => $PureComponent = value,
  StrictMode: (value) => $StrictMode = value,
  Suspense: (value) => $Suspense = value,
  __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: (value) => $__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = value,
  __COMPILER_RUNTIME: (value) => $__COMPILER_RUNTIME = value,
  cache: (value) => $cache = value,
  cacheSignal: (value) => $cacheSignal = value,
  cloneElement: (value) => $cloneElement = value,
  createContext: (value) => $createContext = value,
  createElement: (value) => $createElement = value,
  createRef: (value) => $createRef = value,
  forwardRef: (value) => $forwardRef = value,
  isValidElement: (value) => $isValidElement = value,
  lazy: (value) => $lazy = value,
  memo: (value) => $memo = value,
  startTransition: (value) => $startTransition = value,
  unstable_useCacheRefresh: (value) => $unstable_useCacheRefresh = value,
  use: (value) => $use = value,
  useActionState: (value) => $useActionState = value,
  useCallback: (value) => $useCallback = value,
  useContext: (value) => $useContext = value,
  useDebugValue: (value) => $useDebugValue = value,
  useDeferredValue: (value) => $useDeferredValue = value,
  useEffect: (value) => $useEffect = value,
  useEffectEvent: (value) => $useEffectEvent = value,
  useId: (value) => $useId = value,
  useImperativeHandle: (value) => $useImperativeHandle = value,
  useInsertionEffect: (value) => $useInsertionEffect = value,
  useLayoutEffect: (value) => $useLayoutEffect = value,
  useMemo: (value) => $useMemo = value,
  useOptimistic: (value) => $useOptimistic = value,
  useReducer: (value) => $useReducer = value,
  useRef: (value) => $useRef = value,
  useState: (value) => $useState = value,
  useSyncExternalStore: (value) => $useSyncExternalStore = value,
  useTransition: (value) => $useTransition = value,
  version: (value) => $version = value
});
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== "object")
    return null;
  maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
  return typeof maybeIterable === "function" ? maybeIterable : null;
}
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
function ComponentDummy() {}
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
function noop() {}
function ReactElement(type, key, props) {
  var refProp = props.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref: refProp !== undefined ? refProp : null,
    props
  };
}
function cloneAndReplaceKey(oldElement, newKey) {
  return ReactElement(oldElement.type, newKey, oldElement.props);
}
function isValidElement(object) {
  return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function escape(key) {
  var escaperLookup = { "=": "=0", ":": "=2" };
  return "$" + key.replace(/[=:]/g, function(match) {
    return escaperLookup[match];
  });
}
function getElementKey(element, index) {
  return typeof element === "object" && element !== null && element.key != null ? escape("" + element.key) : index.toString(36);
}
function resolveThenable(thenable) {
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenable.reason;
    default:
      switch (typeof thenable.status === "string" ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
        thenable.status === "pending" && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
      }, function(error) {
        thenable.status === "pending" && (thenable.status = "rejected", thenable.reason = error);
      })), thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
      }
  }
  throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
  var type = typeof children;
  if (type === "undefined" || type === "boolean")
    children = null;
  var invokeCallback = false;
  if (children === null)
    invokeCallback = true;
  else
    switch (type) {
      case "bigint":
      case "string":
      case "number":
        invokeCallback = true;
        break;
      case "object":
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
            break;
          case REACT_LAZY_TYPE:
            return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
        }
    }
  if (invokeCallback)
    return callback = callback(children), invokeCallback = nameSoFar === "" ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", invokeCallback != null && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
      return c;
    })) : callback != null && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (callback.key == null || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
  invokeCallback = 0;
  var nextNamePrefix = nameSoFar === "" ? "." : nameSoFar + ":";
  if (isArrayImpl(children))
    for (var i = 0;i < children.length; i++)
      nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
  else if (i = getIteratorFn(children), typeof i === "function")
    for (children = i.call(children), i = 0;!(nameSoFar = children.next()).done; )
      nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
  else if (type === "object") {
    if (typeof children.then === "function")
      return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
    array = String(children);
    throw Error("Objects are not valid as a React child (found: " + (array === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
  }
  return invokeCallback;
}
function mapChildren(children, func, context) {
  if (children == null)
    return children;
  var result = [], count = 0;
  mapIntoArray(children, result, "", "", function(child) {
    return func.call(context, child, count++);
  });
  return result;
}
function lazyInitializer(payload) {
  if (payload._status === -1) {
    var ctor = payload._result;
    ctor = ctor();
    ctor.then(function(moduleObject) {
      if (payload._status === 0 || payload._status === -1)
        payload._status = 1, payload._result = moduleObject;
    }, function(error) {
      if (payload._status === 0 || payload._status === -1)
        payload._status = 2, payload._result = error;
    });
    payload._status === -1 && (payload._status = 0, payload._result = ctor);
  }
  if (payload._status === 1)
    return payload._result.default;
  throw payload._result;
}
var REACT_ELEMENT_TYPE, REACT_PORTAL_TYPE, REACT_FRAGMENT_TYPE, REACT_STRICT_MODE_TYPE, REACT_PROFILER_TYPE, REACT_CONSUMER_TYPE, REACT_CONTEXT_TYPE, REACT_FORWARD_REF_TYPE, REACT_SUSPENSE_TYPE, REACT_MEMO_TYPE, REACT_LAZY_TYPE, REACT_ACTIVITY_TYPE, MAYBE_ITERATOR_SYMBOL, ReactNoopUpdateQueue, assign, emptyObject, pureComponentPrototype, isArrayImpl, ReactSharedInternals, hasOwnProperty, userProvidedKeyEscapeRegex, reportGlobalError, Children, $Activity, $Children, $Component, $Fragment, $Profiler, $PureComponent, $StrictMode, $Suspense, $__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, $__COMPILER_RUNTIME, $cache = function(fn) {
  return function() {
    return fn.apply(null, arguments);
  };
}, $cacheSignal = function() {
  return null;
}, $cloneElement = function(element, config, children) {
  if (element === null || element === undefined)
    throw Error("The argument must be a React element, but you passed " + element + ".");
  var props = assign({}, element.props), key = element.key;
  if (config != null)
    for (propName in config.key !== undefined && (key = "" + config.key), config)
      !hasOwnProperty.call(config, propName) || propName === "key" || propName === "__self" || propName === "__source" || propName === "ref" && config.ref === undefined || (props[propName] = config[propName]);
  var propName = arguments.length - 2;
  if (propName === 1)
    props.children = children;
  else if (1 < propName) {
    for (var childArray = Array(propName), i = 0;i < propName; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  return ReactElement(element.type, key, props);
}, $createContext = function(defaultValue) {
  defaultValue = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: null,
    Consumer: null
  };
  defaultValue.Provider = defaultValue;
  defaultValue.Consumer = {
    $$typeof: REACT_CONSUMER_TYPE,
    _context: defaultValue
  };
  return defaultValue;
}, $createElement = function(type, config, children) {
  var propName, props = {}, key = null;
  if (config != null)
    for (propName in config.key !== undefined && (key = "" + config.key), config)
      hasOwnProperty.call(config, propName) && propName !== "key" && propName !== "__self" && propName !== "__source" && (props[propName] = config[propName]);
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1)
    props.children = children;
  else if (1 < childrenLength) {
    for (var childArray = Array(childrenLength), i = 0;i < childrenLength; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  if (type && type.defaultProps)
    for (propName in childrenLength = type.defaultProps, childrenLength)
      props[propName] === undefined && (props[propName] = childrenLength[propName]);
  return ReactElement(type, key, props);
}, $createRef = function() {
  return { current: null };
}, $forwardRef = function(render) {
  return { $$typeof: REACT_FORWARD_REF_TYPE, render };
}, $isValidElement, $lazy = function(ctor) {
  return {
    $$typeof: REACT_LAZY_TYPE,
    _payload: { _status: -1, _result: ctor },
    _init: lazyInitializer
  };
}, $memo = function(type, compare) {
  return {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare
  };
}, $startTransition = function(scope) {
  var prevTransition = ReactSharedInternals.T, currentTransition = {};
  ReactSharedInternals.T = currentTransition;
  try {
    var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
    onStartTransitionFinish !== null && onStartTransitionFinish(currentTransition, returnValue);
    typeof returnValue === "object" && returnValue !== null && typeof returnValue.then === "function" && returnValue.then(noop, reportGlobalError);
  } catch (error) {
    reportGlobalError(error);
  } finally {
    prevTransition !== null && currentTransition.types !== null && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
  }
}, $unstable_useCacheRefresh = function() {
  return ReactSharedInternals.H.useCacheRefresh();
}, $use = function(usable) {
  return ReactSharedInternals.H.use(usable);
}, $useActionState = function(action, initialState, permalink) {
  return ReactSharedInternals.H.useActionState(action, initialState, permalink);
}, $useCallback = function(callback, deps) {
  return ReactSharedInternals.H.useCallback(callback, deps);
}, $useContext = function(Context) {
  return ReactSharedInternals.H.useContext(Context);
}, $useDebugValue = function() {}, $useDeferredValue = function(value, initialValue) {
  return ReactSharedInternals.H.useDeferredValue(value, initialValue);
}, $useEffect = function(create, deps) {
  return ReactSharedInternals.H.useEffect(create, deps);
}, $useEffectEvent = function(callback) {
  return ReactSharedInternals.H.useEffectEvent(callback);
}, $useId = function() {
  return ReactSharedInternals.H.useId();
}, $useImperativeHandle = function(ref, create, deps) {
  return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
}, $useInsertionEffect = function(create, deps) {
  return ReactSharedInternals.H.useInsertionEffect(create, deps);
}, $useLayoutEffect = function(create, deps) {
  return ReactSharedInternals.H.useLayoutEffect(create, deps);
}, $useMemo = function(create, deps) {
  return ReactSharedInternals.H.useMemo(create, deps);
}, $useOptimistic = function(passthrough, reducer) {
  return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
}, $useReducer = function(reducer, initialArg, init) {
  return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
}, $useRef = function(initialValue) {
  return ReactSharedInternals.H.useRef(initialValue);
}, $useState = function(initialState) {
  return ReactSharedInternals.H.useState(initialState);
}, $useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
  return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}, $useTransition = function() {
  return ReactSharedInternals.H.useTransition();
}, $version = "19.2.7";
var init_react_production = __esm(() => {
  REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
  REACT_PORTAL_TYPE = Symbol.for("react.portal");
  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
  REACT_PROFILER_TYPE = Symbol.for("react.profiler");
  REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
  REACT_CONTEXT_TYPE = Symbol.for("react.context");
  REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
  REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
  REACT_MEMO_TYPE = Symbol.for("react.memo");
  REACT_LAZY_TYPE = Symbol.for("react.lazy");
  REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
  MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  ReactNoopUpdateQueue = {
    isMounted: function() {
      return false;
    },
    enqueueForceUpdate: function() {},
    enqueueReplaceState: function() {},
    enqueueSetState: function() {}
  };
  assign = Object.assign;
  emptyObject = {};
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partialState, callback) {
    if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null)
      throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  ComponentDummy.prototype = Component.prototype;
  pureComponentPrototype = PureComponent.prototype = new ComponentDummy;
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  isArrayImpl = Array.isArray;
  ReactSharedInternals = { H: null, A: null, T: null, S: null };
  hasOwnProperty = Object.prototype.hasOwnProperty;
  userProvidedKeyEscapeRegex = /\/+/g;
  reportGlobalError = typeof reportError === "function" ? reportError : function(error) {
    if (typeof window === "object" && typeof window.ErrorEvent === "function") {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: typeof error === "object" && error !== null && typeof error.message === "string" ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event))
        return;
    } else if (typeof process === "object" && typeof process.emit === "function") {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  };
  Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(children, function() {
        forEachFunc.apply(this, arguments);
      }, forEachContext);
    },
    count: function(children) {
      var n = 0;
      mapChildren(children, function() {
        n++;
      });
      return n;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children))
        throw Error("React.Children.only expected to receive a single React element child.");
      return children;
    }
  };
  $Activity = REACT_ACTIVITY_TYPE;
  $Children = Children;
  $Component = Component;
  $Fragment = REACT_FRAGMENT_TYPE;
  $Profiler = REACT_PROFILER_TYPE;
  $PureComponent = PureComponent;
  $StrictMode = REACT_STRICT_MODE_TYPE;
  $Suspense = REACT_SUSPENSE_TYPE;
  $__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  $__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(size) {
      return ReactSharedInternals.H.useMemoCache(size);
    }
  };
  $isValidElement = isValidElement;
});

// node_modules/.bun/react@19.2.7/node_modules/react/index.js
var require_react = __commonJS(function(exports, module) {
  init_react_production();
  if (true) {
    module.exports = exports_react_production;
  }
});

// node_modules/.bun/react@19.2.7/node_modules/react/cjs/react-jsx-runtime.production.js
var exports_react_jsx_runtime_production = {};
__exportCjs(exports_react_jsx_runtime_production, {
  Fragment: () => $Fragment2,
  jsx: () => $jsx,
  jsxs: () => $jsxs
}, {
  Fragment: (value2) => $Fragment2 = value2,
  jsx: (value2) => $jsx = value2,
  jsxs: (value2) => $jsxs = value2
});
function jsxProd(type, config, maybeKey) {
  var key = null;
  maybeKey !== undefined && (key = "" + maybeKey);
  config.key !== undefined && (key = "" + config.key);
  if ("key" in config) {
    maybeKey = {};
    for (var propName in config)
      propName !== "key" && (maybeKey[propName] = config[propName]);
  } else
    maybeKey = config;
  config = maybeKey.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE2,
    type,
    key,
    ref: config !== undefined ? config : null,
    props: maybeKey
  };
}
var REACT_ELEMENT_TYPE2, REACT_FRAGMENT_TYPE2, $Fragment2, $jsx, $jsxs;
var init_react_jsx_runtime_production = __esm(() => {
  REACT_ELEMENT_TYPE2 = Symbol.for("react.transitional.element");
  REACT_FRAGMENT_TYPE2 = Symbol.for("react.fragment");
  $Fragment2 = REACT_FRAGMENT_TYPE2;
  $jsx = jsxProd;
  $jsxs = jsxProd;
});

// node_modules/.bun/react@19.2.7/node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS(function(exports, module) {
  init_react_jsx_runtime_production();
  if (true) {
    module.exports = exports_react_jsx_runtime_production;
  }
});

// node_modules/.bun/scheduler@0.27.0/node_modules/scheduler/cjs/scheduler.production.js
var exports_scheduler_production = {};
__exportCjs(exports_scheduler_production, {
  unstable_now: () => $unstable_now,
  unstable_IdlePriority: () => $unstable_IdlePriority,
  unstable_ImmediatePriority: () => $unstable_ImmediatePriority,
  unstable_LowPriority: () => $unstable_LowPriority,
  unstable_NormalPriority: () => $unstable_NormalPriority,
  unstable_Profiling: () => $unstable_Profiling,
  unstable_UserBlockingPriority: () => $unstable_UserBlockingPriority,
  unstable_cancelCallback: () => $unstable_cancelCallback,
  unstable_forceFrameRate: () => $unstable_forceFrameRate,
  unstable_getCurrentPriorityLevel: () => $unstable_getCurrentPriorityLevel,
  unstable_next: () => $unstable_next,
  unstable_requestPaint: () => $unstable_requestPaint,
  unstable_runWithPriority: () => $unstable_runWithPriority,
  unstable_scheduleCallback: () => $unstable_scheduleCallback,
  unstable_shouldYield: () => $unstable_shouldYield,
  unstable_wrapCallback: () => $unstable_wrapCallback
}, {
  unstable_now: (value3) => $unstable_now = value3,
  unstable_IdlePriority: (value3) => $unstable_IdlePriority = value3,
  unstable_ImmediatePriority: (value3) => $unstable_ImmediatePriority = value3,
  unstable_LowPriority: (value3) => $unstable_LowPriority = value3,
  unstable_NormalPriority: (value3) => $unstable_NormalPriority = value3,
  unstable_Profiling: (value3) => $unstable_Profiling = value3,
  unstable_UserBlockingPriority: (value3) => $unstable_UserBlockingPriority = value3,
  unstable_cancelCallback: (value3) => $unstable_cancelCallback = value3,
  unstable_forceFrameRate: (value3) => $unstable_forceFrameRate = value3,
  unstable_getCurrentPriorityLevel: (value3) => $unstable_getCurrentPriorityLevel = value3,
  unstable_next: (value3) => $unstable_next = value3,
  unstable_requestPaint: (value3) => $unstable_requestPaint = value3,
  unstable_runWithPriority: (value3) => $unstable_runWithPriority = value3,
  unstable_scheduleCallback: (value3) => $unstable_scheduleCallback = value3,
  unstable_shouldYield: (value3) => $unstable_shouldYield = value3,
  unstable_wrapCallback: (value3) => $unstable_wrapCallback = value3
});
function push(heap, node) {
  var index = heap.length;
  heap.push(node);
  a:
    for (;0 < index; ) {
      var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
      if (0 < compare(parent, node))
        heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
      else
        break a;
    }
}
function peek(heap) {
  return heap.length === 0 ? null : heap[0];
}
function pop(heap) {
  if (heap.length === 0)
    return null;
  var first = heap[0], last = heap.pop();
  if (last !== first) {
    heap[0] = last;
    a:
      for (var index = 0, length = heap.length, halfLength = length >>> 1;index < halfLength; ) {
        var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
        if (0 > compare(left, last))
          rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
        else if (rightIndex < length && 0 > compare(right, last))
          heap[index] = right, heap[rightIndex] = last, index = rightIndex;
        else
          break a;
      }
  }
  return first;
}
function compare(a, b) {
  var diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
function advanceTimers(currentTime) {
  for (var timer = peek(timerQueue);timer !== null; ) {
    if (timer.callback === null)
      pop(timerQueue);
    else if (timer.startTime <= currentTime)
      pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
    else
      break;
    timer = peek(timerQueue);
  }
}
function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);
  if (!isHostCallbackScheduled)
    if (peek(taskQueue) !== null)
      isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
    else {
      var firstTimer = peek(timerQueue);
      firstTimer !== null && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
}
function shouldYieldToHost() {
  return needsPaint ? true : exports_scheduler_production.unstable_now() - startTime < frameInterval ? false : true;
}
function performWorkUntilDeadline() {
  needsPaint = false;
  if (isMessageLoopRunning) {
    var currentTime = exports_scheduler_production.unstable_now();
    startTime = currentTime;
    var hasMoreWork = true;
    try {
      a: {
        isHostCallbackScheduled = false;
        isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
        isPerformingWork = true;
        var previousPriorityLevel = currentPriorityLevel;
        try {
          b: {
            advanceTimers(currentTime);
            for (currentTask = peek(taskQueue);currentTask !== null && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
              var callback = currentTask.callback;
              if (typeof callback === "function") {
                currentTask.callback = null;
                currentPriorityLevel = currentTask.priorityLevel;
                var continuationCallback = callback(currentTask.expirationTime <= currentTime);
                currentTime = exports_scheduler_production.unstable_now();
                if (typeof continuationCallback === "function") {
                  currentTask.callback = continuationCallback;
                  advanceTimers(currentTime);
                  hasMoreWork = true;
                  break b;
                }
                currentTask === peek(taskQueue) && pop(taskQueue);
                advanceTimers(currentTime);
              } else
                pop(taskQueue);
              currentTask = peek(taskQueue);
            }
            if (currentTask !== null)
              hasMoreWork = true;
            else {
              var firstTimer = peek(timerQueue);
              firstTimer !== null && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
              hasMoreWork = false;
            }
          }
          break a;
        } finally {
          currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
        }
        hasMoreWork = undefined;
      }
    } finally {
      hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
    }
  }
}
function requestHostTimeout(callback, ms) {
  taskTimeoutID = localSetTimeout(function() {
    callback(exports_scheduler_production.unstable_now());
  }, ms);
}
var $unstable_now = undefined, localPerformance, localDate, initialTime, taskQueue, timerQueue, taskIdCounter = 1, currentTask = null, currentPriorityLevel = 3, isPerformingWork = false, isHostCallbackScheduled = false, isHostTimeoutScheduled = false, needsPaint = false, localSetTimeout, localClearTimeout, localSetImmediate, isMessageLoopRunning = false, taskTimeoutID = -1, frameInterval = 5, startTime = -1, schedulePerformWorkUntilDeadline, channel, port, $unstable_IdlePriority = 5, $unstable_ImmediatePriority = 1, $unstable_LowPriority = 4, $unstable_NormalPriority = 3, $unstable_Profiling = null, $unstable_UserBlockingPriority = 2, $unstable_cancelCallback = function(task) {
  task.callback = null;
}, $unstable_forceFrameRate = function(fps) {
  0 > fps || 125 < fps ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : frameInterval = 0 < fps ? Math.floor(1000 / fps) : 5;
}, $unstable_getCurrentPriorityLevel = function() {
  return currentPriorityLevel;
}, $unstable_next = function(eventHandler) {
  switch (currentPriorityLevel) {
    case 1:
    case 2:
    case 3:
      var priorityLevel = 3;
      break;
    default:
      priorityLevel = currentPriorityLevel;
  }
  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;
  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}, $unstable_requestPaint = function() {
  needsPaint = true;
}, $unstable_runWithPriority = function(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      break;
    default:
      priorityLevel = 3;
  }
  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;
  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}, $unstable_scheduleCallback = function(priorityLevel, callback, options) {
  var currentTime = exports_scheduler_production.unstable_now();
  typeof options === "object" && options !== null ? (options = options.delay, options = typeof options === "number" && 0 < options ? currentTime + options : currentTime) : options = currentTime;
  switch (priorityLevel) {
    case 1:
      var timeout = -1;
      break;
    case 2:
      timeout = 250;
      break;
    case 5:
      timeout = 1073741823;
      break;
    case 4:
      timeout = 1e4;
      break;
    default:
      timeout = 5000;
  }
  timeout = options + timeout;
  priorityLevel = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime: options,
    expirationTime: timeout,
    sortIndex: -1
  };
  options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), peek(taskQueue) === null && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline())));
  return priorityLevel;
}, $unstable_shouldYield, $unstable_wrapCallback = function(callback) {
  var parentPriorityLevel = currentPriorityLevel;
  return function() {
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = parentPriorityLevel;
    try {
      return callback.apply(this, arguments);
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
};
var init_scheduler_production = __esm(() => {
  if (typeof performance === "object" && typeof performance.now === "function") {
    localPerformance = performance;
    $unstable_now = function() {
      return localPerformance.now();
    };
  } else {
    localDate = Date, initialTime = localDate.now();
    $unstable_now = function() {
      return localDate.now() - initialTime;
    };
  }
  taskQueue = [];
  timerQueue = [];
  localSetTimeout = typeof setTimeout === "function" ? setTimeout : null;
  localClearTimeout = typeof clearTimeout === "function" ? clearTimeout : null;
  localSetImmediate = typeof setImmediate !== "undefined" ? setImmediate : null;
  if (typeof localSetImmediate === "function")
    schedulePerformWorkUntilDeadline = function() {
      localSetImmediate(performWorkUntilDeadline);
    };
  else if (typeof MessageChannel !== "undefined") {
    channel = new MessageChannel, port = channel.port2;
    channel.port1.onmessage = performWorkUntilDeadline;
    schedulePerformWorkUntilDeadline = function() {
      port.postMessage(null);
    };
  } else
    schedulePerformWorkUntilDeadline = function() {
      localSetTimeout(performWorkUntilDeadline, 0);
    };
  $unstable_shouldYield = shouldYieldToHost;
});

// node_modules/.bun/scheduler@0.27.0/node_modules/scheduler/index.js
var require_scheduler = __commonJS(function(exports, module) {
  init_scheduler_production();
  if (true) {
    module.exports = exports_scheduler_production;
  }
});

// node_modules/.bun/react-dom@19.2.7+e14d3f224186685e/node_modules/react-dom/cjs/react-dom.production.js
var exports_react_dom_production = {};
__exportCjs(exports_react_dom_production, {
  __DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: () => $__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  createPortal: () => $createPortal,
  flushSync: () => $flushSync,
  preconnect: () => $preconnect,
  prefetchDNS: () => $prefetchDNS,
  preinit: () => $preinit,
  preinitModule: () => $preinitModule,
  preload: () => $preload,
  preloadModule: () => $preloadModule,
  requestFormReset: () => $requestFormReset,
  unstable_batchedUpdates: () => $unstable_batchedUpdates,
  useFormState: () => $useFormState,
  useFormStatus: () => $useFormStatus,
  version: () => $version2
}, {
  __DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: (value4) => $__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = value4,
  createPortal: (value4) => $createPortal = value4,
  flushSync: (value4) => $flushSync = value4,
  preconnect: (value4) => $preconnect = value4,
  prefetchDNS: (value4) => $prefetchDNS = value4,
  preinit: (value4) => $preinit = value4,
  preinitModule: (value4) => $preinitModule = value4,
  preload: (value4) => $preload = value4,
  preloadModule: (value4) => $preloadModule = value4,
  requestFormReset: (value4) => $requestFormReset = value4,
  unstable_batchedUpdates: (value4) => $unstable_batchedUpdates = value4,
  useFormState: (value4) => $useFormState = value4,
  useFormStatus: (value4) => $useFormStatus = value4,
  version: (value4) => $version2 = value4
});
function formatProdErrorMessage(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2;i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
function noop2() {}
function createPortal$1(children, containerInfo, implementation) {
  var key = 3 < arguments.length && arguments[3] !== undefined ? arguments[3] : null;
  return {
    $$typeof: REACT_PORTAL_TYPE2,
    key: key == null ? null : "" + key,
    children,
    containerInfo,
    implementation
  };
}
function getCrossOriginStringAs(as, input) {
  if (as === "font")
    return "";
  if (typeof input === "string")
    return input === "use-credentials" ? input : "";
}
var React3, Internals, REACT_PORTAL_TYPE2, ReactSharedInternals2, $__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, $createPortal = function(children, container) {
  var key = 2 < arguments.length && arguments[2] !== undefined ? arguments[2] : null;
  if (!container || container.nodeType !== 1 && container.nodeType !== 9 && container.nodeType !== 11)
    throw Error(formatProdErrorMessage(299));
  return createPortal$1(children, container, null, key);
}, $flushSync = function(fn) {
  var previousTransition = ReactSharedInternals2.T, previousUpdatePriority = Internals.p;
  try {
    if (ReactSharedInternals2.T = null, Internals.p = 2, fn)
      return fn();
  } finally {
    ReactSharedInternals2.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
  }
}, $preconnect = function(href, options) {
  typeof href === "string" && (options ? (options = options.crossOrigin, options = typeof options === "string" ? options === "use-credentials" ? options : "" : undefined) : options = null, Internals.d.C(href, options));
}, $prefetchDNS = function(href) {
  typeof href === "string" && Internals.d.D(href);
}, $preinit = function(href, options) {
  if (typeof href === "string" && options && typeof options.as === "string") {
    var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = typeof options.integrity === "string" ? options.integrity : undefined, fetchPriority = typeof options.fetchPriority === "string" ? options.fetchPriority : undefined;
    as === "style" ? Internals.d.S(href, typeof options.precedence === "string" ? options.precedence : undefined, {
      crossOrigin,
      integrity,
      fetchPriority
    }) : as === "script" && Internals.d.X(href, {
      crossOrigin,
      integrity,
      fetchPriority,
      nonce: typeof options.nonce === "string" ? options.nonce : undefined
    });
  }
}, $preinitModule = function(href, options) {
  if (typeof href === "string")
    if (typeof options === "object" && options !== null) {
      if (options.as == null || options.as === "script") {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.M(href, {
          crossOrigin,
          integrity: typeof options.integrity === "string" ? options.integrity : undefined,
          nonce: typeof options.nonce === "string" ? options.nonce : undefined
        });
      }
    } else
      options == null && Internals.d.M(href);
}, $preload = function(href, options) {
  if (typeof href === "string" && typeof options === "object" && options !== null && typeof options.as === "string") {
    var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
    Internals.d.L(href, as, {
      crossOrigin,
      integrity: typeof options.integrity === "string" ? options.integrity : undefined,
      nonce: typeof options.nonce === "string" ? options.nonce : undefined,
      type: typeof options.type === "string" ? options.type : undefined,
      fetchPriority: typeof options.fetchPriority === "string" ? options.fetchPriority : undefined,
      referrerPolicy: typeof options.referrerPolicy === "string" ? options.referrerPolicy : undefined,
      imageSrcSet: typeof options.imageSrcSet === "string" ? options.imageSrcSet : undefined,
      imageSizes: typeof options.imageSizes === "string" ? options.imageSizes : undefined,
      media: typeof options.media === "string" ? options.media : undefined
    });
  }
}, $preloadModule = function(href, options) {
  if (typeof href === "string")
    if (options) {
      var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
      Internals.d.m(href, {
        as: typeof options.as === "string" && options.as !== "script" ? options.as : undefined,
        crossOrigin,
        integrity: typeof options.integrity === "string" ? options.integrity : undefined
      });
    } else
      Internals.d.m(href);
}, $requestFormReset = function(form) {
  Internals.d.r(form);
}, $unstable_batchedUpdates = function(fn, a) {
  return fn(a);
}, $useFormState = function(action, initialState, permalink) {
  return ReactSharedInternals2.H.useFormState(action, initialState, permalink);
}, $useFormStatus = function() {
  return ReactSharedInternals2.H.useHostTransitionStatus();
}, $version2 = "19.2.7";
var init_react_dom_production = __esm(() => {
  React3 = __toESM(require_react());
  Internals = {
    d: {
      f: noop2,
      r: function() {
        throw Error(formatProdErrorMessage(522));
      },
      D: noop2,
      C: noop2,
      L: noop2,
      m: noop2,
      X: noop2,
      S: noop2,
      M: noop2
    },
    p: 0,
    findDOMNode: null
  };
  REACT_PORTAL_TYPE2 = Symbol.for("react.portal");
  ReactSharedInternals2 = React3.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  $__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
});

// node_modules/.bun/react-dom@19.2.7+e14d3f224186685e/node_modules/react-dom/index.js
var require_react_dom = __commonJS(function(exports, module) {
  init_react_dom_production();
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    if (false) {}
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  if (true) {
    checkDCE();
    module.exports = exports_react_dom_production;
  }
});

// node_modules/.bun/react-dom@19.2.7+e14d3f224186685e/node_modules/react-dom/cjs/react-dom-client.production.js
var exports_react_dom_client_production = {};
__exportCjs(exports_react_dom_client_production, {
  createRoot: () => $createRoot,
  hydrateRoot: () => $hydrateRoot,
  version: () => $version3
}, {
  createRoot: (value5) => $createRoot = value5,
  hydrateRoot: (value5) => $hydrateRoot = value5,
  version: (value5) => $version3 = value5
});
function formatProdErrorMessage2(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2;i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
function isValidContainer(node) {
  return !(!node || node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11);
}
function getNearestMountedFiber(fiber) {
  var node = fiber, nearestMounted = fiber;
  if (fiber.alternate)
    for (;node.return; )
      node = node.return;
  else {
    fiber = node;
    do
      node = fiber, (node.flags & 4098) !== 0 && (nearestMounted = node.return), fiber = node.return;
    while (fiber);
  }
  return node.tag === 3 ? nearestMounted : null;
}
function getSuspenseInstanceFromFiber(fiber) {
  if (fiber.tag === 13) {
    var suspenseState = fiber.memoizedState;
    suspenseState === null && (fiber = fiber.alternate, fiber !== null && (suspenseState = fiber.memoizedState));
    if (suspenseState !== null)
      return suspenseState.dehydrated;
  }
  return null;
}
function getActivityInstanceFromFiber(fiber) {
  if (fiber.tag === 31) {
    var activityState = fiber.memoizedState;
    activityState === null && (fiber = fiber.alternate, fiber !== null && (activityState = fiber.memoizedState));
    if (activityState !== null)
      return activityState.dehydrated;
  }
  return null;
}
function assertIsMounted(fiber) {
  if (getNearestMountedFiber(fiber) !== fiber)
    throw Error(formatProdErrorMessage2(188));
}
function findCurrentFiberUsingSlowPath(fiber) {
  var alternate = fiber.alternate;
  if (!alternate) {
    alternate = getNearestMountedFiber(fiber);
    if (alternate === null)
      throw Error(formatProdErrorMessage2(188));
    return alternate !== fiber ? null : fiber;
  }
  for (var a = fiber, b = alternate;; ) {
    var parentA = a.return;
    if (parentA === null)
      break;
    var parentB = parentA.alternate;
    if (parentB === null) {
      b = parentA.return;
      if (b !== null) {
        a = b;
        continue;
      }
      break;
    }
    if (parentA.child === parentB.child) {
      for (parentB = parentA.child;parentB; ) {
        if (parentB === a)
          return assertIsMounted(parentA), fiber;
        if (parentB === b)
          return assertIsMounted(parentA), alternate;
        parentB = parentB.sibling;
      }
      throw Error(formatProdErrorMessage2(188));
    }
    if (a.return !== b.return)
      a = parentA, b = parentB;
    else {
      for (var didFindChild = false, child$0 = parentA.child;child$0; ) {
        if (child$0 === a) {
          didFindChild = true;
          a = parentA;
          b = parentB;
          break;
        }
        if (child$0 === b) {
          didFindChild = true;
          b = parentA;
          a = parentB;
          break;
        }
        child$0 = child$0.sibling;
      }
      if (!didFindChild) {
        for (child$0 = parentB.child;child$0; ) {
          if (child$0 === a) {
            didFindChild = true;
            a = parentB;
            b = parentA;
            break;
          }
          if (child$0 === b) {
            didFindChild = true;
            b = parentB;
            a = parentA;
            break;
          }
          child$0 = child$0.sibling;
        }
        if (!didFindChild)
          throw Error(formatProdErrorMessage2(189));
      }
    }
    if (a.alternate !== b)
      throw Error(formatProdErrorMessage2(190));
  }
  if (a.tag !== 3)
    throw Error(formatProdErrorMessage2(188));
  return a.stateNode.current === a ? fiber : alternate;
}
function findCurrentHostFiberImpl(node) {
  var tag = node.tag;
  if (tag === 5 || tag === 26 || tag === 27 || tag === 6)
    return node;
  for (node = node.child;node !== null; ) {
    tag = findCurrentHostFiberImpl(node);
    if (tag !== null)
      return tag;
    node = node.sibling;
  }
  return null;
}
function getIteratorFn2(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== "object")
    return null;
  maybeIterable = MAYBE_ITERATOR_SYMBOL2 && maybeIterable[MAYBE_ITERATOR_SYMBOL2] || maybeIterable["@@iterator"];
  return typeof maybeIterable === "function" ? maybeIterable : null;
}
function getComponentNameFromType(type) {
  if (type == null)
    return null;
  if (typeof type === "function")
    return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
  if (typeof type === "string")
    return type;
  switch (type) {
    case REACT_FRAGMENT_TYPE3:
      return "Fragment";
    case REACT_PROFILER_TYPE2:
      return "Profiler";
    case REACT_STRICT_MODE_TYPE2:
      return "StrictMode";
    case REACT_SUSPENSE_TYPE2:
      return "Suspense";
    case REACT_SUSPENSE_LIST_TYPE:
      return "SuspenseList";
    case REACT_ACTIVITY_TYPE2:
      return "Activity";
  }
  if (typeof type === "object")
    switch (type.$$typeof) {
      case REACT_PORTAL_TYPE3:
        return "Portal";
      case REACT_CONTEXT_TYPE2:
        return type.displayName || "Context";
      case REACT_CONSUMER_TYPE2:
        return (type._context.displayName || "Context") + ".Consumer";
      case REACT_FORWARD_REF_TYPE2:
        var innerType = type.render;
        type = type.displayName;
        type || (type = innerType.displayName || innerType.name || "", type = type !== "" ? "ForwardRef(" + type + ")" : "ForwardRef");
        return type;
      case REACT_MEMO_TYPE2:
        return innerType = type.displayName || null, innerType !== null ? innerType : getComponentNameFromType(type.type) || "Memo";
      case REACT_LAZY_TYPE2:
        innerType = type._payload;
        type = type._init;
        try {
          return getComponentNameFromType(type(innerType));
        } catch (x) {}
    }
  return null;
}
function createCursor(defaultValue) {
  return { current: defaultValue };
}
function pop2(cursor) {
  0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
}
function push2(cursor, value) {
  index++;
  valueStack[index] = cursor.current;
  cursor.current = value;
}
function pushHostContainer(fiber, nextRootInstance) {
  push2(rootInstanceStackCursor, nextRootInstance);
  push2(contextFiberStackCursor, fiber);
  push2(contextStackCursor, null);
  switch (nextRootInstance.nodeType) {
    case 9:
    case 11:
      fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
      break;
    default:
      if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI)
        nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
      else
        switch (fiber) {
          case "svg":
            fiber = 1;
            break;
          case "math":
            fiber = 2;
            break;
          default:
            fiber = 0;
        }
  }
  pop2(contextStackCursor);
  push2(contextStackCursor, fiber);
}
function popHostContainer() {
  pop2(contextStackCursor);
  pop2(contextFiberStackCursor);
  pop2(rootInstanceStackCursor);
}
function pushHostContext(fiber) {
  fiber.memoizedState !== null && push2(hostTransitionProviderCursor, fiber);
  var context = contextStackCursor.current;
  var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
  context !== JSCompiler_inline_result && (push2(contextFiberStackCursor, fiber), push2(contextStackCursor, JSCompiler_inline_result));
}
function popHostContext(fiber) {
  contextFiberStackCursor.current === fiber && (pop2(contextStackCursor), pop2(contextFiberStackCursor));
  hostTransitionProviderCursor.current === fiber && (pop2(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
}
function describeBuiltInComponentFrame(name) {
  if (prefix === undefined)
    try {
      throw Error();
    } catch (x) {
      var match = x.stack.trim().match(/\n( *(at )?)/);
      prefix = match && match[1] || "";
      suffix = -1 < x.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
    }
  return `
` + prefix + name + suffix;
}
function describeNativeComponentFrame(fn, construct) {
  if (!fn || reentry)
    return "";
  reentry = true;
  var previousPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = undefined;
  try {
    var RunInRootFrame = {
      DetermineComponentFrameRoot: function() {
        try {
          if (construct) {
            var Fake = function() {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, "props", {
              set: function() {
                throw Error();
              }
            });
            if (typeof Reflect === "object" && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                var control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x$1) {
                control = x$1;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x$2) {
              control = x$2;
            }
            (Fake = fn()) && typeof Fake.catch === "function" && Fake.catch(function() {});
          }
        } catch (sample) {
          if (sample && control && typeof sample.stack === "string")
            return [sample.stack, control.stack];
        }
        return [null, null];
      }
    };
    RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
    var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
    namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
    var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
    if (sampleStack && controlStack) {
      var sampleLines = sampleStack.split(`
`), controlLines = controlStack.split(`
`);
      for (namePropDescriptor = RunInRootFrame = 0;RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
        RunInRootFrame++;
      for (;namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot"); )
        namePropDescriptor++;
      if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
        for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1;1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
          namePropDescriptor--;
      for (;1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
        if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
          if (RunInRootFrame !== 1 || namePropDescriptor !== 1) {
            do
              if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                var frame = `
` + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                return frame;
              }
            while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
          }
          break;
        }
    }
  } finally {
    reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
  }
  return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
}
function describeFiber(fiber, childFiber) {
  switch (fiber.tag) {
    case 26:
    case 27:
    case 5:
      return describeBuiltInComponentFrame(fiber.type);
    case 16:
      return describeBuiltInComponentFrame("Lazy");
    case 13:
      return fiber.child !== childFiber && childFiber !== null ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
    case 19:
      return describeBuiltInComponentFrame("SuspenseList");
    case 0:
    case 15:
      return describeNativeComponentFrame(fiber.type, false);
    case 11:
      return describeNativeComponentFrame(fiber.type.render, false);
    case 1:
      return describeNativeComponentFrame(fiber.type, true);
    case 31:
      return describeBuiltInComponentFrame("Activity");
    default:
      return "";
  }
}
function getStackByFiberInDevAndProd(workInProgress) {
  try {
    var info = "", previous = null;
    do
      info += describeFiber(workInProgress, previous), previous = workInProgress, workInProgress = workInProgress.return;
    while (workInProgress);
    return info;
  } catch (x) {
    return `
Error generating stack: ` + x.message + `
` + x.stack;
  }
}
function setIsStrictModeForDevtools(newIsStrictMode) {
  typeof log$1 === "function" && unstable_setDisableYieldValue2(newIsStrictMode);
  if (injectedHook && typeof injectedHook.setStrictMode === "function")
    try {
      injectedHook.setStrictMode(rendererID, newIsStrictMode);
    } catch (err) {}
}
function clz32Fallback(x) {
  x >>>= 0;
  return x === 0 ? 32 : 31 - (log2(x) / LN2 | 0) | 0;
}
function getHighestPriorityLanes(lanes) {
  var pendingSyncLanes = lanes & 42;
  if (pendingSyncLanes !== 0)
    return pendingSyncLanes;
  switch (lanes & -lanes) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
      return 64;
    case 128:
      return 128;
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
      return lanes & 261888;
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return lanes & 3932160;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return lanes & 62914560;
    case 67108864:
      return 67108864;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 0;
    default:
      return lanes;
  }
}
function getNextLanes(root, wipLanes, rootHasPendingCommit) {
  var pendingLanes = root.pendingLanes;
  if (pendingLanes === 0)
    return 0;
  var nextLanes = 0, suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes;
  root = root.warmLanes;
  var nonIdlePendingLanes = pendingLanes & 134217727;
  nonIdlePendingLanes !== 0 ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, pendingLanes !== 0 ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, pingedLanes !== 0 ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root, rootHasPendingCommit !== 0 && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, nonIdlePendingLanes !== 0 ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : pingedLanes !== 0 ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root, rootHasPendingCommit !== 0 && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
  return nextLanes === 0 ? 0 : wipLanes !== 0 && wipLanes !== nextLanes && (wipLanes & suspendedLanes) === 0 && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || suspendedLanes === 32 && (rootHasPendingCommit & 4194048) !== 0) ? wipLanes : nextLanes;
}
function checkIfRootIsPrerendering(root, renderLanes) {
  return (root.pendingLanes & ~(root.suspendedLanes & ~root.pingedLanes) & renderLanes) === 0;
}
function computeExpirationTime(lane, currentTime) {
  switch (lane) {
    case 1:
    case 2:
    case 4:
    case 8:
    case 64:
      return currentTime + 250;
    case 16:
    case 32:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return currentTime + 5000;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return -1;
    case 67108864:
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function claimNextRetryLane() {
  var lane = nextRetryLane;
  nextRetryLane <<= 1;
  (nextRetryLane & 62914560) === 0 && (nextRetryLane = 4194304);
  return lane;
}
function createLaneMap(initial) {
  for (var laneMap = [], i = 0;31 > i; i++)
    laneMap.push(initial);
  return laneMap;
}
function markRootUpdated$1(root, updateLane) {
  root.pendingLanes |= updateLane;
  updateLane !== 268435456 && (root.suspendedLanes = 0, root.pingedLanes = 0, root.warmLanes = 0);
}
function markRootFinished(root, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
  var previouslyPendingLanes = root.pendingLanes;
  root.pendingLanes = remainingLanes;
  root.suspendedLanes = 0;
  root.pingedLanes = 0;
  root.warmLanes = 0;
  root.expiredLanes &= remainingLanes;
  root.entangledLanes &= remainingLanes;
  root.errorRecoveryDisabledLanes &= remainingLanes;
  root.shellSuspendCounter = 0;
  var { entanglements, expirationTimes, hiddenUpdates } = root;
  for (remainingLanes = previouslyPendingLanes & ~remainingLanes;0 < remainingLanes; ) {
    var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
    entanglements[index$7] = 0;
    expirationTimes[index$7] = -1;
    var hiddenUpdatesForLane = hiddenUpdates[index$7];
    if (hiddenUpdatesForLane !== null)
      for (hiddenUpdates[index$7] = null, index$7 = 0;index$7 < hiddenUpdatesForLane.length; index$7++) {
        var update = hiddenUpdatesForLane[index$7];
        update !== null && (update.lane &= -536870913);
      }
    remainingLanes &= ~lane;
  }
  spawnedLane !== 0 && markSpawnedDeferredLane(root, spawnedLane, 0);
  suspendedRetryLanes !== 0 && updatedLanes === 0 && root.tag !== 0 && (root.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
}
function markSpawnedDeferredLane(root, spawnedLane, entangledLanes) {
  root.pendingLanes |= spawnedLane;
  root.suspendedLanes &= ~spawnedLane;
  var spawnedLaneIndex = 31 - clz32(spawnedLane);
  root.entangledLanes |= spawnedLane;
  root.entanglements[spawnedLaneIndex] = root.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
}
function markRootEntangled(root, entangledLanes) {
  var rootEntangledLanes = root.entangledLanes |= entangledLanes;
  for (root = root.entanglements;rootEntangledLanes; ) {
    var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
    lane & entangledLanes | root[index$8] & entangledLanes && (root[index$8] |= entangledLanes);
    rootEntangledLanes &= ~lane;
  }
}
function getBumpedLaneForHydration(root, renderLanes) {
  var renderLane = renderLanes & -renderLanes;
  renderLane = (renderLane & 42) !== 0 ? 1 : getBumpedLaneForHydrationByLane(renderLane);
  return (renderLane & (root.suspendedLanes | renderLanes)) !== 0 ? 0 : renderLane;
}
function getBumpedLaneForHydrationByLane(lane) {
  switch (lane) {
    case 2:
      lane = 1;
      break;
    case 8:
      lane = 4;
      break;
    case 32:
      lane = 16;
      break;
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      lane = 128;
      break;
    case 268435456:
      lane = 134217728;
      break;
    default:
      lane = 0;
  }
  return lane;
}
function lanesToEventPriority(lanes) {
  lanes &= -lanes;
  return 2 < lanes ? 8 < lanes ? (lanes & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
}
function resolveUpdatePriority() {
  var updatePriority = ReactDOMSharedInternals.p;
  if (updatePriority !== 0)
    return updatePriority;
  updatePriority = window.event;
  return updatePriority === undefined ? 32 : getEventPriority(updatePriority.type);
}
function runWithPriority(priority, fn) {
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    return ReactDOMSharedInternals.p = priority, fn();
  } finally {
    ReactDOMSharedInternals.p = previousPriority;
  }
}
function detachDeletedInstance(node) {
  delete node[internalInstanceKey];
  delete node[internalPropsKey];
  delete node[internalEventHandlersKey];
  delete node[internalEventHandlerListenersKey];
  delete node[internalEventHandlesSetKey];
}
function getClosestInstanceFromNode(targetNode) {
  var targetInst = targetNode[internalInstanceKey];
  if (targetInst)
    return targetInst;
  for (var parentNode = targetNode.parentNode;parentNode; ) {
    if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
      parentNode = targetInst.alternate;
      if (targetInst.child !== null || parentNode !== null && parentNode.child !== null)
        for (targetNode = getParentHydrationBoundary(targetNode);targetNode !== null; ) {
          if (parentNode = targetNode[internalInstanceKey])
            return parentNode;
          targetNode = getParentHydrationBoundary(targetNode);
        }
      return targetInst;
    }
    targetNode = parentNode;
    parentNode = targetNode.parentNode;
  }
  return null;
}
function getInstanceFromNode(node) {
  if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
    var tag = node.tag;
    if (tag === 5 || tag === 6 || tag === 13 || tag === 31 || tag === 26 || tag === 27 || tag === 3)
      return node;
  }
  return null;
}
function getNodeFromInstance(inst) {
  var tag = inst.tag;
  if (tag === 5 || tag === 26 || tag === 27 || tag === 6)
    return inst.stateNode;
  throw Error(formatProdErrorMessage2(33));
}
function getResourcesFromRoot(root) {
  var resources = root[internalRootNodeResourcesKey];
  resources || (resources = root[internalRootNodeResourcesKey] = { hoistableStyles: new Map, hoistableScripts: new Map });
  return resources;
}
function markNodeAsHoistable(node) {
  node[internalHoistableMarker] = true;
}
function registerTwoPhaseEvent(registrationName, dependencies) {
  registerDirectEvent(registrationName, dependencies);
  registerDirectEvent(registrationName + "Capture", dependencies);
}
function registerDirectEvent(registrationName, dependencies) {
  registrationNameDependencies[registrationName] = dependencies;
  for (registrationName = 0;registrationName < dependencies.length; registrationName++)
    allNativeEvents.add(dependencies[registrationName]);
}
function isAttributeNameSafe(attributeName) {
  if (hasOwnProperty2.call(validatedAttributeNameCache, attributeName))
    return true;
  if (hasOwnProperty2.call(illegalAttributeNameCache, attributeName))
    return false;
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
    return validatedAttributeNameCache[attributeName] = true;
  illegalAttributeNameCache[attributeName] = true;
  return false;
}
function setValueForAttribute(node, name, value) {
  if (isAttributeNameSafe(name))
    if (value === null)
      node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
          node.removeAttribute(name);
          return;
        case "boolean":
          var prefix$10 = name.toLowerCase().slice(0, 5);
          if (prefix$10 !== "data-" && prefix$10 !== "aria-") {
            node.removeAttribute(name);
            return;
          }
      }
      node.setAttribute(name, "" + value);
    }
}
function setValueForKnownAttribute(node, name, value) {
  if (value === null)
    node.removeAttribute(name);
  else {
    switch (typeof value) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        node.removeAttribute(name);
        return;
    }
    node.setAttribute(name, "" + value);
  }
}
function setValueForNamespacedAttribute(node, namespace, name, value) {
  if (value === null)
    node.removeAttribute(name);
  else {
    switch (typeof value) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        node.removeAttribute(name);
        return;
    }
    node.setAttributeNS(namespace, name, "" + value);
  }
}
function getToStringValue(value) {
  switch (typeof value) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return value;
    case "object":
      return value;
    default:
      return "";
  }
}
function isCheckable(elem) {
  var type = elem.type;
  return (elem = elem.nodeName) && elem.toLowerCase() === "input" && (type === "checkbox" || type === "radio");
}
function trackValueOnNode(node, valueField, currentValue) {
  var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
  if (!node.hasOwnProperty(valueField) && typeof descriptor !== "undefined" && typeof descriptor.get === "function" && typeof descriptor.set === "function") {
    var { get, set } = descriptor;
    Object.defineProperty(node, valueField, {
      configurable: true,
      get: function() {
        return get.call(this);
      },
      set: function(value) {
        currentValue = "" + value;
        set.call(this, value);
      }
    });
    Object.defineProperty(node, valueField, {
      enumerable: descriptor.enumerable
    });
    return {
      getValue: function() {
        return currentValue;
      },
      setValue: function(value) {
        currentValue = "" + value;
      },
      stopTracking: function() {
        node._valueTracker = null;
        delete node[valueField];
      }
    };
  }
}
function track(node) {
  if (!node._valueTracker) {
    var valueField = isCheckable(node) ? "checked" : "value";
    node._valueTracker = trackValueOnNode(node, valueField, "" + node[valueField]);
  }
}
function updateValueIfChanged(node) {
  if (!node)
    return false;
  var tracker = node._valueTracker;
  if (!tracker)
    return true;
  var lastValue = tracker.getValue();
  var value = "";
  node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
  node = value;
  return node !== lastValue ? (tracker.setValue(node), true) : false;
}
function getActiveElement(doc) {
  doc = doc || (typeof document !== "undefined" ? document : undefined);
  if (typeof doc === "undefined")
    return null;
  try {
    return doc.activeElement || doc.body;
  } catch (e) {
    return doc.body;
  }
}
function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
  return value.replace(escapeSelectorAttributeValueInsideDoubleQuotesRegex, function(ch) {
    return "\\" + ch.charCodeAt(0).toString(16) + " ";
  });
}
function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
  element.name = "";
  type != null && typeof type !== "function" && typeof type !== "symbol" && typeof type !== "boolean" ? element.type = type : element.removeAttribute("type");
  if (value != null)
    if (type === "number") {
      if (value === 0 && element.value === "" || element.value != value)
        element.value = "" + getToStringValue(value);
    } else
      element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
  else
    type !== "submit" && type !== "reset" || element.removeAttribute("value");
  value != null ? setDefaultValue(element, type, getToStringValue(value)) : defaultValue != null ? setDefaultValue(element, type, getToStringValue(defaultValue)) : lastDefaultValue != null && element.removeAttribute("value");
  checked == null && defaultChecked != null && (element.defaultChecked = !!defaultChecked);
  checked != null && (element.checked = checked && typeof checked !== "function" && typeof checked !== "symbol");
  name != null && typeof name !== "function" && typeof name !== "symbol" && typeof name !== "boolean" ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
}
function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating) {
  type != null && typeof type !== "function" && typeof type !== "symbol" && typeof type !== "boolean" && (element.type = type);
  if (value != null || defaultValue != null) {
    if (!(type !== "submit" && type !== "reset" || value !== undefined && value !== null)) {
      track(element);
      return;
    }
    defaultValue = defaultValue != null ? "" + getToStringValue(defaultValue) : "";
    value = value != null ? "" + getToStringValue(value) : defaultValue;
    isHydrating || value === element.value || (element.value = value);
    element.defaultValue = value;
  }
  checked = checked != null ? checked : defaultChecked;
  checked = typeof checked !== "function" && typeof checked !== "symbol" && !!checked;
  element.checked = isHydrating ? element.checked : !!checked;
  element.defaultChecked = !!checked;
  name != null && typeof name !== "function" && typeof name !== "symbol" && typeof name !== "boolean" && (element.name = name);
  track(element);
}
function setDefaultValue(node, type, value) {
  type === "number" && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
}
function updateOptions(node, multiple, propValue, setDefaultSelected) {
  node = node.options;
  if (multiple) {
    multiple = {};
    for (var i = 0;i < propValue.length; i++)
      multiple["$" + propValue[i]] = true;
    for (propValue = 0;propValue < node.length; propValue++)
      i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = true);
  } else {
    propValue = "" + getToStringValue(propValue);
    multiple = null;
    for (i = 0;i < node.length; i++) {
      if (node[i].value === propValue) {
        node[i].selected = true;
        setDefaultSelected && (node[i].defaultSelected = true);
        return;
      }
      multiple !== null || node[i].disabled || (multiple = node[i]);
    }
    multiple !== null && (multiple.selected = true);
  }
}
function updateTextarea(element, value, defaultValue) {
  if (value != null && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), defaultValue == null)) {
    element.defaultValue !== value && (element.defaultValue = value);
    return;
  }
  element.defaultValue = defaultValue != null ? "" + getToStringValue(defaultValue) : "";
}
function initTextarea(element, value, defaultValue, children) {
  if (value == null) {
    if (children != null) {
      if (defaultValue != null)
        throw Error(formatProdErrorMessage2(92));
      if (isArrayImpl2(children)) {
        if (1 < children.length)
          throw Error(formatProdErrorMessage2(93));
        children = children[0];
      }
      defaultValue = children;
    }
    defaultValue == null && (defaultValue = "");
    value = defaultValue;
  }
  defaultValue = getToStringValue(value);
  element.defaultValue = defaultValue;
  children = element.textContent;
  children === defaultValue && children !== "" && children !== null && (element.value = children);
  track(element);
}
function setTextContent(node, text) {
  if (text) {
    var firstChild = node.firstChild;
    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === 3) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
}
function setValueForStyle(style, styleName, value) {
  var isCustomProperty = styleName.indexOf("--") === 0;
  value == null || typeof value === "boolean" || value === "" ? isCustomProperty ? style.setProperty(styleName, "") : styleName === "float" ? style.cssFloat = "" : style[styleName] = "" : isCustomProperty ? style.setProperty(styleName, value) : typeof value !== "number" || value === 0 || unitlessNumbers.has(styleName) ? styleName === "float" ? style.cssFloat = value : style[styleName] = ("" + value).trim() : style[styleName] = value + "px";
}
function setValueForStyles(node, styles, prevStyles) {
  if (styles != null && typeof styles !== "object")
    throw Error(formatProdErrorMessage2(62));
  node = node.style;
  if (prevStyles != null) {
    for (var styleName in prevStyles)
      !prevStyles.hasOwnProperty(styleName) || styles != null && styles.hasOwnProperty(styleName) || (styleName.indexOf("--") === 0 ? node.setProperty(styleName, "") : styleName === "float" ? node.cssFloat = "" : node[styleName] = "");
    for (var styleName$16 in styles)
      styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
  } else
    for (var styleName$17 in styles)
      styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
}
function isCustomElement(tagName) {
  if (tagName.indexOf("-") === -1)
    return false;
  switch (tagName) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return false;
    default:
      return true;
  }
}
function sanitizeURL(url) {
  return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
}
function noop$1() {}
function getEventTarget(nativeEvent) {
  nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
  nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
  return nativeEvent.nodeType === 3 ? nativeEvent.parentNode : nativeEvent;
}
function restoreStateOfTarget(target) {
  var internalInstance = getInstanceFromNode(target);
  if (internalInstance && (target = internalInstance.stateNode)) {
    var props = target[internalPropsKey] || null;
    a:
      switch (target = internalInstance.stateNode, internalInstance.type) {
        case "input":
          updateInput(target, props.value, props.defaultValue, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name);
          internalInstance = props.name;
          if (props.type === "radio" && internalInstance != null) {
            for (props = target;props.parentNode; )
              props = props.parentNode;
            props = props.querySelectorAll('input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes("" + internalInstance) + '"][type="radio"]');
            for (internalInstance = 0;internalInstance < props.length; internalInstance++) {
              var otherNode = props[internalInstance];
              if (otherNode !== target && otherNode.form === target.form) {
                var otherProps = otherNode[internalPropsKey] || null;
                if (!otherProps)
                  throw Error(formatProdErrorMessage2(90));
                updateInput(otherNode, otherProps.value, otherProps.defaultValue, otherProps.defaultValue, otherProps.checked, otherProps.defaultChecked, otherProps.type, otherProps.name);
              }
            }
            for (internalInstance = 0;internalInstance < props.length; internalInstance++)
              otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
          }
          break a;
        case "textarea":
          updateTextarea(target, props.value, props.defaultValue);
          break a;
        case "select":
          internalInstance = props.value, internalInstance != null && updateOptions(target, !!props.multiple, internalInstance, false);
      }
  }
}
function batchedUpdates$1(fn, a, b) {
  if (isInsideEventHandler)
    return fn(a, b);
  isInsideEventHandler = true;
  try {
    var JSCompiler_inline_result = fn(a);
    return JSCompiler_inline_result;
  } finally {
    if (isInsideEventHandler = false, restoreTarget !== null || restoreQueue !== null) {
      if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn))
        for (a = 0;a < fn.length; a++)
          restoreStateOfTarget(fn[a]);
    }
  }
}
function getListener(inst, registrationName) {
  var stateNode = inst.stateNode;
  if (stateNode === null)
    return null;
  var props = stateNode[internalPropsKey] || null;
  if (props === null)
    return null;
  stateNode = props[registrationName];
  a:
    switch (registrationName) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (props = !props.disabled) || (inst = inst.type, props = !(inst === "button" || inst === "input" || inst === "select" || inst === "textarea"));
        inst = !props;
        break a;
      default:
        inst = false;
    }
  if (inst)
    return null;
  if (stateNode && typeof stateNode !== "function")
    throw Error(formatProdErrorMessage2(231, registrationName, typeof stateNode));
  return stateNode;
}
function getData() {
  if (fallbackText)
    return fallbackText;
  var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
  for (start = 0;start < startLength && startValue[start] === endValue[start]; start++)
    ;
  var minEnd = startLength - start;
  for (end = 1;end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++)
    ;
  return fallbackText = endValue.slice(start, 1 < end ? 1 - end : undefined);
}
function getEventCharCode(nativeEvent) {
  var keyCode = nativeEvent.keyCode;
  "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, nativeEvent === 0 && keyCode === 13 && (nativeEvent = 13)) : nativeEvent = keyCode;
  nativeEvent === 10 && (nativeEvent = 13);
  return 32 <= nativeEvent || nativeEvent === 13 ? nativeEvent : 0;
}
function functionThatReturnsTrue() {
  return true;
}
function functionThatReturnsFalse() {
  return false;
}
function createSyntheticEvent(Interface) {
  function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
    this._reactName = reactName;
    this._targetInst = targetInst;
    this.type = reactEventType;
    this.nativeEvent = nativeEvent;
    this.target = nativeEventTarget;
    this.currentTarget = null;
    for (var propName in Interface)
      Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
    this.isDefaultPrevented = (nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false) ? functionThatReturnsTrue : functionThatReturnsFalse;
    this.isPropagationStopped = functionThatReturnsFalse;
    return this;
  }
  assign2(SyntheticBaseEvent.prototype, {
    preventDefault: function() {
      this.defaultPrevented = true;
      var event = this.nativeEvent;
      event && (event.preventDefault ? event.preventDefault() : typeof event.returnValue !== "unknown" && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
    },
    stopPropagation: function() {
      var event = this.nativeEvent;
      event && (event.stopPropagation ? event.stopPropagation() : typeof event.cancelBubble !== "unknown" && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
    },
    persist: function() {},
    isPersistent: functionThatReturnsTrue
  });
  return SyntheticBaseEvent;
}
function modifierStateGetter(keyArg) {
  var nativeEvent = this.nativeEvent;
  return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
}
function getEventModifierState() {
  return modifierStateGetter;
}
function isFallbackCompositionEnd(domEventName, nativeEvent) {
  switch (domEventName) {
    case "keyup":
      return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
    case "keydown":
      return nativeEvent.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return true;
    default:
      return false;
  }
}
function getDataFromCustomEvent(nativeEvent) {
  nativeEvent = nativeEvent.detail;
  return typeof nativeEvent === "object" && "data" in nativeEvent ? nativeEvent.data : null;
}
function getNativeBeforeInputChars(domEventName, nativeEvent) {
  switch (domEventName) {
    case "compositionend":
      return getDataFromCustomEvent(nativeEvent);
    case "keypress":
      if (nativeEvent.which !== 32)
        return null;
      hasSpaceKeypress = true;
      return SPACEBAR_CHAR;
    case "textInput":
      return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
    default:
      return null;
  }
}
function getFallbackBeforeInputChars(domEventName, nativeEvent) {
  if (isComposing)
    return domEventName === "compositionend" || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = false, domEventName) : null;
  switch (domEventName) {
    case "paste":
      return null;
    case "keypress":
      if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
        if (nativeEvent.char && 1 < nativeEvent.char.length)
          return nativeEvent.char;
        if (nativeEvent.which)
          return String.fromCharCode(nativeEvent.which);
      }
      return null;
    case "compositionend":
      return useFallbackCompositionData && nativeEvent.locale !== "ko" ? null : nativeEvent.data;
    default:
      return null;
  }
}
function isTextInputElement(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName === "input" ? !!supportedInputTypes[elem.type] : nodeName === "textarea" ? true : false;
}
function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
  restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
  inst = accumulateTwoPhaseListeners(inst, "onChange");
  0 < inst.length && (nativeEvent = new SyntheticEvent("onChange", "change", null, nativeEvent, target), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
}
function runEventInBatch(dispatchQueue) {
  processDispatchQueue(dispatchQueue, 0);
}
function getInstIfValueChanged(targetInst) {
  var targetNode = getNodeFromInstance(targetInst);
  if (updateValueIfChanged(targetNode))
    return targetInst;
}
function getTargetInstForChangeEvent(domEventName, targetInst) {
  if (domEventName === "change")
    return targetInst;
}
function stopWatchingForValueChange() {
  activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
}
function handlePropertyChange(nativeEvent) {
  if (nativeEvent.propertyName === "value" && getInstIfValueChanged(activeElementInst$1)) {
    var dispatchQueue = [];
    createAndAccumulateChangeEvent(dispatchQueue, activeElementInst$1, nativeEvent, getEventTarget(nativeEvent));
    batchedUpdates$1(runEventInBatch, dispatchQueue);
  }
}
function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
  domEventName === "focusin" ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : domEventName === "focusout" && stopWatchingForValueChange();
}
function getTargetInstForInputEventPolyfill(domEventName) {
  if (domEventName === "selectionchange" || domEventName === "keyup" || domEventName === "keydown")
    return getInstIfValueChanged(activeElementInst$1);
}
function getTargetInstForClickEvent(domEventName, targetInst) {
  if (domEventName === "click")
    return getInstIfValueChanged(targetInst);
}
function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
  if (domEventName === "input" || domEventName === "change")
    return getInstIfValueChanged(targetInst);
}
function is(x, y) {
  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
}
function shallowEqual(objA, objB) {
  if (objectIs(objA, objB))
    return true;
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null)
    return false;
  var keysA = Object.keys(objA), keysB = Object.keys(objB);
  if (keysA.length !== keysB.length)
    return false;
  for (keysB = 0;keysB < keysA.length; keysB++) {
    var currentKey = keysA[keysB];
    if (!hasOwnProperty2.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
      return false;
  }
  return true;
}
function getLeafNode(node) {
  for (;node && node.firstChild; )
    node = node.firstChild;
  return node;
}
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  root = 0;
  for (var nodeEnd;node; ) {
    if (node.nodeType === 3) {
      nodeEnd = root + node.textContent.length;
      if (root <= offset && nodeEnd >= offset)
        return { node, offset: offset - root };
      root = nodeEnd;
    }
    a: {
      for (;node; ) {
        if (node.nextSibling) {
          node = node.nextSibling;
          break a;
        }
        node = node.parentNode;
      }
      node = undefined;
    }
    node = getLeafNode(node);
  }
}
function containsNode(outerNode, innerNode) {
  return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && outerNode.nodeType === 3 ? false : innerNode && innerNode.nodeType === 3 ? containsNode(outerNode, innerNode.parentNode) : ("contains" in outerNode) ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
}
function getActiveElementDeep(containerInfo) {
  containerInfo = containerInfo != null && containerInfo.ownerDocument != null && containerInfo.ownerDocument.defaultView != null ? containerInfo.ownerDocument.defaultView : window;
  for (var element = getActiveElement(containerInfo.document);element instanceof containerInfo.HTMLIFrameElement; ) {
    try {
      var JSCompiler_inline_result = typeof element.contentWindow.location.href === "string";
    } catch (err) {
      JSCompiler_inline_result = false;
    }
    if (JSCompiler_inline_result)
      containerInfo = element.contentWindow;
    else
      break;
    element = getActiveElement(containerInfo.document);
  }
  return element;
}
function hasSelectionCapabilities(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName && (nodeName === "input" && (elem.type === "text" || elem.type === "search" || elem.type === "tel" || elem.type === "url" || elem.type === "password") || nodeName === "textarea" || elem.contentEditable === "true");
}
function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
  var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : nativeEventTarget.nodeType === 9 ? nativeEventTarget : nativeEventTarget.ownerDocument;
  mouseDown || activeElement == null || activeElement !== getActiveElement(doc) || (doc = activeElement, ("selectionStart" in doc) && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
    anchorNode: doc.anchorNode,
    anchorOffset: doc.anchorOffset,
    focusNode: doc.focusNode,
    focusOffset: doc.focusOffset
  }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent("onSelect", "select", null, nativeEvent, nativeEventTarget), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
}
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes["Webkit" + styleProp] = "webkit" + eventName;
  prefixes["Moz" + styleProp] = "moz" + eventName;
  return prefixes;
}
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName])
    return prefixedEventNames[eventName];
  if (!vendorPrefixes[eventName])
    return eventName;
  var prefixMap = vendorPrefixes[eventName], styleProp;
  for (styleProp in prefixMap)
    if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
      return prefixedEventNames[eventName] = prefixMap[styleProp];
  return eventName;
}
function registerSimpleEvent(domEventName, reactName) {
  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]);
}
function finishQueueingConcurrentUpdates() {
  for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0;i < endIndex; ) {
    var fiber = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var queue = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var update = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var lane = concurrentQueues[i];
    concurrentQueues[i++] = null;
    if (queue !== null && update !== null) {
      var pending = queue.pending;
      pending === null ? update.next = update : (update.next = pending.next, pending.next = update);
      queue.pending = update;
    }
    lane !== 0 && markUpdateLaneFromFiberToRoot(fiber, update, lane);
  }
}
function enqueueUpdate$1(fiber, queue, update, lane) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;
  concurrentlyUpdatedLanes |= lane;
  fiber.lanes |= lane;
  fiber = fiber.alternate;
  fiber !== null && (fiber.lanes |= lane);
}
function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
  enqueueUpdate$1(fiber, queue, update, lane);
  return getRootForUpdatedFiber(fiber);
}
function enqueueConcurrentRenderForLane(fiber, lane) {
  enqueueUpdate$1(fiber, null, null, lane);
  return getRootForUpdatedFiber(fiber);
}
function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
  sourceFiber.lanes |= lane;
  var alternate = sourceFiber.alternate;
  alternate !== null && (alternate.lanes |= lane);
  for (var isHidden = false, parent = sourceFiber.return;parent !== null; )
    parent.childLanes |= lane, alternate = parent.alternate, alternate !== null && (alternate.childLanes |= lane), parent.tag === 22 && (sourceFiber = parent.stateNode, sourceFiber === null || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
  return sourceFiber.tag === 3 ? (parent = sourceFiber.stateNode, isHidden && update !== null && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], alternate === null ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
}
function getRootForUpdatedFiber(sourceFiber) {
  if (50 < nestedUpdateCount)
    throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage2(185));
  for (var parent = sourceFiber.return;parent !== null; )
    sourceFiber = parent, parent = sourceFiber.return;
  return sourceFiber.tag === 3 ? sourceFiber.stateNode : null;
}
function FiberNode(tag, pendingProps, key, mode) {
  this.tag = tag;
  this.key = key;
  this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
  this.index = 0;
  this.refCleanup = this.ref = null;
  this.pendingProps = pendingProps;
  this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
  this.mode = mode;
  this.subtreeFlags = this.flags = 0;
  this.deletions = null;
  this.childLanes = this.lanes = 0;
  this.alternate = null;
}
function createFiberImplClass(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
}
function shouldConstruct(Component) {
  Component = Component.prototype;
  return !(!Component || !Component.isReactComponent);
}
function createWorkInProgress(current, pendingProps) {
  var workInProgress = current.alternate;
  workInProgress === null ? (workInProgress = createFiberImplClass(current.tag, pendingProps, current.key, current.mode), workInProgress.elementType = current.elementType, workInProgress.type = current.type, workInProgress.stateNode = current.stateNode, workInProgress.alternate = current, current.alternate = workInProgress) : (workInProgress.pendingProps = pendingProps, workInProgress.type = current.type, workInProgress.flags = 0, workInProgress.subtreeFlags = 0, workInProgress.deletions = null);
  workInProgress.flags = current.flags & 65011712;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  pendingProps = current.dependencies;
  workInProgress.dependencies = pendingProps === null ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;
  workInProgress.refCleanup = current.refCleanup;
  return workInProgress;
}
function resetWorkInProgress(workInProgress, renderLanes) {
  workInProgress.flags &= 65011714;
  var current = workInProgress.alternate;
  current === null ? (workInProgress.childLanes = 0, workInProgress.lanes = renderLanes, workInProgress.child = null, workInProgress.subtreeFlags = 0, workInProgress.memoizedProps = null, workInProgress.memoizedState = null, workInProgress.updateQueue = null, workInProgress.dependencies = null, workInProgress.stateNode = null) : (workInProgress.childLanes = current.childLanes, workInProgress.lanes = current.lanes, workInProgress.child = current.child, workInProgress.subtreeFlags = 0, workInProgress.deletions = null, workInProgress.memoizedProps = current.memoizedProps, workInProgress.memoizedState = current.memoizedState, workInProgress.updateQueue = current.updateQueue, workInProgress.type = current.type, renderLanes = current.dependencies, workInProgress.dependencies = renderLanes === null ? null : {
    lanes: renderLanes.lanes,
    firstContext: renderLanes.firstContext
  });
  return workInProgress;
}
function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
  var fiberTag = 0;
  owner = type;
  if (typeof type === "function")
    shouldConstruct(type) && (fiberTag = 1);
  else if (typeof type === "string")
    fiberTag = isHostHoistableType(type, pendingProps, contextStackCursor.current) ? 26 : type === "html" || type === "head" || type === "body" ? 27 : 5;
  else
    a:
      switch (type) {
        case REACT_ACTIVITY_TYPE2:
          return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE2, type.lanes = lanes, type;
        case REACT_FRAGMENT_TYPE3:
          return createFiberFromFragment(pendingProps.children, mode, lanes, key);
        case REACT_STRICT_MODE_TYPE2:
          fiberTag = 8;
          mode |= 24;
          break;
        case REACT_PROFILER_TYPE2:
          return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE2, type.lanes = lanes, type;
        case REACT_SUSPENSE_TYPE2:
          return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE2, type.lanes = lanes, type;
        case REACT_SUSPENSE_LIST_TYPE:
          return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
        default:
          if (typeof type === "object" && type !== null)
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE2:
                fiberTag = 10;
                break a;
              case REACT_CONSUMER_TYPE2:
                fiberTag = 9;
                break a;
              case REACT_FORWARD_REF_TYPE2:
                fiberTag = 11;
                break a;
              case REACT_MEMO_TYPE2:
                fiberTag = 14;
                break a;
              case REACT_LAZY_TYPE2:
                fiberTag = 16;
                owner = null;
                break a;
            }
          fiberTag = 29;
          pendingProps = Error(formatProdErrorMessage2(130, type === null ? "null" : typeof type, ""));
          owner = null;
      }
  key = createFiberImplClass(fiberTag, pendingProps, key, mode);
  key.elementType = type;
  key.type = owner;
  key.lanes = lanes;
  return key;
}
function createFiberFromFragment(elements, mode, lanes, key) {
  elements = createFiberImplClass(7, elements, key, mode);
  elements.lanes = lanes;
  return elements;
}
function createFiberFromText(content, mode, lanes) {
  content = createFiberImplClass(6, content, null, mode);
  content.lanes = lanes;
  return content;
}
function createFiberFromDehydratedFragment(dehydratedNode) {
  var fiber = createFiberImplClass(18, null, null, 0);
  fiber.stateNode = dehydratedNode;
  return fiber;
}
function createFiberFromPortal(portal, mode, lanes) {
  mode = createFiberImplClass(4, portal.children !== null ? portal.children : [], portal.key, mode);
  mode.lanes = lanes;
  mode.stateNode = {
    containerInfo: portal.containerInfo,
    pendingChildren: null,
    implementation: portal.implementation
  };
  return mode;
}
function createCapturedValueAtFiber(value, source) {
  if (typeof value === "object" && value !== null) {
    var existing = CapturedStacks.get(value);
    if (existing !== undefined)
      return existing;
    source = {
      value,
      source,
      stack: getStackByFiberInDevAndProd(source)
    };
    CapturedStacks.set(value, source);
    return source;
  }
  return {
    value,
    source,
    stack: getStackByFiberInDevAndProd(source)
  };
}
function pushTreeFork(workInProgress, totalChildren) {
  forkStack[forkStackIndex++] = treeForkCount;
  forkStack[forkStackIndex++] = treeForkProvider;
  treeForkProvider = workInProgress;
  treeForkCount = totalChildren;
}
function pushTreeId(workInProgress, totalChildren, index) {
  idStack[idStackIndex++] = treeContextId;
  idStack[idStackIndex++] = treeContextOverflow;
  idStack[idStackIndex++] = treeContextProvider;
  treeContextProvider = workInProgress;
  var baseIdWithLeadingBit = treeContextId;
  workInProgress = treeContextOverflow;
  var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
  baseIdWithLeadingBit &= ~(1 << baseLength);
  index += 1;
  var length = 32 - clz32(totalChildren) + baseLength;
  if (30 < length) {
    var numberOfOverflowBits = baseLength - baseLength % 5;
    length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
    baseIdWithLeadingBit >>= numberOfOverflowBits;
    baseLength -= numberOfOverflowBits;
    treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit;
    treeContextOverflow = length + workInProgress;
  } else
    treeContextId = 1 << length | index << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress;
}
function pushMaterializedTreeId(workInProgress) {
  workInProgress.return !== null && (pushTreeFork(workInProgress, 1), pushTreeId(workInProgress, 1, 0));
}
function popTreeContext(workInProgress) {
  for (;workInProgress === treeForkProvider; )
    treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
  for (;workInProgress === treeContextProvider; )
    treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
}
function restoreSuspendedTreeContext(workInProgress, suspendedContext) {
  idStack[idStackIndex++] = treeContextId;
  idStack[idStackIndex++] = treeContextOverflow;
  idStack[idStackIndex++] = treeContextProvider;
  treeContextId = suspendedContext.id;
  treeContextOverflow = suspendedContext.overflow;
  treeContextProvider = workInProgress;
}
function throwOnHydrationMismatch(fiber) {
  var error = Error(formatProdErrorMessage2(418, 1 < arguments.length && arguments[1] !== undefined && arguments[1] ? "text" : "HTML", ""));
  queueHydrationError(createCapturedValueAtFiber(error, fiber));
  throw HydrationMismatchException;
}
function prepareToHydrateHostInstance(fiber) {
  var { stateNode: instance, type, memoizedProps: props } = fiber;
  instance[internalInstanceKey] = fiber;
  instance[internalPropsKey] = props;
  switch (type) {
    case "dialog":
      listenToNonDelegatedEvent("cancel", instance);
      listenToNonDelegatedEvent("close", instance);
      break;
    case "iframe":
    case "object":
    case "embed":
      listenToNonDelegatedEvent("load", instance);
      break;
    case "video":
    case "audio":
      for (type = 0;type < mediaEventTypes.length; type++)
        listenToNonDelegatedEvent(mediaEventTypes[type], instance);
      break;
    case "source":
      listenToNonDelegatedEvent("error", instance);
      break;
    case "img":
    case "image":
    case "link":
      listenToNonDelegatedEvent("error", instance);
      listenToNonDelegatedEvent("load", instance);
      break;
    case "details":
      listenToNonDelegatedEvent("toggle", instance);
      break;
    case "input":
      listenToNonDelegatedEvent("invalid", instance);
      initInput(instance, props.value, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name, true);
      break;
    case "select":
      listenToNonDelegatedEvent("invalid", instance);
      break;
    case "textarea":
      listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
  }
  type = props.children;
  typeof type !== "string" && typeof type !== "number" && typeof type !== "bigint" || instance.textContent === "" + type || props.suppressHydrationWarning === true || checkForUnmatchedText(instance.textContent, type) ? (props.popover != null && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), props.onScroll != null && listenToNonDelegatedEvent("scroll", instance), props.onScrollEnd != null && listenToNonDelegatedEvent("scrollend", instance), props.onClick != null && (instance.onclick = noop$1), instance = true) : instance = false;
  instance || throwOnHydrationMismatch(fiber, true);
}
function popToNextHostParent(fiber) {
  for (hydrationParentFiber = fiber.return;hydrationParentFiber; )
    switch (hydrationParentFiber.tag) {
      case 5:
      case 31:
      case 13:
        rootOrSingletonContext = false;
        return;
      case 27:
      case 3:
        rootOrSingletonContext = true;
        return;
      default:
        hydrationParentFiber = hydrationParentFiber.return;
    }
}
function popHydrationState(fiber) {
  if (fiber !== hydrationParentFiber)
    return false;
  if (!isHydrating)
    return popToNextHostParent(fiber), isHydrating = true, false;
  var tag = fiber.tag, JSCompiler_temp;
  if (JSCompiler_temp = tag !== 3 && tag !== 27) {
    if (JSCompiler_temp = tag === 5)
      JSCompiler_temp = fiber.type, JSCompiler_temp = !(JSCompiler_temp !== "form" && JSCompiler_temp !== "button") || shouldSetTextContent(fiber.type, fiber.memoizedProps);
    JSCompiler_temp = !JSCompiler_temp;
  }
  JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
  popToNextHostParent(fiber);
  if (tag === 13) {
    fiber = fiber.memoizedState;
    fiber = fiber !== null ? fiber.dehydrated : null;
    if (!fiber)
      throw Error(formatProdErrorMessage2(317));
    nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
  } else if (tag === 31) {
    fiber = fiber.memoizedState;
    fiber = fiber !== null ? fiber.dehydrated : null;
    if (!fiber)
      throw Error(formatProdErrorMessage2(317));
    nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
  } else
    tag === 27 ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
  return true;
}
function resetHydrationState() {
  nextHydratableInstance = hydrationParentFiber = null;
  isHydrating = false;
}
function upgradeHydrationErrorsToRecoverable() {
  var queuedErrors = hydrationErrors;
  queuedErrors !== null && (workInProgressRootRecoverableErrors === null ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, queuedErrors), hydrationErrors = null);
  return queuedErrors;
}
function queueHydrationError(error) {
  hydrationErrors === null ? hydrationErrors = [error] : hydrationErrors.push(error);
}
function pushProvider(providerFiber, context, nextValue) {
  push2(valueCursor, context._currentValue);
  context._currentValue = nextValue;
}
function popProvider(context) {
  context._currentValue = valueCursor.current;
  pop2(valueCursor);
}
function scheduleContextWorkOnParentPath(parent, renderLanes, propagationRoot) {
  for (;parent !== null; ) {
    var alternate = parent.alternate;
    (parent.childLanes & renderLanes) !== renderLanes ? (parent.childLanes |= renderLanes, alternate !== null && (alternate.childLanes |= renderLanes)) : alternate !== null && (alternate.childLanes & renderLanes) !== renderLanes && (alternate.childLanes |= renderLanes);
    if (parent === propagationRoot)
      break;
    parent = parent.return;
  }
}
function propagateContextChanges(workInProgress, contexts, renderLanes, forcePropagateEntireTree) {
  var fiber = workInProgress.child;
  fiber !== null && (fiber.return = workInProgress);
  for (;fiber !== null; ) {
    var list = fiber.dependencies;
    if (list !== null) {
      var nextFiber = fiber.child;
      list = list.firstContext;
      a:
        for (;list !== null; ) {
          var dependency = list;
          list = fiber;
          for (var i = 0;i < contexts.length; i++)
            if (dependency.context === contexts[i]) {
              list.lanes |= renderLanes;
              dependency = list.alternate;
              dependency !== null && (dependency.lanes |= renderLanes);
              scheduleContextWorkOnParentPath(list.return, renderLanes, workInProgress);
              forcePropagateEntireTree || (nextFiber = null);
              break a;
            }
          list = dependency.next;
        }
    } else if (fiber.tag === 18) {
      nextFiber = fiber.return;
      if (nextFiber === null)
        throw Error(formatProdErrorMessage2(341));
      nextFiber.lanes |= renderLanes;
      list = nextFiber.alternate;
      list !== null && (list.lanes |= renderLanes);
      scheduleContextWorkOnParentPath(nextFiber, renderLanes, workInProgress);
      nextFiber = null;
    } else
      nextFiber = fiber.child;
    if (nextFiber !== null)
      nextFiber.return = fiber;
    else
      for (nextFiber = fiber;nextFiber !== null; ) {
        if (nextFiber === workInProgress) {
          nextFiber = null;
          break;
        }
        fiber = nextFiber.sibling;
        if (fiber !== null) {
          fiber.return = nextFiber.return;
          nextFiber = fiber;
          break;
        }
        nextFiber = nextFiber.return;
      }
    fiber = nextFiber;
  }
}
function propagateParentContextChanges(current, workInProgress, renderLanes, forcePropagateEntireTree) {
  current = null;
  for (var parent = workInProgress, isInsidePropagationBailout = false;parent !== null; ) {
    if (!isInsidePropagationBailout) {
      if ((parent.flags & 524288) !== 0)
        isInsidePropagationBailout = true;
      else if ((parent.flags & 262144) !== 0)
        break;
    }
    if (parent.tag === 10) {
      var currentParent = parent.alternate;
      if (currentParent === null)
        throw Error(formatProdErrorMessage2(387));
      currentParent = currentParent.memoizedProps;
      if (currentParent !== null) {
        var context = parent.type;
        objectIs(parent.pendingProps.value, currentParent.value) || (current !== null ? current.push(context) : current = [context]);
      }
    } else if (parent === hostTransitionProviderCursor.current) {
      currentParent = parent.alternate;
      if (currentParent === null)
        throw Error(formatProdErrorMessage2(387));
      currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (current !== null ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
    }
    parent = parent.return;
  }
  current !== null && propagateContextChanges(workInProgress, current, renderLanes, forcePropagateEntireTree);
  workInProgress.flags |= 262144;
}
function checkIfContextChanged(currentDependencies) {
  for (currentDependencies = currentDependencies.firstContext;currentDependencies !== null; ) {
    if (!objectIs(currentDependencies.context._currentValue, currentDependencies.memoizedValue))
      return true;
    currentDependencies = currentDependencies.next;
  }
  return false;
}
function prepareToReadContext(workInProgress) {
  currentlyRenderingFiber$1 = workInProgress;
  lastContextDependency = null;
  workInProgress = workInProgress.dependencies;
  workInProgress !== null && (workInProgress.firstContext = null);
}
function readContext(context) {
  return readContextForConsumer(currentlyRenderingFiber$1, context);
}
function readContextDuringReconciliation(consumer, context) {
  currentlyRenderingFiber$1 === null && prepareToReadContext(consumer);
  return readContextForConsumer(consumer, context);
}
function readContextForConsumer(consumer, context) {
  var value = context._currentValue;
  context = { context, memoizedValue: value, next: null };
  if (lastContextDependency === null) {
    if (consumer === null)
      throw Error(formatProdErrorMessage2(308));
    lastContextDependency = context;
    consumer.dependencies = { lanes: 0, firstContext: context };
    consumer.flags |= 524288;
  } else
    lastContextDependency = lastContextDependency.next = context;
  return value;
}
function createCache() {
  return {
    controller: new AbortControllerLocal,
    data: new Map,
    refCount: 0
  };
}
function releaseCache(cache) {
  cache.refCount--;
  cache.refCount === 0 && scheduleCallback$2(NormalPriority, function() {
    cache.controller.abort();
  });
}
function entangleAsyncAction(transition, thenable) {
  if (currentEntangledListeners === null) {
    var entangledListeners = currentEntangledListeners = [];
    currentEntangledPendingCount = 0;
    currentEntangledLane = requestTransitionLane();
    currentEntangledActionThenable = {
      status: "pending",
      value: undefined,
      then: function(resolve) {
        entangledListeners.push(resolve);
      }
    };
  }
  currentEntangledPendingCount++;
  thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
  return thenable;
}
function pingEngtangledActionScope() {
  if (--currentEntangledPendingCount === 0 && currentEntangledListeners !== null) {
    currentEntangledActionThenable !== null && (currentEntangledActionThenable.status = "fulfilled");
    var listeners = currentEntangledListeners;
    currentEntangledListeners = null;
    currentEntangledLane = 0;
    currentEntangledActionThenable = null;
    for (var i = 0;i < listeners.length; i++)
      (0, listeners[i])();
  }
}
function chainThenableValue(thenable, result) {
  var listeners = [], thenableWithOverride = {
    status: "pending",
    value: null,
    reason: null,
    then: function(resolve) {
      listeners.push(resolve);
    }
  };
  thenable.then(function() {
    thenableWithOverride.status = "fulfilled";
    thenableWithOverride.value = result;
    for (var i = 0;i < listeners.length; i++)
      (0, listeners[i])(result);
  }, function(error) {
    thenableWithOverride.status = "rejected";
    thenableWithOverride.reason = error;
    for (error = 0;error < listeners.length; error++)
      (0, listeners[error])(undefined);
  });
  return thenableWithOverride;
}
function peekCacheFromPool() {
  var cacheResumedFromPreviousRender = resumedCache.current;
  return cacheResumedFromPreviousRender !== null ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
}
function pushTransition(offscreenWorkInProgress, prevCachePool) {
  prevCachePool === null ? push2(resumedCache, resumedCache.current) : push2(resumedCache, prevCachePool.pool);
}
function getSuspendedCache() {
  var cacheFromPool = peekCacheFromPool();
  return cacheFromPool === null ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
}
function isThenableResolved(thenable) {
  thenable = thenable.status;
  return thenable === "fulfilled" || thenable === "rejected";
}
function trackUsedThenable(thenableState, thenable, index) {
  index = thenableState[index];
  index === undefined ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop$1, noop$1), thenable = index);
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
    default:
      if (typeof thenable.status === "string")
        thenable.then(noop$1, noop$1);
      else {
        thenableState = workInProgressRoot;
        if (thenableState !== null && 100 < thenableState.shellSuspendCounter)
          throw Error(formatProdErrorMessage2(482));
        thenableState = thenable;
        thenableState.status = "pending";
        thenableState.then(function(fulfilledValue) {
          if (thenable.status === "pending") {
            var fulfilledThenable = thenable;
            fulfilledThenable.status = "fulfilled";
            fulfilledThenable.value = fulfilledValue;
          }
        }, function(error) {
          if (thenable.status === "pending") {
            var rejectedThenable = thenable;
            rejectedThenable.status = "rejected";
            rejectedThenable.reason = error;
          }
        });
      }
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
      }
      suspendedThenable = thenable;
      throw SuspenseException;
  }
}
function resolveLazy(lazyType) {
  try {
    var init = lazyType._init;
    return init(lazyType._payload);
  } catch (x) {
    if (x !== null && typeof x === "object" && typeof x.then === "function")
      throw suspendedThenable = x, SuspenseException;
    throw x;
  }
}
function getSuspendedThenable() {
  if (suspendedThenable === null)
    throw Error(formatProdErrorMessage2(459));
  var thenable = suspendedThenable;
  suspendedThenable = null;
  return thenable;
}
function checkIfUseWrappedInAsyncCatch(rejectedReason) {
  if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
    throw Error(formatProdErrorMessage2(483));
}
function unwrapThenable(thenable) {
  var index = thenableIndexCounter$1;
  thenableIndexCounter$1 += 1;
  thenableState$1 === null && (thenableState$1 = []);
  return trackUsedThenable(thenableState$1, thenable, index);
}
function coerceRef(workInProgress, element) {
  element = element.props.ref;
  workInProgress.ref = element !== undefined ? element : null;
}
function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
  if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
    throw Error(formatProdErrorMessage2(525));
  returnFiber = Object.prototype.toString.call(newChild);
  throw Error(formatProdErrorMessage2(31, returnFiber === "[object Object]" ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber));
}
function createChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (shouldTrackSideEffects) {
      var deletions = returnFiber.deletions;
      deletions === null ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
    }
  }
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects)
      return null;
    for (;currentFirstChild !== null; )
      deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
    return null;
  }
  function mapRemainingChildren(currentFirstChild) {
    for (var existingChildren = new Map;currentFirstChild !== null; )
      currentFirstChild.key !== null ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
    return existingChildren;
  }
  function useFiber(fiber, pendingProps) {
    fiber = createWorkInProgress(fiber, pendingProps);
    fiber.index = 0;
    fiber.sibling = null;
    return fiber;
  }
  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects)
      return newFiber.flags |= 1048576, lastPlacedIndex;
    newIndex = newFiber.alternate;
    if (newIndex !== null)
      return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
    newFiber.flags |= 67108866;
    return lastPlacedIndex;
  }
  function placeSingleChild(newFiber) {
    shouldTrackSideEffects && newFiber.alternate === null && (newFiber.flags |= 67108866);
    return newFiber;
  }
  function updateTextNode(returnFiber, current, textContent, lanes) {
    if (current === null || current.tag !== 6)
      return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
    current = useFiber(current, textContent);
    current.return = returnFiber;
    return current;
  }
  function updateElement(returnFiber, current, element, lanes) {
    var elementType = element.type;
    if (elementType === REACT_FRAGMENT_TYPE3)
      return updateFragment(returnFiber, current, element.props.children, lanes, element.key);
    if (current !== null && (current.elementType === elementType || typeof elementType === "object" && elementType !== null && elementType.$$typeof === REACT_LAZY_TYPE2 && resolveLazy(elementType) === current.type))
      return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
    current = createFiberFromTypeAndProps(element.type, element.key, element.props, null, returnFiber.mode, lanes);
    coerceRef(current, element);
    current.return = returnFiber;
    return current;
  }
  function updatePortal(returnFiber, current, portal, lanes) {
    if (current === null || current.tag !== 4 || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
      return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
    current = useFiber(current, portal.children || []);
    current.return = returnFiber;
    return current;
  }
  function updateFragment(returnFiber, current, fragment, lanes, key) {
    if (current === null || current.tag !== 7)
      return current = createFiberFromFragment(fragment, returnFiber.mode, lanes, key), current.return = returnFiber, current;
    current = useFiber(current, fragment);
    current.return = returnFiber;
    return current;
  }
  function createChild(returnFiber, newChild, lanes) {
    if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number" || typeof newChild === "bigint")
      return newChild = createFiberFromText("" + newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE3:
          return lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
        case REACT_PORTAL_TYPE3:
          return newChild = createFiberFromPortal(newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
        case REACT_LAZY_TYPE2:
          return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
      }
      if (isArrayImpl2(newChild) || getIteratorFn2(newChild))
        return newChild = createFiberFromFragment(newChild, returnFiber.mode, lanes, null), newChild.return = returnFiber, newChild;
      if (typeof newChild.then === "function")
        return createChild(returnFiber, unwrapThenable(newChild), lanes);
      if (newChild.$$typeof === REACT_CONTEXT_TYPE2)
        return createChild(returnFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
      throwOnInvalidObjectTypeImpl(returnFiber, newChild);
    }
    return null;
  }
  function updateSlot(returnFiber, oldFiber, newChild, lanes) {
    var key = oldFiber !== null ? oldFiber.key : null;
    if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number" || typeof newChild === "bigint")
      return key !== null ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE3:
          return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
        case REACT_PORTAL_TYPE3:
          return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
        case REACT_LAZY_TYPE2:
          return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
      }
      if (isArrayImpl2(newChild) || getIteratorFn2(newChild))
        return key !== null ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
      if (typeof newChild.then === "function")
        return updateSlot(returnFiber, oldFiber, unwrapThenable(newChild), lanes);
      if (newChild.$$typeof === REACT_CONTEXT_TYPE2)
        return updateSlot(returnFiber, oldFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
      throwOnInvalidObjectTypeImpl(returnFiber, newChild);
    }
    return null;
  }
  function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
    if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number" || typeof newChild === "bigint")
      return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE3:
          return existingChildren = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
        case REACT_PORTAL_TYPE3:
          return existingChildren = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
        case REACT_LAZY_TYPE2:
          return newChild = resolveLazy(newChild), updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes);
      }
      if (isArrayImpl2(newChild) || getIteratorFn2(newChild))
        return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
      if (typeof newChild.then === "function")
        return updateFromMap(existingChildren, returnFiber, newIdx, unwrapThenable(newChild), lanes);
      if (newChild.$$typeof === REACT_CONTEXT_TYPE2)
        return updateFromMap(existingChildren, returnFiber, newIdx, readContextDuringReconciliation(returnFiber, newChild), lanes);
      throwOnInvalidObjectTypeImpl(returnFiber, newChild);
    }
    return null;
  }
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
    for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null;oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
      var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
      if (newFiber === null) {
        oldFiber === null && (oldFiber = nextOldFiber);
        break;
      }
      shouldTrackSideEffects && oldFiber && newFiber.alternate === null && deleteChild(returnFiber, oldFiber);
      currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
      previousNewFiber === null ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    if (newIdx === newChildren.length)
      return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
    if (oldFiber === null) {
      for (;newIdx < newChildren.length; newIdx++)
        oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), oldFiber !== null && (currentFirstChild = placeChild(oldFiber, currentFirstChild, newIdx), previousNewFiber === null ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    for (oldFiber = mapRemainingChildren(oldFiber);newIdx < newChildren.length; newIdx++)
      nextOldFiber = updateFromMap(oldFiber, returnFiber, newIdx, newChildren[newIdx], lanes), nextOldFiber !== null && (shouldTrackSideEffects && nextOldFiber.alternate !== null && oldFiber.delete(nextOldFiber.key === null ? newIdx : nextOldFiber.key), currentFirstChild = placeChild(nextOldFiber, currentFirstChild, newIdx), previousNewFiber === null ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
    shouldTrackSideEffects && oldFiber.forEach(function(child) {
      return deleteChild(returnFiber, child);
    });
    isHydrating && pushTreeFork(returnFiber, newIdx);
    return resultingFirstChild;
  }
  function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
    if (newChildren == null)
      throw Error(formatProdErrorMessage2(151));
    for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next();oldFiber !== null && !step.done; newIdx++, step = newChildren.next()) {
      oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
      var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
      if (newFiber === null) {
        oldFiber === null && (oldFiber = nextOldFiber);
        break;
      }
      shouldTrackSideEffects && oldFiber && newFiber.alternate === null && deleteChild(returnFiber, oldFiber);
      currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
      previousNewFiber === null ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    if (step.done)
      return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
    if (oldFiber === null) {
      for (;!step.done; newIdx++, step = newChildren.next())
        step = createChild(returnFiber, step.value, lanes), step !== null && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), previousNewFiber === null ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    for (oldFiber = mapRemainingChildren(oldFiber);!step.done; newIdx++, step = newChildren.next())
      step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), step !== null && (shouldTrackSideEffects && step.alternate !== null && oldFiber.delete(step.key === null ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), previousNewFiber === null ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
    shouldTrackSideEffects && oldFiber.forEach(function(child) {
      return deleteChild(returnFiber, child);
    });
    isHydrating && pushTreeFork(returnFiber, newIdx);
    return resultingFirstChild;
  }
  function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
    typeof newChild === "object" && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE3 && newChild.key === null && (newChild = newChild.props.children);
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE3:
          a: {
            for (var key = newChild.key;currentFirstChild !== null; ) {
              if (currentFirstChild.key === key) {
                key = newChild.type;
                if (key === REACT_FRAGMENT_TYPE3) {
                  if (currentFirstChild.tag === 7) {
                    deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
                    lanes = useFiber(currentFirstChild, newChild.props.children);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  }
                } else if (currentFirstChild.elementType === key || typeof key === "object" && key !== null && key.$$typeof === REACT_LAZY_TYPE2 && resolveLazy(key) === currentFirstChild.type) {
                  deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
                  lanes = useFiber(currentFirstChild, newChild.props);
                  coerceRef(lanes, newChild);
                  lanes.return = returnFiber;
                  returnFiber = lanes;
                  break a;
                }
                deleteRemainingChildren(returnFiber, currentFirstChild);
                break;
              } else
                deleteChild(returnFiber, currentFirstChild);
              currentFirstChild = currentFirstChild.sibling;
            }
            newChild.type === REACT_FRAGMENT_TYPE3 ? (lanes = createFiberFromFragment(newChild.props.children, returnFiber.mode, lanes, newChild.key), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
          }
          return placeSingleChild(returnFiber);
        case REACT_PORTAL_TYPE3:
          a: {
            for (key = newChild.key;currentFirstChild !== null; ) {
              if (currentFirstChild.key === key)
                if (currentFirstChild.tag === 4 && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                  deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
                  lanes = useFiber(currentFirstChild, newChild.children || []);
                  lanes.return = returnFiber;
                  returnFiber = lanes;
                  break a;
                } else {
                  deleteRemainingChildren(returnFiber, currentFirstChild);
                  break;
                }
              else
                deleteChild(returnFiber, currentFirstChild);
              currentFirstChild = currentFirstChild.sibling;
            }
            lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
            lanes.return = returnFiber;
            returnFiber = lanes;
          }
          return placeSingleChild(returnFiber);
        case REACT_LAZY_TYPE2:
          return newChild = resolveLazy(newChild), reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
      }
      if (isArrayImpl2(newChild))
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
      if (getIteratorFn2(newChild)) {
        key = getIteratorFn2(newChild);
        if (typeof key !== "function")
          throw Error(formatProdErrorMessage2(150));
        newChild = key.call(newChild);
        return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);
      }
      if (typeof newChild.then === "function")
        return reconcileChildFibersImpl(returnFiber, currentFirstChild, unwrapThenable(newChild), lanes);
      if (newChild.$$typeof === REACT_CONTEXT_TYPE2)
        return reconcileChildFibersImpl(returnFiber, currentFirstChild, readContextDuringReconciliation(returnFiber, newChild), lanes);
      throwOnInvalidObjectTypeImpl(returnFiber, newChild);
    }
    return typeof newChild === "string" && newChild !== "" || typeof newChild === "number" || typeof newChild === "bigint" ? (newChild = "" + newChild, currentFirstChild !== null && currentFirstChild.tag === 6 ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
  }
  return function(returnFiber, currentFirstChild, newChild, lanes) {
    try {
      thenableIndexCounter$1 = 0;
      var firstChildFiber = reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
      thenableState$1 = null;
      return firstChildFiber;
    } catch (x) {
      if (x === SuspenseException || x === SuspenseActionException)
        throw x;
      var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
      fiber.lanes = lanes;
      fiber.return = returnFiber;
      return fiber;
    } finally {}
  };
}
function initializeUpdateQueue(fiber) {
  fiber.updateQueue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, lanes: 0, hiddenCallbacks: null },
    callbacks: null
  };
}
function cloneUpdateQueue(current, workInProgress) {
  current = current.updateQueue;
  workInProgress.updateQueue === current && (workInProgress.updateQueue = {
    baseState: current.baseState,
    firstBaseUpdate: current.firstBaseUpdate,
    lastBaseUpdate: current.lastBaseUpdate,
    shared: current.shared,
    callbacks: null
  });
}
function createUpdate(lane) {
  return { lane, tag: 0, payload: null, callback: null, next: null };
}
function enqueueUpdate(fiber, update, lane) {
  var updateQueue = fiber.updateQueue;
  if (updateQueue === null)
    return null;
  updateQueue = updateQueue.shared;
  if ((executionContext & 2) !== 0) {
    var pending = updateQueue.pending;
    pending === null ? update.next = update : (update.next = pending.next, pending.next = update);
    updateQueue.pending = update;
    update = getRootForUpdatedFiber(fiber);
    markUpdateLaneFromFiberToRoot(fiber, null, lane);
    return update;
  }
  enqueueUpdate$1(fiber, updateQueue, update, lane);
  return getRootForUpdatedFiber(fiber);
}
function entangleTransitions(root, fiber, lane) {
  fiber = fiber.updateQueue;
  if (fiber !== null && (fiber = fiber.shared, (lane & 4194048) !== 0)) {
    var queueLanes = fiber.lanes;
    queueLanes &= root.pendingLanes;
    lane |= queueLanes;
    fiber.lanes = lane;
    markRootEntangled(root, lane);
  }
}
function enqueueCapturedUpdate(workInProgress, capturedUpdate) {
  var queue = workInProgress.updateQueue, current = workInProgress.alternate;
  if (current !== null && (current = current.updateQueue, queue === current)) {
    var newFirst = null, newLast = null;
    queue = queue.firstBaseUpdate;
    if (queue !== null) {
      do {
        var clone = {
          lane: queue.lane,
          tag: queue.tag,
          payload: queue.payload,
          callback: null,
          next: null
        };
        newLast === null ? newFirst = newLast = clone : newLast = newLast.next = clone;
        queue = queue.next;
      } while (queue !== null);
      newLast === null ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
    } else
      newFirst = newLast = capturedUpdate;
    queue = {
      baseState: current.baseState,
      firstBaseUpdate: newFirst,
      lastBaseUpdate: newLast,
      shared: current.shared,
      callbacks: current.callbacks
    };
    workInProgress.updateQueue = queue;
    return;
  }
  workInProgress = queue.lastBaseUpdate;
  workInProgress === null ? queue.firstBaseUpdate = capturedUpdate : workInProgress.next = capturedUpdate;
  queue.lastBaseUpdate = capturedUpdate;
}
function suspendIfUpdateReadFromEntangledAsyncAction() {
  if (didReadFromEntangledAsyncAction) {
    var entangledActionThenable = currentEntangledActionThenable;
    if (entangledActionThenable !== null)
      throw entangledActionThenable;
  }
}
function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes) {
  didReadFromEntangledAsyncAction = false;
  var queue = workInProgress$jscomp$0.updateQueue;
  hasForceUpdate = false;
  var { firstBaseUpdate, lastBaseUpdate } = queue, pendingQueue = queue.shared.pending;
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    lastBaseUpdate === null ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
    lastBaseUpdate = lastPendingUpdate;
    var current = workInProgress$jscomp$0.alternate;
    current !== null && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (pendingQueue === null ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
  }
  if (firstBaseUpdate !== null) {
    var newState = queue.baseState;
    lastBaseUpdate = 0;
    current = firstPendingUpdate = lastPendingUpdate = null;
    pendingQueue = firstBaseUpdate;
    do {
      var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
      if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
        updateLane !== 0 && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
        current !== null && (current = current.next = {
          lane: 0,
          tag: pendingQueue.tag,
          payload: pendingQueue.payload,
          callback: null,
          next: null
        });
        a: {
          var workInProgress = workInProgress$jscomp$0, update = pendingQueue;
          updateLane = props;
          var instance = instance$jscomp$0;
          switch (update.tag) {
            case 1:
              workInProgress = update.payload;
              if (typeof workInProgress === "function") {
                newState = workInProgress.call(instance, newState, updateLane);
                break a;
              }
              newState = workInProgress;
              break a;
            case 3:
              workInProgress.flags = workInProgress.flags & -65537 | 128;
            case 0:
              workInProgress = update.payload;
              updateLane = typeof workInProgress === "function" ? workInProgress.call(instance, newState, updateLane) : workInProgress;
              if (updateLane === null || updateLane === undefined)
                break a;
              newState = assign2({}, newState, updateLane);
              break a;
            case 2:
              hasForceUpdate = true;
          }
        }
        updateLane = pendingQueue.callback;
        updateLane !== null && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, isHiddenUpdate === null ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
      } else
        isHiddenUpdate = {
          lane: updateLane,
          tag: pendingQueue.tag,
          payload: pendingQueue.payload,
          callback: pendingQueue.callback,
          next: null
        }, current === null ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
      pendingQueue = pendingQueue.next;
      if (pendingQueue === null)
        if (pendingQueue = queue.shared.pending, pendingQueue === null)
          break;
        else
          isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
    } while (1);
    current === null && (lastPendingUpdate = newState);
    queue.baseState = lastPendingUpdate;
    queue.firstBaseUpdate = firstPendingUpdate;
    queue.lastBaseUpdate = current;
    firstBaseUpdate === null && (queue.shared.lanes = 0);
    workInProgressRootSkippedLanes |= lastBaseUpdate;
    workInProgress$jscomp$0.lanes = lastBaseUpdate;
    workInProgress$jscomp$0.memoizedState = newState;
  }
}
function callCallback(callback, context) {
  if (typeof callback !== "function")
    throw Error(formatProdErrorMessage2(191, callback));
  callback.call(context);
}
function commitCallbacks(updateQueue, context) {
  var callbacks = updateQueue.callbacks;
  if (callbacks !== null)
    for (updateQueue.callbacks = null, updateQueue = 0;updateQueue < callbacks.length; updateQueue++)
      callCallback(callbacks[updateQueue], context);
}
function pushHiddenContext(fiber, context) {
  fiber = entangledRenderLanes;
  push2(prevEntangledRenderLanesCursor, fiber);
  push2(currentTreeHiddenStackCursor, context);
  entangledRenderLanes = fiber | context.baseLanes;
}
function reuseHiddenContextOnStack() {
  push2(prevEntangledRenderLanesCursor, entangledRenderLanes);
  push2(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
}
function popHiddenContext() {
  entangledRenderLanes = prevEntangledRenderLanesCursor.current;
  pop2(currentTreeHiddenStackCursor);
  pop2(prevEntangledRenderLanesCursor);
}
function pushPrimaryTreeSuspenseHandler(handler) {
  var current = handler.alternate;
  push2(suspenseStackCursor, suspenseStackCursor.current & 1);
  push2(suspenseHandlerStackCursor, handler);
  shellBoundary === null && (current === null || currentTreeHiddenStackCursor.current !== null ? shellBoundary = handler : current.memoizedState !== null && (shellBoundary = handler));
}
function pushDehydratedActivitySuspenseHandler(fiber) {
  push2(suspenseStackCursor, suspenseStackCursor.current);
  push2(suspenseHandlerStackCursor, fiber);
  shellBoundary === null && (shellBoundary = fiber);
}
function pushOffscreenSuspenseHandler(fiber) {
  fiber.tag === 22 ? (push2(suspenseStackCursor, suspenseStackCursor.current), push2(suspenseHandlerStackCursor, fiber), shellBoundary === null && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack(fiber);
}
function reuseSuspenseHandlerOnStack() {
  push2(suspenseStackCursor, suspenseStackCursor.current);
  push2(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
}
function popSuspenseHandler(fiber) {
  pop2(suspenseHandlerStackCursor);
  shellBoundary === fiber && (shellBoundary = null);
  pop2(suspenseStackCursor);
}
function findFirstSuspended(row) {
  for (var node = row;node !== null; ) {
    if (node.tag === 13) {
      var state = node.memoizedState;
      if (state !== null && (state = state.dehydrated, state === null || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state)))
        return node;
    } else if (node.tag === 19 && (node.memoizedProps.revealOrder === "forwards" || node.memoizedProps.revealOrder === "backwards" || node.memoizedProps.revealOrder === "unstable_legacy-backwards" || node.memoizedProps.revealOrder === "together")) {
      if ((node.flags & 128) !== 0)
        return node;
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === row)
      break;
    for (;node.sibling === null; ) {
      if (node.return === null || node.return === row)
        return null;
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
  return null;
}
function throwInvalidHookError() {
  throw Error(formatProdErrorMessage2(321));
}
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null)
    return false;
  for (var i = 0;i < prevDeps.length && i < nextDeps.length; i++)
    if (!objectIs(nextDeps[i], prevDeps[i]))
      return false;
  return true;
}
function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = 0;
  ReactSharedInternals3.H = current === null || current.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
  shouldDoubleInvokeUserFnsInHooksDEV = false;
  nextRenderLanes = Component(props, secondArg);
  shouldDoubleInvokeUserFnsInHooksDEV = false;
  didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(workInProgress, Component, props, secondArg));
  finishRenderingHooks(current);
  return nextRenderLanes;
}
function finishRenderingHooks(current) {
  ReactSharedInternals3.H = ContextOnlyDispatcher;
  var didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;
  renderLanes = 0;
  workInProgressHook = currentHook = currentlyRenderingFiber = null;
  didScheduleRenderPhaseUpdate = false;
  thenableIndexCounter = 0;
  thenableState = null;
  if (didRenderTooFewHooks)
    throw Error(formatProdErrorMessage2(300));
  current === null || didReceiveUpdate || (current = current.dependencies, current !== null && checkIfContextChanged(current) && (didReceiveUpdate = true));
}
function renderWithHooksAgain(workInProgress, Component, props, secondArg) {
  currentlyRenderingFiber = workInProgress;
  var numberOfReRenders = 0;
  do {
    didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
    thenableIndexCounter = 0;
    didScheduleRenderPhaseUpdateDuringThisPass = false;
    if (25 <= numberOfReRenders)
      throw Error(formatProdErrorMessage2(301));
    numberOfReRenders += 1;
    workInProgressHook = currentHook = null;
    if (workInProgress.updateQueue != null) {
      var children = workInProgress.updateQueue;
      children.lastEffect = null;
      children.events = null;
      children.stores = null;
      children.memoCache != null && (children.memoCache.index = 0);
    }
    ReactSharedInternals3.H = HooksDispatcherOnRerender;
    children = Component(props, secondArg);
  } while (didScheduleRenderPhaseUpdateDuringThisPass);
  return children;
}
function TransitionAwareHostComponent() {
  var dispatcher = ReactSharedInternals3.H, maybeThenable = dispatcher.useState()[0];
  maybeThenable = typeof maybeThenable.then === "function" ? useThenable(maybeThenable) : maybeThenable;
  dispatcher = dispatcher.useState()[0];
  (currentHook !== null ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
  return maybeThenable;
}
function checkDidRenderIdHook() {
  var didRenderIdHook = localIdCounter !== 0;
  localIdCounter = 0;
  return didRenderIdHook;
}
function bailoutHooks(current, workInProgress, lanes) {
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.flags &= -2053;
  current.lanes &= ~lanes;
}
function resetHooksOnUnwind(workInProgress) {
  if (didScheduleRenderPhaseUpdate) {
    for (workInProgress = workInProgress.memoizedState;workInProgress !== null; ) {
      var queue = workInProgress.queue;
      queue !== null && (queue.pending = null);
      workInProgress = workInProgress.next;
    }
    didScheduleRenderPhaseUpdate = false;
  }
  renderLanes = 0;
  workInProgressHook = currentHook = currentlyRenderingFiber = null;
  didScheduleRenderPhaseUpdateDuringThisPass = false;
  thenableIndexCounter = localIdCounter = 0;
  thenableState = null;
}
function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  workInProgressHook === null ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
  return workInProgressHook;
}
function updateWorkInProgressHook() {
  if (currentHook === null) {
    var nextCurrentHook = currentlyRenderingFiber.alternate;
    nextCurrentHook = nextCurrentHook !== null ? nextCurrentHook.memoizedState : null;
  } else
    nextCurrentHook = currentHook.next;
  var nextWorkInProgressHook = workInProgressHook === null ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
  if (nextWorkInProgressHook !== null)
    workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
  else {
    if (nextCurrentHook === null) {
      if (currentlyRenderingFiber.alternate === null)
        throw Error(formatProdErrorMessage2(467));
      throw Error(formatProdErrorMessage2(310));
    }
    currentHook = nextCurrentHook;
    nextCurrentHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null
    };
    workInProgressHook === null ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
  }
  return workInProgressHook;
}
function createFunctionComponentUpdateQueue() {
  return { lastEffect: null, events: null, stores: null, memoCache: null };
}
function useThenable(thenable) {
  var index = thenableIndexCounter;
  thenableIndexCounter += 1;
  thenableState === null && (thenableState = []);
  thenable = trackUsedThenable(thenableState, thenable, index);
  index = currentlyRenderingFiber;
  (workInProgressHook === null ? index.memoizedState : workInProgressHook.next) === null && (index = index.alternate, ReactSharedInternals3.H = index === null || index.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
  return thenable;
}
function use(usable) {
  if (usable !== null && typeof usable === "object") {
    if (typeof usable.then === "function")
      return useThenable(usable);
    if (usable.$$typeof === REACT_CONTEXT_TYPE2)
      return readContext(usable);
  }
  throw Error(formatProdErrorMessage2(438, String(usable)));
}
function useMemoCache(size) {
  var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
  updateQueue !== null && (memoCache = updateQueue.memoCache);
  if (memoCache == null) {
    var current = currentlyRenderingFiber.alternate;
    current !== null && (current = current.updateQueue, current !== null && (current = current.memoCache, current != null && (memoCache = {
      data: current.data.map(function(array) {
        return array.slice();
      }),
      index: 0
    })));
  }
  memoCache == null && (memoCache = { data: [], index: 0 });
  updateQueue === null && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
  updateQueue.memoCache = memoCache;
  updateQueue = memoCache.data[memoCache.index];
  if (updateQueue === undefined)
    for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0;current < size; current++)
      updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
  memoCache.index++;
  return updateQueue;
}
function basicStateReducer(state, action) {
  return typeof action === "function" ? action(state) : action;
}
function updateReducer(reducer) {
  var hook = updateWorkInProgressHook();
  return updateReducerImpl(hook, currentHook, reducer);
}
function updateReducerImpl(hook, current, reducer) {
  var queue = hook.queue;
  if (queue === null)
    throw Error(formatProdErrorMessage2(311));
  queue.lastRenderedReducer = reducer;
  var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      var baseFirst = baseQueue.next;
      baseQueue.next = pendingQueue.next;
      pendingQueue.next = baseFirst;
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }
  pendingQueue = hook.baseState;
  if (baseQueue === null)
    hook.memoizedState = pendingQueue;
  else {
    current = baseQueue.next;
    var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$60 = false;
    do {
      var updateLane = update.lane & -536870913;
      if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
        var revertLane = update.revertLane;
        if (revertLane === 0)
          newBaseQueueLast !== null && (newBaseQueueLast = newBaseQueueLast.next = {
            lane: 0,
            revertLane: 0,
            gesture: null,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = true);
        else if ((renderLanes & revertLane) === revertLane) {
          update = update.next;
          revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = true);
          continue;
        } else
          updateLane = {
            lane: 0,
            revertLane: update.revertLane,
            gesture: null,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }, newBaseQueueLast === null ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
        updateLane = update.action;
        shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
        pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
      } else
        revertLane = {
          lane: updateLane,
          revertLane: update.revertLane,
          gesture: update.gesture,
          action: update.action,
          hasEagerState: update.hasEagerState,
          eagerState: update.eagerState,
          next: null
        }, newBaseQueueLast === null ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
      update = update.next;
    } while (update !== null && update !== current);
    newBaseQueueLast === null ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
    if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$60 && (reducer = currentEntangledActionThenable, reducer !== null)))
      throw reducer;
    hook.memoizedState = pendingQueue;
    hook.baseState = baseFirst;
    hook.baseQueue = newBaseQueueLast;
    queue.lastRenderedState = pendingQueue;
  }
  baseQueue === null && (queue.lanes = 0);
  return [hook.memoizedState, queue.dispatch];
}
function rerenderReducer(reducer) {
  var hook = updateWorkInProgressHook(), queue = hook.queue;
  if (queue === null)
    throw Error(formatProdErrorMessage2(311));
  queue.lastRenderedReducer = reducer;
  var { dispatch, pending: lastRenderPhaseUpdate } = queue, newState = hook.memoizedState;
  if (lastRenderPhaseUpdate !== null) {
    queue.pending = null;
    var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
    do
      newState = reducer(newState, update.action), update = update.next;
    while (update !== lastRenderPhaseUpdate);
    objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
    hook.memoizedState = newState;
    hook.baseQueue === null && (hook.baseState = newState);
    queue.lastRenderedState = newState;
  }
  return [newState, dispatch];
}
function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
  if (isHydrating$jscomp$0) {
    if (getServerSnapshot === undefined)
      throw Error(formatProdErrorMessage2(407));
    getServerSnapshot = getServerSnapshot();
  } else
    getServerSnapshot = getSnapshot();
  var snapshotChanged = !objectIs((currentHook || hook).memoizedState, getServerSnapshot);
  snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
  hook = hook.queue;
  updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
    subscribe
  ]);
  if (hook.getSnapshot !== getSnapshot || snapshotChanged || workInProgressHook !== null && workInProgressHook.memoizedState.tag & 1) {
    fiber.flags |= 2048;
    pushSimpleEffect(9, { destroy: undefined }, updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot), null);
    if (workInProgressRoot === null)
      throw Error(formatProdErrorMessage2(349));
    isHydrating$jscomp$0 || (renderLanes & 127) !== 0 || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
  }
  return getServerSnapshot;
}
function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
  fiber.flags |= 16384;
  fiber = { getSnapshot, value: renderedSnapshot };
  getSnapshot = currentlyRenderingFiber.updateQueue;
  getSnapshot === null ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, renderedSnapshot === null ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
}
function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
  inst.value = nextSnapshot;
  inst.getSnapshot = getSnapshot;
  checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
}
function subscribeToStore(fiber, inst, subscribe) {
  return subscribe(function() {
    checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
  });
}
function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs(inst, nextValue);
  } catch (error) {
    return true;
  }
}
function forceStoreRerender(fiber) {
  var root = enqueueConcurrentRenderForLane(fiber, 2);
  root !== null && scheduleUpdateOnFiber(root, fiber, 2);
}
function mountStateImpl(initialState) {
  var hook = mountWorkInProgressHook();
  if (typeof initialState === "function") {
    var initialStateInitializer = initialState;
    initialState = initialStateInitializer();
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(true);
      try {
        initialStateInitializer();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }
  }
  hook.memoizedState = hook.baseState = initialState;
  hook.queue = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  return hook;
}
function updateOptimisticImpl(hook, current, passthrough, reducer) {
  hook.baseState = passthrough;
  return updateReducerImpl(hook, currentHook, typeof reducer === "function" ? reducer : basicStateReducer);
}
function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
  if (isRenderPhaseUpdate(fiber))
    throw Error(formatProdErrorMessage2(485));
  fiber = actionQueue.action;
  if (fiber !== null) {
    var actionNode = {
      payload,
      action: fiber,
      next: null,
      isTransition: true,
      status: "pending",
      value: null,
      reason: null,
      listeners: [],
      then: function(listener) {
        actionNode.listeners.push(listener);
      }
    };
    ReactSharedInternals3.T !== null ? setPendingState(true) : actionNode.isTransition = false;
    setState(actionNode);
    setPendingState = actionQueue.pending;
    setPendingState === null ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
  }
}
function runActionStateAction(actionQueue, node) {
  var { action, payload } = node, prevState = actionQueue.state;
  if (node.isTransition) {
    var prevTransition = ReactSharedInternals3.T, currentTransition = {};
    ReactSharedInternals3.T = currentTransition;
    try {
      var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals3.S;
      onStartTransitionFinish !== null && onStartTransitionFinish(currentTransition, returnValue);
      handleActionReturnValue(actionQueue, node, returnValue);
    } catch (error) {
      onActionError(actionQueue, node, error);
    } finally {
      prevTransition !== null && currentTransition.types !== null && (prevTransition.types = currentTransition.types), ReactSharedInternals3.T = prevTransition;
    }
  } else
    try {
      prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
    } catch (error$66) {
      onActionError(actionQueue, node, error$66);
    }
}
function handleActionReturnValue(actionQueue, node, returnValue) {
  returnValue !== null && typeof returnValue === "object" && typeof returnValue.then === "function" ? returnValue.then(function(nextState) {
    onActionSuccess(actionQueue, node, nextState);
  }, function(error) {
    return onActionError(actionQueue, node, error);
  }) : onActionSuccess(actionQueue, node, returnValue);
}
function onActionSuccess(actionQueue, actionNode, nextState) {
  actionNode.status = "fulfilled";
  actionNode.value = nextState;
  notifyActionListeners(actionNode);
  actionQueue.state = nextState;
  actionNode = actionQueue.pending;
  actionNode !== null && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
}
function onActionError(actionQueue, actionNode, error) {
  var last = actionQueue.pending;
  actionQueue.pending = null;
  if (last !== null) {
    last = last.next;
    do
      actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
    while (actionNode !== last);
  }
  actionQueue.action = null;
}
function notifyActionListeners(actionNode) {
  actionNode = actionNode.listeners;
  for (var i = 0;i < actionNode.length; i++)
    (0, actionNode[i])();
}
function actionStateReducer(oldState, newState) {
  return newState;
}
function mountActionState(action, initialStateProp) {
  if (isHydrating) {
    var ssrFormState = workInProgressRoot.formState;
    if (ssrFormState !== null) {
      a: {
        var JSCompiler_inline_result = currentlyRenderingFiber;
        if (isHydrating) {
          if (nextHydratableInstance) {
            b: {
              var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
              for (var inRootOrSingleton = rootOrSingletonContext;JSCompiler_inline_result$jscomp$0.nodeType !== 8; ) {
                if (!inRootOrSingleton) {
                  JSCompiler_inline_result$jscomp$0 = null;
                  break b;
                }
                JSCompiler_inline_result$jscomp$0 = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
                if (JSCompiler_inline_result$jscomp$0 === null) {
                  JSCompiler_inline_result$jscomp$0 = null;
                  break b;
                }
              }
              inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
              JSCompiler_inline_result$jscomp$0 = inRootOrSingleton === "F!" || inRootOrSingleton === "F" ? JSCompiler_inline_result$jscomp$0 : null;
            }
            if (JSCompiler_inline_result$jscomp$0) {
              nextHydratableInstance = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
              JSCompiler_inline_result = JSCompiler_inline_result$jscomp$0.data === "F!";
              break a;
            }
          }
          throwOnHydrationMismatch(JSCompiler_inline_result);
        }
        JSCompiler_inline_result = false;
      }
      JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
    }
  }
  ssrFormState = mountWorkInProgressHook();
  ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
  JSCompiler_inline_result = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: actionStateReducer,
    lastRenderedState: initialStateProp
  };
  ssrFormState.queue = JSCompiler_inline_result;
  ssrFormState = dispatchSetState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result);
  JSCompiler_inline_result.dispatch = ssrFormState;
  JSCompiler_inline_result = mountStateImpl(false);
  inRootOrSingleton = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, false, JSCompiler_inline_result.queue);
  JSCompiler_inline_result = mountWorkInProgressHook();
  JSCompiler_inline_result$jscomp$0 = {
    state: initialStateProp,
    dispatch: null,
    action,
    pending: null
  };
  JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
  ssrFormState = dispatchActionState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result$jscomp$0, inRootOrSingleton, ssrFormState);
  JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
  JSCompiler_inline_result.memoizedState = action;
  return [initialStateProp, ssrFormState, false];
}
function updateActionState(action) {
  var stateHook = updateWorkInProgressHook();
  return updateActionStateImpl(stateHook, currentHook, action);
}
function updateActionStateImpl(stateHook, currentStateHook, action) {
  currentStateHook = updateReducerImpl(stateHook, currentStateHook, actionStateReducer)[0];
  stateHook = updateReducer(basicStateReducer)[0];
  if (typeof currentStateHook === "object" && currentStateHook !== null && typeof currentStateHook.then === "function")
    try {
      var state = useThenable(currentStateHook);
    } catch (x) {
      if (x === SuspenseException)
        throw SuspenseActionException;
      throw x;
    }
  else
    state = currentStateHook;
  currentStateHook = updateWorkInProgressHook();
  var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
  action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(9, { destroy: undefined }, actionStateActionEffect.bind(null, actionQueue, action), null));
  return [state, dispatch, stateHook];
}
function actionStateActionEffect(actionQueue, action) {
  actionQueue.action = action;
}
function rerenderActionState(action) {
  var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
  if (currentStateHook !== null)
    return updateActionStateImpl(stateHook, currentStateHook, action);
  updateWorkInProgressHook();
  stateHook = stateHook.memoizedState;
  currentStateHook = updateWorkInProgressHook();
  var dispatch = currentStateHook.queue.dispatch;
  currentStateHook.memoizedState = action;
  return [stateHook, dispatch, false];
}
function pushSimpleEffect(tag, inst, create, deps) {
  tag = { tag, create, deps, inst, next: null };
  inst = currentlyRenderingFiber.updateQueue;
  inst === null && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
  create = inst.lastEffect;
  create === null ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
  return tag;
}
function updateRef() {
  return updateWorkInProgressHook().memoizedState;
}
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  var hook = mountWorkInProgressHook();
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushSimpleEffect(1 | hookFlags, { destroy: undefined }, create, deps === undefined ? null : deps);
}
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  var hook = updateWorkInProgressHook();
  deps = deps === undefined ? null : deps;
  var inst = hook.memoizedState.inst;
  currentHook !== null && deps !== null && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(1 | hookFlags, inst, create, deps));
}
function mountEffect(create, deps) {
  mountEffectImpl(8390656, 8, create, deps);
}
function updateEffect(create, deps) {
  updateEffectImpl(2048, 8, create, deps);
}
function useEffectEventImpl(payload) {
  currentlyRenderingFiber.flags |= 4;
  var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
  if (componentUpdateQueue === null)
    componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
  else {
    var events = componentUpdateQueue.events;
    events === null ? componentUpdateQueue.events = [payload] : events.push(payload);
  }
}
function updateEvent(callback) {
  var ref = updateWorkInProgressHook().memoizedState;
  useEffectEventImpl({ ref, nextImpl: callback });
  return function() {
    if ((executionContext & 2) !== 0)
      throw Error(formatProdErrorMessage2(440));
    return ref.impl.apply(undefined, arguments);
  };
}
function updateInsertionEffect(create, deps) {
  return updateEffectImpl(4, 2, create, deps);
}
function updateLayoutEffect(create, deps) {
  return updateEffectImpl(4, 4, create, deps);
}
function imperativeHandleEffect(create, ref) {
  if (typeof ref === "function") {
    create = create();
    var refCleanup = ref(create);
    return function() {
      typeof refCleanup === "function" ? refCleanup() : ref(null);
    };
  }
  if (ref !== null && ref !== undefined)
    return create = create(), ref.current = create, function() {
      ref.current = null;
    };
}
function updateImperativeHandle(ref, create, deps) {
  deps = deps !== null && deps !== undefined ? deps.concat([ref]) : null;
  updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
}
function mountDebugValue() {}
function updateCallback(callback, deps) {
  var hook = updateWorkInProgressHook();
  deps = deps === undefined ? null : deps;
  var prevState = hook.memoizedState;
  if (deps !== null && areHookInputsEqual(deps, prevState[1]))
    return prevState[0];
  hook.memoizedState = [callback, deps];
  return callback;
}
function updateMemo(nextCreate, deps) {
  var hook = updateWorkInProgressHook();
  deps = deps === undefined ? null : deps;
  var prevState = hook.memoizedState;
  if (deps !== null && areHookInputsEqual(deps, prevState[1]))
    return prevState[0];
  prevState = nextCreate();
  if (shouldDoubleInvokeUserFnsInHooksDEV) {
    setIsStrictModeForDevtools(true);
    try {
      nextCreate();
    } finally {
      setIsStrictModeForDevtools(false);
    }
  }
  hook.memoizedState = [prevState, deps];
  return prevState;
}
function mountDeferredValueImpl(hook, value, initialValue) {
  if (initialValue === undefined || (renderLanes & 1073741824) !== 0 && (workInProgressRootRenderLanes & 261930) === 0)
    return hook.memoizedState = value;
  hook.memoizedState = initialValue;
  hook = requestDeferredLane();
  currentlyRenderingFiber.lanes |= hook;
  workInProgressRootSkippedLanes |= hook;
  return initialValue;
}
function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
  if (objectIs(value, prevValue))
    return value;
  if (currentTreeHiddenStackCursor.current !== null)
    return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
  if ((renderLanes & 42) === 0 || (renderLanes & 1073741824) !== 0 && (workInProgressRootRenderLanes & 261930) === 0)
    return didReceiveUpdate = true, hook.memoizedState = value;
  hook = requestDeferredLane();
  currentlyRenderingFiber.lanes |= hook;
  workInProgressRootSkippedLanes |= hook;
  return prevValue;
}
function startTransition(fiber, queue, pendingState, finishedState, callback) {
  var previousPriority = ReactDOMSharedInternals.p;
  ReactDOMSharedInternals.p = previousPriority !== 0 && 8 > previousPriority ? previousPriority : 8;
  var prevTransition = ReactSharedInternals3.T, currentTransition = {};
  ReactSharedInternals3.T = currentTransition;
  dispatchOptimisticSetState(fiber, false, queue, pendingState);
  try {
    var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals3.S;
    onStartTransitionFinish !== null && onStartTransitionFinish(currentTransition, returnValue);
    if (returnValue !== null && typeof returnValue === "object" && typeof returnValue.then === "function") {
      var thenableForFinishedState = chainThenableValue(returnValue, finishedState);
      dispatchSetStateInternal(fiber, queue, thenableForFinishedState, requestUpdateLane(fiber));
    } else
      dispatchSetStateInternal(fiber, queue, finishedState, requestUpdateLane(fiber));
  } catch (error) {
    dispatchSetStateInternal(fiber, queue, { then: function() {}, status: "rejected", reason: error }, requestUpdateLane());
  } finally {
    ReactDOMSharedInternals.p = previousPriority, prevTransition !== null && currentTransition.types !== null && (prevTransition.types = currentTransition.types), ReactSharedInternals3.T = prevTransition;
  }
}
function noop3() {}
function startHostTransition(formFiber, pendingState, action, formData) {
  if (formFiber.tag !== 5)
    throw Error(formatProdErrorMessage2(476));
  var queue = ensureFormComponentIsStateful(formFiber).queue;
  startTransition(formFiber, queue, pendingState, sharedNotPendingObject, action === null ? noop3 : function() {
    requestFormReset$1(formFiber);
    return action(formData);
  });
}
function ensureFormComponentIsStateful(formFiber) {
  var existingStateHook = formFiber.memoizedState;
  if (existingStateHook !== null)
    return existingStateHook;
  existingStateHook = {
    memoizedState: sharedNotPendingObject,
    baseState: sharedNotPendingObject,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: sharedNotPendingObject
    },
    next: null
  };
  var initialResetState = {};
  existingStateHook.next = {
    memoizedState: initialResetState,
    baseState: initialResetState,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: initialResetState
    },
    next: null
  };
  formFiber.memoizedState = existingStateHook;
  formFiber = formFiber.alternate;
  formFiber !== null && (formFiber.memoizedState = existingStateHook);
  return existingStateHook;
}
function requestFormReset$1(formFiber) {
  var stateHook = ensureFormComponentIsStateful(formFiber);
  stateHook.next === null && (stateHook = formFiber.alternate.memoizedState);
  dispatchSetStateInternal(formFiber, stateHook.next.queue, {}, requestUpdateLane());
}
function useHostTransitionStatus() {
  return readContext(HostTransitionContext);
}
function updateId() {
  return updateWorkInProgressHook().memoizedState;
}
function updateRefresh() {
  return updateWorkInProgressHook().memoizedState;
}
function refreshCache(fiber) {
  for (var provider = fiber.return;provider !== null; ) {
    switch (provider.tag) {
      case 24:
      case 3:
        var lane = requestUpdateLane();
        fiber = createUpdate(lane);
        var root$69 = enqueueUpdate(provider, fiber, lane);
        root$69 !== null && (scheduleUpdateOnFiber(root$69, provider, lane), entangleTransitions(root$69, provider, lane));
        provider = { cache: createCache() };
        fiber.payload = provider;
        return;
    }
    provider = provider.return;
  }
}
function dispatchReducerAction(fiber, queue, action) {
  var lane = requestUpdateLane();
  action = {
    lane,
    revertLane: 0,
    gesture: null,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };
  isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), action !== null && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
}
function dispatchSetState(fiber, queue, action) {
  var lane = requestUpdateLane();
  dispatchSetStateInternal(fiber, queue, action, lane);
}
function dispatchSetStateInternal(fiber, queue, action, lane) {
  var update = {
    lane,
    revertLane: 0,
    gesture: null,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };
  if (isRenderPhaseUpdate(fiber))
    enqueueRenderPhaseUpdate(queue, update);
  else {
    var alternate = fiber.alternate;
    if (fiber.lanes === 0 && (alternate === null || alternate.lanes === 0) && (alternate = queue.lastRenderedReducer, alternate !== null))
      try {
        var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
        update.hasEagerState = true;
        update.eagerState = eagerState;
        if (objectIs(eagerState, currentState))
          return enqueueUpdate$1(fiber, queue, update, 0), workInProgressRoot === null && finishQueueingConcurrentUpdates(), false;
      } catch (error) {} finally {}
    action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
    if (action !== null)
      return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
  }
  return false;
}
function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
  action = {
    lane: 2,
    revertLane: requestTransitionLane(),
    gesture: null,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };
  if (isRenderPhaseUpdate(fiber)) {
    if (throwIfDuringRender)
      throw Error(formatProdErrorMessage2(479));
  } else
    throwIfDuringRender = enqueueConcurrentHookUpdate(fiber, queue, action, 2), throwIfDuringRender !== null && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
}
function isRenderPhaseUpdate(fiber) {
  var alternate = fiber.alternate;
  return fiber === currentlyRenderingFiber || alternate !== null && alternate === currentlyRenderingFiber;
}
function enqueueRenderPhaseUpdate(queue, update) {
  didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
  var pending = queue.pending;
  pending === null ? update.next = update : (update.next = pending.next, pending.next = update);
  queue.pending = update;
}
function entangleTransitionUpdate(root, queue, lane) {
  if ((lane & 4194048) !== 0) {
    var queueLanes = queue.lanes;
    queueLanes &= root.pendingLanes;
    lane |= queueLanes;
    queue.lanes = lane;
    markRootEntangled(root, lane);
  }
}
function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, nextProps) {
  ctor = workInProgress.memoizedState;
  getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
  getDerivedStateFromProps = getDerivedStateFromProps === null || getDerivedStateFromProps === undefined ? ctor : assign2({}, ctor, getDerivedStateFromProps);
  workInProgress.memoizedState = getDerivedStateFromProps;
  workInProgress.lanes === 0 && (workInProgress.updateQueue.baseState = getDerivedStateFromProps);
}
function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
  workInProgress = workInProgress.stateNode;
  return typeof workInProgress.shouldComponentUpdate === "function" ? workInProgress.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
}
function callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext) {
  workInProgress = instance.state;
  typeof instance.componentWillReceiveProps === "function" && instance.componentWillReceiveProps(newProps, nextContext);
  typeof instance.UNSAFE_componentWillReceiveProps === "function" && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
  instance.state !== workInProgress && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
}
function resolveClassComponentProps(Component, baseProps) {
  var newProps = baseProps;
  if ("ref" in baseProps) {
    newProps = {};
    for (var propName in baseProps)
      propName !== "ref" && (newProps[propName] = baseProps[propName]);
  }
  if (Component = Component.defaultProps) {
    newProps === baseProps && (newProps = assign2({}, newProps));
    for (var propName$73 in Component)
      newProps[propName$73] === undefined && (newProps[propName$73] = Component[propName$73]);
  }
  return newProps;
}
function defaultOnUncaughtError(error) {
  reportGlobalError2(error);
}
function defaultOnCaughtError(error) {
  console.error(error);
}
function defaultOnRecoverableError(error) {
  reportGlobalError2(error);
}
function logUncaughtError(root, errorInfo) {
  try {
    var onUncaughtError = root.onUncaughtError;
    onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
  } catch (e$74) {
    setTimeout(function() {
      throw e$74;
    });
  }
}
function logCaughtError(root, boundary, errorInfo) {
  try {
    var onCaughtError = root.onCaughtError;
    onCaughtError(errorInfo.value, {
      componentStack: errorInfo.stack,
      errorBoundary: boundary.tag === 1 ? boundary.stateNode : null
    });
  } catch (e$75) {
    setTimeout(function() {
      throw e$75;
    });
  }
}
function createRootErrorUpdate(root, errorInfo, lane) {
  lane = createUpdate(lane);
  lane.tag = 3;
  lane.payload = { element: null };
  lane.callback = function() {
    logUncaughtError(root, errorInfo);
  };
  return lane;
}
function createClassErrorUpdate(lane) {
  lane = createUpdate(lane);
  lane.tag = 3;
  return lane;
}
function initializeClassErrorUpdate(update, root, fiber, errorInfo) {
  var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
  if (typeof getDerivedStateFromError === "function") {
    var error = errorInfo.value;
    update.payload = function() {
      return getDerivedStateFromError(error);
    };
    update.callback = function() {
      logCaughtError(root, fiber, errorInfo);
    };
  }
  var inst = fiber.stateNode;
  inst !== null && typeof inst.componentDidCatch === "function" && (update.callback = function() {
    logCaughtError(root, fiber, errorInfo);
    typeof getDerivedStateFromError !== "function" && (legacyErrorBoundariesThatAlreadyFailed === null ? legacyErrorBoundariesThatAlreadyFailed = new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
    var stack = errorInfo.stack;
    this.componentDidCatch(errorInfo.value, {
      componentStack: stack !== null ? stack : ""
    });
  });
}
function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
  sourceFiber.flags |= 32768;
  if (value !== null && typeof value === "object" && typeof value.then === "function") {
    returnFiber = sourceFiber.alternate;
    returnFiber !== null && propagateParentContextChanges(returnFiber, sourceFiber, rootRenderLanes, true);
    sourceFiber = suspenseHandlerStackCursor.current;
    if (sourceFiber !== null) {
      switch (sourceFiber.tag) {
        case 31:
        case 13:
          return shellBoundary === null ? renderDidSuspendDelayIfPossible() : sourceFiber.alternate === null && workInProgressRootExitStatus === 0 && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, returnFiber === null ? sourceFiber.updateQueue = new Set([value]) : returnFiber.add(value), attachPingListener(root, value, rootRenderLanes)), false;
        case 22:
          return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, returnFiber === null ? (returnFiber = {
            transitions: null,
            markerInstances: null,
            retryQueue: new Set([value])
          }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, sourceFiber === null ? returnFiber.retryQueue = new Set([value]) : sourceFiber.add(value)), attachPingListener(root, value, rootRenderLanes)), false;
      }
      throw Error(formatProdErrorMessage2(435, sourceFiber.tag));
    }
    attachPingListener(root, value, rootRenderLanes);
    renderDidSuspendDelayIfPossible();
    return false;
  }
  if (isHydrating)
    return returnFiber = suspenseHandlerStackCursor.current, returnFiber !== null ? ((returnFiber.flags & 65536) === 0 && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root = Error(formatProdErrorMessage2(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage2(423), {
      cause: value
    }), queueHydrationError(createCapturedValueAtFiber(returnFiber, sourceFiber))), root = root.current.alternate, root.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(root.stateNode, value, rootRenderLanes), enqueueCapturedUpdate(root, rootRenderLanes), workInProgressRootExitStatus !== 4 && (workInProgressRootExitStatus = 2)), false;
  var wrapperError = Error(formatProdErrorMessage2(520), { cause: value });
  wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
  workInProgressRootConcurrentErrors === null ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
  workInProgressRootExitStatus !== 4 && (workInProgressRootExitStatus = 2);
  if (returnFiber === null)
    return true;
  value = createCapturedValueAtFiber(value, sourceFiber);
  sourceFiber = returnFiber;
  do {
    switch (sourceFiber.tag) {
      case 3:
        return sourceFiber.flags |= 65536, root = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root, root = createRootErrorUpdate(sourceFiber.stateNode, value, root), enqueueCapturedUpdate(sourceFiber, root), false;
      case 1:
        if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, (sourceFiber.flags & 128) === 0 && (typeof returnFiber.getDerivedStateFromError === "function" || wrapperError !== null && typeof wrapperError.componentDidCatch === "function" && (legacyErrorBoundariesThatAlreadyFailed === null || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
          return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(rootRenderLanes, root, sourceFiber, value), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
    }
    sourceFiber = sourceFiber.return;
  } while (sourceFiber !== null);
  return false;
}
function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
  workInProgress.child = current === null ? mountChildFibers(workInProgress, null, nextChildren, renderLanes) : reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
}
function updateForwardRef(current, workInProgress, Component, nextProps, renderLanes) {
  Component = Component.render;
  var ref = workInProgress.ref;
  if ("ref" in nextProps) {
    var propsWithoutRef = {};
    for (var key in nextProps)
      key !== "ref" && (propsWithoutRef[key] = nextProps[key]);
  } else
    propsWithoutRef = nextProps;
  prepareToReadContext(workInProgress);
  nextProps = renderWithHooks(current, workInProgress, Component, propsWithoutRef, ref, renderLanes);
  key = checkDidRenderIdHook();
  if (current !== null && !didReceiveUpdate)
    return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  isHydrating && key && pushMaterializedTreeId(workInProgress);
  workInProgress.flags |= 1;
  reconcileChildren(current, workInProgress, nextProps, renderLanes);
  return workInProgress.child;
}
function updateMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
  if (current === null) {
    var type = Component.type;
    if (typeof type === "function" && !shouldConstruct(type) && type.defaultProps === undefined && Component.compare === null)
      return workInProgress.tag = 15, workInProgress.type = type, updateSimpleMemoComponent(current, workInProgress, type, nextProps, renderLanes);
    current = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress, workInProgress.mode, renderLanes);
    current.ref = workInProgress.ref;
    current.return = workInProgress;
    return workInProgress.child = current;
  }
  type = current.child;
  if (!checkScheduledUpdateOrContext(current, renderLanes)) {
    var prevProps = type.memoizedProps;
    Component = Component.compare;
    Component = Component !== null ? Component : shallowEqual;
    if (Component(prevProps, nextProps) && current.ref === workInProgress.ref)
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  workInProgress.flags |= 1;
  current = createWorkInProgress(type, nextProps);
  current.ref = workInProgress.ref;
  current.return = workInProgress;
  return workInProgress.child = current;
}
function updateSimpleMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
  if (current !== null) {
    var prevProps = current.memoizedProps;
    if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress.ref)
      if (didReceiveUpdate = false, workInProgress.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes))
        (current.flags & 131072) !== 0 && (didReceiveUpdate = true);
      else
        return workInProgress.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  return updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes);
}
function updateOffscreenComponent(current, workInProgress, renderLanes, nextProps) {
  var nextChildren = nextProps.children, prevState = current !== null ? current.memoizedState : null;
  current === null && workInProgress.stateNode === null && (workInProgress.stateNode = {
    _visibility: 1,
    _pendingMarkers: null,
    _retryCache: null,
    _transitions: null
  });
  if (nextProps.mode === "hidden") {
    if ((workInProgress.flags & 128) !== 0) {
      prevState = prevState !== null ? prevState.baseLanes | renderLanes : renderLanes;
      if (current !== null) {
        nextProps = workInProgress.child = current.child;
        for (nextChildren = 0;nextProps !== null; )
          nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
        nextProps = nextChildren & ~prevState;
      } else
        nextProps = 0, workInProgress.child = null;
      return deferHiddenOffscreenComponent(current, workInProgress, prevState, renderLanes, nextProps);
    }
    if ((renderLanes & 536870912) !== 0)
      workInProgress.memoizedState = { baseLanes: 0, cachePool: null }, current !== null && pushTransition(workInProgress, prevState !== null ? prevState.cachePool : null), prevState !== null ? pushHiddenContext(workInProgress, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress);
    else
      return nextProps = workInProgress.lanes = 536870912, deferHiddenOffscreenComponent(current, workInProgress, prevState !== null ? prevState.baseLanes | renderLanes : renderLanes, renderLanes, nextProps);
  } else
    prevState !== null ? (pushTransition(workInProgress, prevState.cachePool), pushHiddenContext(workInProgress, prevState), reuseSuspenseHandlerOnStack(workInProgress), workInProgress.memoizedState = null) : (current !== null && pushTransition(workInProgress, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack(workInProgress));
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
function bailoutOffscreenComponent(current, workInProgress) {
  current !== null && current.tag === 22 || workInProgress.stateNode !== null || (workInProgress.stateNode = {
    _visibility: 1,
    _pendingMarkers: null,
    _retryCache: null,
    _transitions: null
  });
  return workInProgress.sibling;
}
function deferHiddenOffscreenComponent(current, workInProgress, nextBaseLanes, renderLanes, remainingChildLanes) {
  var JSCompiler_inline_result = peekCacheFromPool();
  JSCompiler_inline_result = JSCompiler_inline_result === null ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
  workInProgress.memoizedState = {
    baseLanes: nextBaseLanes,
    cachePool: JSCompiler_inline_result
  };
  current !== null && pushTransition(workInProgress, null);
  reuseHiddenContextOnStack();
  pushOffscreenSuspenseHandler(workInProgress);
  current !== null && propagateParentContextChanges(current, workInProgress, renderLanes, true);
  workInProgress.childLanes = remainingChildLanes;
  return null;
}
function mountActivityChildren(workInProgress, nextProps) {
  nextProps = mountWorkInProgressOffscreenFiber({ mode: nextProps.mode, children: nextProps.children }, workInProgress.mode);
  nextProps.ref = workInProgress.ref;
  workInProgress.child = nextProps;
  nextProps.return = workInProgress;
  return nextProps;
}
function retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes) {
  reconcileChildFibers(workInProgress, current.child, null, renderLanes);
  current = mountActivityChildren(workInProgress, workInProgress.pendingProps);
  current.flags |= 2;
  popSuspenseHandler(workInProgress);
  workInProgress.memoizedState = null;
  return current;
}
function updateActivityComponent(current, workInProgress, renderLanes) {
  var nextProps = workInProgress.pendingProps, didSuspend = (workInProgress.flags & 128) !== 0;
  workInProgress.flags &= -129;
  if (current === null) {
    if (isHydrating) {
      if (nextProps.mode === "hidden")
        return current = mountActivityChildren(workInProgress, nextProps), workInProgress.lanes = 536870912, bailoutOffscreenComponent(null, current);
      pushDehydratedActivitySuspenseHandler(workInProgress);
      (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = current !== null && current.data === "&" ? current : null, current !== null && (workInProgress.memoizedState = {
        dehydrated: current,
        treeContext: treeContextProvider !== null ? { id: treeContextId, overflow: treeContextOverflow } : null,
        retryLane: 536870912,
        hydrationErrors: null
      }, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
      if (current === null)
        throw throwOnHydrationMismatch(workInProgress);
      workInProgress.lanes = 536870912;
      return null;
    }
    return mountActivityChildren(workInProgress, nextProps);
  }
  var prevState = current.memoizedState;
  if (prevState !== null) {
    var dehydrated = prevState.dehydrated;
    pushDehydratedActivitySuspenseHandler(workInProgress);
    if (didSuspend)
      if (workInProgress.flags & 256)
        workInProgress.flags &= -257, workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
      else if (workInProgress.memoizedState !== null)
        workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null;
      else
        throw Error(formatProdErrorMessage2(558));
    else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, false), didSuspend = (renderLanes & current.childLanes) !== 0, didReceiveUpdate || didSuspend) {
      nextProps = workInProgressRoot;
      if (nextProps !== null && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes), dehydrated !== 0 && dehydrated !== prevState.retryLane))
        throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
      renderDidSuspendDelayIfPossible();
      workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
    } else
      current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, current !== null && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountActivityChildren(workInProgress, nextProps), workInProgress.flags |= 4096;
    return workInProgress;
  }
  current = createWorkInProgress(current.child, {
    mode: nextProps.mode,
    children: nextProps.children
  });
  current.ref = workInProgress.ref;
  workInProgress.child = current;
  current.return = workInProgress;
  return current;
}
function markRef(current, workInProgress) {
  var ref = workInProgress.ref;
  if (ref === null)
    current !== null && current.ref !== null && (workInProgress.flags |= 4194816);
  else {
    if (typeof ref !== "function" && typeof ref !== "object")
      throw Error(formatProdErrorMessage2(284));
    if (current === null || current.ref !== ref)
      workInProgress.flags |= 4194816;
  }
}
function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
  prepareToReadContext(workInProgress);
  Component = renderWithHooks(current, workInProgress, Component, nextProps, undefined, renderLanes);
  nextProps = checkDidRenderIdHook();
  if (current !== null && !didReceiveUpdate)
    return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  isHydrating && nextProps && pushMaterializedTreeId(workInProgress);
  workInProgress.flags |= 1;
  reconcileChildren(current, workInProgress, Component, renderLanes);
  return workInProgress.child;
}
function replayFunctionComponent(current, workInProgress, nextProps, Component, secondArg, renderLanes) {
  prepareToReadContext(workInProgress);
  workInProgress.updateQueue = null;
  nextProps = renderWithHooksAgain(workInProgress, Component, nextProps, secondArg);
  finishRenderingHooks(current);
  Component = checkDidRenderIdHook();
  if (current !== null && !didReceiveUpdate)
    return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  isHydrating && Component && pushMaterializedTreeId(workInProgress);
  workInProgress.flags |= 1;
  reconcileChildren(current, workInProgress, nextProps, renderLanes);
  return workInProgress.child;
}
function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
  prepareToReadContext(workInProgress);
  if (workInProgress.stateNode === null) {
    var context = emptyContextObject, contextType = Component.contextType;
    typeof contextType === "object" && contextType !== null && (context = readContext(contextType));
    context = new Component(nextProps, context);
    workInProgress.memoizedState = context.state !== null && context.state !== undefined ? context.state : null;
    context.updater = classComponentUpdater;
    workInProgress.stateNode = context;
    context._reactInternals = workInProgress;
    context = workInProgress.stateNode;
    context.props = nextProps;
    context.state = workInProgress.memoizedState;
    context.refs = {};
    initializeUpdateQueue(workInProgress);
    contextType = Component.contextType;
    context.context = typeof contextType === "object" && contextType !== null ? readContext(contextType) : emptyContextObject;
    context.state = workInProgress.memoizedState;
    contextType = Component.getDerivedStateFromProps;
    typeof contextType === "function" && (applyDerivedStateFromProps(workInProgress, Component, contextType, nextProps), context.state = workInProgress.memoizedState);
    typeof Component.getDerivedStateFromProps === "function" || typeof context.getSnapshotBeforeUpdate === "function" || typeof context.UNSAFE_componentWillMount !== "function" && typeof context.componentWillMount !== "function" || (contextType = context.state, typeof context.componentWillMount === "function" && context.componentWillMount(), typeof context.UNSAFE_componentWillMount === "function" && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress, nextProps, context, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress.memoizedState);
    typeof context.componentDidMount === "function" && (workInProgress.flags |= 4194308);
    nextProps = true;
  } else if (current === null) {
    context = workInProgress.stateNode;
    var unresolvedOldProps = workInProgress.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
    context.props = oldProps;
    var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
    contextType = emptyContextObject;
    typeof contextType$jscomp$0 === "object" && contextType$jscomp$0 !== null && (contextType = readContext(contextType$jscomp$0));
    var getDerivedStateFromProps = Component.getDerivedStateFromProps;
    contextType$jscomp$0 = typeof getDerivedStateFromProps === "function" || typeof context.getSnapshotBeforeUpdate === "function";
    unresolvedOldProps = workInProgress.pendingProps !== unresolvedOldProps;
    contextType$jscomp$0 || typeof context.UNSAFE_componentWillReceiveProps !== "function" && typeof context.componentWillReceiveProps !== "function" || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(workInProgress, context, nextProps, contextType);
    hasForceUpdate = false;
    var oldState = workInProgress.memoizedState;
    context.state = oldState;
    processUpdateQueue(workInProgress, nextProps, context, renderLanes);
    suspendIfUpdateReadFromEntangledAsyncAction();
    oldContext = workInProgress.memoizedState;
    unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? (typeof getDerivedStateFromProps === "function" && (applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, nextProps), oldContext = workInProgress.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, oldProps, nextProps, oldState, oldContext, contextType)) ? (contextType$jscomp$0 || typeof context.UNSAFE_componentWillMount !== "function" && typeof context.componentWillMount !== "function" || (typeof context.componentWillMount === "function" && context.componentWillMount(), typeof context.UNSAFE_componentWillMount === "function" && context.UNSAFE_componentWillMount()), typeof context.componentDidMount === "function" && (workInProgress.flags |= 4194308)) : (typeof context.componentDidMount === "function" && (workInProgress.flags |= 4194308), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : (typeof context.componentDidMount === "function" && (workInProgress.flags |= 4194308), nextProps = false);
  } else {
    context = workInProgress.stateNode;
    cloneUpdateQueue(current, workInProgress);
    contextType = workInProgress.memoizedProps;
    contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
    context.props = contextType$jscomp$0;
    getDerivedStateFromProps = workInProgress.pendingProps;
    oldState = context.context;
    oldContext = Component.contextType;
    oldProps = emptyContextObject;
    typeof oldContext === "object" && oldContext !== null && (oldProps = readContext(oldContext));
    unresolvedOldProps = Component.getDerivedStateFromProps;
    (oldContext = typeof unresolvedOldProps === "function" || typeof context.getSnapshotBeforeUpdate === "function") || typeof context.UNSAFE_componentWillReceiveProps !== "function" && typeof context.componentWillReceiveProps !== "function" || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(workInProgress, context, nextProps, oldProps);
    hasForceUpdate = false;
    oldState = workInProgress.memoizedState;
    context.state = oldState;
    processUpdateQueue(workInProgress, nextProps, context, renderLanes);
    suspendIfUpdateReadFromEntangledAsyncAction();
    var newState = workInProgress.memoizedState;
    contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || current !== null && current.dependencies !== null && checkIfContextChanged(current.dependencies) ? (typeof unresolvedOldProps === "function" && (applyDerivedStateFromProps(workInProgress, Component, unresolvedOldProps, nextProps), newState = workInProgress.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, contextType$jscomp$0, nextProps, oldState, newState, oldProps) || current !== null && current.dependencies !== null && checkIfContextChanged(current.dependencies)) ? (oldContext || typeof context.UNSAFE_componentWillUpdate !== "function" && typeof context.componentWillUpdate !== "function" || (typeof context.componentWillUpdate === "function" && context.componentWillUpdate(nextProps, newState, oldProps), typeof context.UNSAFE_componentWillUpdate === "function" && context.UNSAFE_componentWillUpdate(nextProps, newState, oldProps)), typeof context.componentDidUpdate === "function" && (workInProgress.flags |= 4), typeof context.getSnapshotBeforeUpdate === "function" && (workInProgress.flags |= 1024)) : (typeof context.componentDidUpdate !== "function" || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), typeof context.getSnapshotBeforeUpdate !== "function" || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : (typeof context.componentDidUpdate !== "function" || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), typeof context.getSnapshotBeforeUpdate !== "function" || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), nextProps = false);
  }
  context = nextProps;
  markRef(current, workInProgress);
  nextProps = (workInProgress.flags & 128) !== 0;
  context || nextProps ? (context = workInProgress.stateNode, Component = nextProps && typeof Component.getDerivedStateFromError !== "function" ? null : context.render(), workInProgress.flags |= 1, current !== null && nextProps ? (workInProgress.child = reconcileChildFibers(workInProgress, current.child, null, renderLanes), workInProgress.child = reconcileChildFibers(workInProgress, null, Component, renderLanes)) : reconcileChildren(current, workInProgress, Component, renderLanes), workInProgress.memoizedState = context.state, current = workInProgress.child) : current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  return current;
}
function mountHostRootWithoutHydrating(current, workInProgress, nextChildren, renderLanes) {
  resetHydrationState();
  workInProgress.flags |= 256;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
function mountSuspenseOffscreenState(renderLanes) {
  return { baseLanes: renderLanes, cachePool: getSuspendedCache() };
}
function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes) {
  current = current !== null ? current.childLanes & ~renderLanes : 0;
  primaryTreeDidDefer && (current |= workInProgressDeferredLane);
  return current;
}
function updateSuspenseComponent(current, workInProgress, renderLanes) {
  var nextProps = workInProgress.pendingProps, showFallback = false, didSuspend = (workInProgress.flags & 128) !== 0, JSCompiler_temp;
  (JSCompiler_temp = didSuspend) || (JSCompiler_temp = current !== null && current.memoizedState === null ? false : (suspenseStackCursor.current & 2) !== 0);
  JSCompiler_temp && (showFallback = true, workInProgress.flags &= -129);
  JSCompiler_temp = (workInProgress.flags & 32) !== 0;
  workInProgress.flags &= -33;
  if (current === null) {
    if (isHydrating) {
      showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress) : reuseSuspenseHandlerOnStack(workInProgress);
      (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = current !== null && current.data !== "&" ? current : null, current !== null && (workInProgress.memoizedState = {
        dehydrated: current,
        treeContext: treeContextProvider !== null ? { id: treeContextId, overflow: treeContextOverflow } : null,
        retryLane: 536870912,
        hydrationErrors: null
      }, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
      if (current === null)
        throw throwOnHydrationMismatch(workInProgress);
      isSuspenseInstanceFallback(current) ? workInProgress.lanes = 32 : workInProgress.lanes = 536870912;
      return null;
    }
    var nextPrimaryChildren = nextProps.children;
    nextProps = nextProps.fallback;
    if (showFallback)
      return reuseSuspenseHandlerOnStack(workInProgress), showFallback = workInProgress.mode, nextPrimaryChildren = mountWorkInProgressOffscreenFiber({ mode: "hidden", children: nextPrimaryChildren }, showFallback), nextProps = createFiberFromFragment(nextProps, showFallback, renderLanes, null), nextPrimaryChildren.return = workInProgress, nextProps.return = workInProgress, nextPrimaryChildren.sibling = nextProps, workInProgress.child = nextPrimaryChildren, nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
    pushPrimaryTreeSuspenseHandler(workInProgress);
    return mountSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
  }
  var prevState = current.memoizedState;
  if (prevState !== null && (nextPrimaryChildren = prevState.dehydrated, nextPrimaryChildren !== null)) {
    if (didSuspend)
      workInProgress.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags &= -257, workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes)) : workInProgress.memoizedState !== null ? (reuseSuspenseHandlerOnStack(workInProgress), workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null) : (reuseSuspenseHandlerOnStack(workInProgress), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress.mode, nextProps = mountWorkInProgressOffscreenFiber({ mode: "visible", children: nextProps.children }, showFallback), nextPrimaryChildren = createFiberFromFragment(nextPrimaryChildren, showFallback, renderLanes, null), nextPrimaryChildren.flags |= 2, nextProps.return = workInProgress, nextPrimaryChildren.return = workInProgress, nextProps.sibling = nextPrimaryChildren, workInProgress.child = nextProps, reconcileChildFibers(workInProgress, current.child, null, renderLanes), nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, workInProgress = bailoutOffscreenComponent(null, nextProps));
    else if (pushPrimaryTreeSuspenseHandler(workInProgress), isSuspenseInstanceFallback(nextPrimaryChildren)) {
      JSCompiler_temp = nextPrimaryChildren.nextSibling && nextPrimaryChildren.nextSibling.dataset;
      if (JSCompiler_temp)
        var digest = JSCompiler_temp.dgst;
      JSCompiler_temp = digest;
      nextProps = Error(formatProdErrorMessage2(419));
      nextProps.stack = "";
      nextProps.digest = JSCompiler_temp;
      queueHydrationError({ value: nextProps, source: null, stack: null });
      workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
    } else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, false), JSCompiler_temp = (renderLanes & current.childLanes) !== 0, didReceiveUpdate || JSCompiler_temp) {
      JSCompiler_temp = workInProgressRoot;
      if (JSCompiler_temp !== null && (nextProps = getBumpedLaneForHydration(JSCompiler_temp, renderLanes), nextProps !== 0 && nextProps !== prevState.retryLane))
        throw prevState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
      isSuspenseInstancePending(nextPrimaryChildren) || renderDidSuspendDelayIfPossible();
      workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
    } else
      isSuspenseInstancePending(nextPrimaryChildren) ? (workInProgress.flags |= 192, workInProgress.child = current.child, workInProgress = null) : (current = prevState.treeContext, nextHydratableInstance = getNextHydratable(nextPrimaryChildren.nextSibling), hydrationParentFiber = workInProgress, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, current !== null && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountSuspensePrimaryChildren(workInProgress, nextProps.children), workInProgress.flags |= 4096);
    return workInProgress;
  }
  if (showFallback)
    return reuseSuspenseHandlerOnStack(workInProgress), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress.mode, prevState = current.child, digest = prevState.sibling, nextProps = createWorkInProgress(prevState, {
      mode: "hidden",
      children: nextProps.children
    }), nextProps.subtreeFlags = prevState.subtreeFlags & 65011712, digest !== null ? nextPrimaryChildren = createWorkInProgress(digest, nextPrimaryChildren) : (nextPrimaryChildren = createFiberFromFragment(nextPrimaryChildren, showFallback, renderLanes, null), nextPrimaryChildren.flags |= 2), nextPrimaryChildren.return = workInProgress, nextProps.return = workInProgress, nextProps.sibling = nextPrimaryChildren, workInProgress.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress.child, nextPrimaryChildren = current.child.memoizedState, nextPrimaryChildren === null ? nextPrimaryChildren = mountSuspenseOffscreenState(renderLanes) : (showFallback = nextPrimaryChildren.cachePool, showFallback !== null ? (prevState = CacheContext._currentValue, showFallback = showFallback.parent !== prevState ? { parent: prevState, pool: prevState } : showFallback) : showFallback = getSuspendedCache(), nextPrimaryChildren = {
      baseLanes: nextPrimaryChildren.baseLanes | renderLanes,
      cachePool: showFallback
    }), nextProps.memoizedState = nextPrimaryChildren, nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
  pushPrimaryTreeSuspenseHandler(workInProgress);
  renderLanes = current.child;
  current = renderLanes.sibling;
  renderLanes = createWorkInProgress(renderLanes, {
    mode: "visible",
    children: nextProps.children
  });
  renderLanes.return = workInProgress;
  renderLanes.sibling = null;
  current !== null && (JSCompiler_temp = workInProgress.deletions, JSCompiler_temp === null ? (workInProgress.deletions = [current], workInProgress.flags |= 16) : JSCompiler_temp.push(current));
  workInProgress.child = renderLanes;
  workInProgress.memoizedState = null;
  return renderLanes;
}
function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
  primaryChildren = mountWorkInProgressOffscreenFiber({ mode: "visible", children: primaryChildren }, workInProgress.mode);
  primaryChildren.return = workInProgress;
  return workInProgress.child = primaryChildren;
}
function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
  offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
  offscreenProps.lanes = 0;
  return offscreenProps;
}
function retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes) {
  reconcileChildFibers(workInProgress, current.child, null, renderLanes);
  current = mountSuspensePrimaryChildren(workInProgress, workInProgress.pendingProps.children);
  current.flags |= 2;
  workInProgress.memoizedState = null;
  return current;
}
function scheduleSuspenseWorkOnFiber(fiber, renderLanes, propagationRoot) {
  fiber.lanes |= renderLanes;
  var alternate = fiber.alternate;
  alternate !== null && (alternate.lanes |= renderLanes);
  scheduleContextWorkOnParentPath(fiber.return, renderLanes, propagationRoot);
}
function initSuspenseListRenderState(workInProgress, isBackwards, tail, lastContentRow, tailMode, treeForkCount) {
  var renderState = workInProgress.memoizedState;
  renderState === null ? workInProgress.memoizedState = {
    isBackwards,
    rendering: null,
    renderingStartTime: 0,
    last: lastContentRow,
    tail,
    tailMode,
    treeForkCount
  } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount);
}
function updateSuspenseListComponent(current, workInProgress, renderLanes) {
  var nextProps = workInProgress.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
  nextProps = nextProps.children;
  var suspenseContext = suspenseStackCursor.current, shouldForceFallback = (suspenseContext & 2) !== 0;
  shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress.flags |= 128) : suspenseContext &= 1;
  push2(suspenseStackCursor, suspenseContext);
  reconcileChildren(current, workInProgress, nextProps, renderLanes);
  nextProps = isHydrating ? treeForkCount : 0;
  if (!shouldForceFallback && current !== null && (current.flags & 128) !== 0)
    a:
      for (current = workInProgress.child;current !== null; ) {
        if (current.tag === 13)
          current.memoizedState !== null && scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
        else if (current.tag === 19)
          scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
        else if (current.child !== null) {
          current.child.return = current;
          current = current.child;
          continue;
        }
        if (current === workInProgress)
          break a;
        for (;current.sibling === null; ) {
          if (current.return === null || current.return === workInProgress)
            break a;
          current = current.return;
        }
        current.sibling.return = current.return;
        current = current.sibling;
      }
  switch (revealOrder) {
    case "forwards":
      renderLanes = workInProgress.child;
      for (revealOrder = null;renderLanes !== null; )
        current = renderLanes.alternate, current !== null && findFirstSuspended(current) === null && (revealOrder = renderLanes), renderLanes = renderLanes.sibling;
      renderLanes = revealOrder;
      renderLanes === null ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null);
      initSuspenseListRenderState(workInProgress, false, revealOrder, renderLanes, tailMode, nextProps);
      break;
    case "backwards":
    case "unstable_legacy-backwards":
      renderLanes = null;
      revealOrder = workInProgress.child;
      for (workInProgress.child = null;revealOrder !== null; ) {
        current = revealOrder.alternate;
        if (current !== null && findFirstSuspended(current) === null) {
          workInProgress.child = revealOrder;
          break;
        }
        current = revealOrder.sibling;
        revealOrder.sibling = renderLanes;
        renderLanes = revealOrder;
        revealOrder = current;
      }
      initSuspenseListRenderState(workInProgress, true, renderLanes, null, tailMode, nextProps);
      break;
    case "together":
      initSuspenseListRenderState(workInProgress, false, null, null, undefined, nextProps);
      break;
    default:
      workInProgress.memoizedState = null;
  }
  return workInProgress.child;
}
function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
  current !== null && (workInProgress.dependencies = current.dependencies);
  workInProgressRootSkippedLanes |= workInProgress.lanes;
  if ((renderLanes & workInProgress.childLanes) === 0)
    if (current !== null) {
      if (propagateParentContextChanges(current, workInProgress, renderLanes, false), (renderLanes & workInProgress.childLanes) === 0)
        return null;
    } else
      return null;
  if (current !== null && workInProgress.child !== current.child)
    throw Error(formatProdErrorMessage2(153));
  if (workInProgress.child !== null) {
    current = workInProgress.child;
    renderLanes = createWorkInProgress(current, current.pendingProps);
    workInProgress.child = renderLanes;
    for (renderLanes.return = workInProgress;current.sibling !== null; )
      current = current.sibling, renderLanes = renderLanes.sibling = createWorkInProgress(current, current.pendingProps), renderLanes.return = workInProgress;
    renderLanes.sibling = null;
  }
  return workInProgress.child;
}
function checkScheduledUpdateOrContext(current, renderLanes) {
  if ((current.lanes & renderLanes) !== 0)
    return true;
  current = current.dependencies;
  return current !== null && checkIfContextChanged(current) ? true : false;
}
function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case 3:
      pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
      pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
      resetHydrationState();
      break;
    case 27:
    case 5:
      pushHostContext(workInProgress);
      break;
    case 4:
      pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
      break;
    case 10:
      pushProvider(workInProgress, workInProgress.type, workInProgress.memoizedProps.value);
      break;
    case 31:
      if (workInProgress.memoizedState !== null)
        return workInProgress.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress), null;
      break;
    case 13:
      var state$102 = workInProgress.memoizedState;
      if (state$102 !== null) {
        if (state$102.dehydrated !== null)
          return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags |= 128, null;
        if ((renderLanes & workInProgress.child.childLanes) !== 0)
          return updateSuspenseComponent(current, workInProgress, renderLanes);
        pushPrimaryTreeSuspenseHandler(workInProgress);
        current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
        return current !== null ? current.sibling : null;
      }
      pushPrimaryTreeSuspenseHandler(workInProgress);
      break;
    case 19:
      var didSuspendBefore = (current.flags & 128) !== 0;
      state$102 = (renderLanes & workInProgress.childLanes) !== 0;
      state$102 || (propagateParentContextChanges(current, workInProgress, renderLanes, false), state$102 = (renderLanes & workInProgress.childLanes) !== 0);
      if (didSuspendBefore) {
        if (state$102)
          return updateSuspenseListComponent(current, workInProgress, renderLanes);
        workInProgress.flags |= 128;
      }
      didSuspendBefore = workInProgress.memoizedState;
      didSuspendBefore !== null && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
      push2(suspenseStackCursor, suspenseStackCursor.current);
      if (state$102)
        break;
      else
        return null;
    case 22:
      return workInProgress.lanes = 0, updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
    case 24:
      pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
  }
  return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
}
function beginWork(current, workInProgress, renderLanes) {
  if (current !== null)
    if (current.memoizedProps !== workInProgress.pendingProps)
      didReceiveUpdate = true;
    else {
      if (!checkScheduledUpdateOrContext(current, renderLanes) && (workInProgress.flags & 128) === 0)
        return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
      didReceiveUpdate = (current.flags & 131072) !== 0 ? true : false;
    }
  else
    didReceiveUpdate = false, isHydrating && (workInProgress.flags & 1048576) !== 0 && pushTreeId(workInProgress, treeForkCount, workInProgress.index);
  workInProgress.lanes = 0;
  switch (workInProgress.tag) {
    case 16:
      a: {
        var props = workInProgress.pendingProps;
        current = resolveLazy(workInProgress.elementType);
        workInProgress.type = current;
        if (typeof current === "function")
          shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress.tag = 1, workInProgress = updateClassComponent(null, workInProgress, current, props, renderLanes)) : (workInProgress.tag = 0, workInProgress = updateFunctionComponent(null, workInProgress, current, props, renderLanes));
        else {
          if (current !== undefined && current !== null) {
            var $$typeof = current.$$typeof;
            if ($$typeof === REACT_FORWARD_REF_TYPE2) {
              workInProgress.tag = 11;
              workInProgress = updateForwardRef(null, workInProgress, current, props, renderLanes);
              break a;
            } else if ($$typeof === REACT_MEMO_TYPE2) {
              workInProgress.tag = 14;
              workInProgress = updateMemoComponent(null, workInProgress, current, props, renderLanes);
              break a;
            }
          }
          workInProgress = getComponentNameFromType(current) || current;
          throw Error(formatProdErrorMessage2(306, workInProgress, ""));
        }
      }
      return workInProgress;
    case 0:
      return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
    case 1:
      return props = workInProgress.type, $$typeof = resolveClassComponentProps(props, workInProgress.pendingProps), updateClassComponent(current, workInProgress, props, $$typeof, renderLanes);
    case 3:
      a: {
        pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
        if (current === null)
          throw Error(formatProdErrorMessage2(387));
        props = workInProgress.pendingProps;
        var prevState = workInProgress.memoizedState;
        $$typeof = prevState.element;
        cloneUpdateQueue(current, workInProgress);
        processUpdateQueue(workInProgress, props, null, renderLanes);
        var nextState = workInProgress.memoizedState;
        props = nextState.cache;
        pushProvider(workInProgress, CacheContext, props);
        props !== prevState.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, true);
        suspendIfUpdateReadFromEntangledAsyncAction();
        props = nextState.element;
        if (prevState.isDehydrated)
          if (prevState = {
            element: props,
            isDehydrated: false,
            cache: nextState.cache
          }, workInProgress.updateQueue.baseState = prevState, workInProgress.memoizedState = prevState, workInProgress.flags & 256) {
            workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
            break a;
          } else if (props !== $$typeof) {
            $$typeof = createCapturedValueAtFiber(Error(formatProdErrorMessage2(424)), workInProgress);
            queueHydrationError($$typeof);
            workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
            break a;
          } else {
            current = workInProgress.stateNode.containerInfo;
            switch (current.nodeType) {
              case 9:
                current = current.body;
                break;
              default:
                current = current.nodeName === "HTML" ? current.ownerDocument.body : current;
            }
            nextHydratableInstance = getNextHydratable(current.firstChild);
            hydrationParentFiber = workInProgress;
            isHydrating = true;
            hydrationErrors = null;
            rootOrSingletonContext = true;
            renderLanes = mountChildFibers(workInProgress, null, props, renderLanes);
            for (workInProgress.child = renderLanes;renderLanes; )
              renderLanes.flags = renderLanes.flags & -3 | 4096, renderLanes = renderLanes.sibling;
          }
        else {
          resetHydrationState();
          if (props === $$typeof) {
            workInProgress = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
            break a;
          }
          reconcileChildren(current, workInProgress, props, renderLanes);
        }
        workInProgress = workInProgress.child;
      }
      return workInProgress;
    case 26:
      return markRef(current, workInProgress), current === null ? (renderLanes = getResource(workInProgress.type, null, workInProgress.pendingProps, null)) ? workInProgress.memoizedState = renderLanes : isHydrating || (renderLanes = workInProgress.type, current = workInProgress.pendingProps, props = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current).createElement(renderLanes), props[internalInstanceKey] = workInProgress, props[internalPropsKey] = current, setInitialProperties(props, renderLanes, current), markNodeAsHoistable(props), workInProgress.stateNode = props) : workInProgress.memoizedState = getResource(workInProgress.type, current.memoizedProps, workInProgress.pendingProps, current.memoizedState), null;
    case 27:
      return pushHostContext(workInProgress), current === null && isHydrating && (props = workInProgress.stateNode = resolveSingletonInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current), hydrationParentFiber = workInProgress, rootOrSingletonContext = true, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), markRef(current, workInProgress), current === null && (workInProgress.flags |= 4194304), workInProgress.child;
    case 5:
      if (current === null && isHydrating) {
        if ($$typeof = props = nextHydratableInstance)
          props = canHydrateInstance(props, workInProgress.type, workInProgress.pendingProps, rootOrSingletonContext), props !== null ? (workInProgress.stateNode = props, hydrationParentFiber = workInProgress, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = false, $$typeof = true) : $$typeof = false;
        $$typeof || throwOnHydrationMismatch(workInProgress);
      }
      pushHostContext(workInProgress);
      $$typeof = workInProgress.type;
      prevState = workInProgress.pendingProps;
      nextState = current !== null ? current.memoizedProps : null;
      props = prevState.children;
      shouldSetTextContent($$typeof, prevState) ? props = null : nextState !== null && shouldSetTextContent($$typeof, nextState) && (workInProgress.flags |= 32);
      workInProgress.memoizedState !== null && ($$typeof = renderWithHooks(current, workInProgress, TransitionAwareHostComponent, null, null, renderLanes), HostTransitionContext._currentValue = $$typeof);
      markRef(current, workInProgress);
      reconcileChildren(current, workInProgress, props, renderLanes);
      return workInProgress.child;
    case 6:
      if (current === null && isHydrating) {
        if (current = renderLanes = nextHydratableInstance)
          renderLanes = canHydrateTextInstance(renderLanes, workInProgress.pendingProps, rootOrSingletonContext), renderLanes !== null ? (workInProgress.stateNode = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null, current = true) : current = false;
        current || throwOnHydrationMismatch(workInProgress);
      }
      return null;
    case 13:
      return updateSuspenseComponent(current, workInProgress, renderLanes);
    case 4:
      return pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo), props = workInProgress.pendingProps, current === null ? workInProgress.child = reconcileChildFibers(workInProgress, null, props, renderLanes) : reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
    case 11:
      return updateForwardRef(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
    case 7:
      return reconcileChildren(current, workInProgress, workInProgress.pendingProps, renderLanes), workInProgress.child;
    case 8:
      return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
    case 12:
      return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
    case 10:
      return props = workInProgress.pendingProps, pushProvider(workInProgress, workInProgress.type, props.value), reconcileChildren(current, workInProgress, props.children, renderLanes), workInProgress.child;
    case 9:
      return $$typeof = workInProgress.type._context, props = workInProgress.pendingProps.children, prepareToReadContext(workInProgress), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress.flags |= 1, reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
    case 14:
      return updateMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
    case 15:
      return updateSimpleMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
    case 19:
      return updateSuspenseListComponent(current, workInProgress, renderLanes);
    case 31:
      return updateActivityComponent(current, workInProgress, renderLanes);
    case 22:
      return updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
    case 24:
      return prepareToReadContext(workInProgress), props = readContext(CacheContext), current === null ? ($$typeof = peekCacheFromPool(), $$typeof === null && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, prevState !== null && ($$typeof.pooledCacheLanes |= renderLanes), $$typeof = prevState), workInProgress.memoizedState = { parent: props, cache: $$typeof }, initializeUpdateQueue(workInProgress), pushProvider(workInProgress, CacheContext, $$typeof)) : ((current.lanes & renderLanes) !== 0 && (cloneUpdateQueue(current, workInProgress), processUpdateQueue(workInProgress, null, null, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress.memoizedState, $$typeof.parent !== props ? ($$typeof = { parent: props, cache: props }, workInProgress.memoizedState = $$typeof, workInProgress.lanes === 0 && (workInProgress.memoizedState = workInProgress.updateQueue.baseState = $$typeof), pushProvider(workInProgress, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, true))), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
    case 29:
      throw workInProgress.pendingProps;
  }
  throw Error(formatProdErrorMessage2(156, workInProgress.tag));
}
function markUpdate(workInProgress) {
  workInProgress.flags |= 4;
}
function preloadInstanceAndSuspendIfNeeded(workInProgress, type, oldProps, newProps, renderLanes) {
  if (type = (workInProgress.mode & 32) !== 0)
    type = false;
  if (type) {
    if (workInProgress.flags |= 16777216, (renderLanes & 335544128) === renderLanes)
      if (workInProgress.stateNode.complete)
        workInProgress.flags |= 8192;
      else if (shouldRemainOnPreviousScreen())
        workInProgress.flags |= 8192;
      else
        throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
  } else
    workInProgress.flags &= -16777217;
}
function preloadResourceAndSuspendIfNeeded(workInProgress, resource) {
  if (resource.type !== "stylesheet" || (resource.state.loading & 4) !== 0)
    workInProgress.flags &= -16777217;
  else if (workInProgress.flags |= 16777216, !preloadResource(resource))
    if (shouldRemainOnPreviousScreen())
      workInProgress.flags |= 8192;
    else
      throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
}
function scheduleRetryEffect(workInProgress, retryQueue) {
  retryQueue !== null && (workInProgress.flags |= 4);
  workInProgress.flags & 16384 && (retryQueue = workInProgress.tag !== 22 ? claimNextRetryLane() : 536870912, workInProgress.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
}
function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
  if (!isHydrating)
    switch (renderState.tailMode) {
      case "hidden":
        hasRenderedATailFallback = renderState.tail;
        for (var lastTailNode = null;hasRenderedATailFallback !== null; )
          hasRenderedATailFallback.alternate !== null && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
        lastTailNode === null ? renderState.tail = null : lastTailNode.sibling = null;
        break;
      case "collapsed":
        lastTailNode = renderState.tail;
        for (var lastTailNode$106 = null;lastTailNode !== null; )
          lastTailNode.alternate !== null && (lastTailNode$106 = lastTailNode), lastTailNode = lastTailNode.sibling;
        lastTailNode$106 === null ? hasRenderedATailFallback || renderState.tail === null ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$106.sibling = null;
    }
}
function bubbleProperties(completedWork) {
  var didBailout = completedWork.alternate !== null && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
  if (didBailout)
    for (var child$107 = completedWork.child;child$107 !== null; )
      newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags & 65011712, subtreeFlags |= child$107.flags & 65011712, child$107.return = completedWork, child$107 = child$107.sibling;
  else
    for (child$107 = completedWork.child;child$107 !== null; )
      newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags, subtreeFlags |= child$107.flags, child$107.return = completedWork, child$107 = child$107.sibling;
  completedWork.subtreeFlags |= subtreeFlags;
  completedWork.childLanes = newChildLanes;
  return didBailout;
}
function completeWork(current, workInProgress, renderLanes) {
  var newProps = workInProgress.pendingProps;
  popTreeContext(workInProgress);
  switch (workInProgress.tag) {
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return bubbleProperties(workInProgress), null;
    case 1:
      return bubbleProperties(workInProgress), null;
    case 3:
      renderLanes = workInProgress.stateNode;
      newProps = null;
      current !== null && (newProps = current.memoizedState.cache);
      workInProgress.memoizedState.cache !== newProps && (workInProgress.flags |= 2048);
      popProvider(CacheContext);
      popHostContainer();
      renderLanes.pendingContext && (renderLanes.context = renderLanes.pendingContext, renderLanes.pendingContext = null);
      if (current === null || current.child === null)
        popHydrationState(workInProgress) ? markUpdate(workInProgress) : current === null || current.memoizedState.isDehydrated && (workInProgress.flags & 256) === 0 || (workInProgress.flags |= 1024, upgradeHydrationErrorsToRecoverable());
      bubbleProperties(workInProgress);
      return null;
    case 26:
      var { type, memoizedState: nextResource } = workInProgress;
      current === null ? (markUpdate(workInProgress), nextResource !== null ? (bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, null, newProps, renderLanes))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress), bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), workInProgress.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress), bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, current, newProps, renderLanes));
      return null;
    case 27:
      popHostContext(workInProgress);
      renderLanes = rootInstanceStackCursor.current;
      type = workInProgress.type;
      if (current !== null && workInProgress.stateNode != null)
        current.memoizedProps !== newProps && markUpdate(workInProgress);
      else {
        if (!newProps) {
          if (workInProgress.stateNode === null)
            throw Error(formatProdErrorMessage2(166));
          bubbleProperties(workInProgress);
          return null;
        }
        current = contextStackCursor.current;
        popHydrationState(workInProgress) ? prepareToHydrateHostInstance(workInProgress, current) : (current = resolveSingletonInstance(type, newProps, renderLanes), workInProgress.stateNode = current, markUpdate(workInProgress));
      }
      bubbleProperties(workInProgress);
      return null;
    case 5:
      popHostContext(workInProgress);
      type = workInProgress.type;
      if (current !== null && workInProgress.stateNode != null)
        current.memoizedProps !== newProps && markUpdate(workInProgress);
      else {
        if (!newProps) {
          if (workInProgress.stateNode === null)
            throw Error(formatProdErrorMessage2(166));
          bubbleProperties(workInProgress);
          return null;
        }
        nextResource = contextStackCursor.current;
        if (popHydrationState(workInProgress))
          prepareToHydrateHostInstance(workInProgress, nextResource);
        else {
          var ownerDocument = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current);
          switch (nextResource) {
            case 1:
              nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
              break;
            case 2:
              nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
              break;
            default:
              switch (type) {
                case "svg":
                  nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
                  break;
                case "math":
                  nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
                  break;
                case "script":
                  nextResource = ownerDocument.createElement("div");
                  nextResource.innerHTML = "<script></script>";
                  nextResource = nextResource.removeChild(nextResource.firstChild);
                  break;
                case "select":
                  nextResource = typeof newProps.is === "string" ? ownerDocument.createElement("select", {
                    is: newProps.is
                  }) : ownerDocument.createElement("select");
                  newProps.multiple ? nextResource.multiple = true : newProps.size && (nextResource.size = newProps.size);
                  break;
                default:
                  nextResource = typeof newProps.is === "string" ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
              }
          }
          nextResource[internalInstanceKey] = workInProgress;
          nextResource[internalPropsKey] = newProps;
          a:
            for (ownerDocument = workInProgress.child;ownerDocument !== null; ) {
              if (ownerDocument.tag === 5 || ownerDocument.tag === 6)
                nextResource.appendChild(ownerDocument.stateNode);
              else if (ownerDocument.tag !== 4 && ownerDocument.tag !== 27 && ownerDocument.child !== null) {
                ownerDocument.child.return = ownerDocument;
                ownerDocument = ownerDocument.child;
                continue;
              }
              if (ownerDocument === workInProgress)
                break a;
              for (;ownerDocument.sibling === null; ) {
                if (ownerDocument.return === null || ownerDocument.return === workInProgress)
                  break a;
                ownerDocument = ownerDocument.return;
              }
              ownerDocument.sibling.return = ownerDocument.return;
              ownerDocument = ownerDocument.sibling;
            }
          workInProgress.stateNode = nextResource;
          a:
            switch (setInitialProperties(nextResource, type, newProps), type) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                newProps = !!newProps.autoFocus;
                break a;
              case "img":
                newProps = true;
                break a;
              default:
                newProps = false;
            }
          newProps && markUpdate(workInProgress);
        }
      }
      bubbleProperties(workInProgress);
      preloadInstanceAndSuspendIfNeeded(workInProgress, workInProgress.type, current === null ? null : current.memoizedProps, workInProgress.pendingProps, renderLanes);
      return null;
    case 6:
      if (current && workInProgress.stateNode != null)
        current.memoizedProps !== newProps && markUpdate(workInProgress);
      else {
        if (typeof newProps !== "string" && workInProgress.stateNode === null)
          throw Error(formatProdErrorMessage2(166));
        current = rootInstanceStackCursor.current;
        if (popHydrationState(workInProgress)) {
          current = workInProgress.stateNode;
          renderLanes = workInProgress.memoizedProps;
          newProps = null;
          type = hydrationParentFiber;
          if (type !== null)
            switch (type.tag) {
              case 27:
              case 5:
                newProps = type.memoizedProps;
            }
          current[internalInstanceKey] = workInProgress;
          current = current.nodeValue === renderLanes || newProps !== null && newProps.suppressHydrationWarning === true || checkForUnmatchedText(current.nodeValue, renderLanes) ? true : false;
          current || throwOnHydrationMismatch(workInProgress, true);
        } else
          current = getOwnerDocumentFromRootContainer(current).createTextNode(newProps), current[internalInstanceKey] = workInProgress, workInProgress.stateNode = current;
      }
      bubbleProperties(workInProgress);
      return null;
    case 31:
      renderLanes = workInProgress.memoizedState;
      if (current === null || current.memoizedState !== null) {
        newProps = popHydrationState(workInProgress);
        if (renderLanes !== null) {
          if (current === null) {
            if (!newProps)
              throw Error(formatProdErrorMessage2(318));
            current = workInProgress.memoizedState;
            current = current !== null ? current.dehydrated : null;
            if (!current)
              throw Error(formatProdErrorMessage2(557));
            current[internalInstanceKey] = workInProgress;
          } else
            resetHydrationState(), (workInProgress.flags & 128) === 0 && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
          bubbleProperties(workInProgress);
          current = false;
        } else
          renderLanes = upgradeHydrationErrorsToRecoverable(), current !== null && current.memoizedState !== null && (current.memoizedState.hydrationErrors = renderLanes), current = true;
        if (!current) {
          if (workInProgress.flags & 256)
            return popSuspenseHandler(workInProgress), workInProgress;
          popSuspenseHandler(workInProgress);
          return null;
        }
        if ((workInProgress.flags & 128) !== 0)
          throw Error(formatProdErrorMessage2(558));
      }
      bubbleProperties(workInProgress);
      return null;
    case 13:
      newProps = workInProgress.memoizedState;
      if (current === null || current.memoizedState !== null && current.memoizedState.dehydrated !== null) {
        type = popHydrationState(workInProgress);
        if (newProps !== null && newProps.dehydrated !== null) {
          if (current === null) {
            if (!type)
              throw Error(formatProdErrorMessage2(318));
            type = workInProgress.memoizedState;
            type = type !== null ? type.dehydrated : null;
            if (!type)
              throw Error(formatProdErrorMessage2(317));
            type[internalInstanceKey] = workInProgress;
          } else
            resetHydrationState(), (workInProgress.flags & 128) === 0 && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
          bubbleProperties(workInProgress);
          type = false;
        } else
          type = upgradeHydrationErrorsToRecoverable(), current !== null && current.memoizedState !== null && (current.memoizedState.hydrationErrors = type), type = true;
        if (!type) {
          if (workInProgress.flags & 256)
            return popSuspenseHandler(workInProgress), workInProgress;
          popSuspenseHandler(workInProgress);
          return null;
        }
      }
      popSuspenseHandler(workInProgress);
      if ((workInProgress.flags & 128) !== 0)
        return workInProgress.lanes = renderLanes, workInProgress;
      renderLanes = newProps !== null;
      current = current !== null && current.memoizedState !== null;
      renderLanes && (newProps = workInProgress.child, type = null, newProps.alternate !== null && newProps.alternate.memoizedState !== null && newProps.alternate.memoizedState.cachePool !== null && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, newProps.memoizedState !== null && newProps.memoizedState.cachePool !== null && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
      renderLanes !== current && renderLanes && (workInProgress.child.flags |= 8192);
      scheduleRetryEffect(workInProgress, workInProgress.updateQueue);
      bubbleProperties(workInProgress);
      return null;
    case 4:
      return popHostContainer(), current === null && listenToAllSupportedEvents(workInProgress.stateNode.containerInfo), bubbleProperties(workInProgress), null;
    case 10:
      return popProvider(workInProgress.type), bubbleProperties(workInProgress), null;
    case 19:
      pop2(suspenseStackCursor);
      newProps = workInProgress.memoizedState;
      if (newProps === null)
        return bubbleProperties(workInProgress), null;
      type = (workInProgress.flags & 128) !== 0;
      nextResource = newProps.rendering;
      if (nextResource === null)
        if (type)
          cutOffTailIfNeeded(newProps, false);
        else {
          if (workInProgressRootExitStatus !== 0 || current !== null && (current.flags & 128) !== 0)
            for (current = workInProgress.child;current !== null; ) {
              nextResource = findFirstSuspended(current);
              if (nextResource !== null) {
                workInProgress.flags |= 128;
                cutOffTailIfNeeded(newProps, false);
                current = nextResource.updateQueue;
                workInProgress.updateQueue = current;
                scheduleRetryEffect(workInProgress, current);
                workInProgress.subtreeFlags = 0;
                current = renderLanes;
                for (renderLanes = workInProgress.child;renderLanes !== null; )
                  resetWorkInProgress(renderLanes, current), renderLanes = renderLanes.sibling;
                push2(suspenseStackCursor, suspenseStackCursor.current & 1 | 2);
                isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
                return workInProgress.child;
              }
              current = current.sibling;
            }
          newProps.tail !== null && now() > workInProgressRootRenderTargetTime && (workInProgress.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress.lanes = 4194304);
        }
      else {
        if (!type)
          if (current = findFirstSuspended(nextResource), current !== null) {
            if (workInProgress.flags |= 128, type = true, current = current.updateQueue, workInProgress.updateQueue = current, scheduleRetryEffect(workInProgress, current), cutOffTailIfNeeded(newProps, true), newProps.tail === null && newProps.tailMode === "hidden" && !nextResource.alternate && !isHydrating)
              return bubbleProperties(workInProgress), null;
          } else
            2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && renderLanes !== 536870912 && (workInProgress.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress.lanes = 4194304);
        newProps.isBackwards ? (nextResource.sibling = workInProgress.child, workInProgress.child = nextResource) : (current = newProps.last, current !== null ? current.sibling = nextResource : workInProgress.child = nextResource, newProps.last = nextResource);
      }
      if (newProps.tail !== null)
        return current = newProps.tail, newProps.rendering = current, newProps.tail = current.sibling, newProps.renderingStartTime = now(), current.sibling = null, renderLanes = suspenseStackCursor.current, push2(suspenseStackCursor, type ? renderLanes & 1 | 2 : renderLanes & 1), isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount), current;
      bubbleProperties(workInProgress);
      return null;
    case 22:
    case 23:
      return popSuspenseHandler(workInProgress), popHiddenContext(), newProps = workInProgress.memoizedState !== null, current !== null ? current.memoizedState !== null !== newProps && (workInProgress.flags |= 8192) : newProps && (workInProgress.flags |= 8192), newProps ? (renderLanes & 536870912) !== 0 && (workInProgress.flags & 128) === 0 && (bubbleProperties(workInProgress), workInProgress.subtreeFlags & 6 && (workInProgress.flags |= 8192)) : bubbleProperties(workInProgress), renderLanes = workInProgress.updateQueue, renderLanes !== null && scheduleRetryEffect(workInProgress, renderLanes.retryQueue), renderLanes = null, current !== null && current.memoizedState !== null && current.memoizedState.cachePool !== null && (renderLanes = current.memoizedState.cachePool.pool), newProps = null, workInProgress.memoizedState !== null && workInProgress.memoizedState.cachePool !== null && (newProps = workInProgress.memoizedState.cachePool.pool), newProps !== renderLanes && (workInProgress.flags |= 2048), current !== null && pop2(resumedCache), null;
    case 24:
      return renderLanes = null, current !== null && (renderLanes = current.memoizedState.cache), workInProgress.memoizedState.cache !== renderLanes && (workInProgress.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress), null;
    case 25:
      return null;
    case 30:
      return null;
  }
  throw Error(formatProdErrorMessage2(156, workInProgress.tag));
}
function unwindWork(current, workInProgress) {
  popTreeContext(workInProgress);
  switch (workInProgress.tag) {
    case 1:
      return current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
    case 3:
      return popProvider(CacheContext), popHostContainer(), current = workInProgress.flags, (current & 65536) !== 0 && (current & 128) === 0 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
    case 26:
    case 27:
    case 5:
      return popHostContext(workInProgress), null;
    case 31:
      if (workInProgress.memoizedState !== null) {
        popSuspenseHandler(workInProgress);
        if (workInProgress.alternate === null)
          throw Error(formatProdErrorMessage2(340));
        resetHydrationState();
      }
      current = workInProgress.flags;
      return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
    case 13:
      popSuspenseHandler(workInProgress);
      current = workInProgress.memoizedState;
      if (current !== null && current.dehydrated !== null) {
        if (workInProgress.alternate === null)
          throw Error(formatProdErrorMessage2(340));
        resetHydrationState();
      }
      current = workInProgress.flags;
      return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
    case 19:
      return pop2(suspenseStackCursor), null;
    case 4:
      return popHostContainer(), null;
    case 10:
      return popProvider(workInProgress.type), null;
    case 22:
    case 23:
      return popSuspenseHandler(workInProgress), popHiddenContext(), current !== null && pop2(resumedCache), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
    case 24:
      return popProvider(CacheContext), null;
    case 25:
      return null;
    default:
      return null;
  }
}
function unwindInterruptedWork(current, interruptedWork) {
  popTreeContext(interruptedWork);
  switch (interruptedWork.tag) {
    case 3:
      popProvider(CacheContext);
      popHostContainer();
      break;
    case 26:
    case 27:
    case 5:
      popHostContext(interruptedWork);
      break;
    case 4:
      popHostContainer();
      break;
    case 31:
      interruptedWork.memoizedState !== null && popSuspenseHandler(interruptedWork);
      break;
    case 13:
      popSuspenseHandler(interruptedWork);
      break;
    case 19:
      pop2(suspenseStackCursor);
      break;
    case 10:
      popProvider(interruptedWork.type);
      break;
    case 22:
    case 23:
      popSuspenseHandler(interruptedWork);
      popHiddenContext();
      current !== null && pop2(resumedCache);
      break;
    case 24:
      popProvider(CacheContext);
  }
}
function commitHookEffectListMount(flags, finishedWork) {
  try {
    var updateQueue = finishedWork.updateQueue, lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
      var firstEffect = lastEffect.next;
      updateQueue = firstEffect;
      do {
        if ((updateQueue.tag & flags) === flags) {
          lastEffect = undefined;
          var create = updateQueue.create, inst = updateQueue.inst;
          lastEffect = create();
          inst.destroy = lastEffect;
        }
        updateQueue = updateQueue.next;
      } while (updateQueue !== firstEffect);
    }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
  try {
    var updateQueue = finishedWork.updateQueue, lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
      var firstEffect = lastEffect.next;
      updateQueue = firstEffect;
      do {
        if ((updateQueue.tag & flags) === flags) {
          var inst = updateQueue.inst, destroy = inst.destroy;
          if (destroy !== undefined) {
            inst.destroy = undefined;
            lastEffect = finishedWork;
            var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
            try {
              destroy_();
            } catch (error) {
              captureCommitPhaseError(lastEffect, nearestMountedAncestor, error);
            }
          }
        }
        updateQueue = updateQueue.next;
      } while (updateQueue !== firstEffect);
    }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitClassCallbacks(finishedWork) {
  var updateQueue = finishedWork.updateQueue;
  if (updateQueue !== null) {
    var instance = finishedWork.stateNode;
    try {
      commitCallbacks(updateQueue, instance);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
}
function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
  instance.props = resolveClassComponentProps(current.type, current.memoizedProps);
  instance.state = current.memoizedState;
  try {
    instance.componentWillUnmount();
  } catch (error) {
    captureCommitPhaseError(current, nearestMountedAncestor, error);
  }
}
function safelyAttachRef(current, nearestMountedAncestor) {
  try {
    var ref = current.ref;
    if (ref !== null) {
      switch (current.tag) {
        case 26:
        case 27:
        case 5:
          var instanceToUse = current.stateNode;
          break;
        case 30:
          instanceToUse = current.stateNode;
          break;
        default:
          instanceToUse = current.stateNode;
      }
      typeof ref === "function" ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
    }
  } catch (error) {
    captureCommitPhaseError(current, nearestMountedAncestor, error);
  }
}
function safelyDetachRef(current, nearestMountedAncestor) {
  var ref = current.ref, refCleanup = current.refCleanup;
  if (ref !== null)
    if (typeof refCleanup === "function")
      try {
        refCleanup();
      } catch (error) {
        captureCommitPhaseError(current, nearestMountedAncestor, error);
      } finally {
        current.refCleanup = null, current = current.alternate, current != null && (current.refCleanup = null);
      }
    else if (typeof ref === "function")
      try {
        ref(null);
      } catch (error$140) {
        captureCommitPhaseError(current, nearestMountedAncestor, error$140);
      }
    else
      ref.current = null;
}
function commitHostMount(finishedWork) {
  var { type, memoizedProps: props, stateNode: instance } = finishedWork;
  try {
    a:
      switch (type) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          props.autoFocus && instance.focus();
          break a;
        case "img":
          props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
      }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitHostUpdate(finishedWork, newProps, oldProps) {
  try {
    var domElement = finishedWork.stateNode;
    updateProperties(domElement, finishedWork.type, oldProps, newProps);
    domElement[internalPropsKey] = newProps;
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function isHostParent(fiber) {
  return fiber.tag === 5 || fiber.tag === 3 || fiber.tag === 26 || fiber.tag === 27 && isSingletonScope(fiber.type) || fiber.tag === 4;
}
function getHostSibling(fiber) {
  a:
    for (;; ) {
      for (;fiber.sibling === null; ) {
        if (fiber.return === null || isHostParent(fiber.return))
          return null;
        fiber = fiber.return;
      }
      fiber.sibling.return = fiber.return;
      for (fiber = fiber.sibling;fiber.tag !== 5 && fiber.tag !== 6 && fiber.tag !== 18; ) {
        if (fiber.tag === 27 && isSingletonScope(fiber.type))
          continue a;
        if (fiber.flags & 2)
          continue a;
        if (fiber.child === null || fiber.tag === 4)
          continue a;
        else
          fiber.child.return = fiber, fiber = fiber.child;
      }
      if (!(fiber.flags & 2))
        return fiber.stateNode;
    }
}
function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  var tag = node.tag;
  if (tag === 5 || tag === 6)
    node = node.stateNode, before ? (parent.nodeType === 9 ? parent.body : parent.nodeName === "HTML" ? parent.ownerDocument.body : parent).insertBefore(node, before) : (before = parent.nodeType === 9 ? parent.body : parent.nodeName === "HTML" ? parent.ownerDocument.body : parent, before.appendChild(node), parent = parent._reactRootContainer, parent !== null && parent !== undefined || before.onclick !== null || (before.onclick = noop$1));
  else if (tag !== 4 && (tag === 27 && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, node !== null))
    for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;node !== null; )
      insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
}
function insertOrAppendPlacementNode(node, before, parent) {
  var tag = node.tag;
  if (tag === 5 || tag === 6)
    node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
  else if (tag !== 4 && (tag === 27 && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, node !== null))
    for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling;node !== null; )
      insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
}
function commitHostSingletonAcquisition(finishedWork) {
  var { stateNode: singleton, memoizedProps: props } = finishedWork;
  try {
    for (var type = finishedWork.type, attributes = singleton.attributes;attributes.length; )
      singleton.removeAttributeNode(attributes[0]);
    setInitialProperties(singleton, type, props);
    singleton[internalInstanceKey] = finishedWork;
    singleton[internalPropsKey] = props;
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitBeforeMutationEffects(root, firstChild) {
  root = root.containerInfo;
  eventsEnabled = _enabled;
  root = getActiveElementDeep(root);
  if (hasSelectionCapabilities(root)) {
    if ("selectionStart" in root)
      var JSCompiler_temp = {
        start: root.selectionStart,
        end: root.selectionEnd
      };
    else
      a: {
        JSCompiler_temp = (JSCompiler_temp = root.ownerDocument) && JSCompiler_temp.defaultView || window;
        var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
        if (selection && selection.rangeCount !== 0) {
          JSCompiler_temp = selection.anchorNode;
          var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
          selection = selection.focusOffset;
          try {
            JSCompiler_temp.nodeType, focusNode.nodeType;
          } catch (e$20) {
            JSCompiler_temp = null;
            break a;
          }
          var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root, parentNode = null;
          b:
            for (;; ) {
              for (var next;; ) {
                node !== JSCompiler_temp || anchorOffset !== 0 && node.nodeType !== 3 || (start = length + anchorOffset);
                node !== focusNode || selection !== 0 && node.nodeType !== 3 || (end = length + selection);
                node.nodeType === 3 && (length += node.nodeValue.length);
                if ((next = node.firstChild) === null)
                  break;
                parentNode = node;
                node = next;
              }
              for (;; ) {
                if (node === root)
                  break b;
                parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
                parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
                if ((next = node.nextSibling) !== null)
                  break;
                node = parentNode;
                parentNode = node.parentNode;
              }
              node = next;
            }
          JSCompiler_temp = start === -1 || end === -1 ? null : { start, end };
        } else
          JSCompiler_temp = null;
      }
    JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
  } else
    JSCompiler_temp = null;
  selectionInformation = { focusedElem: root, selectionRange: JSCompiler_temp };
  _enabled = false;
  for (nextEffect = firstChild;nextEffect !== null; )
    if (firstChild = nextEffect, root = firstChild.child, (firstChild.subtreeFlags & 1028) !== 0 && root !== null)
      root.return = firstChild, nextEffect = root;
    else
      for (;nextEffect !== null; ) {
        firstChild = nextEffect;
        focusNode = firstChild.alternate;
        root = firstChild.flags;
        switch (firstChild.tag) {
          case 0:
            if ((root & 4) !== 0 && (root = firstChild.updateQueue, root = root !== null ? root.events : null, root !== null))
              for (JSCompiler_temp = 0;JSCompiler_temp < root.length; JSCompiler_temp++)
                anchorOffset = root[JSCompiler_temp], anchorOffset.ref.impl = anchorOffset.nextImpl;
            break;
          case 11:
          case 15:
            break;
          case 1:
            if ((root & 1024) !== 0 && focusNode !== null) {
              root = undefined;
              JSCompiler_temp = firstChild;
              anchorOffset = focusNode.memoizedProps;
              focusNode = focusNode.memoizedState;
              selection = JSCompiler_temp.stateNode;
              try {
                var resolvedPrevProps = resolveClassComponentProps(JSCompiler_temp.type, anchorOffset);
                root = selection.getSnapshotBeforeUpdate(resolvedPrevProps, focusNode);
                selection.__reactInternalSnapshotBeforeUpdate = root;
              } catch (error) {
                captureCommitPhaseError(JSCompiler_temp, JSCompiler_temp.return, error);
              }
            }
            break;
          case 3:
            if ((root & 1024) !== 0) {
              if (root = firstChild.stateNode.containerInfo, JSCompiler_temp = root.nodeType, JSCompiler_temp === 9)
                clearContainerSparingly(root);
              else if (JSCompiler_temp === 1)
                switch (root.nodeName) {
                  case "HEAD":
                  case "HTML":
                  case "BODY":
                    clearContainerSparingly(root);
                    break;
                  default:
                    root.textContent = "";
                }
            }
            break;
          case 5:
          case 26:
          case 27:
          case 6:
          case 4:
          case 17:
            break;
          default:
            if ((root & 1024) !== 0)
              throw Error(formatProdErrorMessage2(163));
        }
        root = firstChild.sibling;
        if (root !== null) {
          root.return = firstChild.return;
          nextEffect = root;
          break;
        }
        nextEffect = firstChild.return;
      }
}
function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
  var flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      flags & 4 && commitHookEffectListMount(5, finishedWork);
      break;
    case 1:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      if (flags & 4)
        if (finishedRoot = finishedWork.stateNode, current === null)
          try {
            finishedRoot.componentDidMount();
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        else {
          var prevProps = resolveClassComponentProps(finishedWork.type, current.memoizedProps);
          current = current.memoizedState;
          try {
            finishedRoot.componentDidUpdate(prevProps, current, finishedRoot.__reactInternalSnapshotBeforeUpdate);
          } catch (error$139) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error$139);
          }
        }
      flags & 64 && commitClassCallbacks(finishedWork);
      flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
      break;
    case 3:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      if (flags & 64 && (finishedRoot = finishedWork.updateQueue, finishedRoot !== null)) {
        current = null;
        if (finishedWork.child !== null)
          switch (finishedWork.child.tag) {
            case 27:
            case 5:
              current = finishedWork.child.stateNode;
              break;
            case 1:
              current = finishedWork.child.stateNode;
          }
        try {
          commitCallbacks(finishedRoot, current);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      break;
    case 27:
      current === null && flags & 4 && commitHostSingletonAcquisition(finishedWork);
    case 26:
    case 5:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      current === null && flags & 4 && commitHostMount(finishedWork);
      flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
      break;
    case 12:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      break;
    case 31:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
      break;
    case 13:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
      flags & 64 && (finishedRoot = finishedWork.memoizedState, finishedRoot !== null && (finishedRoot = finishedRoot.dehydrated, finishedRoot !== null && (finishedWork = retryDehydratedSuspenseBoundary.bind(null, finishedWork), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
      break;
    case 22:
      flags = finishedWork.memoizedState !== null || offscreenSubtreeIsHidden;
      if (!flags) {
        current = current !== null && current.memoizedState !== null || offscreenSubtreeWasHidden;
        prevProps = offscreenSubtreeIsHidden;
        var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = flags;
        (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, (finishedWork.subtreeFlags & 8772) !== 0) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        offscreenSubtreeIsHidden = prevProps;
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
      }
      break;
    case 30:
      break;
    default:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
  }
}
function detachFiberAfterEffects(fiber) {
  var alternate = fiber.alternate;
  alternate !== null && (fiber.alternate = null, detachFiberAfterEffects(alternate));
  fiber.child = null;
  fiber.deletions = null;
  fiber.sibling = null;
  fiber.tag === 5 && (alternate = fiber.stateNode, alternate !== null && detachDeletedInstance(alternate));
  fiber.stateNode = null;
  fiber.return = null;
  fiber.dependencies = null;
  fiber.memoizedProps = null;
  fiber.memoizedState = null;
  fiber.pendingProps = null;
  fiber.stateNode = null;
  fiber.updateQueue = null;
}
function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
  for (parent = parent.child;parent !== null; )
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
}
function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
  if (injectedHook && typeof injectedHook.onCommitFiberUnmount === "function")
    try {
      injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
    } catch (err) {}
  switch (deletedFiber.tag) {
    case 26:
      offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
      break;
    case 27:
      offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
      var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
      isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      releaseSingletonInstance(deletedFiber.stateNode);
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      break;
    case 5:
      offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
    case 6:
      prevHostParent = hostParent;
      prevHostParentIsContainer = hostParentIsContainer;
      hostParent = null;
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      if (hostParent !== null)
        if (hostParentIsContainer)
          try {
            (hostParent.nodeType === 9 ? hostParent.body : hostParent.nodeName === "HTML" ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode);
          } catch (error) {
            captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
          }
        else
          try {
            hostParent.removeChild(deletedFiber.stateNode);
          } catch (error) {
            captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
          }
      break;
    case 18:
      hostParent !== null && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(finishedRoot.nodeType === 9 ? finishedRoot.body : finishedRoot.nodeName === "HTML" ? finishedRoot.ownerDocument.body : finishedRoot, deletedFiber.stateNode), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
      break;
    case 4:
      prevHostParent = hostParent;
      prevHostParentIsContainer = hostParentIsContainer;
      hostParent = deletedFiber.stateNode.containerInfo;
      hostParentIsContainer = true;
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
      offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      break;
    case 1:
      offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, typeof prevHostParent.componentWillUnmount === "function" && safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, prevHostParent));
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      break;
    case 21:
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      break;
    case 22:
      offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || deletedFiber.memoizedState !== null;
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      offscreenSubtreeWasHidden = prevHostParent;
      break;
    default:
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
  }
}
function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
  if (finishedWork.memoizedState === null && (finishedRoot = finishedWork.alternate, finishedRoot !== null && (finishedRoot = finishedRoot.memoizedState, finishedRoot !== null))) {
    finishedRoot = finishedRoot.dehydrated;
    try {
      retryIfBlockedOn(finishedRoot);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
}
function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
  if (finishedWork.memoizedState === null && (finishedRoot = finishedWork.alternate, finishedRoot !== null && (finishedRoot = finishedRoot.memoizedState, finishedRoot !== null && (finishedRoot = finishedRoot.dehydrated, finishedRoot !== null))))
    try {
      retryIfBlockedOn(finishedRoot);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
}
function getRetryCache(finishedWork) {
  switch (finishedWork.tag) {
    case 31:
    case 13:
    case 19:
      var retryCache = finishedWork.stateNode;
      retryCache === null && (retryCache = finishedWork.stateNode = new PossiblyWeakSet);
      return retryCache;
    case 22:
      return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, retryCache === null && (retryCache = finishedWork._retryCache = new PossiblyWeakSet), retryCache;
    default:
      throw Error(formatProdErrorMessage2(435, finishedWork.tag));
  }
}
function attachSuspenseRetryListeners(finishedWork, wakeables) {
  var retryCache = getRetryCache(finishedWork);
  wakeables.forEach(function(wakeable) {
    if (!retryCache.has(wakeable)) {
      retryCache.add(wakeable);
      var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
      wakeable.then(retry, retry);
    }
  });
}
function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
  var deletions = parentFiber.deletions;
  if (deletions !== null)
    for (var i = 0;i < deletions.length; i++) {
      var childToDelete = deletions[i], root = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
      a:
        for (;parent !== null; ) {
          switch (parent.tag) {
            case 27:
              if (isSingletonScope(parent.type)) {
                hostParent = parent.stateNode;
                hostParentIsContainer = false;
                break a;
              }
              break;
            case 5:
              hostParent = parent.stateNode;
              hostParentIsContainer = false;
              break a;
            case 3:
            case 4:
              hostParent = parent.stateNode.containerInfo;
              hostParentIsContainer = true;
              break a;
          }
          parent = parent.return;
        }
      if (hostParent === null)
        throw Error(formatProdErrorMessage2(160));
      commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
      hostParent = null;
      hostParentIsContainer = false;
      root = childToDelete.alternate;
      root !== null && (root.return = null);
      childToDelete.return = null;
    }
  if (parentFiber.subtreeFlags & 13886)
    for (parentFiber = parentFiber.child;parentFiber !== null; )
      commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
}
function commitMutationEffectsOnFiber(finishedWork, root) {
  var current = finishedWork.alternate, flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
      break;
    case 1:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 && (offscreenSubtreeWasHidden || current === null || safelyDetachRef(current, current.return));
      flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, finishedWork !== null && (flags = finishedWork.callbacks, flags !== null && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = current === null ? flags : current.concat(flags))));
      break;
    case 26:
      var hoistableRoot = currentHoistableRoot;
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 && (offscreenSubtreeWasHidden || current === null || safelyDetachRef(current, current.return));
      if (flags & 4) {
        var currentResource = current !== null ? current.memoizedState : null;
        flags = finishedWork.memoizedState;
        if (current === null)
          if (flags === null)
            if (finishedWork.stateNode === null) {
              a: {
                flags = finishedWork.type;
                current = finishedWork.memoizedProps;
                hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
                b:
                  switch (flags) {
                    case "title":
                      currentResource = hoistableRoot.getElementsByTagName("title")[0];
                      if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || currentResource.namespaceURI === "http://www.w3.org/2000/svg" || currentResource.hasAttribute("itemprop"))
                        currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(currentResource, hoistableRoot.querySelector("head > title"));
                      setInitialProperties(currentResource, flags, current);
                      currentResource[internalInstanceKey] = finishedWork;
                      markNodeAsHoistable(currentResource);
                      flags = currentResource;
                      break a;
                    case "link":
                      var maybeNodes = getHydratableHoistableCache("link", "href", hoistableRoot).get(flags + (current.href || ""));
                      if (maybeNodes) {
                        for (var i = 0;i < maybeNodes.length; i++)
                          if (currentResource = maybeNodes[i], currentResource.getAttribute("href") === (current.href == null || current.href === "" ? null : current.href) && currentResource.getAttribute("rel") === (current.rel == null ? null : current.rel) && currentResource.getAttribute("title") === (current.title == null ? null : current.title) && currentResource.getAttribute("crossorigin") === (current.crossOrigin == null ? null : current.crossOrigin)) {
                            maybeNodes.splice(i, 1);
                            break b;
                          }
                      }
                      currentResource = hoistableRoot.createElement(flags);
                      setInitialProperties(currentResource, flags, current);
                      hoistableRoot.head.appendChild(currentResource);
                      break;
                    case "meta":
                      if (maybeNodes = getHydratableHoistableCache("meta", "content", hoistableRoot).get(flags + (current.content || ""))) {
                        for (i = 0;i < maybeNodes.length; i++)
                          if (currentResource = maybeNodes[i], currentResource.getAttribute("content") === (current.content == null ? null : "" + current.content) && currentResource.getAttribute("name") === (current.name == null ? null : current.name) && currentResource.getAttribute("property") === (current.property == null ? null : current.property) && currentResource.getAttribute("http-equiv") === (current.httpEquiv == null ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (current.charSet == null ? null : current.charSet)) {
                            maybeNodes.splice(i, 1);
                            break b;
                          }
                      }
                      currentResource = hoistableRoot.createElement(flags);
                      setInitialProperties(currentResource, flags, current);
                      hoistableRoot.head.appendChild(currentResource);
                      break;
                    default:
                      throw Error(formatProdErrorMessage2(468, flags));
                  }
                currentResource[internalInstanceKey] = finishedWork;
                markNodeAsHoistable(currentResource);
                flags = currentResource;
              }
              finishedWork.stateNode = flags;
            } else
              mountHoistable(hoistableRoot, finishedWork.type, finishedWork.stateNode);
          else
            finishedWork.stateNode = acquireResource(hoistableRoot, flags, finishedWork.memoizedProps);
        else
          currentResource !== flags ? (currentResource === null ? current.stateNode !== null && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, flags === null ? mountHoistable(hoistableRoot, finishedWork.type, finishedWork.stateNode) : acquireResource(hoistableRoot, flags, finishedWork.memoizedProps)) : flags === null && finishedWork.stateNode !== null && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
      }
      break;
    case 27:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 && (offscreenSubtreeWasHidden || current === null || safelyDetachRef(current, current.return));
      current !== null && flags & 4 && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
      break;
    case 5:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 && (offscreenSubtreeWasHidden || current === null || safelyDetachRef(current, current.return));
      if (finishedWork.flags & 32) {
        hoistableRoot = finishedWork.stateNode;
        try {
          setTextContent(hoistableRoot, "");
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      flags & 4 && finishedWork.stateNode != null && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(finishedWork, hoistableRoot, current !== null ? current.memoizedProps : hoistableRoot));
      flags & 1024 && (needsFormReset = true);
      break;
    case 6:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      if (flags & 4) {
        if (finishedWork.stateNode === null)
          throw Error(formatProdErrorMessage2(162));
        flags = finishedWork.memoizedProps;
        current = finishedWork.stateNode;
        try {
          current.nodeValue = flags;
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      break;
    case 3:
      tagCaches = null;
      hoistableRoot = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(root.containerInfo);
      recursivelyTraverseMutationEffects(root, finishedWork);
      currentHoistableRoot = hoistableRoot;
      commitReconciliationEffects(finishedWork);
      if (flags & 4 && current !== null && current.memoizedState.isDehydrated)
        try {
          retryIfBlockedOn(root.containerInfo);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
      break;
    case 4:
      flags = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(finishedWork.stateNode.containerInfo);
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      currentHoistableRoot = flags;
      break;
    case 12:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      break;
    case 31:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 4 && (flags = finishedWork.updateQueue, flags !== null && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
      break;
    case 13:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      finishedWork.child.flags & 8192 && finishedWork.memoizedState !== null !== (current !== null && current.memoizedState !== null) && (globalMostRecentFallbackTime = now());
      flags & 4 && (flags = finishedWork.updateQueue, flags !== null && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
      break;
    case 22:
      hoistableRoot = finishedWork.memoizedState !== null;
      var wasHidden = current !== null && current.memoizedState !== null, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
      offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
      offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
      recursivelyTraverseMutationEffects(root, finishedWork);
      offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
      offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
      commitReconciliationEffects(finishedWork);
      if (flags & 8192)
        a:
          for (root = finishedWork.stateNode, root._visibility = hoistableRoot ? root._visibility & -2 : root._visibility | 1, hoistableRoot && (current === null || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), current = null, root = finishedWork;; ) {
            if (root.tag === 5 || root.tag === 26) {
              if (current === null) {
                wasHidden = current = root;
                try {
                  if (currentResource = wasHidden.stateNode, hoistableRoot)
                    maybeNodes = currentResource.style, typeof maybeNodes.setProperty === "function" ? maybeNodes.setProperty("display", "none", "important") : maybeNodes.display = "none";
                  else {
                    i = wasHidden.stateNode;
                    var styleProp = wasHidden.memoizedProps.style, display = styleProp !== undefined && styleProp !== null && styleProp.hasOwnProperty("display") ? styleProp.display : null;
                    i.style.display = display == null || typeof display === "boolean" ? "" : ("" + display).trim();
                  }
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if (root.tag === 6) {
              if (current === null) {
                wasHidden = root;
                try {
                  wasHidden.stateNode.nodeValue = hoistableRoot ? "" : wasHidden.memoizedProps;
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if (root.tag === 18) {
              if (current === null) {
                wasHidden = root;
                try {
                  var instance = wasHidden.stateNode;
                  hoistableRoot ? hideOrUnhideDehydratedBoundary(instance, true) : hideOrUnhideDehydratedBoundary(wasHidden.stateNode, false);
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if ((root.tag !== 22 && root.tag !== 23 || root.memoizedState === null || root === finishedWork) && root.child !== null) {
              root.child.return = root;
              root = root.child;
              continue;
            }
            if (root === finishedWork)
              break a;
            for (;root.sibling === null; ) {
              if (root.return === null || root.return === finishedWork)
                break a;
              current === root && (current = null);
              root = root.return;
            }
            current === root && (current = null);
            root.sibling.return = root.return;
            root = root.sibling;
          }
      flags & 4 && (flags = finishedWork.updateQueue, flags !== null && (current = flags.retryQueue, current !== null && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
      break;
    case 19:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 4 && (flags = finishedWork.updateQueue, flags !== null && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
      break;
    case 30:
      break;
    case 21:
      break;
    default:
      recursivelyTraverseMutationEffects(root, finishedWork), commitReconciliationEffects(finishedWork);
  }
}
function commitReconciliationEffects(finishedWork) {
  var flags = finishedWork.flags;
  if (flags & 2) {
    try {
      for (var hostParentFiber, parentFiber = finishedWork.return;parentFiber !== null; ) {
        if (isHostParent(parentFiber)) {
          hostParentFiber = parentFiber;
          break;
        }
        parentFiber = parentFiber.return;
      }
      if (hostParentFiber == null)
        throw Error(formatProdErrorMessage2(160));
      switch (hostParentFiber.tag) {
        case 27:
          var parent = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
          insertOrAppendPlacementNode(finishedWork, before, parent);
          break;
        case 5:
          var parent$141 = hostParentFiber.stateNode;
          hostParentFiber.flags & 32 && (setTextContent(parent$141, ""), hostParentFiber.flags &= -33);
          var before$142 = getHostSibling(finishedWork);
          insertOrAppendPlacementNode(finishedWork, before$142, parent$141);
          break;
        case 3:
        case 4:
          var parent$143 = hostParentFiber.stateNode.containerInfo, before$144 = getHostSibling(finishedWork);
          insertOrAppendPlacementNodeIntoContainer(finishedWork, before$144, parent$143);
          break;
        default:
          throw Error(formatProdErrorMessage2(161));
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
    finishedWork.flags &= -3;
  }
  flags & 4096 && (finishedWork.flags &= -4097);
}
function recursivelyResetForms(parentFiber) {
  if (parentFiber.subtreeFlags & 1024)
    for (parentFiber = parentFiber.child;parentFiber !== null; ) {
      var fiber = parentFiber;
      recursivelyResetForms(fiber);
      fiber.tag === 5 && fiber.flags & 1024 && fiber.stateNode.reset();
      parentFiber = parentFiber.sibling;
    }
}
function recursivelyTraverseLayoutEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & 8772)
    for (parentFiber = parentFiber.child;parentFiber !== null; )
      commitLayoutEffectOnFiber(root, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
}
function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
  for (parentFiber = parentFiber.child;parentFiber !== null; ) {
    var finishedWork = parentFiber;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 1:
        safelyDetachRef(finishedWork, finishedWork.return);
        var instance = finishedWork.stateNode;
        typeof instance.componentWillUnmount === "function" && safelyCallComponentWillUnmount(finishedWork, finishedWork.return, instance);
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 27:
        releaseSingletonInstance(finishedWork.stateNode);
      case 26:
      case 5:
        safelyDetachRef(finishedWork, finishedWork.return);
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 22:
        finishedWork.memoizedState === null && recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 30:
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      default:
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
    }
    parentFiber = parentFiber.sibling;
  }
}
function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
  includeWorkInProgressEffects = includeWorkInProgressEffects && (parentFiber.subtreeFlags & 8772) !== 0;
  for (parentFiber = parentFiber.child;parentFiber !== null; ) {
    var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
        commitHookEffectListMount(4, finishedWork);
        break;
      case 1:
        recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
        current = finishedWork;
        finishedRoot = current.stateNode;
        if (typeof finishedRoot.componentDidMount === "function")
          try {
            finishedRoot.componentDidMount();
          } catch (error) {
            captureCommitPhaseError(current, current.return, error);
          }
        current = finishedWork;
        finishedRoot = current.updateQueue;
        if (finishedRoot !== null) {
          var instance = current.stateNode;
          try {
            var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
            if (hiddenCallbacks !== null)
              for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0;finishedRoot < hiddenCallbacks.length; finishedRoot++)
                callCallback(hiddenCallbacks[finishedRoot], instance);
          } catch (error) {
            captureCommitPhaseError(current, current.return, error);
          }
        }
        includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 27:
        commitHostSingletonAcquisition(finishedWork);
      case 26:
      case 5:
        recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
        includeWorkInProgressEffects && current === null && flags & 4 && commitHostMount(finishedWork);
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 12:
        recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
        break;
      case 31:
        recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
        includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
        break;
      case 13:
        recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
        includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
        break;
      case 22:
        finishedWork.memoizedState === null && recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 30:
        break;
      default:
        recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
    }
    parentFiber = parentFiber.sibling;
  }
}
function commitOffscreenPassiveMountEffects(current, finishedWork) {
  var previousCache = null;
  current !== null && current.memoizedState !== null && current.memoizedState.cachePool !== null && (previousCache = current.memoizedState.cachePool.pool);
  current = null;
  finishedWork.memoizedState !== null && finishedWork.memoizedState.cachePool !== null && (current = finishedWork.memoizedState.cachePool.pool);
  current !== previousCache && (current != null && current.refCount++, previousCache != null && releaseCache(previousCache));
}
function commitCachePassiveMountEffect(current, finishedWork) {
  current = null;
  finishedWork.alternate !== null && (current = finishedWork.alternate.memoizedState.cache);
  finishedWork = finishedWork.memoizedState.cache;
  finishedWork !== current && (finishedWork.refCount++, current != null && releaseCache(current));
}
function recursivelyTraversePassiveMountEffects(root, parentFiber, committedLanes, committedTransitions) {
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child;parentFiber !== null; )
      commitPassiveMountOnFiber(root, parentFiber, committedLanes, committedTransitions), parentFiber = parentFiber.sibling;
}
function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
  var flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
      flags & 2048 && commitHookEffectListMount(9, finishedWork);
      break;
    case 1:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
      break;
    case 3:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
      flags & 2048 && (finishedRoot = null, finishedWork.alternate !== null && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, finishedRoot != null && releaseCache(finishedRoot)));
      break;
    case 12:
      if (flags & 2048) {
        recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
        finishedRoot = finishedWork.stateNode;
        try {
          var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
          typeof onPostCommit === "function" && onPostCommit(id, finishedWork.alternate === null ? "mount" : "update", finishedRoot.passiveEffectDuration, -0);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      } else
        recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
      break;
    case 31:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
      break;
    case 13:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
      break;
    case 23:
      break;
    case 22:
      _finishedWork$memoize2 = finishedWork.stateNode;
      id = finishedWork.alternate;
      finishedWork.memoizedState !== null ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, (finishedWork.subtreeFlags & 10256) !== 0 || false));
      flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
      break;
    case 24:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
      flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
      break;
    default:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
  }
}
function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
  includeWorkInProgressEffects = includeWorkInProgressEffects && ((parentFiber.subtreeFlags & 10256) !== 0 || false);
  for (parentFiber = parentFiber.child;parentFiber !== null; ) {
    var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
        commitHookEffectListMount(8, finishedWork);
        break;
      case 23:
        break;
      case 22:
        var instance = finishedWork.stateNode;
        finishedWork.memoizedState !== null ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects));
        includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
        break;
      case 24:
        recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
        includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
        break;
      default:
        recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
    }
    parentFiber = parentFiber.sibling;
  }
}
function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child;parentFiber !== null; ) {
      var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 22:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
          flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
          break;
        case 24:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
          flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
          break;
        default:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
      }
      parentFiber = parentFiber.sibling;
    }
}
function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
  if (parentFiber.subtreeFlags & suspenseyCommitFlag)
    for (parentFiber = parentFiber.child;parentFiber !== null; )
      accumulateSuspenseyCommitOnFiber(parentFiber, committedLanes, suspendedState), parentFiber = parentFiber.sibling;
}
function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
  switch (fiber.tag) {
    case 26:
      recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
      fiber.flags & suspenseyCommitFlag && fiber.memoizedState !== null && suspendResource(suspendedState, currentHoistableRoot, fiber.memoizedState, fiber.memoizedProps);
      break;
    case 5:
      recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
      break;
    case 3:
    case 4:
      var previousHoistableRoot = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
      recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
      currentHoistableRoot = previousHoistableRoot;
      break;
    case 22:
      fiber.memoizedState === null && (previousHoistableRoot = fiber.alternate, previousHoistableRoot !== null && previousHoistableRoot.memoizedState !== null ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState));
      break;
    default:
      recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
  }
}
function detachAlternateSiblings(parentFiber) {
  var previousFiber = parentFiber.alternate;
  if (previousFiber !== null && (parentFiber = previousFiber.child, parentFiber !== null)) {
    previousFiber.child = null;
    do
      previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
    while (parentFiber !== null);
  }
}
function recursivelyTraversePassiveUnmountEffects(parentFiber) {
  var deletions = parentFiber.deletions;
  if ((parentFiber.flags & 16) !== 0) {
    if (deletions !== null)
      for (var i = 0;i < deletions.length; i++) {
        var childToDelete = deletions[i];
        nextEffect = childToDelete;
        commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
      }
    detachAlternateSiblings(parentFiber);
  }
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child;parentFiber !== null; )
      commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
}
function commitPassiveUnmountOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
      break;
    case 3:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    case 12:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    case 22:
      var instance = finishedWork.stateNode;
      finishedWork.memoizedState !== null && instance._visibility & 2 && (finishedWork.return === null || finishedWork.return.tag !== 13) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    default:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
  }
}
function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
  var deletions = parentFiber.deletions;
  if ((parentFiber.flags & 16) !== 0) {
    if (deletions !== null)
      for (var i = 0;i < deletions.length; i++) {
        var childToDelete = deletions[i];
        nextEffect = childToDelete;
        commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
      }
    detachAlternateSiblings(parentFiber);
  }
  for (parentFiber = parentFiber.child;parentFiber !== null; ) {
    deletions = parentFiber;
    switch (deletions.tag) {
      case 0:
      case 11:
      case 15:
        commitHookEffectListUnmount(8, deletions, deletions.return);
        recursivelyTraverseDisconnectPassiveEffects(deletions);
        break;
      case 22:
        i = deletions.stateNode;
        i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
        break;
      default:
        recursivelyTraverseDisconnectPassiveEffects(deletions);
    }
    parentFiber = parentFiber.sibling;
  }
}
function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
  for (;nextEffect !== null; ) {
    var fiber = nextEffect;
    switch (fiber.tag) {
      case 0:
      case 11:
      case 15:
        commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
        break;
      case 23:
      case 22:
        if (fiber.memoizedState !== null && fiber.memoizedState.cachePool !== null) {
          var cache = fiber.memoizedState.cachePool.pool;
          cache != null && cache.refCount++;
        }
        break;
      case 24:
        releaseCache(fiber.memoizedState.cache);
    }
    cache = fiber.child;
    if (cache !== null)
      cache.return = fiber, nextEffect = cache;
    else
      a:
        for (fiber = deletedSubtreeRoot;nextEffect !== null; ) {
          cache = nextEffect;
          var sibling = cache.sibling, returnFiber = cache.return;
          detachFiberAfterEffects(cache);
          if (cache === fiber) {
            nextEffect = null;
            break a;
          }
          if (sibling !== null) {
            sibling.return = returnFiber;
            nextEffect = sibling;
            break a;
          }
          nextEffect = returnFiber;
        }
  }
}
function requestUpdateLane() {
  return (executionContext & 2) !== 0 && workInProgressRootRenderLanes !== 0 ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : ReactSharedInternals3.T !== null ? requestTransitionLane() : resolveUpdatePriority();
}
function requestDeferredLane() {
  if (workInProgressDeferredLane === 0)
    if ((workInProgressRootRenderLanes & 536870912) === 0 || isHydrating) {
      var lane = nextTransitionDeferredLane;
      nextTransitionDeferredLane <<= 1;
      (nextTransitionDeferredLane & 3932160) === 0 && (nextTransitionDeferredLane = 262144);
      workInProgressDeferredLane = lane;
    } else
      workInProgressDeferredLane = 536870912;
  lane = suspenseHandlerStackCursor.current;
  lane !== null && (lane.flags |= 32);
  return workInProgressDeferredLane;
}
function scheduleUpdateOnFiber(root, fiber, lane) {
  if (root === workInProgressRoot && (workInProgressSuspendedReason === 2 || workInProgressSuspendedReason === 9) || root.cancelPendingCommit !== null)
    prepareFreshStack(root, 0), markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, false);
  markRootUpdated$1(root, lane);
  if ((executionContext & 2) === 0 || root !== workInProgressRoot)
    root === workInProgressRoot && ((executionContext & 2) === 0 && (workInProgressRootInterleavedUpdatedLanes |= lane), workInProgressRootExitStatus === 4 && markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, false)), ensureRootIsScheduled(root);
}
function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
  if ((executionContext & 6) !== 0)
    throw Error(formatProdErrorMessage2(327));
  var shouldTimeSlice = !forceSync && (lanes & 127) === 0 && (lanes & root$jscomp$0.expiredLanes) === 0 || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
  do {
    if (exitStatus === 0) {
      workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
      break;
    } else {
      forceSync = root$jscomp$0.current.alternate;
      if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
        exitStatus = renderRootSync(root$jscomp$0, lanes, false);
        renderWasConcurrent = false;
        continue;
      }
      if (exitStatus === 2) {
        renderWasConcurrent = lanes;
        if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
          var JSCompiler_inline_result = 0;
        else
          JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = JSCompiler_inline_result !== 0 ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
        if (JSCompiler_inline_result !== 0) {
          lanes = JSCompiler_inline_result;
          a: {
            var root = root$jscomp$0;
            exitStatus = workInProgressRootConcurrentErrors;
            var wasRootDehydrated = root.current.memoizedState.isDehydrated;
            wasRootDehydrated && (prepareFreshStack(root, JSCompiler_inline_result).flags |= 256);
            JSCompiler_inline_result = renderRootSync(root, JSCompiler_inline_result, false);
            if (JSCompiler_inline_result !== 2) {
              if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                root.errorRecoveryDisabledLanes |= renderWasConcurrent;
                workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                exitStatus = 4;
                break a;
              }
              renderWasConcurrent = workInProgressRootRecoverableErrors;
              workInProgressRootRecoverableErrors = exitStatus;
              renderWasConcurrent !== null && (workInProgressRootRecoverableErrors === null ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, renderWasConcurrent));
            }
            exitStatus = JSCompiler_inline_result;
          }
          renderWasConcurrent = false;
          if (exitStatus !== 2)
            continue;
        }
      }
      if (exitStatus === 1) {
        prepareFreshStack(root$jscomp$0, 0);
        markRootSuspended(root$jscomp$0, lanes, 0, true);
        break;
      }
      a: {
        shouldTimeSlice = root$jscomp$0;
        renderWasConcurrent = exitStatus;
        switch (renderWasConcurrent) {
          case 0:
          case 1:
            throw Error(formatProdErrorMessage2(345));
          case 4:
            if ((lanes & 4194048) !== lanes)
              break;
          case 6:
            markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
            break a;
          case 2:
            workInProgressRootRecoverableErrors = null;
            break;
          case 3:
          case 5:
            break;
          default:
            throw Error(formatProdErrorMessage2(329));
        }
        if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
          markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
          if (getNextLanes(shouldTimeSlice, 0, true) !== 0)
            break a;
          pendingEffectsLanes = lanes;
          shouldTimeSlice.timeoutHandle = scheduleTimeout(commitRootWhenReady.bind(null, shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, "Throttled", -0, 0), exitStatus);
          break a;
        }
        commitRootWhenReady(shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, null, -0, 0);
      }
    }
    break;
  } while (1);
  ensureRootIsScheduled(root$jscomp$0);
}
function commitRootWhenReady(root, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
  root.timeoutHandle = -1;
  suspendedCommitReason = finishedWork.subtreeFlags;
  if (suspendedCommitReason & 8192 || (suspendedCommitReason & 16785408) === 16785408) {
    suspendedCommitReason = {
      stylesheets: null,
      count: 0,
      imgCount: 0,
      imgBytes: 0,
      suspenseyImages: [],
      waitingForImages: true,
      waitingForViewTransition: false,
      unsuspend: noop$1
    };
    accumulateSuspenseyCommitOnFiber(finishedWork, lanes, suspendedCommitReason);
    var timeoutOffset = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0;
    timeoutOffset = waitForCommitToBeReady(suspendedCommitReason, timeoutOffset);
    if (timeoutOffset !== null) {
      pendingEffectsLanes = lanes;
      root.cancelPendingCommit = timeoutOffset(commitRoot.bind(null, root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, exitStatus, suspendedCommitReason, null, completedRenderStartTime, completedRenderEndTime));
      markRootSuspended(root, lanes, spawnedLane, !didSkipSuspendedSiblings);
      return;
    }
  }
  commitRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes);
}
function isRenderConsistentWithExternalStores(finishedWork) {
  for (var node = finishedWork;; ) {
    var tag = node.tag;
    if ((tag === 0 || tag === 11 || tag === 15) && node.flags & 16384 && (tag = node.updateQueue, tag !== null && (tag = tag.stores, tag !== null)))
      for (var i = 0;i < tag.length; i++) {
        var check = tag[i], getSnapshot = check.getSnapshot;
        check = check.value;
        try {
          if (!objectIs(getSnapshot(), check))
            return false;
        } catch (error) {
          return false;
        }
      }
    tag = node.child;
    if (node.subtreeFlags & 16384 && tag !== null)
      tag.return = node, node = tag;
    else {
      if (node === finishedWork)
        break;
      for (;node.sibling === null; ) {
        if (node.return === null || node.return === finishedWork)
          return true;
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
  }
  return true;
}
function markRootSuspended(root, suspendedLanes, spawnedLane, didAttemptEntireTree) {
  suspendedLanes &= ~workInProgressRootPingedLanes;
  suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
  root.suspendedLanes |= suspendedLanes;
  root.pingedLanes &= ~suspendedLanes;
  didAttemptEntireTree && (root.warmLanes |= suspendedLanes);
  didAttemptEntireTree = root.expirationTimes;
  for (var lanes = suspendedLanes;0 < lanes; ) {
    var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
    didAttemptEntireTree[index$6] = -1;
    lanes &= ~lane;
  }
  spawnedLane !== 0 && markSpawnedDeferredLane(root, spawnedLane, suspendedLanes);
}
function flushSyncWork$1() {
  return (executionContext & 6) === 0 ? (flushSyncWorkAcrossRoots_impl(0, false), false) : true;
}
function resetWorkInProgressStack() {
  if (workInProgress !== null) {
    if (workInProgressSuspendedReason === 0)
      var interruptedWork = workInProgress.return;
    else
      interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
    for (;interruptedWork !== null; )
      unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
    workInProgress = null;
  }
}
function prepareFreshStack(root, lanes) {
  var timeoutHandle = root.timeoutHandle;
  timeoutHandle !== -1 && (root.timeoutHandle = -1, cancelTimeout(timeoutHandle));
  timeoutHandle = root.cancelPendingCommit;
  timeoutHandle !== null && (root.cancelPendingCommit = null, timeoutHandle());
  pendingEffectsLanes = 0;
  resetWorkInProgressStack();
  workInProgressRoot = root;
  workInProgress = timeoutHandle = createWorkInProgress(root.current, null);
  workInProgressRootRenderLanes = lanes;
  workInProgressSuspendedReason = 0;
  workInProgressThrownValue = null;
  workInProgressRootDidSkipSuspendedSiblings = false;
  workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
  workInProgressRootDidAttachPingListener = false;
  workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
  workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
  workInProgressRootDidIncludeRecursiveRenderUpdate = false;
  (lanes & 8) !== 0 && (lanes |= lanes & 32);
  var allEntangledLanes = root.entangledLanes;
  if (allEntangledLanes !== 0)
    for (root = root.entanglements, allEntangledLanes &= lanes;0 < allEntangledLanes; ) {
      var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
      lanes |= root[index$4];
      allEntangledLanes &= ~lane;
    }
  entangledRenderLanes = lanes;
  finishQueueingConcurrentUpdates();
  return timeoutHandle;
}
function handleThrow(root, thrownValue) {
  currentlyRenderingFiber = null;
  ReactSharedInternals3.H = ContextOnlyDispatcher;
  thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : thrownValue !== null && typeof thrownValue === "object" && typeof thrownValue.then === "function" ? 6 : 1;
  workInProgressThrownValue = thrownValue;
  workInProgress === null && (workInProgressRootExitStatus = 1, logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current)));
}
function shouldRemainOnPreviousScreen() {
  var handler = suspenseHandlerStackCursor.current;
  return handler === null ? true : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? shellBoundary === null ? true : false : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || (workInProgressRootRenderLanes & 536870912) !== 0 ? handler === shellBoundary : false;
}
function pushDispatcher() {
  var prevDispatcher = ReactSharedInternals3.H;
  ReactSharedInternals3.H = ContextOnlyDispatcher;
  return prevDispatcher === null ? ContextOnlyDispatcher : prevDispatcher;
}
function pushAsyncDispatcher() {
  var prevAsyncDispatcher = ReactSharedInternals3.A;
  ReactSharedInternals3.A = DefaultAsyncDispatcher;
  return prevAsyncDispatcher;
}
function renderDidSuspendDelayIfPossible() {
  workInProgressRootExitStatus = 4;
  workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && suspenseHandlerStackCursor.current !== null || (workInProgressRootIsPrerendering = true);
  (workInProgressRootSkippedLanes & 134217727) === 0 && (workInProgressRootInterleavedUpdatedLanes & 134217727) === 0 || workInProgressRoot === null || markRootSuspended(workInProgressRoot, workInProgressRootRenderLanes, workInProgressDeferredLane, false);
}
function renderRootSync(root, lanes, shouldYieldForPrerendering) {
  var prevExecutionContext = executionContext;
  executionContext |= 2;
  var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes)
    workInProgressTransitions = null, prepareFreshStack(root, lanes);
  lanes = false;
  var exitStatus = workInProgressRootExitStatus;
  a:
    do
      try {
        if (workInProgressSuspendedReason !== 0 && workInProgress !== null) {
          var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
          switch (workInProgressSuspendedReason) {
            case 8:
              resetWorkInProgressStack();
              exitStatus = 6;
              break a;
            case 3:
            case 2:
            case 9:
            case 6:
              suspenseHandlerStackCursor.current === null && (lanes = true);
              var reason = workInProgressSuspendedReason;
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
              if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
                exitStatus = 0;
                break a;
              }
              break;
            default:
              reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
          }
        }
        workLoopSync();
        exitStatus = workInProgressRootExitStatus;
        break;
      } catch (thrownValue$165) {
        handleThrow(root, thrownValue$165);
      }
    while (1);
  lanes && root.shellSuspendCounter++;
  lastContextDependency = currentlyRenderingFiber$1 = null;
  executionContext = prevExecutionContext;
  ReactSharedInternals3.H = prevDispatcher;
  ReactSharedInternals3.A = prevAsyncDispatcher;
  workInProgress === null && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
  return exitStatus;
}
function workLoopSync() {
  for (;workInProgress !== null; )
    performUnitOfWork(workInProgress);
}
function renderRootConcurrent(root, lanes) {
  var prevExecutionContext = executionContext;
  executionContext |= 2;
  var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
  workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
  a:
    do
      try {
        if (workInProgressSuspendedReason !== 0 && workInProgress !== null) {
          lanes = workInProgress;
          var thrownValue = workInProgressThrownValue;
          b:
            switch (workInProgressSuspendedReason) {
              case 1:
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                throwAndUnwindWorkLoop(root, lanes, thrownValue, 1);
                break;
              case 2:
              case 9:
                if (isThenableResolved(thrownValue)) {
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  replaySuspendedUnitOfWork(lanes);
                  break;
                }
                lanes = function() {
                  workInProgressSuspendedReason !== 2 && workInProgressSuspendedReason !== 9 || workInProgressRoot !== root || (workInProgressSuspendedReason = 7);
                  ensureRootIsScheduled(root);
                };
                thrownValue.then(lanes, lanes);
                break a;
              case 3:
                workInProgressSuspendedReason = 7;
                break a;
              case 4:
                workInProgressSuspendedReason = 5;
                break a;
              case 7:
                isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, lanes, thrownValue, 7));
                break;
              case 5:
                var resource = null;
                switch (workInProgress.tag) {
                  case 26:
                    resource = workInProgress.memoizedState;
                  case 5:
                  case 27:
                    var hostFiber = workInProgress;
                    if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
                      workInProgressSuspendedReason = 0;
                      workInProgressThrownValue = null;
                      var sibling = hostFiber.sibling;
                      if (sibling !== null)
                        workInProgress = sibling;
                      else {
                        var returnFiber = hostFiber.return;
                        returnFiber !== null ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                      }
                      break b;
                    }
                }
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                throwAndUnwindWorkLoop(root, lanes, thrownValue, 5);
                break;
              case 6:
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                throwAndUnwindWorkLoop(root, lanes, thrownValue, 6);
                break;
              case 8:
                resetWorkInProgressStack();
                workInProgressRootExitStatus = 6;
                break a;
              default:
                throw Error(formatProdErrorMessage2(462));
            }
        }
        workLoopConcurrentByScheduler();
        break;
      } catch (thrownValue$167) {
        handleThrow(root, thrownValue$167);
      }
    while (1);
  lastContextDependency = currentlyRenderingFiber$1 = null;
  ReactSharedInternals3.H = prevDispatcher;
  ReactSharedInternals3.A = prevAsyncDispatcher;
  executionContext = prevExecutionContext;
  if (workInProgress !== null)
    return 0;
  workInProgressRoot = null;
  workInProgressRootRenderLanes = 0;
  finishQueueingConcurrentUpdates();
  return workInProgressRootExitStatus;
}
function workLoopConcurrentByScheduler() {
  for (;workInProgress !== null && !shouldYield(); )
    performUnitOfWork(workInProgress);
}
function performUnitOfWork(unitOfWork) {
  var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  next === null ? completeUnitOfWork(unitOfWork) : workInProgress = next;
}
function replaySuspendedUnitOfWork(unitOfWork) {
  var next = unitOfWork;
  var current = next.alternate;
  switch (next.tag) {
    case 15:
    case 0:
      next = replayFunctionComponent(current, next, next.pendingProps, next.type, undefined, workInProgressRootRenderLanes);
      break;
    case 11:
      next = replayFunctionComponent(current, next, next.pendingProps, next.type.render, next.ref, workInProgressRootRenderLanes);
      break;
    case 5:
      resetHooksOnUnwind(next);
    default:
      unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
  }
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  next === null ? completeUnitOfWork(unitOfWork) : workInProgress = next;
}
function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, suspendedReason) {
  lastContextDependency = currentlyRenderingFiber$1 = null;
  resetHooksOnUnwind(unitOfWork);
  thenableState$1 = null;
  thenableIndexCounter$1 = 0;
  var returnFiber = unitOfWork.return;
  try {
    if (throwException(root, returnFiber, unitOfWork, thrownValue, workInProgressRootRenderLanes)) {
      workInProgressRootExitStatus = 1;
      logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
      workInProgress = null;
      return;
    }
  } catch (error) {
    if (returnFiber !== null)
      throw workInProgress = returnFiber, error;
    workInProgressRootExitStatus = 1;
    logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
    workInProgress = null;
    return;
  }
  if (unitOfWork.flags & 32768) {
    if (isHydrating || suspendedReason === 1)
      root = true;
    else if (workInProgressRootIsPrerendering || (workInProgressRootRenderLanes & 536870912) !== 0)
      root = false;
    else if (workInProgressRootDidSkipSuspendedSiblings = root = true, suspendedReason === 2 || suspendedReason === 9 || suspendedReason === 3 || suspendedReason === 6)
      suspendedReason = suspenseHandlerStackCursor.current, suspendedReason !== null && suspendedReason.tag === 13 && (suspendedReason.flags |= 16384);
    unwindUnitOfWork(unitOfWork, root);
  } else
    completeUnitOfWork(unitOfWork);
}
function completeUnitOfWork(unitOfWork) {
  var completedWork = unitOfWork;
  do {
    if ((completedWork.flags & 32768) !== 0) {
      unwindUnitOfWork(completedWork, workInProgressRootDidSkipSuspendedSiblings);
      return;
    }
    unitOfWork = completedWork.return;
    var next = completeWork(completedWork.alternate, completedWork, entangledRenderLanes);
    if (next !== null) {
      workInProgress = next;
      return;
    }
    completedWork = completedWork.sibling;
    if (completedWork !== null) {
      workInProgress = completedWork;
      return;
    }
    workInProgress = completedWork = unitOfWork;
  } while (completedWork !== null);
  workInProgressRootExitStatus === 0 && (workInProgressRootExitStatus = 5);
}
function unwindUnitOfWork(unitOfWork, skipSiblings) {
  do {
    var next = unwindWork(unitOfWork.alternate, unitOfWork);
    if (next !== null) {
      next.flags &= 32767;
      workInProgress = next;
      return;
    }
    next = unitOfWork.return;
    next !== null && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
    if (!skipSiblings && (unitOfWork = unitOfWork.sibling, unitOfWork !== null)) {
      workInProgress = unitOfWork;
      return;
    }
    workInProgress = unitOfWork = next;
  } while (unitOfWork !== null);
  workInProgressRootExitStatus = 6;
  workInProgress = null;
}
function commitRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
  root.cancelPendingCommit = null;
  do
    flushPendingEffects();
  while (pendingEffectsStatus !== 0);
  if ((executionContext & 6) !== 0)
    throw Error(formatProdErrorMessage2(327));
  if (finishedWork !== null) {
    if (finishedWork === root.current)
      throw Error(formatProdErrorMessage2(177));
    didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
    didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
    markRootFinished(root, lanes, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes);
    root === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
    pendingFinishedWork = finishedWork;
    pendingEffectsRoot = root;
    pendingEffectsLanes = lanes;
    pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
    pendingPassiveTransitions = transitions;
    pendingRecoverableErrors = recoverableErrors;
    (finishedWork.subtreeFlags & 10256) !== 0 || (finishedWork.flags & 10256) !== 0 ? (root.callbackNode = null, root.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
      flushPassiveEffects();
      return null;
    })) : (root.callbackNode = null, root.callbackPriority = 0);
    recoverableErrors = (finishedWork.flags & 13878) !== 0;
    if ((finishedWork.subtreeFlags & 13878) !== 0 || recoverableErrors) {
      recoverableErrors = ReactSharedInternals3.T;
      ReactSharedInternals3.T = null;
      transitions = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      spawnedLane = executionContext;
      executionContext |= 4;
      try {
        commitBeforeMutationEffects(root, finishedWork, lanes);
      } finally {
        executionContext = spawnedLane, ReactDOMSharedInternals.p = transitions, ReactSharedInternals3.T = recoverableErrors;
      }
    }
    pendingEffectsStatus = 1;
    flushMutationEffects();
    flushLayoutEffects();
    flushSpawnedWork();
  }
}
function flushMutationEffects() {
  if (pendingEffectsStatus === 1) {
    pendingEffectsStatus = 0;
    var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = (finishedWork.flags & 13878) !== 0;
    if ((finishedWork.subtreeFlags & 13878) !== 0 || rootMutationHasEffect) {
      rootMutationHasEffect = ReactSharedInternals3.T;
      ReactSharedInternals3.T = null;
      var previousPriority = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      try {
        commitMutationEffectsOnFiber(finishedWork, root);
        var priorSelectionInformation = selectionInformation, curFocusedElem = getActiveElementDeep(root.containerInfo), { focusedElem: priorFocusedElem, selectionRange: priorSelectionRange } = priorSelectionInformation;
        if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(priorFocusedElem.ownerDocument.documentElement, priorFocusedElem)) {
          if (priorSelectionRange !== null && hasSelectionCapabilities(priorFocusedElem)) {
            var { start, end } = priorSelectionRange;
            end === undefined && (end = start);
            if ("selectionStart" in priorFocusedElem)
              priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(end, priorFocusedElem.value.length);
            else {
              var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
              if (win.getSelection) {
                var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = priorSelectionRange.end === undefined ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
                !selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
                var startMarker = getNodeForCharacterOffset(priorFocusedElem, start$jscomp$0), endMarker = getNodeForCharacterOffset(priorFocusedElem, end$jscomp$0);
                if (startMarker && endMarker && (selection.rangeCount !== 1 || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
                  var range = doc.createRange();
                  range.setStart(startMarker.node, startMarker.offset);
                  selection.removeAllRanges();
                  start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
                }
              }
            }
          }
          doc = [];
          for (selection = priorFocusedElem;selection = selection.parentNode; )
            selection.nodeType === 1 && doc.push({
              element: selection,
              left: selection.scrollLeft,
              top: selection.scrollTop
            });
          typeof priorFocusedElem.focus === "function" && priorFocusedElem.focus();
          for (priorFocusedElem = 0;priorFocusedElem < doc.length; priorFocusedElem++) {
            var info = doc[priorFocusedElem];
            info.element.scrollLeft = info.left;
            info.element.scrollTop = info.top;
          }
        }
        _enabled = !!eventsEnabled;
        selectionInformation = eventsEnabled = null;
      } finally {
        executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals3.T = rootMutationHasEffect;
      }
    }
    root.current = finishedWork;
    pendingEffectsStatus = 2;
  }
}
function flushLayoutEffects() {
  if (pendingEffectsStatus === 2) {
    pendingEffectsStatus = 0;
    var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = (finishedWork.flags & 8772) !== 0;
    if ((finishedWork.subtreeFlags & 8772) !== 0 || rootHasLayoutEffect) {
      rootHasLayoutEffect = ReactSharedInternals3.T;
      ReactSharedInternals3.T = null;
      var previousPriority = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      try {
        commitLayoutEffectOnFiber(root, finishedWork.alternate, finishedWork);
      } finally {
        executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals3.T = rootHasLayoutEffect;
      }
    }
    pendingEffectsStatus = 3;
  }
}
function flushSpawnedWork() {
  if (pendingEffectsStatus === 4 || pendingEffectsStatus === 3) {
    pendingEffectsStatus = 0;
    requestPaint();
    var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
    (finishedWork.subtreeFlags & 10256) !== 0 || (finishedWork.flags & 10256) !== 0 ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root, root.pendingLanes));
    var remainingLanes = root.pendingLanes;
    remainingLanes === 0 && (legacyErrorBoundariesThatAlreadyFailed = null);
    lanesToEventPriority(lanes);
    finishedWork = finishedWork.stateNode;
    if (injectedHook && typeof injectedHook.onCommitFiberRoot === "function")
      try {
        injectedHook.onCommitFiberRoot(rendererID, finishedWork, undefined, (finishedWork.current.flags & 128) === 128);
      } catch (err) {}
    if (recoverableErrors !== null) {
      finishedWork = ReactSharedInternals3.T;
      remainingLanes = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      ReactSharedInternals3.T = null;
      try {
        for (var onRecoverableError = root.onRecoverableError, i = 0;i < recoverableErrors.length; i++) {
          var recoverableError = recoverableErrors[i];
          onRecoverableError(recoverableError.value, {
            componentStack: recoverableError.stack
          });
        }
      } finally {
        ReactSharedInternals3.T = finishedWork, ReactDOMSharedInternals.p = remainingLanes;
      }
    }
    (pendingEffectsLanes & 3) !== 0 && flushPendingEffects();
    ensureRootIsScheduled(root);
    remainingLanes = root.pendingLanes;
    (lanes & 261930) !== 0 && (remainingLanes & 42) !== 0 ? root === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root) : nestedUpdateCount = 0;
    flushSyncWorkAcrossRoots_impl(0, false);
  }
}
function releaseRootPooledCache(root, remainingLanes) {
  (root.pooledCacheLanes &= remainingLanes) === 0 && (remainingLanes = root.pooledCache, remainingLanes != null && (root.pooledCache = null, releaseCache(remainingLanes)));
}
function flushPendingEffects() {
  flushMutationEffects();
  flushLayoutEffects();
  flushSpawnedWork();
  return flushPassiveEffects();
}
function flushPassiveEffects() {
  if (pendingEffectsStatus !== 5)
    return false;
  var root = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
  pendingEffectsRemainingLanes = 0;
  var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals3.T, previousPriority = ReactDOMSharedInternals.p;
  try {
    ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
    ReactSharedInternals3.T = null;
    renderPriority = pendingPassiveTransitions;
    pendingPassiveTransitions = null;
    var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
    pendingEffectsStatus = 0;
    pendingFinishedWork = pendingEffectsRoot = null;
    pendingEffectsLanes = 0;
    if ((executionContext & 6) !== 0)
      throw Error(formatProdErrorMessage2(331));
    var prevExecutionContext = executionContext;
    executionContext |= 4;
    commitPassiveUnmountOnFiber(root$jscomp$0.current);
    commitPassiveMountOnFiber(root$jscomp$0, root$jscomp$0.current, lanes, renderPriority);
    executionContext = prevExecutionContext;
    flushSyncWorkAcrossRoots_impl(0, false);
    if (injectedHook && typeof injectedHook.onPostCommitFiberRoot === "function")
      try {
        injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
      } catch (err) {}
    return true;
  } finally {
    ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals3.T = prevTransition, releaseRootPooledCache(root, remainingLanes);
  }
}
function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
  sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
  sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
  rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
  rootFiber !== null && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
}
function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
  if (sourceFiber.tag === 3)
    captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
  else
    for (;nearestMountedAncestor !== null; ) {
      if (nearestMountedAncestor.tag === 3) {
        captureCommitPhaseErrorOnRoot(nearestMountedAncestor, sourceFiber, error);
        break;
      } else if (nearestMountedAncestor.tag === 1) {
        var instance = nearestMountedAncestor.stateNode;
        if (typeof nearestMountedAncestor.type.getDerivedStateFromError === "function" || typeof instance.componentDidCatch === "function" && (legacyErrorBoundariesThatAlreadyFailed === null || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
          sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
          error = createClassErrorUpdate(2);
          instance = enqueueUpdate(nearestMountedAncestor, error, 2);
          instance !== null && (initializeClassErrorUpdate(error, instance, nearestMountedAncestor, sourceFiber), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
          break;
        }
      }
      nearestMountedAncestor = nearestMountedAncestor.return;
    }
}
function attachPingListener(root, wakeable, lanes) {
  var pingCache = root.pingCache;
  if (pingCache === null) {
    pingCache = root.pingCache = new PossiblyWeakMap;
    var threadIDs = new Set;
    pingCache.set(wakeable, threadIDs);
  } else
    threadIDs = pingCache.get(wakeable), threadIDs === undefined && (threadIDs = new Set, pingCache.set(wakeable, threadIDs));
  threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root = pingSuspendedRoot.bind(null, root, wakeable, lanes), wakeable.then(root, root));
}
function pingSuspendedRoot(root, wakeable, pingedLanes) {
  var pingCache = root.pingCache;
  pingCache !== null && pingCache.delete(wakeable);
  root.pingedLanes |= root.suspendedLanes & pingedLanes;
  root.warmLanes &= ~pingedLanes;
  workInProgressRoot === root && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (workInProgressRootExitStatus === 4 || workInProgressRootExitStatus === 3 && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? (executionContext & 2) === 0 && prepareFreshStack(root, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
  ensureRootIsScheduled(root);
}
function retryTimedOutBoundary(boundaryFiber, retryLane) {
  retryLane === 0 && (retryLane = claimNextRetryLane());
  boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
  boundaryFiber !== null && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
}
function retryDehydratedSuspenseBoundary(boundaryFiber) {
  var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
  suspenseState !== null && (retryLane = suspenseState.retryLane);
  retryTimedOutBoundary(boundaryFiber, retryLane);
}
function resolveRetryWakeable(boundaryFiber, wakeable) {
  var retryLane = 0;
  switch (boundaryFiber.tag) {
    case 31:
    case 13:
      var retryCache = boundaryFiber.stateNode;
      var suspenseState = boundaryFiber.memoizedState;
      suspenseState !== null && (retryLane = suspenseState.retryLane);
      break;
    case 19:
      retryCache = boundaryFiber.stateNode;
      break;
    case 22:
      retryCache = boundaryFiber.stateNode._retryCache;
      break;
    default:
      throw Error(formatProdErrorMessage2(314));
  }
  retryCache !== null && retryCache.delete(wakeable);
  retryTimedOutBoundary(boundaryFiber, retryLane);
}
function scheduleCallback$1(priorityLevel, callback) {
  return scheduleCallback$3(priorityLevel, callback);
}
function ensureRootIsScheduled(root) {
  root !== lastScheduledRoot && root.next === null && (lastScheduledRoot === null ? firstScheduledRoot = lastScheduledRoot = root : lastScheduledRoot = lastScheduledRoot.next = root);
  mightHavePendingSyncWork = true;
  didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
}
function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
  if (!isFlushingWork && mightHavePendingSyncWork) {
    isFlushingWork = true;
    do {
      var didPerformSomeWork = false;
      for (var root$170 = firstScheduledRoot;root$170 !== null; ) {
        if (!onlyLegacy)
          if (syncTransitionLanes !== 0) {
            var pendingLanes = root$170.pendingLanes;
            if (pendingLanes === 0)
              var JSCompiler_inline_result = 0;
            else {
              var suspendedLanes = root$170.suspendedLanes, pingedLanes = root$170.pingedLanes;
              JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
              JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
              JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
            }
            JSCompiler_inline_result !== 0 && (didPerformSomeWork = true, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
          } else
            JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(root$170, root$170 === workInProgressRoot ? JSCompiler_inline_result : 0, root$170.cancelPendingCommit !== null || root$170.timeoutHandle !== -1), (JSCompiler_inline_result & 3) === 0 || checkIfRootIsPrerendering(root$170, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
        root$170 = root$170.next;
      }
    } while (didPerformSomeWork);
    isFlushingWork = false;
  }
}
function processRootScheduleInImmediateTask() {
  processRootScheduleInMicrotask();
}
function processRootScheduleInMicrotask() {
  mightHavePendingSyncWork = didScheduleMicrotask = false;
  var syncTransitionLanes = 0;
  currentEventTransitionLane !== 0 && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
  for (var currentTime = now(), prev = null, root = firstScheduledRoot;root !== null; ) {
    var next = root.next, nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
    if (nextLanes === 0)
      root.next = null, prev === null ? firstScheduledRoot = next : prev.next = next, next === null && (lastScheduledRoot = prev);
    else if (prev = root, syncTransitionLanes !== 0 || (nextLanes & 3) !== 0)
      mightHavePendingSyncWork = true;
    root = next;
  }
  pendingEffectsStatus !== 0 && pendingEffectsStatus !== 5 || flushSyncWorkAcrossRoots_impl(syncTransitionLanes, false);
  currentEventTransitionLane !== 0 && (currentEventTransitionLane = 0);
}
function scheduleTaskForRootDuringMicrotask(root, currentTime) {
  for (var { suspendedLanes, pingedLanes, expirationTimes } = root, lanes = root.pendingLanes & -62914561;0 < lanes; ) {
    var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
    if (expirationTime === -1) {
      if ((lane & suspendedLanes) === 0 || (lane & pingedLanes) !== 0)
        expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
    } else
      expirationTime <= currentTime && (root.expiredLanes |= lane);
    lanes &= ~lane;
  }
  currentTime = workInProgressRoot;
  suspendedLanes = workInProgressRootRenderLanes;
  suspendedLanes = getNextLanes(root, root === currentTime ? suspendedLanes : 0, root.cancelPendingCommit !== null || root.timeoutHandle !== -1);
  pingedLanes = root.callbackNode;
  if (suspendedLanes === 0 || root === currentTime && (workInProgressSuspendedReason === 2 || workInProgressSuspendedReason === 9) || root.cancelPendingCommit !== null)
    return pingedLanes !== null && pingedLanes !== null && cancelCallback$1(pingedLanes), root.callbackNode = null, root.callbackPriority = 0;
  if ((suspendedLanes & 3) === 0 || checkIfRootIsPrerendering(root, suspendedLanes)) {
    currentTime = suspendedLanes & -suspendedLanes;
    if (currentTime === root.callbackPriority)
      return currentTime;
    pingedLanes !== null && cancelCallback$1(pingedLanes);
    switch (lanesToEventPriority(suspendedLanes)) {
      case 2:
      case 8:
        suspendedLanes = UserBlockingPriority;
        break;
      case 32:
        suspendedLanes = NormalPriority$1;
        break;
      case 268435456:
        suspendedLanes = IdlePriority;
        break;
      default:
        suspendedLanes = NormalPriority$1;
    }
    pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root);
    suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
    root.callbackPriority = currentTime;
    root.callbackNode = suspendedLanes;
    return currentTime;
  }
  pingedLanes !== null && pingedLanes !== null && cancelCallback$1(pingedLanes);
  root.callbackPriority = 2;
  root.callbackNode = null;
  return 2;
}
function performWorkOnRootViaSchedulerTask(root, didTimeout) {
  if (pendingEffectsStatus !== 0 && pendingEffectsStatus !== 5)
    return root.callbackNode = null, root.callbackPriority = 0, null;
  var originalCallbackNode = root.callbackNode;
  if (flushPendingEffects() && root.callbackNode !== originalCallbackNode)
    return null;
  var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
  workInProgressRootRenderLanes$jscomp$0 = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0, root.cancelPendingCommit !== null || root.timeoutHandle !== -1);
  if (workInProgressRootRenderLanes$jscomp$0 === 0)
    return null;
  performWorkOnRoot(root, workInProgressRootRenderLanes$jscomp$0, didTimeout);
  scheduleTaskForRootDuringMicrotask(root, now());
  return root.callbackNode != null && root.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root) : null;
}
function performSyncWorkOnRoot(root, lanes) {
  if (flushPendingEffects())
    return null;
  performWorkOnRoot(root, lanes, true);
}
function scheduleImmediateRootScheduleTask() {
  scheduleMicrotask(function() {
    (executionContext & 6) !== 0 ? scheduleCallback$3(ImmediatePriority, processRootScheduleInImmediateTask) : processRootScheduleInMicrotask();
  });
}
function requestTransitionLane() {
  if (currentEventTransitionLane === 0) {
    var actionScopeLane = currentEntangledLane;
    actionScopeLane === 0 && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, (nextTransitionUpdateLane & 261888) === 0 && (nextTransitionUpdateLane = 256));
    currentEventTransitionLane = actionScopeLane;
  }
  return currentEventTransitionLane;
}
function coerceFormActionProp(actionProp) {
  return actionProp == null || typeof actionProp === "symbol" || typeof actionProp === "boolean" ? null : typeof actionProp === "function" ? actionProp : sanitizeURL("" + actionProp);
}
function createFormDataWithSubmitter(form, submitter) {
  var temp = submitter.ownerDocument.createElement("input");
  temp.name = submitter.name;
  temp.value = submitter.value;
  form.id && temp.setAttribute("form", form.id);
  submitter.parentNode.insertBefore(temp, submitter);
  form = new FormData(form);
  temp.parentNode.removeChild(temp);
  return form;
}
function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
  if (domEventName === "submit" && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
    var action = coerceFormActionProp((nativeEventTarget[internalPropsKey] || null).action), submitter = nativeEvent.submitter;
    submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), domEventName !== null && (action = domEventName, submitter = null));
    var event = new SyntheticEvent("action", "action", null, nativeEvent, nativeEventTarget);
    dispatchQueue.push({
      event,
      listeners: [
        {
          instance: null,
          listener: function() {
            if (nativeEvent.defaultPrevented) {
              if (currentEventTransitionLane !== 0) {
                var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
                startHostTransition(maybeTargetInst, {
                  pending: true,
                  data: formData,
                  method: nativeEventTarget.method,
                  action
                }, null, formData);
              }
            } else
              typeof action === "function" && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(maybeTargetInst, {
                pending: true,
                data: formData,
                method: nativeEventTarget.method,
                action
              }, action, formData));
          },
          currentTarget: nativeEventTarget
        }
      ]
    });
  }
}
function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  eventSystemFlags = (eventSystemFlags & 4) !== 0;
  for (var i = 0;i < dispatchQueue.length; i++) {
    var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
    _dispatchQueue$i = _dispatchQueue$i.listeners;
    a: {
      var previousInstance = undefined;
      if (eventSystemFlags)
        for (var i$jscomp$0 = _dispatchQueue$i.length - 1;0 <= i$jscomp$0; i$jscomp$0--) {
          var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
          _dispatchListeners$i = _dispatchListeners$i.listener;
          if (instance !== previousInstance && event.isPropagationStopped())
            break a;
          previousInstance = _dispatchListeners$i;
          event.currentTarget = currentTarget;
          try {
            previousInstance(event);
          } catch (error) {
            reportGlobalError2(error);
          }
          event.currentTarget = null;
          previousInstance = instance;
        }
      else
        for (i$jscomp$0 = 0;i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
          _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
          instance = _dispatchListeners$i.instance;
          currentTarget = _dispatchListeners$i.currentTarget;
          _dispatchListeners$i = _dispatchListeners$i.listener;
          if (instance !== previousInstance && event.isPropagationStopped())
            break a;
          previousInstance = _dispatchListeners$i;
          event.currentTarget = currentTarget;
          try {
            previousInstance(event);
          } catch (error) {
            reportGlobalError2(error);
          }
          event.currentTarget = null;
          previousInstance = instance;
        }
    }
  }
}
function listenToNonDelegatedEvent(domEventName, targetElement) {
  var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
  JSCompiler_inline_result === undefined && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = new Set);
  var listenerSetKey = domEventName + "__bubble";
  JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
}
function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
  var eventSystemFlags = 0;
  isCapturePhaseListener && (eventSystemFlags |= 4);
  addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
}
function listenToAllSupportedEvents(rootContainerElement) {
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true;
    allNativeEvents.forEach(function(domEventName) {
      domEventName !== "selectionchange" && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
    });
    var ownerDocument = rootContainerElement.nodeType === 9 ? rootContainerElement : rootContainerElement.ownerDocument;
    ownerDocument === null || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
  }
}
function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
  switch (getEventPriority(domEventName)) {
    case 2:
      var listenerWrapper = dispatchDiscreteEvent;
      break;
    case 8:
      listenerWrapper = dispatchContinuousEvent;
      break;
    default:
      listenerWrapper = dispatchEvent;
  }
  eventSystemFlags = listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
  listenerWrapper = undefined;
  !passiveBrowserEventsSupported || domEventName !== "touchstart" && domEventName !== "touchmove" && domEventName !== "wheel" || (listenerWrapper = true);
  isCapturePhaseListener ? listenerWrapper !== undefined ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
    capture: true,
    passive: listenerWrapper
  }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : listenerWrapper !== undefined ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
    passive: listenerWrapper
  }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
}
function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
  var ancestorInst = targetInst$jscomp$0;
  if ((eventSystemFlags & 1) === 0 && (eventSystemFlags & 2) === 0 && targetInst$jscomp$0 !== null)
    a:
      for (;; ) {
        if (targetInst$jscomp$0 === null)
          return;
        var nodeTag = targetInst$jscomp$0.tag;
        if (nodeTag === 3 || nodeTag === 4) {
          var container = targetInst$jscomp$0.stateNode.containerInfo;
          if (container === targetContainer)
            break;
          if (nodeTag === 4)
            for (nodeTag = targetInst$jscomp$0.return;nodeTag !== null; ) {
              var grandTag = nodeTag.tag;
              if ((grandTag === 3 || grandTag === 4) && nodeTag.stateNode.containerInfo === targetContainer)
                return;
              nodeTag = nodeTag.return;
            }
          for (;container !== null; ) {
            nodeTag = getClosestInstanceFromNode(container);
            if (nodeTag === null)
              return;
            grandTag = nodeTag.tag;
            if (grandTag === 5 || grandTag === 6 || grandTag === 26 || grandTag === 27) {
              targetInst$jscomp$0 = ancestorInst = nodeTag;
              continue a;
            }
            container = container.parentNode;
          }
        }
        targetInst$jscomp$0 = targetInst$jscomp$0.return;
      }
  batchedUpdates$1(function() {
    var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
    a: {
      var reactName = topLevelEventsToReactNames.get(domEventName);
      if (reactName !== undefined) {
        var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
        switch (domEventName) {
          case "keypress":
            if (getEventCharCode(nativeEvent) === 0)
              break a;
          case "keydown":
          case "keyup":
            SyntheticEventCtor = SyntheticKeyboardEvent;
            break;
          case "focusin":
            reactEventType = "focus";
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "focusout":
            reactEventType = "blur";
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "beforeblur":
          case "afterblur":
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "click":
            if (nativeEvent.button === 2)
              break a;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            SyntheticEventCtor = SyntheticMouseEvent;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            SyntheticEventCtor = SyntheticDragEvent;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            SyntheticEventCtor = SyntheticTouchEvent;
            break;
          case ANIMATION_END:
          case ANIMATION_ITERATION:
          case ANIMATION_START:
            SyntheticEventCtor = SyntheticAnimationEvent;
            break;
          case TRANSITION_END:
            SyntheticEventCtor = SyntheticTransitionEvent;
            break;
          case "scroll":
          case "scrollend":
            SyntheticEventCtor = SyntheticUIEvent;
            break;
          case "wheel":
            SyntheticEventCtor = SyntheticWheelEvent;
            break;
          case "copy":
          case "cut":
          case "paste":
            SyntheticEventCtor = SyntheticClipboardEvent;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            SyntheticEventCtor = SyntheticPointerEvent;
            break;
          case "toggle":
          case "beforetoggle":
            SyntheticEventCtor = SyntheticToggleEvent;
        }
        var inCapturePhase = (eventSystemFlags & 4) !== 0, accumulateTargetOnly = !inCapturePhase && (domEventName === "scroll" || domEventName === "scrollend"), reactEventName = inCapturePhase ? reactName !== null ? reactName + "Capture" : null : reactName;
        inCapturePhase = [];
        for (var instance = targetInst, lastHostComponent;instance !== null; ) {
          var _instance = instance;
          lastHostComponent = _instance.stateNode;
          _instance = _instance.tag;
          _instance !== 5 && _instance !== 26 && _instance !== 27 || lastHostComponent === null || reactEventName === null || (_instance = getListener(instance, reactEventName), _instance != null && inCapturePhase.push(createDispatchListener(instance, _instance, lastHostComponent)));
          if (accumulateTargetOnly)
            break;
          instance = instance.return;
        }
        0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
      }
    }
    if ((eventSystemFlags & 7) === 0) {
      a: {
        reactName = domEventName === "mouseover" || domEventName === "pointerover";
        SyntheticEventCtor = domEventName === "mouseout" || domEventName === "pointerout";
        if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
          break a;
        if (SyntheticEventCtor || reactName) {
          reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
          if (SyntheticEventCtor) {
            if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, reactEventType !== null && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || inCapturePhase !== 5 && inCapturePhase !== 27 && inCapturePhase !== 6))
              reactEventType = null;
          } else
            SyntheticEventCtor = null, reactEventType = targetInst;
          if (SyntheticEventCtor !== reactEventType) {
            inCapturePhase = SyntheticMouseEvent;
            _instance = "onMouseLeave";
            reactEventName = "onMouseEnter";
            instance = "mouse";
            if (domEventName === "pointerout" || domEventName === "pointerover")
              inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
            accumulateTargetOnly = SyntheticEventCtor == null ? reactName : getNodeFromInstance(SyntheticEventCtor);
            lastHostComponent = reactEventType == null ? reactName : getNodeFromInstance(reactEventType);
            reactName = new inCapturePhase(_instance, instance + "leave", SyntheticEventCtor, nativeEvent, nativeEventTarget);
            reactName.target = accumulateTargetOnly;
            reactName.relatedTarget = lastHostComponent;
            _instance = null;
            getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(reactEventName, instance + "enter", reactEventType, nativeEvent, nativeEventTarget), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
            accumulateTargetOnly = _instance;
            if (SyntheticEventCtor && reactEventType)
              b: {
                inCapturePhase = getParent;
                reactEventName = SyntheticEventCtor;
                instance = reactEventType;
                lastHostComponent = 0;
                for (_instance = reactEventName;_instance; _instance = inCapturePhase(_instance))
                  lastHostComponent++;
                _instance = 0;
                for (var tempB = instance;tempB; tempB = inCapturePhase(tempB))
                  _instance++;
                for (;0 < lastHostComponent - _instance; )
                  reactEventName = inCapturePhase(reactEventName), lastHostComponent--;
                for (;0 < _instance - lastHostComponent; )
                  instance = inCapturePhase(instance), _instance--;
                for (;lastHostComponent--; ) {
                  if (reactEventName === instance || instance !== null && reactEventName === instance.alternate) {
                    inCapturePhase = reactEventName;
                    break b;
                  }
                  reactEventName = inCapturePhase(reactEventName);
                  instance = inCapturePhase(instance);
                }
                inCapturePhase = null;
              }
            else
              inCapturePhase = null;
            SyntheticEventCtor !== null && accumulateEnterLeaveListenersForEvent(dispatchQueue, reactName, SyntheticEventCtor, inCapturePhase, false);
            reactEventType !== null && accumulateTargetOnly !== null && accumulateEnterLeaveListenersForEvent(dispatchQueue, accumulateTargetOnly, reactEventType, inCapturePhase, true);
          }
        }
      }
      a: {
        reactName = targetInst ? getNodeFromInstance(targetInst) : window;
        SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
        if (SyntheticEventCtor === "select" || SyntheticEventCtor === "input" && reactName.type === "file")
          var getTargetInstFunc = getTargetInstForChangeEvent;
        else if (isTextInputElement(reactName))
          if (isInputEventSupported)
            getTargetInstFunc = getTargetInstForInputOrChangeEvent;
          else {
            getTargetInstFunc = getTargetInstForInputEventPolyfill;
            var handleEventFunc = handleEventsForInputEventPolyfill;
          }
        else
          SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || SyntheticEventCtor.toLowerCase() !== "input" || reactName.type !== "checkbox" && reactName.type !== "radio" ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
        if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
          createAndAccumulateChangeEvent(dispatchQueue, getTargetInstFunc, nativeEvent, nativeEventTarget);
          break a;
        }
        handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
        domEventName === "focusout" && targetInst && reactName.type === "number" && targetInst.memoizedProps.value != null && setDefaultValue(reactName, "number", reactName.value);
      }
      handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
      switch (domEventName) {
        case "focusin":
          if (isTextInputElement(handleEventFunc) || handleEventFunc.contentEditable === "true")
            activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
          break;
        case "focusout":
          lastSelection = activeElementInst = activeElement = null;
          break;
        case "mousedown":
          mouseDown = true;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          mouseDown = false;
          constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
          break;
        case "selectionchange":
          if (skipSelectionChangeEvent)
            break;
        case "keydown":
        case "keyup":
          constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
      }
      var fallbackData;
      if (canUseCompositionEvent)
        b: {
          switch (domEventName) {
            case "compositionstart":
              var eventType = "onCompositionStart";
              break b;
            case "compositionend":
              eventType = "onCompositionEnd";
              break b;
            case "compositionupdate":
              eventType = "onCompositionUpdate";
              break b;
          }
          eventType = undefined;
        }
      else
        isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : domEventName === "keydown" && nativeEvent.keyCode === 229 && (eventType = "onCompositionStart");
      eventType && (useFallbackCompositionData && nativeEvent.locale !== "ko" && (isComposing || eventType !== "onCompositionStart" ? eventType === "onCompositionEnd" && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = ("value" in root) ? root.value : root.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), fallbackData !== null && (eventType.data = fallbackData))));
      if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
        eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent("onBeforeInput", "beforeinput", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
          event: handleEventFunc,
          listeners: eventType
        }), handleEventFunc.data = fallbackData);
      extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
    }
    processDispatchQueue(dispatchQueue, eventSystemFlags);
  });
}
function createDispatchListener(instance, listener, currentTarget) {
  return {
    instance,
    listener,
    currentTarget
  };
}
function accumulateTwoPhaseListeners(targetFiber, reactName) {
  for (var captureName = reactName + "Capture", listeners = [];targetFiber !== null; ) {
    var _instance2 = targetFiber, stateNode = _instance2.stateNode;
    _instance2 = _instance2.tag;
    _instance2 !== 5 && _instance2 !== 26 && _instance2 !== 27 || stateNode === null || (_instance2 = getListener(targetFiber, captureName), _instance2 != null && listeners.unshift(createDispatchListener(targetFiber, _instance2, stateNode)), _instance2 = getListener(targetFiber, reactName), _instance2 != null && listeners.push(createDispatchListener(targetFiber, _instance2, stateNode)));
    if (targetFiber.tag === 3)
      return listeners;
    targetFiber = targetFiber.return;
  }
  return [];
}
function getParent(inst) {
  if (inst === null)
    return null;
  do
    inst = inst.return;
  while (inst && inst.tag !== 5 && inst.tag !== 27);
  return inst ? inst : null;
}
function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
  for (var registrationName = event._reactName, listeners = [];target !== null && target !== common; ) {
    var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
    _instance3 = _instance3.tag;
    if (alternate !== null && alternate === common)
      break;
    _instance3 !== 5 && _instance3 !== 26 && _instance3 !== 27 || stateNode === null || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), stateNode != null && listeners.unshift(createDispatchListener(target, stateNode, alternate))) : inCapturePhase || (stateNode = getListener(target, registrationName), stateNode != null && listeners.push(createDispatchListener(target, stateNode, alternate))));
    target = target.return;
  }
  listeners.length !== 0 && dispatchQueue.push({ event, listeners });
}
function normalizeMarkupForTextOrAttribute(markup) {
  return (typeof markup === "string" ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, `
`).replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
}
function checkForUnmatchedText(serverText, clientText) {
  clientText = normalizeMarkupForTextOrAttribute(clientText);
  return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
}
function setProp(domElement, tag, key, value, props, prevValue) {
  switch (key) {
    case "children":
      typeof value === "string" ? tag === "body" || tag === "textarea" && value === "" || setTextContent(domElement, value) : (typeof value === "number" || typeof value === "bigint") && tag !== "body" && setTextContent(domElement, "" + value);
      break;
    case "className":
      setValueForKnownAttribute(domElement, "class", value);
      break;
    case "tabIndex":
      setValueForKnownAttribute(domElement, "tabindex", value);
      break;
    case "dir":
    case "role":
    case "viewBox":
    case "width":
    case "height":
      setValueForKnownAttribute(domElement, key, value);
      break;
    case "style":
      setValueForStyles(domElement, value, prevValue);
      break;
    case "data":
      if (tag !== "object") {
        setValueForKnownAttribute(domElement, "data", value);
        break;
      }
    case "src":
    case "href":
      if (value === "" && (tag !== "a" || key !== "href")) {
        domElement.removeAttribute(key);
        break;
      }
      if (value == null || typeof value === "function" || typeof value === "symbol" || typeof value === "boolean") {
        domElement.removeAttribute(key);
        break;
      }
      value = sanitizeURL("" + value);
      domElement.setAttribute(key, value);
      break;
    case "action":
    case "formAction":
      if (typeof value === "function") {
        domElement.setAttribute(key, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
        break;
      } else
        typeof prevValue === "function" && (key === "formAction" ? (tag !== "input" && setProp(domElement, tag, "name", props.name, props, null), setProp(domElement, tag, "formEncType", props.formEncType, props, null), setProp(domElement, tag, "formMethod", props.formMethod, props, null), setProp(domElement, tag, "formTarget", props.formTarget, props, null)) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
      if (value == null || typeof value === "symbol" || typeof value === "boolean") {
        domElement.removeAttribute(key);
        break;
      }
      value = sanitizeURL("" + value);
      domElement.setAttribute(key, value);
      break;
    case "onClick":
      value != null && (domElement.onclick = noop$1);
      break;
    case "onScroll":
      value != null && listenToNonDelegatedEvent("scroll", domElement);
      break;
    case "onScrollEnd":
      value != null && listenToNonDelegatedEvent("scrollend", domElement);
      break;
    case "dangerouslySetInnerHTML":
      if (value != null) {
        if (typeof value !== "object" || !("__html" in value))
          throw Error(formatProdErrorMessage2(61));
        key = value.__html;
        if (key != null) {
          if (props.children != null)
            throw Error(formatProdErrorMessage2(60));
          domElement.innerHTML = key;
        }
      }
      break;
    case "multiple":
      domElement.multiple = value && typeof value !== "function" && typeof value !== "symbol";
      break;
    case "muted":
      domElement.muted = value && typeof value !== "function" && typeof value !== "symbol";
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "defaultValue":
    case "defaultChecked":
    case "innerHTML":
    case "ref":
      break;
    case "autoFocus":
      break;
    case "xlinkHref":
      if (value == null || typeof value === "function" || typeof value === "boolean" || typeof value === "symbol") {
        domElement.removeAttribute("xlink:href");
        break;
      }
      key = sanitizeURL("" + value);
      domElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", key);
      break;
    case "contentEditable":
    case "spellCheck":
    case "draggable":
    case "value":
    case "autoReverse":
    case "externalResourcesRequired":
    case "focusable":
    case "preserveAlpha":
      value != null && typeof value !== "function" && typeof value !== "symbol" ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
      break;
    case "inert":
    case "allowFullScreen":
    case "async":
    case "autoPlay":
    case "controls":
    case "default":
    case "defer":
    case "disabled":
    case "disablePictureInPicture":
    case "disableRemotePlayback":
    case "formNoValidate":
    case "hidden":
    case "loop":
    case "noModule":
    case "noValidate":
    case "open":
    case "playsInline":
    case "readOnly":
    case "required":
    case "reversed":
    case "scoped":
    case "seamless":
    case "itemScope":
      value && typeof value !== "function" && typeof value !== "symbol" ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
      break;
    case "capture":
    case "download":
      value === true ? domElement.setAttribute(key, "") : value !== false && value != null && typeof value !== "function" && typeof value !== "symbol" ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
      break;
    case "cols":
    case "rows":
    case "size":
    case "span":
      value != null && typeof value !== "function" && typeof value !== "symbol" && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
      break;
    case "rowSpan":
    case "start":
      value == null || typeof value === "function" || typeof value === "symbol" || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
      break;
    case "popover":
      listenToNonDelegatedEvent("beforetoggle", domElement);
      listenToNonDelegatedEvent("toggle", domElement);
      setValueForAttribute(domElement, "popover", value);
      break;
    case "xlinkActuate":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:actuate", value);
      break;
    case "xlinkArcrole":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:arcrole", value);
      break;
    case "xlinkRole":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:role", value);
      break;
    case "xlinkShow":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:show", value);
      break;
    case "xlinkTitle":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:title", value);
      break;
    case "xlinkType":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:type", value);
      break;
    case "xmlBase":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:base", value);
      break;
    case "xmlLang":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:lang", value);
      break;
    case "xmlSpace":
      setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:space", value);
      break;
    case "is":
      setValueForAttribute(domElement, "is", value);
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      if (!(2 < key.length) || key[0] !== "o" && key[0] !== "O" || key[1] !== "n" && key[1] !== "N")
        key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
  }
}
function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
  switch (key) {
    case "style":
      setValueForStyles(domElement, value, prevValue);
      break;
    case "dangerouslySetInnerHTML":
      if (value != null) {
        if (typeof value !== "object" || !("__html" in value))
          throw Error(formatProdErrorMessage2(61));
        key = value.__html;
        if (key != null) {
          if (props.children != null)
            throw Error(formatProdErrorMessage2(60));
          domElement.innerHTML = key;
        }
      }
      break;
    case "children":
      typeof value === "string" ? setTextContent(domElement, value) : (typeof value === "number" || typeof value === "bigint") && setTextContent(domElement, "" + value);
      break;
    case "onScroll":
      value != null && listenToNonDelegatedEvent("scroll", domElement);
      break;
    case "onScrollEnd":
      value != null && listenToNonDelegatedEvent("scrollend", domElement);
      break;
    case "onClick":
      value != null && (domElement.onclick = noop$1);
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "innerHTML":
    case "ref":
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      if (!registrationNameDependencies.hasOwnProperty(key))
        a: {
          if (key[0] === "o" && key[1] === "n" && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : undefined), prevValue = domElement[internalPropsKey] || null, prevValue = prevValue != null ? prevValue[key] : null, typeof prevValue === "function" && domElement.removeEventListener(tag, prevValue, props), typeof value === "function")) {
            typeof prevValue !== "function" && prevValue !== null && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
            domElement.addEventListener(tag, value, props);
            break a;
          }
          key in domElement ? domElement[key] = value : value === true ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
        }
  }
}
function setInitialProperties(domElement, tag, props) {
  switch (tag) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "img":
      listenToNonDelegatedEvent("error", domElement);
      listenToNonDelegatedEvent("load", domElement);
      var hasSrc = false, hasSrcSet = false, propKey;
      for (propKey in props)
        if (props.hasOwnProperty(propKey)) {
          var propValue = props[propKey];
          if (propValue != null)
            switch (propKey) {
              case "src":
                hasSrc = true;
                break;
              case "srcSet":
                hasSrcSet = true;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage2(137, tag));
              default:
                setProp(domElement, tag, propKey, propValue, props, null);
            }
        }
      hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
      hasSrc && setProp(domElement, tag, "src", props.src, props, null);
      return;
    case "input":
      listenToNonDelegatedEvent("invalid", domElement);
      var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
      for (hasSrc in props)
        if (props.hasOwnProperty(hasSrc)) {
          var propValue$184 = props[hasSrc];
          if (propValue$184 != null)
            switch (hasSrc) {
              case "name":
                hasSrcSet = propValue$184;
                break;
              case "type":
                propValue = propValue$184;
                break;
              case "checked":
                checked = propValue$184;
                break;
              case "defaultChecked":
                defaultChecked = propValue$184;
                break;
              case "value":
                propKey = propValue$184;
                break;
              case "defaultValue":
                defaultValue = propValue$184;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (propValue$184 != null)
                  throw Error(formatProdErrorMessage2(137, tag));
                break;
              default:
                setProp(domElement, tag, hasSrc, propValue$184, props, null);
            }
        }
      initInput(domElement, propKey, defaultValue, checked, defaultChecked, propValue, hasSrcSet, false);
      return;
    case "select":
      listenToNonDelegatedEvent("invalid", domElement);
      hasSrc = propValue = propKey = null;
      for (hasSrcSet in props)
        if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], defaultValue != null))
          switch (hasSrcSet) {
            case "value":
              propKey = defaultValue;
              break;
            case "defaultValue":
              propValue = defaultValue;
              break;
            case "multiple":
              hasSrc = defaultValue;
            default:
              setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
          }
      tag = propKey;
      props = propValue;
      domElement.multiple = !!hasSrc;
      tag != null ? updateOptions(domElement, !!hasSrc, tag, false) : props != null && updateOptions(domElement, !!hasSrc, props, true);
      return;
    case "textarea":
      listenToNonDelegatedEvent("invalid", domElement);
      propKey = hasSrcSet = hasSrc = null;
      for (propValue in props)
        if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], defaultValue != null))
          switch (propValue) {
            case "value":
              hasSrc = defaultValue;
              break;
            case "defaultValue":
              hasSrcSet = defaultValue;
              break;
            case "children":
              propKey = defaultValue;
              break;
            case "dangerouslySetInnerHTML":
              if (defaultValue != null)
                throw Error(formatProdErrorMessage2(91));
              break;
            default:
              setProp(domElement, tag, propValue, defaultValue, props, null);
          }
      initTextarea(domElement, hasSrc, hasSrcSet, propKey);
      return;
    case "option":
      for (checked in props)
        if (props.hasOwnProperty(checked) && (hasSrc = props[checked], hasSrc != null))
          switch (checked) {
            case "selected":
              domElement.selected = hasSrc && typeof hasSrc !== "function" && typeof hasSrc !== "symbol";
              break;
            default:
              setProp(domElement, tag, checked, hasSrc, props, null);
          }
      return;
    case "dialog":
      listenToNonDelegatedEvent("beforetoggle", domElement);
      listenToNonDelegatedEvent("toggle", domElement);
      listenToNonDelegatedEvent("cancel", domElement);
      listenToNonDelegatedEvent("close", domElement);
      break;
    case "iframe":
    case "object":
      listenToNonDelegatedEvent("load", domElement);
      break;
    case "video":
    case "audio":
      for (hasSrc = 0;hasSrc < mediaEventTypes.length; hasSrc++)
        listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
      break;
    case "image":
      listenToNonDelegatedEvent("error", domElement);
      listenToNonDelegatedEvent("load", domElement);
      break;
    case "details":
      listenToNonDelegatedEvent("toggle", domElement);
      break;
    case "embed":
    case "source":
    case "link":
      listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
    case "area":
    case "base":
    case "br":
    case "col":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "track":
    case "wbr":
    case "menuitem":
      for (defaultChecked in props)
        if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], hasSrc != null))
          switch (defaultChecked) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(formatProdErrorMessage2(137, tag));
            default:
              setProp(domElement, tag, defaultChecked, hasSrc, props, null);
          }
      return;
    default:
      if (isCustomElement(tag)) {
        for (propValue$184 in props)
          props.hasOwnProperty(propValue$184) && (hasSrc = props[propValue$184], hasSrc !== undefined && setPropOnCustomElement(domElement, tag, propValue$184, hasSrc, props, undefined));
        return;
      }
  }
  for (defaultValue in props)
    props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], hasSrc != null && setProp(domElement, tag, defaultValue, hasSrc, props, null));
}
function updateProperties(domElement, tag, lastProps, nextProps) {
  switch (tag) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "input":
      var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
      for (propKey in lastProps) {
        var lastProp = lastProps[propKey];
        if (lastProps.hasOwnProperty(propKey) && lastProp != null)
          switch (propKey) {
            case "checked":
              break;
            case "value":
              break;
            case "defaultValue":
              lastDefaultValue = lastProp;
            default:
              nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
          }
      }
      for (var propKey$201 in nextProps) {
        var propKey = nextProps[propKey$201];
        lastProp = lastProps[propKey$201];
        if (nextProps.hasOwnProperty(propKey$201) && (propKey != null || lastProp != null))
          switch (propKey$201) {
            case "type":
              type = propKey;
              break;
            case "name":
              name = propKey;
              break;
            case "checked":
              checked = propKey;
              break;
            case "defaultChecked":
              defaultChecked = propKey;
              break;
            case "value":
              value = propKey;
              break;
            case "defaultValue":
              defaultValue = propKey;
              break;
            case "children":
            case "dangerouslySetInnerHTML":
              if (propKey != null)
                throw Error(formatProdErrorMessage2(137, tag));
              break;
            default:
              propKey !== lastProp && setProp(domElement, tag, propKey$201, propKey, nextProps, lastProp);
          }
      }
      updateInput(domElement, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name);
      return;
    case "select":
      propKey = value = defaultValue = propKey$201 = null;
      for (type in lastProps)
        if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && lastDefaultValue != null)
          switch (type) {
            case "value":
              break;
            case "multiple":
              propKey = lastDefaultValue;
            default:
              nextProps.hasOwnProperty(type) || setProp(domElement, tag, type, null, nextProps, lastDefaultValue);
          }
      for (name in nextProps)
        if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (type != null || lastDefaultValue != null))
          switch (name) {
            case "value":
              propKey$201 = type;
              break;
            case "defaultValue":
              defaultValue = type;
              break;
            case "multiple":
              value = type;
            default:
              type !== lastDefaultValue && setProp(domElement, tag, name, type, nextProps, lastDefaultValue);
          }
      tag = defaultValue;
      lastProps = value;
      nextProps = propKey;
      propKey$201 != null ? updateOptions(domElement, !!lastProps, propKey$201, false) : !!nextProps !== !!lastProps && (tag != null ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
      return;
    case "textarea":
      propKey = propKey$201 = null;
      for (defaultValue in lastProps)
        if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && name != null && !nextProps.hasOwnProperty(defaultValue))
          switch (defaultValue) {
            case "value":
              break;
            case "children":
              break;
            default:
              setProp(domElement, tag, defaultValue, null, nextProps, name);
          }
      for (value in nextProps)
        if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (name != null || type != null))
          switch (value) {
            case "value":
              propKey$201 = name;
              break;
            case "defaultValue":
              propKey = name;
              break;
            case "children":
              break;
            case "dangerouslySetInnerHTML":
              if (name != null)
                throw Error(formatProdErrorMessage2(91));
              break;
            default:
              name !== type && setProp(domElement, tag, value, name, nextProps, type);
          }
      updateTextarea(domElement, propKey$201, propKey);
      return;
    case "option":
      for (var propKey$217 in lastProps)
        if (propKey$201 = lastProps[propKey$217], lastProps.hasOwnProperty(propKey$217) && propKey$201 != null && !nextProps.hasOwnProperty(propKey$217))
          switch (propKey$217) {
            case "selected":
              domElement.selected = false;
              break;
            default:
              setProp(domElement, tag, propKey$217, null, nextProps, propKey$201);
          }
      for (lastDefaultValue in nextProps)
        if (propKey$201 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$201 !== propKey && (propKey$201 != null || propKey != null))
          switch (lastDefaultValue) {
            case "selected":
              domElement.selected = propKey$201 && typeof propKey$201 !== "function" && typeof propKey$201 !== "symbol";
              break;
            default:
              setProp(domElement, tag, lastDefaultValue, propKey$201, nextProps, propKey);
          }
      return;
    case "img":
    case "link":
    case "area":
    case "base":
    case "br":
    case "col":
    case "embed":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "source":
    case "track":
    case "wbr":
    case "menuitem":
      for (var propKey$222 in lastProps)
        propKey$201 = lastProps[propKey$222], lastProps.hasOwnProperty(propKey$222) && propKey$201 != null && !nextProps.hasOwnProperty(propKey$222) && setProp(domElement, tag, propKey$222, null, nextProps, propKey$201);
      for (checked in nextProps)
        if (propKey$201 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$201 !== propKey && (propKey$201 != null || propKey != null))
          switch (checked) {
            case "children":
            case "dangerouslySetInnerHTML":
              if (propKey$201 != null)
                throw Error(formatProdErrorMessage2(137, tag));
              break;
            default:
              setProp(domElement, tag, checked, propKey$201, nextProps, propKey);
          }
      return;
    default:
      if (isCustomElement(tag)) {
        for (var propKey$227 in lastProps)
          propKey$201 = lastProps[propKey$227], lastProps.hasOwnProperty(propKey$227) && propKey$201 !== undefined && !nextProps.hasOwnProperty(propKey$227) && setPropOnCustomElement(domElement, tag, propKey$227, undefined, nextProps, propKey$201);
        for (defaultChecked in nextProps)
          propKey$201 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$201 === propKey || propKey$201 === undefined && propKey === undefined || setPropOnCustomElement(domElement, tag, defaultChecked, propKey$201, nextProps, propKey);
        return;
      }
  }
  for (var propKey$232 in lastProps)
    propKey$201 = lastProps[propKey$232], lastProps.hasOwnProperty(propKey$232) && propKey$201 != null && !nextProps.hasOwnProperty(propKey$232) && setProp(domElement, tag, propKey$232, null, nextProps, propKey$201);
  for (lastProp in nextProps)
    propKey$201 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$201 === propKey || propKey$201 == null && propKey == null || setProp(domElement, tag, lastProp, propKey$201, nextProps, propKey);
}
function isLikelyStaticResource(initiatorType) {
  switch (initiatorType) {
    case "css":
    case "script":
    case "font":
    case "img":
    case "image":
    case "input":
    case "link":
      return true;
    default:
      return false;
  }
}
function estimateBandwidth() {
  if (typeof performance.getEntriesByType === "function") {
    for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0;i < resourceEntries.length; i++) {
      var entry = resourceEntries[i], { transferSize, initiatorType, duration } = entry;
      if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
        initiatorType = 0;
        duration = entry.responseEnd;
        for (i += 1;i < resourceEntries.length; i++) {
          var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
          if (overlapStartTime > duration)
            break;
          var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
          overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
        }
        --i;
        bits += 8 * (transferSize + initiatorType) / (entry.duration / 1000);
        count++;
        if (10 < count)
          break;
      }
    }
    if (0 < count)
      return bits / count / 1e6;
  }
  return navigator.connection && (count = navigator.connection.downlink, typeof count === "number") ? count : 5;
}
function getOwnerDocumentFromRootContainer(rootContainerElement) {
  return rootContainerElement.nodeType === 9 ? rootContainerElement : rootContainerElement.ownerDocument;
}
function getOwnHostContext(namespaceURI) {
  switch (namespaceURI) {
    case "http://www.w3.org/2000/svg":
      return 1;
    case "http://www.w3.org/1998/Math/MathML":
      return 2;
    default:
      return 0;
  }
}
function getChildHostContextProd(parentNamespace, type) {
  if (parentNamespace === 0)
    switch (type) {
      case "svg":
        return 1;
      case "math":
        return 2;
      default:
        return 0;
    }
  return parentNamespace === 1 && type === "foreignObject" ? 0 : parentNamespace;
}
function shouldSetTextContent(type, props) {
  return type === "textarea" || type === "noscript" || typeof props.children === "string" || typeof props.children === "number" || typeof props.children === "bigint" || typeof props.dangerouslySetInnerHTML === "object" && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
}
function shouldAttemptEagerTransition() {
  var event = window.event;
  if (event && event.type === "popstate") {
    if (event === currentPopstateTransitionEvent)
      return false;
    currentPopstateTransitionEvent = event;
    return true;
  }
  currentPopstateTransitionEvent = null;
  return false;
}
function handleErrorInNextTick(error) {
  setTimeout(function() {
    throw error;
  });
}
function isSingletonScope(type) {
  return type === "head";
}
function clearHydrationBoundary(parentInstance, hydrationInstance) {
  var node = hydrationInstance, depth = 0;
  do {
    var nextNode = node.nextSibling;
    parentInstance.removeChild(node);
    if (nextNode && nextNode.nodeType === 8)
      if (node = nextNode.data, node === "/$" || node === "/&") {
        if (depth === 0) {
          parentInstance.removeChild(nextNode);
          retryIfBlockedOn(hydrationInstance);
          return;
        }
        depth--;
      } else if (node === "$" || node === "$?" || node === "$~" || node === "$!" || node === "&")
        depth++;
      else if (node === "html")
        releaseSingletonInstance(parentInstance.ownerDocument.documentElement);
      else if (node === "head") {
        node = parentInstance.ownerDocument.head;
        releaseSingletonInstance(node);
        for (var node$jscomp$0 = node.firstChild;node$jscomp$0; ) {
          var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
          node$jscomp$0[internalHoistableMarker] || nodeName === "SCRIPT" || nodeName === "STYLE" || nodeName === "LINK" && node$jscomp$0.rel.toLowerCase() === "stylesheet" || node.removeChild(node$jscomp$0);
          node$jscomp$0 = nextNode$jscomp$0;
        }
      } else
        node === "body" && releaseSingletonInstance(parentInstance.ownerDocument.body);
    node = nextNode;
  } while (node);
  retryIfBlockedOn(hydrationInstance);
}
function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
  var node = suspenseInstance;
  suspenseInstance = 0;
  do {
    var nextNode = node.nextSibling;
    node.nodeType === 1 ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", node.getAttribute("style") === "" && node.removeAttribute("style")) : node.nodeType === 3 && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
    if (nextNode && nextNode.nodeType === 8)
      if (node = nextNode.data, node === "/$")
        if (suspenseInstance === 0)
          break;
        else
          suspenseInstance--;
      else
        node !== "$" && node !== "$?" && node !== "$~" && node !== "$!" || suspenseInstance++;
    node = nextNode;
  } while (node);
}
function clearContainerSparingly(container) {
  var nextNode = container.firstChild;
  nextNode && nextNode.nodeType === 10 && (nextNode = nextNode.nextSibling);
  for (;nextNode; ) {
    var node = nextNode;
    nextNode = nextNode.nextSibling;
    switch (node.nodeName) {
      case "HTML":
      case "HEAD":
      case "BODY":
        clearContainerSparingly(node);
        detachDeletedInstance(node);
        continue;
      case "SCRIPT":
      case "STYLE":
        continue;
      case "LINK":
        if (node.rel.toLowerCase() === "stylesheet")
          continue;
    }
    container.removeChild(node);
  }
}
function canHydrateInstance(instance, type, props, inRootOrSingleton) {
  for (;instance.nodeType === 1; ) {
    var anyProps = props;
    if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
      if (!inRootOrSingleton && (instance.nodeName !== "INPUT" || instance.type !== "hidden"))
        break;
    } else if (!inRootOrSingleton)
      if (type === "input" && instance.type === "hidden") {
        var name = anyProps.name == null ? null : "" + anyProps.name;
        if (anyProps.type === "hidden" && instance.getAttribute("name") === name)
          return instance;
      } else
        return instance;
    else if (!instance[internalHoistableMarker])
      switch (type) {
        case "meta":
          if (!instance.hasAttribute("itemprop"))
            break;
          return instance;
        case "link":
          name = instance.getAttribute("rel");
          if (name === "stylesheet" && instance.hasAttribute("data-precedence"))
            break;
          else if (name !== anyProps.rel || instance.getAttribute("href") !== (anyProps.href == null || anyProps.href === "" ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (anyProps.crossOrigin == null ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (anyProps.title == null ? null : anyProps.title))
            break;
          return instance;
        case "style":
          if (instance.hasAttribute("data-precedence"))
            break;
          return instance;
        case "script":
          name = instance.getAttribute("src");
          if ((name !== (anyProps.src == null ? null : anyProps.src) || instance.getAttribute("type") !== (anyProps.type == null ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (anyProps.crossOrigin == null ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
            break;
          return instance;
        default:
          return instance;
      }
    instance = getNextHydratable(instance.nextSibling);
    if (instance === null)
      break;
  }
  return null;
}
function canHydrateTextInstance(instance, text, inRootOrSingleton) {
  if (text === "")
    return null;
  for (;instance.nodeType !== 3; ) {
    if ((instance.nodeType !== 1 || instance.nodeName !== "INPUT" || instance.type !== "hidden") && !inRootOrSingleton)
      return null;
    instance = getNextHydratable(instance.nextSibling);
    if (instance === null)
      return null;
  }
  return instance;
}
function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
  for (;instance.nodeType !== 8; ) {
    if ((instance.nodeType !== 1 || instance.nodeName !== "INPUT" || instance.type !== "hidden") && !inRootOrSingleton)
      return null;
    instance = getNextHydratable(instance.nextSibling);
    if (instance === null)
      return null;
  }
  return instance;
}
function isSuspenseInstancePending(instance) {
  return instance.data === "$?" || instance.data === "$~";
}
function isSuspenseInstanceFallback(instance) {
  return instance.data === "$!" || instance.data === "$?" && instance.ownerDocument.readyState !== "loading";
}
function registerSuspenseInstanceRetry(instance, callback) {
  var ownerDocument = instance.ownerDocument;
  if (instance.data === "$~")
    instance._reactRetry = callback;
  else if (instance.data !== "$?" || ownerDocument.readyState !== "loading")
    callback();
  else {
    var listener = function() {
      callback();
      ownerDocument.removeEventListener("DOMContentLoaded", listener);
    };
    ownerDocument.addEventListener("DOMContentLoaded", listener);
    instance._reactRetry = listener;
  }
}
function getNextHydratable(node) {
  for (;node != null; node = node.nextSibling) {
    var nodeType = node.nodeType;
    if (nodeType === 1 || nodeType === 3)
      break;
    if (nodeType === 8) {
      nodeType = node.data;
      if (nodeType === "$" || nodeType === "$!" || nodeType === "$?" || nodeType === "$~" || nodeType === "&" || nodeType === "F!" || nodeType === "F")
        break;
      if (nodeType === "/$" || nodeType === "/&")
        return null;
    }
  }
  return node;
}
function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
  hydrationInstance = hydrationInstance.nextSibling;
  for (var depth = 0;hydrationInstance; ) {
    if (hydrationInstance.nodeType === 8) {
      var data = hydrationInstance.data;
      if (data === "/$" || data === "/&") {
        if (depth === 0)
          return getNextHydratable(hydrationInstance.nextSibling);
        depth--;
      } else
        data !== "$" && data !== "$!" && data !== "$?" && data !== "$~" && data !== "&" || depth++;
    }
    hydrationInstance = hydrationInstance.nextSibling;
  }
  return null;
}
function getParentHydrationBoundary(targetInstance) {
  targetInstance = targetInstance.previousSibling;
  for (var depth = 0;targetInstance; ) {
    if (targetInstance.nodeType === 8) {
      var data = targetInstance.data;
      if (data === "$" || data === "$!" || data === "$?" || data === "$~" || data === "&") {
        if (depth === 0)
          return targetInstance;
        depth--;
      } else
        data !== "/$" && data !== "/&" || depth++;
    }
    targetInstance = targetInstance.previousSibling;
  }
  return null;
}
function resolveSingletonInstance(type, props, rootContainerInstance) {
  props = getOwnerDocumentFromRootContainer(rootContainerInstance);
  switch (type) {
    case "html":
      type = props.documentElement;
      if (!type)
        throw Error(formatProdErrorMessage2(452));
      return type;
    case "head":
      type = props.head;
      if (!type)
        throw Error(formatProdErrorMessage2(453));
      return type;
    case "body":
      type = props.body;
      if (!type)
        throw Error(formatProdErrorMessage2(454));
      return type;
    default:
      throw Error(formatProdErrorMessage2(451));
  }
}
function releaseSingletonInstance(instance) {
  for (var attributes = instance.attributes;attributes.length; )
    instance.removeAttributeNode(attributes[0]);
  detachDeletedInstance(instance);
}
function getHoistableRoot(container) {
  return typeof container.getRootNode === "function" ? container.getRootNode() : container.nodeType === 9 ? container : container.ownerDocument;
}
function flushSyncWork() {
  var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
  return previousWasRendering || wasRendering;
}
function requestFormReset(form) {
  var formInst = getInstanceFromNode(form);
  formInst !== null && formInst.tag === 5 && formInst.type === "form" ? requestFormReset$1(formInst) : previousDispatcher.r(form);
}
function preconnectAs(rel, href, crossOrigin) {
  var ownerDocument = globalDocument;
  if (ownerDocument && typeof href === "string" && href) {
    var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
    limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
    typeof crossOrigin === "string" && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
    preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, ownerDocument.querySelector(limitedEscapedHref) === null && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
  }
}
function prefetchDNS(href) {
  previousDispatcher.D(href);
  preconnectAs("dns-prefetch", href, null);
}
function preconnect(href, crossOrigin) {
  previousDispatcher.C(href, crossOrigin);
  preconnectAs("preconnect", href, crossOrigin);
}
function preload(href, as, options) {
  previousDispatcher.L(href, as, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href && as) {
    var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
    as === "image" ? options && options.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSrcSet) + '"]', typeof options.imageSizes === "string" && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSizes) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
    var key = preloadSelector;
    switch (as) {
      case "style":
        key = getStyleKey(href);
        break;
      case "script":
        key = getScriptKey(href);
    }
    preloadPropsMap.has(key) || (href = assign2({
      rel: "preload",
      href: as === "image" && options && options.imageSrcSet ? undefined : href,
      as
    }, options), preloadPropsMap.set(key, href), ownerDocument.querySelector(preloadSelector) !== null || as === "style" && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || as === "script" && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
  }
}
function preloadModule(href, options) {
  previousDispatcher.m(href, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href) {
    var as = options && typeof options.as === "string" ? options.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
    switch (as) {
      case "audioworklet":
      case "paintworklet":
      case "serviceworker":
      case "sharedworker":
      case "worker":
      case "script":
        key = getScriptKey(href);
    }
    if (!preloadPropsMap.has(key) && (href = assign2({ rel: "modulepreload", href }, options), preloadPropsMap.set(key, href), ownerDocument.querySelector(preloadSelector) === null)) {
      switch (as) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
            return;
      }
      as = ownerDocument.createElement("link");
      setInitialProperties(as, "link", href);
      markNodeAsHoistable(as);
      ownerDocument.head.appendChild(as);
    }
  }
}
function preinitStyle(href, precedence, options) {
  previousDispatcher.S(href, precedence, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href) {
    var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
    precedence = precedence || "default";
    var resource = styles.get(key);
    if (!resource) {
      var state = { loading: 0, preload: null };
      if (resource = ownerDocument.querySelector(getStylesheetSelectorFromKey(key)))
        state.loading = 5;
      else {
        href = assign2({ rel: "stylesheet", href, "data-precedence": precedence }, options);
        (options = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options);
        var link = resource = ownerDocument.createElement("link");
        markNodeAsHoistable(link);
        setInitialProperties(link, "link", href);
        link._p = new Promise(function(resolve, reject) {
          link.onload = resolve;
          link.onerror = reject;
        });
        link.addEventListener("load", function() {
          state.loading |= 1;
        });
        link.addEventListener("error", function() {
          state.loading |= 2;
        });
        state.loading |= 4;
        insertStylesheet(resource, precedence, ownerDocument);
      }
      resource = {
        type: "stylesheet",
        instance: resource,
        count: 1,
        state
      };
      styles.set(key, resource);
    }
  }
}
function preinitScript(src, options) {
  previousDispatcher.X(src, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && src) {
    var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
    resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign2({ src, async: true }, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
      type: "script",
      instance: resource,
      count: 1,
      state: null
    }, scripts.set(key, resource));
  }
}
function preinitModuleScript(src, options) {
  previousDispatcher.M(src, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && src) {
    var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
    resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign2({ src, async: true, type: "module" }, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
      type: "script",
      instance: resource,
      count: 1,
      state: null
    }, scripts.set(key, resource));
  }
}
function getResource(type, currentProps, pendingProps, currentResource) {
  var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
  if (!JSCompiler_inline_result)
    throw Error(formatProdErrorMessage2(446));
  switch (type) {
    case "meta":
    case "title":
      return null;
    case "style":
      return typeof pendingProps.precedence === "string" && typeof pendingProps.href === "string" ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
        type: "style",
        instance: null,
        count: 0,
        state: null
      }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
    case "link":
      if (pendingProps.rel === "stylesheet" && typeof pendingProps.href === "string" && typeof pendingProps.precedence === "string") {
        type = getStyleKey(pendingProps.href);
        var styles$243 = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, resource$244 = styles$243.get(type);
        resource$244 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$244 = {
          type: "stylesheet",
          instance: null,
          count: 0,
          state: { loading: 0, preload: null }
        }, styles$243.set(type, resource$244), (styles$243 = JSCompiler_inline_result.querySelector(getStylesheetSelectorFromKey(type))) && !styles$243._p && (resource$244.instance = styles$243, resource$244.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
          rel: "preload",
          as: "style",
          href: pendingProps.href,
          crossOrigin: pendingProps.crossOrigin,
          integrity: pendingProps.integrity,
          media: pendingProps.media,
          hrefLang: pendingProps.hrefLang,
          referrerPolicy: pendingProps.referrerPolicy
        }, preloadPropsMap.set(type, pendingProps), styles$243 || preloadStylesheet(JSCompiler_inline_result, type, pendingProps, resource$244.state)));
        if (currentProps && currentResource === null)
          throw Error(formatProdErrorMessage2(528, ""));
        return resource$244;
      }
      if (currentProps && currentResource !== null)
        throw Error(formatProdErrorMessage2(529, ""));
      return null;
    case "script":
      return currentProps = pendingProps.async, pendingProps = pendingProps.src, typeof pendingProps === "string" && currentProps && typeof currentProps !== "function" && typeof currentProps !== "symbol" ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
        type: "script",
        instance: null,
        count: 0,
        state: null
      }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
    default:
      throw Error(formatProdErrorMessage2(444, type));
  }
}
function getStyleKey(href) {
  return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
}
function getStylesheetSelectorFromKey(key) {
  return 'link[rel="stylesheet"][' + key + "]";
}
function stylesheetPropsFromRawProps(rawProps) {
  return assign2({}, rawProps, {
    "data-precedence": rawProps.precedence,
    precedence: null
  });
}
function preloadStylesheet(ownerDocument, key, preloadProps, state) {
  ownerDocument.querySelector('link[rel="preload"][as="style"][' + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
    return state.loading |= 1;
  }), key.addEventListener("error", function() {
    return state.loading |= 2;
  }), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
}
function getScriptKey(src) {
  return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
}
function getScriptSelectorFromKey(key) {
  return "script[async]" + key;
}
function acquireResource(hoistableRoot, resource, props) {
  resource.count++;
  if (resource.instance === null)
    switch (resource.type) {
      case "style":
        var instance = hoistableRoot.querySelector('style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]');
        if (instance)
          return resource.instance = instance, markNodeAsHoistable(instance), instance;
        var styleProps = assign2({}, props, {
          "data-href": props.href,
          "data-precedence": props.precedence,
          href: null,
          precedence: null
        });
        instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement("style");
        markNodeAsHoistable(instance);
        setInitialProperties(instance, "style", styleProps);
        insertStylesheet(instance, props.precedence, hoistableRoot);
        return resource.instance = instance;
      case "stylesheet":
        styleProps = getStyleKey(props.href);
        var instance$249 = hoistableRoot.querySelector(getStylesheetSelectorFromKey(styleProps));
        if (instance$249)
          return resource.state.loading |= 4, resource.instance = instance$249, markNodeAsHoistable(instance$249), instance$249;
        instance = stylesheetPropsFromRawProps(props);
        (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
        instance$249 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
        markNodeAsHoistable(instance$249);
        var linkInstance = instance$249;
        linkInstance._p = new Promise(function(resolve, reject) {
          linkInstance.onload = resolve;
          linkInstance.onerror = reject;
        });
        setInitialProperties(instance$249, "link", instance);
        resource.state.loading |= 4;
        insertStylesheet(instance$249, props.precedence, hoistableRoot);
        return resource.instance = instance$249;
      case "script":
        instance$249 = getScriptKey(props.src);
        if (styleProps = hoistableRoot.querySelector(getScriptSelectorFromKey(instance$249)))
          return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
        instance = props;
        if (styleProps = preloadPropsMap.get(instance$249))
          instance = assign2({}, props), adoptPreloadPropsForScript(instance, styleProps);
        hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
        styleProps = hoistableRoot.createElement("script");
        markNodeAsHoistable(styleProps);
        setInitialProperties(styleProps, "link", instance);
        hoistableRoot.head.appendChild(styleProps);
        return resource.instance = styleProps;
      case "void":
        return null;
      default:
        throw Error(formatProdErrorMessage2(443, resource.type));
    }
  else
    resource.type === "stylesheet" && (resource.state.loading & 4) === 0 && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
  return resource.instance;
}
function insertStylesheet(instance, precedence, root) {
  for (var nodes = root.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0;i < nodes.length; i++) {
    var node = nodes[i];
    if (node.dataset.precedence === precedence)
      prior = node;
    else if (prior !== last)
      break;
  }
  prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = root.nodeType === 9 ? root.head : root, precedence.insertBefore(instance, precedence.firstChild));
}
function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
  stylesheetProps.crossOrigin == null && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
  stylesheetProps.referrerPolicy == null && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
  stylesheetProps.title == null && (stylesheetProps.title = preloadProps.title);
}
function adoptPreloadPropsForScript(scriptProps, preloadProps) {
  scriptProps.crossOrigin == null && (scriptProps.crossOrigin = preloadProps.crossOrigin);
  scriptProps.referrerPolicy == null && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
  scriptProps.integrity == null && (scriptProps.integrity = preloadProps.integrity);
}
function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
  if (tagCaches === null) {
    var cache = new Map;
    var caches = tagCaches = new Map;
    caches.set(ownerDocument, cache);
  } else
    caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = new Map, caches.set(ownerDocument, cache));
  if (cache.has(type))
    return cache;
  cache.set(type, null);
  ownerDocument = ownerDocument.getElementsByTagName(type);
  for (caches = 0;caches < ownerDocument.length; caches++) {
    var node = ownerDocument[caches];
    if (!(node[internalHoistableMarker] || node[internalInstanceKey] || type === "link" && node.getAttribute("rel") === "stylesheet") && node.namespaceURI !== "http://www.w3.org/2000/svg") {
      var nodeKey = node.getAttribute(keyAttribute) || "";
      nodeKey = type + nodeKey;
      var existing = cache.get(nodeKey);
      existing ? existing.push(node) : cache.set(nodeKey, [node]);
    }
  }
  return cache;
}
function mountHoistable(hoistableRoot, type, instance) {
  hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
  hoistableRoot.head.insertBefore(instance, type === "title" ? hoistableRoot.querySelector("head > title") : null);
}
function isHostHoistableType(type, props, hostContext) {
  if (hostContext === 1 || props.itemProp != null)
    return false;
  switch (type) {
    case "meta":
    case "title":
      return true;
    case "style":
      if (typeof props.precedence !== "string" || typeof props.href !== "string" || props.href === "")
        break;
      return true;
    case "link":
      if (typeof props.rel !== "string" || typeof props.href !== "string" || props.href === "" || props.onLoad || props.onError)
        break;
      switch (props.rel) {
        case "stylesheet":
          return type = props.disabled, typeof props.precedence === "string" && type == null;
        default:
          return true;
      }
    case "script":
      if (props.async && typeof props.async !== "function" && typeof props.async !== "symbol" && !props.onLoad && !props.onError && props.src && typeof props.src === "string")
        return true;
  }
  return false;
}
function preloadResource(resource) {
  return resource.type === "stylesheet" && (resource.state.loading & 3) === 0 ? false : true;
}
function suspendResource(state, hoistableRoot, resource, props) {
  if (resource.type === "stylesheet" && (typeof props.media !== "string" || matchMedia(props.media).matches !== false) && (resource.state.loading & 4) === 0) {
    if (resource.instance === null) {
      var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(getStylesheetSelectorFromKey(key));
      if (instance) {
        hoistableRoot = instance._p;
        hoistableRoot !== null && typeof hoistableRoot === "object" && typeof hoistableRoot.then === "function" && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
        resource.state.loading |= 4;
        resource.instance = instance;
        markNodeAsHoistable(instance);
        return;
      }
      instance = hoistableRoot.ownerDocument || hoistableRoot;
      props = stylesheetPropsFromRawProps(props);
      (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
      instance = instance.createElement("link");
      markNodeAsHoistable(instance);
      var linkInstance = instance;
      linkInstance._p = new Promise(function(resolve, reject) {
        linkInstance.onload = resolve;
        linkInstance.onerror = reject;
      });
      setInitialProperties(instance, "link", props);
      resource.instance = instance;
    }
    state.stylesheets === null && (state.stylesheets = new Map);
    state.stylesheets.set(resource, hoistableRoot);
    (hoistableRoot = resource.state.preload) && (resource.state.loading & 3) === 0 && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
  }
}
function waitForCommitToBeReady(state, timeoutOffset) {
  state.stylesheets && state.count === 0 && insertSuspendedStylesheets(state, state.stylesheets);
  return 0 < state.count || 0 < state.imgCount ? function(commit) {
    var stylesheetTimer = setTimeout(function() {
      state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
      if (state.unsuspend) {
        var unsuspend = state.unsuspend;
        state.unsuspend = null;
        unsuspend();
      }
    }, 60000 + timeoutOffset);
    0 < state.imgBytes && estimatedBytesWithinLimit === 0 && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
    var imgTimer = setTimeout(function() {
      state.waitingForImages = false;
      if (state.count === 0 && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
        var unsuspend = state.unsuspend;
        state.unsuspend = null;
        unsuspend();
      }
    }, (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset);
    state.unsuspend = commit;
    return function() {
      state.unsuspend = null;
      clearTimeout(stylesheetTimer);
      clearTimeout(imgTimer);
    };
  } : null;
}
function onUnsuspend() {
  this.count--;
  if (this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
    if (this.stylesheets)
      insertSuspendedStylesheets(this, this.stylesheets);
    else if (this.unsuspend) {
      var unsuspend = this.unsuspend;
      this.unsuspend = null;
      unsuspend();
    }
  }
}
function insertSuspendedStylesheets(state, resources) {
  state.stylesheets = null;
  state.unsuspend !== null && (state.count++, precedencesByRoot = new Map, resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
}
function insertStylesheetIntoRoot(root, resource) {
  if (!(resource.state.loading & 4)) {
    var precedences = precedencesByRoot.get(root);
    if (precedences)
      var last = precedences.get(null);
    else {
      precedences = new Map;
      precedencesByRoot.set(root, precedences);
      for (var nodes = root.querySelectorAll("link[data-precedence],style[data-precedence]"), i = 0;i < nodes.length; i++) {
        var node = nodes[i];
        if (node.nodeName === "LINK" || node.getAttribute("media") !== "not all")
          precedences.set(node.dataset.precedence, node), last = node;
      }
      last && precedences.set(null, last);
    }
    nodes = resource.instance;
    node = nodes.getAttribute("data-precedence");
    i = precedences.get(node) || last;
    i === last && precedences.set(null, nodes);
    precedences.set(node, nodes);
    this.count++;
    last = onUnsuspend.bind(this);
    nodes.addEventListener("load", last);
    nodes.addEventListener("error", last);
    i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root = root.nodeType === 9 ? root.head : root, root.insertBefore(nodes, root.firstChild));
    resource.state.loading |= 4;
  }
}
function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
  this.tag = 1;
  this.containerInfo = containerInfo;
  this.pingCache = this.current = this.pendingChildren = null;
  this.timeoutHandle = -1;
  this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
  this.callbackPriority = 0;
  this.expirationTimes = createLaneMap(-1);
  this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
  this.entanglements = createLaneMap(0);
  this.hiddenUpdates = createLaneMap(null);
  this.identifierPrefix = identifierPrefix;
  this.onUncaughtError = onUncaughtError;
  this.onCaughtError = onCaughtError;
  this.onRecoverableError = onRecoverableError;
  this.pooledCache = null;
  this.pooledCacheLanes = 0;
  this.formState = formState;
  this.incompleteTransitions = new Map;
}
function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
  containerInfo = new FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState);
  tag = 1;
  isStrictMode === true && (tag |= 24);
  isStrictMode = createFiberImplClass(3, null, null, tag);
  containerInfo.current = isStrictMode;
  isStrictMode.stateNode = containerInfo;
  tag = createCache();
  tag.refCount++;
  containerInfo.pooledCache = tag;
  tag.refCount++;
  isStrictMode.memoizedState = {
    element: initialChildren,
    isDehydrated: hydrate,
    cache: tag
  };
  initializeUpdateQueue(isStrictMode);
  return containerInfo;
}
function getContextForSubtree(parentComponent) {
  if (!parentComponent)
    return emptyContextObject;
  parentComponent = emptyContextObject;
  return parentComponent;
}
function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
  parentComponent = getContextForSubtree(parentComponent);
  container.context === null ? container.context = parentComponent : container.pendingContext = parentComponent;
  container = createUpdate(lane);
  container.payload = { element };
  callback = callback === undefined ? null : callback;
  callback !== null && (container.callback = callback);
  element = enqueueUpdate(rootFiber, container, lane);
  element !== null && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
}
function markRetryLaneImpl(fiber, retryLane) {
  fiber = fiber.memoizedState;
  if (fiber !== null && fiber.dehydrated !== null) {
    var a = fiber.retryLane;
    fiber.retryLane = a !== 0 && a < retryLane ? a : retryLane;
  }
}
function markRetryLaneIfNotHydrated(fiber, retryLane) {
  markRetryLaneImpl(fiber, retryLane);
  (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
}
function attemptContinuousHydration(fiber) {
  if (fiber.tag === 13 || fiber.tag === 31) {
    var root = enqueueConcurrentRenderForLane(fiber, 67108864);
    root !== null && scheduleUpdateOnFiber(root, fiber, 67108864);
    markRetryLaneIfNotHydrated(fiber, 67108864);
  }
}
function attemptHydrationAtCurrentPriority(fiber) {
  if (fiber.tag === 13 || fiber.tag === 31) {
    var lane = requestUpdateLane();
    lane = getBumpedLaneForHydrationByLane(lane);
    var root = enqueueConcurrentRenderForLane(fiber, lane);
    root !== null && scheduleUpdateOnFiber(root, fiber, lane);
    markRetryLaneIfNotHydrated(fiber, lane);
  }
}
function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  var prevTransition = ReactSharedInternals3.T;
  ReactSharedInternals3.T = null;
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals3.T = prevTransition;
  }
}
function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  var prevTransition = ReactSharedInternals3.T;
  ReactSharedInternals3.T = null;
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals3.T = prevTransition;
  }
}
function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  if (_enabled) {
    var blockedOn = findInstanceBlockingEvent(nativeEvent);
    if (blockedOn === null)
      dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer), clearIfContinuousEvent(domEventName, nativeEvent);
    else if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent))
      nativeEvent.stopPropagation();
    else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
      for (;blockedOn !== null; ) {
        var fiber = getInstanceFromNode(blockedOn);
        if (fiber !== null)
          switch (fiber.tag) {
            case 3:
              fiber = fiber.stateNode;
              if (fiber.current.memoizedState.isDehydrated) {
                var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                if (lanes !== 0) {
                  var root = fiber;
                  root.pendingLanes |= 2;
                  for (root.entangledLanes |= 2;lanes; ) {
                    var lane = 1 << 31 - clz32(lanes);
                    root.entanglements[1] |= lane;
                    lanes &= ~lane;
                  }
                  ensureRootIsScheduled(fiber);
                  (executionContext & 6) === 0 && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, false));
                }
              }
              break;
            case 31:
            case 13:
              root = enqueueConcurrentRenderForLane(fiber, 2), root !== null && scheduleUpdateOnFiber(root, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
          }
        fiber = findInstanceBlockingEvent(nativeEvent);
        fiber === null && dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
        if (fiber === blockedOn)
          break;
        blockedOn = fiber;
      }
      blockedOn !== null && nativeEvent.stopPropagation();
    } else
      dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
  }
}
function findInstanceBlockingEvent(nativeEvent) {
  nativeEvent = getEventTarget(nativeEvent);
  return findInstanceBlockingTarget(nativeEvent);
}
function findInstanceBlockingTarget(targetNode) {
  return_targetInst = null;
  targetNode = getClosestInstanceFromNode(targetNode);
  if (targetNode !== null) {
    var nearestMounted = getNearestMountedFiber(targetNode);
    if (nearestMounted === null)
      targetNode = null;
    else {
      var tag = nearestMounted.tag;
      if (tag === 13) {
        targetNode = getSuspenseInstanceFromFiber(nearestMounted);
        if (targetNode !== null)
          return targetNode;
        targetNode = null;
      } else if (tag === 31) {
        targetNode = getActivityInstanceFromFiber(nearestMounted);
        if (targetNode !== null)
          return targetNode;
        targetNode = null;
      } else if (tag === 3) {
        if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
          return nearestMounted.tag === 3 ? nearestMounted.stateNode.containerInfo : null;
        targetNode = null;
      } else
        nearestMounted !== targetNode && (targetNode = null);
    }
  }
  return_targetInst = targetNode;
  return null;
}
function getEventPriority(domEventName) {
  switch (domEventName) {
    case "beforetoggle":
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "toggle":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 2;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 8;
    case "message":
      switch (getCurrentPriorityLevel()) {
        case ImmediatePriority:
          return 2;
        case UserBlockingPriority:
          return 8;
        case NormalPriority$1:
        case LowPriority:
          return 32;
        case IdlePriority:
          return 268435456;
        default:
          return 32;
      }
    default:
      return 32;
  }
}
function clearIfContinuousEvent(domEventName, nativeEvent) {
  switch (domEventName) {
    case "focusin":
    case "focusout":
      queuedFocus = null;
      break;
    case "dragenter":
    case "dragleave":
      queuedDrag = null;
      break;
    case "mouseover":
    case "mouseout":
      queuedMouse = null;
      break;
    case "pointerover":
    case "pointerout":
      queuedPointers.delete(nativeEvent.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      queuedPointerCaptures.delete(nativeEvent.pointerId);
  }
}
function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  if (existingQueuedEvent === null || existingQueuedEvent.nativeEvent !== nativeEvent)
    return existingQueuedEvent = {
      blockedOn,
      domEventName,
      eventSystemFlags,
      nativeEvent,
      targetContainers: [targetContainer]
    }, blockedOn !== null && (blockedOn = getInstanceFromNode(blockedOn), blockedOn !== null && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
  existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
  blockedOn = existingQueuedEvent.targetContainers;
  targetContainer !== null && blockedOn.indexOf(targetContainer) === -1 && blockedOn.push(targetContainer);
  return existingQueuedEvent;
}
function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  switch (domEventName) {
    case "focusin":
      return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), true;
    case "dragenter":
      return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), true;
    case "mouseover":
      return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), true;
    case "pointerover":
      var pointerId = nativeEvent.pointerId;
      queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent));
      return true;
    case "gotpointercapture":
      return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)), true;
  }
  return false;
}
function attemptExplicitHydrationTarget(queuedTarget) {
  var targetInst = getClosestInstanceFromNode(queuedTarget.target);
  if (targetInst !== null) {
    var nearestMounted = getNearestMountedFiber(targetInst);
    if (nearestMounted !== null) {
      if (targetInst = nearestMounted.tag, targetInst === 13) {
        if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), targetInst !== null) {
          queuedTarget.blockedOn = targetInst;
          runWithPriority(queuedTarget.priority, function() {
            attemptHydrationAtCurrentPriority(nearestMounted);
          });
          return;
        }
      } else if (targetInst === 31) {
        if (targetInst = getActivityInstanceFromFiber(nearestMounted), targetInst !== null) {
          queuedTarget.blockedOn = targetInst;
          runWithPriority(queuedTarget.priority, function() {
            attemptHydrationAtCurrentPriority(nearestMounted);
          });
          return;
        }
      } else if (targetInst === 3 && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
        queuedTarget.blockedOn = nearestMounted.tag === 3 ? nearestMounted.stateNode.containerInfo : null;
        return;
      }
    }
  }
  queuedTarget.blockedOn = null;
}
function attemptReplayContinuousQueuedEvent(queuedEvent) {
  if (queuedEvent.blockedOn !== null)
    return false;
  for (var targetContainers = queuedEvent.targetContainers;0 < targetContainers.length; ) {
    var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
    if (nextBlockedOn === null) {
      nextBlockedOn = queuedEvent.nativeEvent;
      var nativeEventClone = new nextBlockedOn.constructor(nextBlockedOn.type, nextBlockedOn);
      currentReplayingEvent = nativeEventClone;
      nextBlockedOn.target.dispatchEvent(nativeEventClone);
      currentReplayingEvent = null;
    } else
      return targetContainers = getInstanceFromNode(nextBlockedOn), targetContainers !== null && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
    targetContainers.shift();
  }
  return true;
}
function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
  attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
}
function replayUnblockedEvents() {
  hasScheduledReplayAttempt = false;
  queuedFocus !== null && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
  queuedDrag !== null && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
  queuedMouse !== null && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
  queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
  queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
}
function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
  queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents)));
}
function scheduleReplayQueueIfNeeded(formReplayingQueue) {
  lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, function() {
    lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
    for (var i = 0;i < formReplayingQueue.length; i += 3) {
      var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
      if (typeof submitterOrAction !== "function")
        if (findInstanceBlockingTarget(submitterOrAction || form) === null)
          continue;
        else
          break;
      var formInst = getInstanceFromNode(form);
      formInst !== null && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(formInst, {
        pending: true,
        data: formData,
        method: form.method,
        action: submitterOrAction
      }, submitterOrAction, formData));
    }
  }));
}
function retryIfBlockedOn(unblocked) {
  function unblock(queuedEvent) {
    return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
  }
  queuedFocus !== null && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
  queuedDrag !== null && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
  queuedMouse !== null && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
  queuedPointers.forEach(unblock);
  queuedPointerCaptures.forEach(unblock);
  for (var i = 0;i < queuedExplicitHydrationTargets.length; i++) {
    var queuedTarget = queuedExplicitHydrationTargets[i];
    queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
  }
  for (;0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], i.blockedOn === null); )
    attemptExplicitHydrationTarget(i), i.blockedOn === null && queuedExplicitHydrationTargets.shift();
  i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
  if (i != null)
    for (queuedTarget = 0;queuedTarget < i.length; queuedTarget += 3) {
      var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
      if (typeof submitterOrAction === "function")
        formProps || scheduleReplayQueueIfNeeded(i);
      else if (formProps) {
        var action = null;
        if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
          if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
            action = formProps.formAction;
          else {
            if (findInstanceBlockingTarget(form) !== null)
              continue;
          }
        else
          action = formProps.action;
        typeof action === "function" ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
        scheduleReplayQueueIfNeeded(i);
      }
    }
}
function defaultOnDefaultTransitionIndicator() {
  function handleNavigate(event) {
    event.canIntercept && event.info === "react-transition" && event.intercept({
      handler: function() {
        return new Promise(function(resolve) {
          return pendingResolve = resolve;
        });
      },
      focusReset: "manual",
      scroll: "manual"
    });
  }
  function handleNavigateComplete() {
    pendingResolve !== null && (pendingResolve(), pendingResolve = null);
    isCancelled || setTimeout(startFakeNavigation, 20);
  }
  function startFakeNavigation() {
    if (!isCancelled && !navigation.transition) {
      var currentEntry = navigation.currentEntry;
      currentEntry && currentEntry.url != null && navigation.navigate(currentEntry.url, {
        state: currentEntry.getState(),
        info: "react-transition",
        history: "replace"
      });
    }
  }
  if (typeof navigation === "object") {
    var isCancelled = false, pendingResolve = null;
    navigation.addEventListener("navigate", handleNavigate);
    navigation.addEventListener("navigatesuccess", handleNavigateComplete);
    navigation.addEventListener("navigateerror", handleNavigateComplete);
    setTimeout(startFakeNavigation, 100);
    return function() {
      isCancelled = true;
      navigation.removeEventListener("navigate", handleNavigate);
      navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
      navigation.removeEventListener("navigateerror", handleNavigateComplete);
      pendingResolve !== null && (pendingResolve(), pendingResolve = null);
    };
  }
}
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}
function ReactDOMHydrationRoot(internalRoot) {
  this._internalRoot = internalRoot;
}
var Scheduler, React4, ReactDOM, assign2, REACT_LEGACY_ELEMENT_TYPE, REACT_ELEMENT_TYPE3, REACT_PORTAL_TYPE3, REACT_FRAGMENT_TYPE3, REACT_STRICT_MODE_TYPE2, REACT_PROFILER_TYPE2, REACT_CONSUMER_TYPE2, REACT_CONTEXT_TYPE2, REACT_FORWARD_REF_TYPE2, REACT_SUSPENSE_TYPE2, REACT_SUSPENSE_LIST_TYPE, REACT_MEMO_TYPE2, REACT_LAZY_TYPE2, REACT_ACTIVITY_TYPE2, REACT_MEMO_CACHE_SENTINEL, MAYBE_ITERATOR_SYMBOL2, REACT_CLIENT_REFERENCE, isArrayImpl2, ReactSharedInternals3, ReactDOMSharedInternals, sharedNotPendingObject, valueStack, index = -1, contextStackCursor, contextFiberStackCursor, rootInstanceStackCursor, hostTransitionProviderCursor, prefix, suffix, reentry = false, hasOwnProperty2, scheduleCallback$3, cancelCallback$1, shouldYield, requestPaint, now, getCurrentPriorityLevel, ImmediatePriority, UserBlockingPriority, NormalPriority$1, LowPriority, IdlePriority, log$1, unstable_setDisableYieldValue2, rendererID = null, injectedHook = null, clz32, log2, LN2, nextTransitionUpdateLane = 256, nextTransitionDeferredLane = 262144, nextRetryLane = 4194304, randomKey, internalInstanceKey, internalPropsKey, internalContainerInstanceKey, internalEventHandlersKey, internalEventHandlerListenersKey, internalEventHandlesSetKey, internalRootNodeResourcesKey, internalHoistableMarker, allNativeEvents, registrationNameDependencies, VALID_ATTRIBUTE_NAME_REGEX, illegalAttributeNameCache, validatedAttributeNameCache, escapeSelectorAttributeValueInsideDoubleQuotesRegex, unitlessNumbers, aliases, isJavaScriptProtocol, currentReplayingEvent = null, restoreTarget = null, restoreQueue = null, isInsideEventHandler = false, canUseDOM, passiveBrowserEventsSupported = false, options, root = null, startText = null, fallbackText = null, EventInterface, SyntheticEvent, UIEventInterface, SyntheticUIEvent, lastMovementX, lastMovementY, lastMouseEvent, MouseEventInterface, SyntheticMouseEvent, DragEventInterface, SyntheticDragEvent, FocusEventInterface, SyntheticFocusEvent, AnimationEventInterface, SyntheticAnimationEvent, ClipboardEventInterface, SyntheticClipboardEvent, CompositionEventInterface, SyntheticCompositionEvent, normalizeKey, translateToKey, modifierKeyToProp, KeyboardEventInterface, SyntheticKeyboardEvent, PointerEventInterface, SyntheticPointerEvent, TouchEventInterface, SyntheticTouchEvent, TransitionEventInterface, SyntheticTransitionEvent, WheelEventInterface, SyntheticWheelEvent, ToggleEventInterface, SyntheticToggleEvent, END_KEYCODES, canUseCompositionEvent, documentMode = null, canUseTextInputEvent, useFallbackCompositionData, SPACEBAR_CHAR, hasSpaceKeypress = false, isComposing = false, supportedInputTypes, activeElement$1 = null, activeElementInst$1 = null, isInputEventSupported = false, JSCompiler_inline_result$jscomp$286, isSupported$jscomp$inline_427, element$jscomp$inline_428, objectIs, skipSelectionChangeEvent, activeElement = null, activeElementInst = null, lastSelection = null, mouseDown = false, vendorPrefixes, prefixedEventNames, style, ANIMATION_END, ANIMATION_ITERATION, ANIMATION_START, TRANSITION_RUN, TRANSITION_START, TRANSITION_CANCEL, TRANSITION_END, topLevelEventsToReactNames, simpleEventPluginEvents, reportGlobalError2, concurrentQueues, concurrentQueuesIndex = 0, concurrentlyUpdatedLanes = 0, emptyContextObject, CapturedStacks, forkStack, forkStackIndex = 0, treeForkProvider = null, treeForkCount = 0, idStack, idStackIndex = 0, treeContextProvider = null, treeContextId = 1, treeContextOverflow = "", hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = false, hydrationErrors = null, rootOrSingletonContext = false, HydrationMismatchException, valueCursor, currentlyRenderingFiber$1 = null, lastContextDependency = null, AbortControllerLocal, scheduleCallback$2, NormalPriority, CacheContext, currentEntangledListeners = null, currentEntangledPendingCount = 0, currentEntangledLane = 0, currentEntangledActionThenable = null, prevOnStartTransitionFinish, resumedCache, SuspenseException, SuspenseyCommitException, SuspenseActionException, noopSuspenseyCommitThenable, suspendedThenable = null, thenableState$1 = null, thenableIndexCounter$1 = 0, reconcileChildFibers, mountChildFibers, hasForceUpdate = false, didReadFromEntangledAsyncAction = false, currentTreeHiddenStackCursor, prevEntangledRenderLanesCursor, suspenseHandlerStackCursor, shellBoundary = null, suspenseStackCursor, renderLanes = 0, currentlyRenderingFiber = null, currentHook = null, workInProgressHook = null, didScheduleRenderPhaseUpdate = false, didScheduleRenderPhaseUpdateDuringThisPass = false, shouldDoubleInvokeUserFnsInHooksDEV = false, localIdCounter = 0, thenableIndexCounter = 0, thenableState = null, globalClientIdCounter = 0, ContextOnlyDispatcher, HooksDispatcherOnMount, HooksDispatcherOnUpdate, HooksDispatcherOnRerender, classComponentUpdater, SelectiveHydrationException, didReceiveUpdate = false, SUSPENDED_MARKER, offscreenSubtreeIsHidden = false, offscreenSubtreeWasHidden = false, needsFormReset = false, PossiblyWeakSet, nextEffect = null, hostParent = null, hostParentIsContainer = false, currentHoistableRoot = null, suspenseyCommitFlag = 8192, DefaultAsyncDispatcher, PossiblyWeakMap, executionContext = 0, workInProgressRoot = null, workInProgress = null, workInProgressRootRenderLanes = 0, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, workInProgressRootDidSkipSuspendedSiblings = false, workInProgressRootIsPrerendering = false, workInProgressRootDidAttachPingListener = false, entangledRenderLanes = 0, workInProgressRootExitStatus = 0, workInProgressRootSkippedLanes = 0, workInProgressRootInterleavedUpdatedLanes = 0, workInProgressRootPingedLanes = 0, workInProgressDeferredLane = 0, workInProgressSuspendedRetryLanes = 0, workInProgressRootConcurrentErrors = null, workInProgressRootRecoverableErrors = null, workInProgressRootDidIncludeRecursiveRenderUpdate = false, globalMostRecentFallbackTime = 0, globalMostRecentTransitionTime = 0, workInProgressRootRenderTargetTime = Infinity, workInProgressTransitions = null, legacyErrorBoundariesThatAlreadyFailed = null, pendingEffectsStatus = 0, pendingEffectsRoot = null, pendingFinishedWork = null, pendingEffectsLanes = 0, pendingEffectsRemainingLanes = 0, pendingPassiveTransitions = null, pendingRecoverableErrors = null, nestedUpdateCount = 0, rootWithNestedUpdates = null, firstScheduledRoot = null, lastScheduledRoot = null, didScheduleMicrotask = false, mightHavePendingSyncWork = false, isFlushingWork = false, currentEventTransitionLane = 0, eventName$jscomp$inline_1578, domEventName$jscomp$inline_1579, capitalizedEvent$jscomp$inline_1580, i$jscomp$inline_1577, mediaEventTypes, nonDelegatedEvents, listeningMarker, NORMALIZE_NEWLINES_REGEX, NORMALIZE_NULL_AND_REPLACEMENT_REGEX, eventsEnabled = null, selectionInformation = null, currentPopstateTransitionEvent = null, scheduleTimeout, cancelTimeout, localPromise, scheduleMicrotask, previousHydratableOnEnteringScopedSingleton = null, preloadPropsMap, preconnectsSet, previousDispatcher, globalDocument, tagCaches = null, estimatedBytesWithinLimit = 0, precedencesByRoot = null, HostTransitionContext, _enabled = true, return_targetInst = null, hasScheduledReplayAttempt = false, queuedFocus = null, queuedDrag = null, queuedMouse = null, queuedPointers, queuedPointerCaptures, queuedExplicitHydrationTargets, discreteReplayableEvents, lastScheduledReplayQueue = null, isomorphicReactPackageVersion$jscomp$inline_1840, internals$jscomp$inline_2347, hook$jscomp$inline_2348, $createRoot = function(container, options) {
  if (!isValidContainer(container))
    throw Error(formatProdErrorMessage2(299));
  var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
  options !== null && options !== undefined && (options.unstable_strictMode === true && (isStrictMode = true), options.identifierPrefix !== undefined && (identifierPrefix = options.identifierPrefix), options.onUncaughtError !== undefined && (onUncaughtError = options.onUncaughtError), options.onCaughtError !== undefined && (onCaughtError = options.onCaughtError), options.onRecoverableError !== undefined && (onRecoverableError = options.onRecoverableError));
  options = createFiberRoot(container, 1, false, null, null, isStrictMode, identifierPrefix, null, onUncaughtError, onCaughtError, onRecoverableError, defaultOnDefaultTransitionIndicator);
  container[internalContainerInstanceKey] = options.current;
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(options);
}, $hydrateRoot = function(container, initialChildren, options) {
  if (!isValidContainer(container))
    throw Error(formatProdErrorMessage2(299));
  var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, formState = null;
  options !== null && options !== undefined && (options.unstable_strictMode === true && (isStrictMode = true), options.identifierPrefix !== undefined && (identifierPrefix = options.identifierPrefix), options.onUncaughtError !== undefined && (onUncaughtError = options.onUncaughtError), options.onCaughtError !== undefined && (onCaughtError = options.onCaughtError), options.onRecoverableError !== undefined && (onRecoverableError = options.onRecoverableError), options.formState !== undefined && (formState = options.formState));
  initialChildren = createFiberRoot(container, 1, true, initialChildren, options != null ? options : null, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, defaultOnDefaultTransitionIndicator);
  initialChildren.context = getContextForSubtree(null);
  options = initialChildren.current;
  isStrictMode = requestUpdateLane();
  isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
  identifierPrefix = createUpdate(isStrictMode);
  identifierPrefix.callback = null;
  enqueueUpdate(options, identifierPrefix, isStrictMode);
  options = isStrictMode;
  initialChildren.current.lanes = options;
  markRootUpdated$1(initialChildren, options);
  ensureRootIsScheduled(initialChildren);
  container[internalContainerInstanceKey] = initialChildren.current;
  listenToAllSupportedEvents(container);
  return new ReactDOMHydrationRoot(initialChildren);
}, $version3 = "19.2.7";
var init_react_dom_client_production = __esm(() => {
  Scheduler = __toESM(require_scheduler());
  React4 = __toESM(require_react());
  ReactDOM = __toESM(require_react_dom());
  assign2 = Object.assign;
  REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element");
  REACT_ELEMENT_TYPE3 = Symbol.for("react.transitional.element");
  REACT_PORTAL_TYPE3 = Symbol.for("react.portal");
  REACT_FRAGMENT_TYPE3 = Symbol.for("react.fragment");
  REACT_STRICT_MODE_TYPE2 = Symbol.for("react.strict_mode");
  REACT_PROFILER_TYPE2 = Symbol.for("react.profiler");
  REACT_CONSUMER_TYPE2 = Symbol.for("react.consumer");
  REACT_CONTEXT_TYPE2 = Symbol.for("react.context");
  REACT_FORWARD_REF_TYPE2 = Symbol.for("react.forward_ref");
  REACT_SUSPENSE_TYPE2 = Symbol.for("react.suspense");
  REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
  REACT_MEMO_TYPE2 = Symbol.for("react.memo");
  REACT_LAZY_TYPE2 = Symbol.for("react.lazy");
  Symbol.for("react.scope");
  REACT_ACTIVITY_TYPE2 = Symbol.for("react.activity");
  Symbol.for("react.legacy_hidden");
  Symbol.for("react.tracing_marker");
  REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
  Symbol.for("react.view_transition");
  MAYBE_ITERATOR_SYMBOL2 = Symbol.iterator;
  REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
  isArrayImpl2 = Array.isArray;
  ReactSharedInternals3 = React4.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  sharedNotPendingObject = {
    pending: false,
    data: null,
    method: null,
    action: null
  };
  valueStack = [];
  contextStackCursor = createCursor(null);
  contextFiberStackCursor = createCursor(null);
  rootInstanceStackCursor = createCursor(null);
  hostTransitionProviderCursor = createCursor(null);
  hasOwnProperty2 = Object.prototype.hasOwnProperty;
  scheduleCallback$3 = Scheduler.unstable_scheduleCallback;
  cancelCallback$1 = Scheduler.unstable_cancelCallback;
  shouldYield = Scheduler.unstable_shouldYield;
  requestPaint = Scheduler.unstable_requestPaint;
  now = Scheduler.unstable_now;
  getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
  ImmediatePriority = Scheduler.unstable_ImmediatePriority;
  UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
  NormalPriority$1 = Scheduler.unstable_NormalPriority;
  LowPriority = Scheduler.unstable_LowPriority;
  IdlePriority = Scheduler.unstable_IdlePriority;
  log$1 = Scheduler.log;
  unstable_setDisableYieldValue2 = Scheduler.unstable_setDisableYieldValue;
  clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
  log2 = Math.log;
  LN2 = Math.LN2;
  randomKey = Math.random().toString(36).slice(2);
  internalInstanceKey = "__reactFiber$" + randomKey;
  internalPropsKey = "__reactProps$" + randomKey;
  internalContainerInstanceKey = "__reactContainer$" + randomKey;
  internalEventHandlersKey = "__reactEvents$" + randomKey;
  internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
  internalEventHandlesSetKey = "__reactHandles$" + randomKey;
  internalRootNodeResourcesKey = "__reactResources$" + randomKey;
  internalHoistableMarker = "__reactMarker$" + randomKey;
  allNativeEvents = new Set;
  registrationNameDependencies = {};
  VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$");
  illegalAttributeNameCache = {};
  validatedAttributeNameCache = {};
  escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
  unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
  aliases = new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]);
  isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  canUseDOM = !(typeof window === "undefined" || typeof window.document === "undefined" || typeof window.document.createElement === "undefined");
  if (canUseDOM)
    try {
      options = {};
      Object.defineProperty(options, "passive", {
        get: function() {
          passiveBrowserEventsSupported = true;
        }
      });
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (e) {
      passiveBrowserEventsSupported = false;
    }
  EventInterface = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(event) {
      return event.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  };
  SyntheticEvent = createSyntheticEvent(EventInterface);
  UIEventInterface = assign2({}, EventInterface, { view: 0, detail: 0 });
  SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
  MouseEventInterface = assign2({}, UIEventInterface, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: getEventModifierState,
    button: 0,
    buttons: 0,
    relatedTarget: function(event) {
      return event.relatedTarget === undefined ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
    },
    movementX: function(event) {
      if ("movementX" in event)
        return event.movementX;
      event !== lastMouseEvent && (lastMouseEvent && event.type === "mousemove" ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
      return lastMovementX;
    },
    movementY: function(event) {
      return "movementY" in event ? event.movementY : lastMovementY;
    }
  });
  SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
  DragEventInterface = assign2({}, MouseEventInterface, { dataTransfer: 0 });
  SyntheticDragEvent = createSyntheticEvent(DragEventInterface);
  FocusEventInterface = assign2({}, UIEventInterface, { relatedTarget: 0 });
  SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface);
  AnimationEventInterface = assign2({}, EventInterface, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  });
  SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface);
  ClipboardEventInterface = assign2({}, EventInterface, {
    clipboardData: function(event) {
      return "clipboardData" in event ? event.clipboardData : window.clipboardData;
    }
  });
  SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface);
  CompositionEventInterface = assign2({}, EventInterface, { data: 0 });
  SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface);
  normalizeKey = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  };
  translateToKey = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  };
  modifierKeyToProp = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  KeyboardEventInterface = assign2({}, UIEventInterface, {
    key: function(nativeEvent) {
      if (nativeEvent.key) {
        var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
        if (key !== "Unidentified")
          return key;
      }
      return nativeEvent.type === "keypress" ? (nativeEvent = getEventCharCode(nativeEvent), nativeEvent === 13 ? "Enter" : String.fromCharCode(nativeEvent)) : nativeEvent.type === "keydown" || nativeEvent.type === "keyup" ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: getEventModifierState,
    charCode: function(event) {
      return event.type === "keypress" ? getEventCharCode(event) : 0;
    },
    keyCode: function(event) {
      return event.type === "keydown" || event.type === "keyup" ? event.keyCode : 0;
    },
    which: function(event) {
      return event.type === "keypress" ? getEventCharCode(event) : event.type === "keydown" || event.type === "keyup" ? event.keyCode : 0;
    }
  });
  SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
  PointerEventInterface = assign2({}, MouseEventInterface, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  });
  SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);
  TouchEventInterface = assign2({}, UIEventInterface, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: getEventModifierState
  });
  SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface);
  TransitionEventInterface = assign2({}, EventInterface, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  });
  SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface);
  WheelEventInterface = assign2({}, MouseEventInterface, {
    deltaX: function(event) {
      return "deltaX" in event ? event.deltaX : ("wheelDeltaX" in event) ? -event.wheelDeltaX : 0;
    },
    deltaY: function(event) {
      return "deltaY" in event ? event.deltaY : ("wheelDeltaY" in event) ? -event.wheelDeltaY : ("wheelDelta" in event) ? -event.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  });
  SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface);
  ToggleEventInterface = assign2({}, EventInterface, {
    newState: 0,
    oldState: 0
  });
  SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface);
  END_KEYCODES = [9, 13, 27, 32];
  canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
  canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
  canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
  useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode);
  SPACEBAR_CHAR = String.fromCharCode(32);
  supportedInputTypes = {
    color: true,
    date: true,
    datetime: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true
  };
  if (canUseDOM) {
    if (canUseDOM) {
      isSupported$jscomp$inline_427 = "oninput" in document;
      if (!isSupported$jscomp$inline_427) {
        element$jscomp$inline_428 = document.createElement("div");
        element$jscomp$inline_428.setAttribute("oninput", "return;");
        isSupported$jscomp$inline_427 = typeof element$jscomp$inline_428.oninput === "function";
      }
      JSCompiler_inline_result$jscomp$286 = isSupported$jscomp$inline_427;
    } else
      JSCompiler_inline_result$jscomp$286 = false;
    isInputEventSupported = JSCompiler_inline_result$jscomp$286 && (!document.documentMode || 9 < document.documentMode);
  }
  objectIs = typeof Object.is === "function" ? Object.is : is;
  skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode;
  vendorPrefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    animationiteration: makePrefixMap("Animation", "AnimationIteration"),
    animationstart: makePrefixMap("Animation", "AnimationStart"),
    transitionrun: makePrefixMap("Transition", "TransitionRun"),
    transitionstart: makePrefixMap("Transition", "TransitionStart"),
    transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  };
  prefixedEventNames = {};
  style = {};
  canUseDOM && (style = document.createElement("div").style, ("AnimationEvent" in window) || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), ("TransitionEvent" in window) || delete vendorPrefixes.transitionend.transition);
  ANIMATION_END = getVendorPrefixedEventName("animationend");
  ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
  ANIMATION_START = getVendorPrefixedEventName("animationstart");
  TRANSITION_RUN = getVendorPrefixedEventName("transitionrun");
  TRANSITION_START = getVendorPrefixedEventName("transitionstart");
  TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel");
  TRANSITION_END = getVendorPrefixedEventName("transitionend");
  topLevelEventsToReactNames = new Map;
  simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  simpleEventPluginEvents.push("scrollEnd");
  reportGlobalError2 = typeof reportError === "function" ? reportError : function(error) {
    if (typeof window === "object" && typeof window.ErrorEvent === "function") {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: typeof error === "object" && error !== null && typeof error.message === "string" ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event))
        return;
    } else if (typeof process === "object" && typeof process.emit === "function") {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  };
  concurrentQueues = [];
  emptyContextObject = {};
  CapturedStacks = new WeakMap;
  forkStack = [];
  idStack = [];
  HydrationMismatchException = Error(formatProdErrorMessage2(519));
  valueCursor = createCursor(null);
  AbortControllerLocal = typeof AbortController !== "undefined" ? AbortController : function() {
    var listeners = [], signal = this.signal = {
      aborted: false,
      addEventListener: function(type, listener) {
        listeners.push(listener);
      }
    };
    this.abort = function() {
      signal.aborted = true;
      listeners.forEach(function(listener) {
        return listener();
      });
    };
  };
  scheduleCallback$2 = Scheduler.unstable_scheduleCallback;
  NormalPriority = Scheduler.unstable_NormalPriority;
  CacheContext = {
    $$typeof: REACT_CONTEXT_TYPE2,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  prevOnStartTransitionFinish = ReactSharedInternals3.S;
  ReactSharedInternals3.S = function(transition, returnValue) {
    globalMostRecentTransitionTime = now();
    typeof returnValue === "object" && returnValue !== null && typeof returnValue.then === "function" && entangleAsyncAction(transition, returnValue);
    prevOnStartTransitionFinish !== null && prevOnStartTransitionFinish(transition, returnValue);
  };
  resumedCache = createCursor(null);
  SuspenseException = Error(formatProdErrorMessage2(460));
  SuspenseyCommitException = Error(formatProdErrorMessage2(474));
  SuspenseActionException = Error(formatProdErrorMessage2(542));
  noopSuspenseyCommitThenable = { then: function() {} };
  reconcileChildFibers = createChildReconciler(true);
  mountChildFibers = createChildReconciler(false);
  currentTreeHiddenStackCursor = createCursor(null);
  prevEntangledRenderLanesCursor = createCursor(0);
  suspenseHandlerStackCursor = createCursor(null);
  suspenseStackCursor = createCursor(0);
  ContextOnlyDispatcher = {
    readContext,
    use,
    useCallback: throwInvalidHookError,
    useContext: throwInvalidHookError,
    useEffect: throwInvalidHookError,
    useImperativeHandle: throwInvalidHookError,
    useLayoutEffect: throwInvalidHookError,
    useInsertionEffect: throwInvalidHookError,
    useMemo: throwInvalidHookError,
    useReducer: throwInvalidHookError,
    useRef: throwInvalidHookError,
    useState: throwInvalidHookError,
    useDebugValue: throwInvalidHookError,
    useDeferredValue: throwInvalidHookError,
    useTransition: throwInvalidHookError,
    useSyncExternalStore: throwInvalidHookError,
    useId: throwInvalidHookError,
    useHostTransitionStatus: throwInvalidHookError,
    useFormState: throwInvalidHookError,
    useActionState: throwInvalidHookError,
    useOptimistic: throwInvalidHookError,
    useMemoCache: throwInvalidHookError,
    useCacheRefresh: throwInvalidHookError
  };
  ContextOnlyDispatcher.useEffectEvent = throwInvalidHookError;
  HooksDispatcherOnMount = {
    readContext,
    use,
    useCallback: function(callback, deps) {
      mountWorkInProgressHook().memoizedState = [
        callback,
        deps === undefined ? null : deps
      ];
      return callback;
    },
    useContext: readContext,
    useEffect: mountEffect,
    useImperativeHandle: function(ref, create, deps) {
      deps = deps !== null && deps !== undefined ? deps.concat([ref]) : null;
      mountEffectImpl(4194308, 4, imperativeHandleEffect.bind(null, create, ref), deps);
    },
    useLayoutEffect: function(create, deps) {
      return mountEffectImpl(4194308, 4, create, deps);
    },
    useInsertionEffect: function(create, deps) {
      mountEffectImpl(4, 2, create, deps);
    },
    useMemo: function(nextCreate, deps) {
      var hook = mountWorkInProgressHook();
      deps = deps === undefined ? null : deps;
      var nextValue = nextCreate();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          nextCreate();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
      hook.memoizedState = [nextValue, deps];
      return nextValue;
    },
    useReducer: function(reducer, initialArg, init) {
      var hook = mountWorkInProgressHook();
      if (init !== undefined) {
        var initialState = init(initialArg);
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            init(initialArg);
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
      } else
        initialState = initialArg;
      hook.memoizedState = hook.baseState = initialState;
      reducer = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: reducer,
        lastRenderedState: initialState
      };
      hook.queue = reducer;
      reducer = reducer.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, reducer);
      return [hook.memoizedState, reducer];
    },
    useRef: function(initialValue) {
      var hook = mountWorkInProgressHook();
      initialValue = { current: initialValue };
      return hook.memoizedState = initialValue;
    },
    useState: function(initialState) {
      initialState = mountStateImpl(initialState);
      var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
      queue.dispatch = dispatch;
      return [initialState.memoizedState, dispatch];
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = mountWorkInProgressHook();
      return mountDeferredValueImpl(hook, value, initialValue);
    },
    useTransition: function() {
      var stateHook = mountStateImpl(false);
      stateHook = startTransition.bind(null, currentlyRenderingFiber, stateHook.queue, true, false);
      mountWorkInProgressHook().memoizedState = stateHook;
      return [false, stateHook];
    },
    useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
      var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
      if (isHydrating) {
        if (getServerSnapshot === undefined)
          throw Error(formatProdErrorMessage2(407));
        getServerSnapshot = getServerSnapshot();
      } else {
        getServerSnapshot = getSnapshot();
        if (workInProgressRoot === null)
          throw Error(formatProdErrorMessage2(349));
        (workInProgressRootRenderLanes & 127) !== 0 || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
      }
      hook.memoizedState = getServerSnapshot;
      var inst = { value: getServerSnapshot, getSnapshot };
      hook.queue = inst;
      mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
        subscribe
      ]);
      fiber.flags |= 2048;
      pushSimpleEffect(9, { destroy: undefined }, updateStoreInstance.bind(null, fiber, inst, getServerSnapshot, getSnapshot), null);
      return getServerSnapshot;
    },
    useId: function() {
      var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
      if (isHydrating) {
        var JSCompiler_inline_result = treeContextOverflow;
        var idWithLeadingBit = treeContextId;
        JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
        identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
        JSCompiler_inline_result = localIdCounter++;
        0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
        identifierPrefix += "_";
      } else
        JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
      return hook.memoizedState = identifierPrefix;
    },
    useHostTransitionStatus,
    useFormState: mountActionState,
    useActionState: mountActionState,
    useOptimistic: function(passthrough) {
      var hook = mountWorkInProgressHook();
      hook.memoizedState = hook.baseState = passthrough;
      var queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      hook.queue = queue;
      hook = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, true, queue);
      queue.dispatch = hook;
      return [passthrough, hook];
    },
    useMemoCache,
    useCacheRefresh: function() {
      return mountWorkInProgressHook().memoizedState = refreshCache.bind(null, currentlyRenderingFiber);
    },
    useEffectEvent: function(callback) {
      var hook = mountWorkInProgressHook(), ref = { impl: callback };
      hook.memoizedState = ref;
      return function() {
        if ((executionContext & 2) !== 0)
          throw Error(formatProdErrorMessage2(440));
        return ref.impl.apply(undefined, arguments);
      };
    }
  };
  HooksDispatcherOnUpdate = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
    useRef: updateRef,
    useState: function() {
      return updateReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
    },
    useTransition: function() {
      var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        typeof booleanOrThenable === "boolean" ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: updateActionState,
    useActionState: updateActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  HooksDispatcherOnUpdate.useEffectEvent = updateEvent;
  HooksDispatcherOnRerender = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: rerenderReducer,
    useRef: updateRef,
    useState: function() {
      return rerenderReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return currentHook === null ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
    },
    useTransition: function() {
      var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        typeof booleanOrThenable === "boolean" ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: rerenderActionState,
    useActionState: rerenderActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      if (currentHook !== null)
        return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
      hook.baseState = passthrough;
      return [passthrough, hook.queue.dispatch];
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  HooksDispatcherOnRerender.useEffectEvent = updateEvent;
  classComponentUpdater = {
    enqueueSetState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.payload = payload;
      callback !== undefined && callback !== null && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      payload !== null && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueReplaceState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 1;
      update.payload = payload;
      callback !== undefined && callback !== null && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      payload !== null && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueForceUpdate: function(inst, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 2;
      callback !== undefined && callback !== null && (update.callback = callback);
      callback = enqueueUpdate(inst, update, lane);
      callback !== null && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
    }
  };
  SelectiveHydrationException = Error(formatProdErrorMessage2(461));
  SUSPENDED_MARKER = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  PossiblyWeakSet = typeof WeakSet === "function" ? WeakSet : Set;
  DefaultAsyncDispatcher = {
    getCacheForType: function(resourceType) {
      var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
      cacheForType === undefined && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
      return cacheForType;
    },
    cacheSignal: function() {
      return readContext(CacheContext).controller.signal;
    }
  };
  PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
  for (i$jscomp$inline_1577 = 0;i$jscomp$inline_1577 < simpleEventPluginEvents.length; i$jscomp$inline_1577++) {
    eventName$jscomp$inline_1578 = simpleEventPluginEvents[i$jscomp$inline_1577], domEventName$jscomp$inline_1579 = eventName$jscomp$inline_1578.toLowerCase(), capitalizedEvent$jscomp$inline_1580 = eventName$jscomp$inline_1578[0].toUpperCase() + eventName$jscomp$inline_1578.slice(1);
    registerSimpleEvent(domEventName$jscomp$inline_1579, "on" + capitalizedEvent$jscomp$inline_1580);
  }
  registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
  registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
  registerSimpleEvent(ANIMATION_START, "onAnimationStart");
  registerSimpleEvent("dblclick", "onDoubleClick");
  registerSimpleEvent("focusin", "onFocus");
  registerSimpleEvent("focusout", "onBlur");
  registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
  registerSimpleEvent(TRANSITION_START, "onTransitionStart");
  registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
  registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
  registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
  registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
  registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
  registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
  registerTwoPhaseEvent("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
  registerTwoPhaseEvent("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
  registerTwoPhaseEvent("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]);
  registerTwoPhaseEvent("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
  registerTwoPhaseEvent("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
  registerTwoPhaseEvent("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
  nonDelegatedEvents = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes));
  listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
  NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
  NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
  scheduleTimeout = typeof setTimeout === "function" ? setTimeout : undefined;
  cancelTimeout = typeof clearTimeout === "function" ? clearTimeout : undefined;
  localPromise = typeof Promise === "function" ? Promise : undefined;
  scheduleMicrotask = typeof queueMicrotask === "function" ? queueMicrotask : typeof localPromise !== "undefined" ? function(callback) {
    return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
  } : scheduleTimeout;
  preloadPropsMap = new Map;
  preconnectsSet = new Set;
  previousDispatcher = ReactDOMSharedInternals.d;
  ReactDOMSharedInternals.d = {
    f: flushSyncWork,
    r: requestFormReset,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
  };
  globalDocument = typeof document === "undefined" ? null : document;
  HostTransitionContext = {
    $$typeof: REACT_CONTEXT_TYPE2,
    Provider: null,
    Consumer: null,
    _currentValue: sharedNotPendingObject,
    _currentValue2: sharedNotPendingObject,
    _threadCount: 0
  };
  queuedPointers = new Map;
  queuedPointerCaptures = new Map;
  queuedExplicitHydrationTargets = [];
  discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
  ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
    var root = this._internalRoot;
    if (root === null)
      throw Error(formatProdErrorMessage2(409));
    var current = root.current, lane = requestUpdateLane();
    updateContainerImpl(current, lane, children, root, null, null);
  };
  ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
    var root = this._internalRoot;
    if (root !== null) {
      this._internalRoot = null;
      var container = root.containerInfo;
      updateContainerImpl(root.current, 2, null, root, null, null);
      flushSyncWork$1();
      container[internalContainerInstanceKey] = null;
    }
  };
  ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
    if (target) {
      var updatePriority = resolveUpdatePriority();
      target = { blockedOn: null, target, priority: updatePriority };
      for (var i = 0;i < queuedExplicitHydrationTargets.length && updatePriority !== 0 && updatePriority < queuedExplicitHydrationTargets[i].priority; i++)
        ;
      queuedExplicitHydrationTargets.splice(i, 0, target);
      i === 0 && attemptExplicitHydrationTarget(target);
    }
  };
  isomorphicReactPackageVersion$jscomp$inline_1840 = React4.version;
  if (isomorphicReactPackageVersion$jscomp$inline_1840 !== "19.2.7")
    throw Error(formatProdErrorMessage2(527, isomorphicReactPackageVersion$jscomp$inline_1840, "19.2.7"));
  ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
    var fiber = componentOrElement._reactInternals;
    if (fiber === undefined) {
      if (typeof componentOrElement.render === "function")
        throw Error(formatProdErrorMessage2(188));
      componentOrElement = Object.keys(componentOrElement).join(",");
      throw Error(formatProdErrorMessage2(268, componentOrElement));
    }
    componentOrElement = findCurrentFiberUsingSlowPath(fiber);
    componentOrElement = componentOrElement !== null ? findCurrentHostFiberImpl(componentOrElement) : null;
    componentOrElement = componentOrElement === null ? null : componentOrElement.stateNode;
    return componentOrElement;
  };
  internals$jscomp$inline_2347 = {
    bundleType: 0,
    version: "19.2.7",
    rendererPackageName: "react-dom",
    currentDispatcherRef: ReactSharedInternals3,
    reconcilerVersion: "19.2.7"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined") {
    hook$jscomp$inline_2348 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook$jscomp$inline_2348.isDisabled && hook$jscomp$inline_2348.supportsFiber)
      try {
        rendererID = hook$jscomp$inline_2348.inject(internals$jscomp$inline_2347), injectedHook = hook$jscomp$inline_2348;
      } catch (err) {}
  }
});

// node_modules/.bun/react-dom@19.2.7+e14d3f224186685e/node_modules/react-dom/client.js
var require_client = __commonJS(function(exports, module) {
  init_react_dom_client_production();
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    if (false) {}
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  if (true) {
    checkDCE();
    module.exports = exports_react_dom_client_production;
  }
});

// frontend/widget-preview.tsx
var import_react4 = __toESM(require_react(), 1);

// packages/sdk/src/types.ts
class FnError extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "FnError";
  }
}

// packages/sdk/src/client.ts
var requestHost = (path, init) => window.fiaTransport?.request(path, init) ?? fetch(path, { ...init, credentials: "same-origin" });
async function openHostSocket(path) {
  let url = new URL(path, location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  if (window.fiaTransport) {
    const response = await requestHost("/_fia/browser/socket", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    });
    if (!response.ok)
      throw new Error("Browser session ended");
    url = new URL((await response.json()).url);
  }
  const socket = new WebSocket(url);
  const off = window.fiaTransport?.onEnd(() => socket.close());
  if (off)
    socket.addEventListener("close", off, { once: true });
  return socket;
}
async function jsonHost(path, body, headers, signal) {
  const response = await requestHost("/api/fn/v1" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "content-type": "application/json",
      ...Object.fromEntries(new Headers(headers))
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal
  });
  const value = await response.json();
  if (!response.ok)
    throw new FnError(value.code ?? "request_failed", value.message ?? "Request failed");
  return value;
}

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array, separator = "|") {
  return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}

class Cached {
  constructor(getter) {
    this._getter = getter;
    this._value = undefined;
  }
  get value() {
    const getter = this._getter;
    if (getter !== undefined) {
      this._value = getter();
      this._getter = undefined;
    }
    return this._value;
  }
}
function cached(getter) {
  return new Cached(getter);
}
function nullish(input) {
  return input === null || input === undefined;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
  let value = undefined;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) {
        return;
      }
      if (value === undefined) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v
      });
    },
    configurable: true
  });
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function rawShape(def) {
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  return desc?.get ? desc.get.raw : desc?.value;
}
function sourceShape(schema) {
  return rawShape(schema._zod.def) ?? schema._zod.def.shape;
}
function deferProp(target, key, getter) {
  Object.defineProperty(target, key, {
    get() {
      const value = getter();
      assignProp(this, key, value);
      return value;
    },
    enumerable: true,
    configurable: true
  });
}
function putProp(target, key, value) {
  if (key in target)
    assignProp(target, key, value);
  else
    target[key] = value;
}
function mirrorShape(target, source, keys, wrap) {
  const raw = sourceShape(source);
  for (const key of keys) {
    const desc = Object.getOwnPropertyDescriptor(raw, key);
    if (!desc.enumerable)
      continue;
    if (desc.get) {
      deferProp(target, key, () => {
        const value = source._zod.def.shape[key];
        return wrap ? wrap(value, key) : value;
      });
    } else
      putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
  }
}
function mirrorProps(target, source) {
  for (const key of Reflect.ownKeys(source)) {
    const desc = Object.getOwnPropertyDescriptor(source, key);
    if (!desc.enumerable)
      continue;
    if (desc.get)
      deferProp(target, key, () => source[key]);
    else
      putProp(target, key, desc.value);
  }
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === undefined)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== undefined) {
    if (params?.error !== undefined)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin !== undefined && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = /* @__PURE__ */ (() => ({
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-340282346638528860000000000000000000000, 340282346638528860000000000000000000000],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}))();
var BIGINT_FORMAT_RANGES = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const newShape = {};
  mirrorShape(newShape, schema, maskedKeys(schema, mask));
  return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
}
function maskedKeys(schema, mask) {
  const raw = sourceShape(schema);
  const keys = [];
  for (const key of Reflect.ownKeys(mask)) {
    if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) {
      throw new Error(`Unrecognized key: "${String(key)}"`);
    }
    if (mask[key])
      keys.push(key);
  }
  return keys;
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const omitted = new Set(maskedKeys(schema, mask));
  const newShape = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
  return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = sourceShape(schema);
    for (const key of Reflect.ownKeys(shape)) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function extended(schema, shape) {
  const newShape = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
  mirrorProps(newShape, shape);
  return newShape;
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function merge(a, b) {
  if (!b?._zod?.def) {
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  }
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const newShape = {};
  mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
  mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
  const def = mergeDefs(a._zod.def, {
    shape: newShape,
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class, schema, mask, name = "partial") {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
  }
  const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
  const newShape = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class && ((value, key) => selected && !selected.has(key) ? value : new Class({ type: "optional", innerType: value })));
  return clone(schema, mergeDefs(schema._zod.def, { shape: newShape, checks: [] }));
}
function required(Class, schema, mask) {
  const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
  const newShape = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) => selected && !selected.has(key) ? value : new Class({ type: "nonoptional", innerType: value }));
  return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a;
    (_a = iss).path ?? (_a.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function attachSchema(issues, start, inst) {
  var _a;
  for (let i = start;i < issues.length; i++) {
    (_a = issues[i]).schema ?? (_a.schema = inst);
  }
}
function finalizeIssue(iss, ctx, config) {
  var _a;
  const traits = iss.inst?._zod?.traits;
  if (traits?.has("$ZodType")) {
    if (traits.has("$ZodCheck"))
      (_a = iss).schema ?? (_a.schema = iss.inst);
    else
      iss.schema = iss.inst;
  }
  const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : undefined;
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
  const full = {};
  for (const k of Object.keys(iss)) {
    if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__")
      continue;
    full[k] = iss[k];
  }
  full.path ?? (full.path = []);
  full.message = message;
  if (ctx?.reportInput) {
    full.input = iss.input;
  }
  return full;
}
var highSurrogate = /[\uD800-\uDBFF]/;
function codePointLength(str) {
  const units = str.length;
  if (!highSurrogate.test(str))
    return units;
  let count = units;
  for (let i = 0;i < units - 1; i++) {
    if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
      count--;
      i++;
    }
  }
  return count;
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function parsedType(data) {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }
      const obj = data;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return obj.constructor.name;
      }
    }
  }
  return t;
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function members(proto, table) {
  for (const key in table) {
    const desc = Object.getOwnPropertyDescriptor(table, key);
    if (desc.get)
      Object.defineProperty(proto, key, { ...desc, enumerable: false });
    else
      defineBound(proto, key, desc.value);
  }
}
function own(inst, key, value, enumerable = true) {
  Object.defineProperty(inst, key, { configurable: true, writable: true, enumerable, value });
  return value;
}
function hide(inst, key, value) {
  return own(inst, key, value, false);
}
function derived(computes, table) {
  for (const key in computes) {
    const compute = computes[key];
    Object.defineProperty(table, key, {
      configurable: true,
      enumerable: true,
      get() {
        return own(this, key, compute(this));
      },
      set(value) {
        own(this, key, value);
      }
    });
  }
  return table;
}
function defineBound(proto, key, fn) {
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      return this == null ? fn : own(this, key, fn.bind(this));
    },
    set(value) {
      own(this, key, value);
    }
  });
}
function claim(inst, sentinel) {
  const proto = Object.getPrototypeOf(inst);
  return sentinel in proto ? undefined : proto;
}
var installing;
var broke = false;
var breaker = {
  configurable: true,
  get() {
    broke = true;
    return;
  }
};
function defineLazyInternal(inst, key, compute) {
  const proto = Object.getPrototypeOf(inst._zod);
  if (key in proto && installing !== inst._zod) {
    installing = undefined;
    return;
  }
  installing = inst._zod;
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      Object.defineProperty(this, key, breaker);
      const outer = broke;
      broke = false;
      try {
        const value = compute(this);
        if (broke)
          delete this[key];
        else
          Object.defineProperty(this, key, { configurable: true, writable: true, value });
        broke = broke || outer;
        return value;
      } catch (err) {
        delete this[key];
        broke = broke || outer;
        throw err;
      }
    },
    set(value) {
      Object.defineProperty(this, key, { configurable: true, writable: true, value });
    }
  });
}
function installLazyProp(inst, key, make, enumerable) {
  const proto = claim(inst, key);
  if (!proto)
    return;
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      const desc = { configurable: true, writable: true, enumerable, value: undefined };
      Object.defineProperty(this, key, desc);
      desc.value = make(this);
      Object.defineProperty(this, key, desc);
      return desc.value;
    },
    set(value) {
      Object.defineProperty(this, key, { configurable: true, writable: true, enumerable, value });
    }
  });
}
var CONSTANT_CATCH = "~constantCatch";
function constantCatch(value) {
  const fn = () => value;
  fn[CONSTANT_CATCH] = true;
  return fn;
}

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/core.js
var _a;
var _zodDesc = { value: undefined, enumerable: false };
var _E = "captureStackTrace" in Error ? Error : null;
function newError(Definition) {
  const E = _E;
  if (E) {
    const saved = E.stackTraceLimit;
    if (typeof saved === "number") {
      try {
        E.stackTraceLimit = 0;
      } catch {
        _E = null;
        return new Definition;
      }
      try {
        return new Definition;
      } finally {
        E.stackTraceLimit = saved;
      }
    }
  }
  return new Definition;
}
function $constructor(name, initializer, proto, params) {
  const zodProto = {};
  function Internals(def) {
    this.def = def;
    this.constr = _;
    this.traits = new Set;
  }
  Internals.prototype = zodProto;
  const protoMembers = proto;
  const initialized = protoMembers && new WeakSet;
  function init(inst, def) {
    if (!inst._zod) {
      _zodDesc.value = new Internals(def);
      try {
        Object.defineProperty(inst, "_zod", _zodDesc);
      } finally {
        _zodDesc.value = undefined;
      }
    } else if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer(inst, def);
    if (initialized) {
      const own = Object.getPrototypeOf(inst);
      const ctorProto = inst._zod.constr.prototype;
      let up = own;
      while (up && up !== ctorProto)
        up = Object.getPrototypeOf(up);
      const target = up ?? own;
      if (!initialized.has(target)) {
        initialized.add(target);
        members(target, protoMembers);
      }
    }
    const proto = _.prototype;
    for (const k in proto) {
      if (!Object.prototype.hasOwnProperty.call(proto, k))
        continue;
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;

  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    const inst = params?.Parent ? newError(Definition) : this;
    init(inst, def);
    const deferred = inst._zod.deferred;
    if (deferred) {
      for (const fn of deferred) {
        fn();
      }
      inst._zod.deferred = undefined;
    }
    const pp = globalThis.__zod_globalConfig?.postProcessor;
    if (pp)
      pp(inst);
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

class $ZodEncodeError extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
}
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/errors.js
function _getMessage() {
  const internals = this._zod;
  internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
  return internals.message;
}
function _setMessage(value) {
  this._zod.message = value;
}
var _messageDesc = {
  get: _getMessage,
  set: _setMessage,
  enumerable: true,
  configurable: true
};
var _issuesDesc = { value: undefined, enumerable: false };
var _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  _issuesDesc.value = def;
  Object.defineProperty(inst, "issues", _issuesDesc);
  _issuesDesc.value = undefined;
  Object.defineProperty(inst, "message", _messageDesc);
  const proto = Object.getPrototypeOf(inst);
  if (!_installedToString.has(proto)) {
    _installedToString.add(proto);
    Object.defineProperty(proto, "toString", {
      configurable: true,
      enumerable: false,
      get() {
        const value = () => this.message;
        Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
        return value;
      },
      set(value) {
        Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
      }
    });
  }
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, undefined, {
  Parent: Error
});
function node(obj, key, make) {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) {
    if (key === "__proto__") {
      Object.defineProperty(obj, key, { value: make(), writable: true, enumerable: true, configurable: true });
    } else {
      obj[key] = make();
    }
  }
  return obj[key];
}
function flattenError(error, mapper = (issue) => issue.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue) => issue.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error, path = []) => {
    for (const issue of error.issues) {
      if (issue.code === "invalid_union" && issue.errors.length) {
        issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
      } else if (issue.code === "invalid_key") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else if (issue.code === "invalid_element") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else {
        const fullpath = [...path, ...issue.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (el === "_errors") {
              if (terminal)
                curr._errors.push(mapper(issue));
              i++;
              continue;
            }
            if (!Object.prototype.hasOwnProperty.call(curr, el)) {
              Object.defineProperty(curr, el, {
                value: { _errors: [] },
                enumerable: true,
                writable: true,
                configurable: true
              });
            }
            const node = curr[el];
            if (terminal) {
              node._errors.push(mapper(issue));
            }
            curr = node;
            i++;
          }
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/parse.js
function finalizeParams(callee, params) {
  return { callee: params?.callee ?? callee, Err: params?.Err };
}
var _parse = (_Err) => {
  const fn = (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new $ZodAsyncError;
    }
    if (result.issues.length) {
      const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e, _params?.callee ?? fn);
      throw e;
    }
    return result.value;
  };
  return fn;
};
var _parseAsync = (_Err) => {
  const fn = async (schema, value, _ctx, params) => {
    const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
      result = await result;
    if (result.issues.length) {
      const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e, params?.callee ?? fn);
      throw e;
    }
    return result.value;
  };
  return fn;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  return result.issues.length ? failure(_Err, result.issues, ctx) : { success: true, data: result.value };
};
function failure(Err, issues, ctx) {
  let error;
  return {
    success: false,
    get error() {
      if (!error) {
        error = new Err(issues.map((iss) => finalizeIssue(iss, ctx, config())));
        issues = undefined;
        ctx = undefined;
      }
      return error;
    },
    set error(e) {
      error = e;
      issues = undefined;
      ctx = undefined;
    }
  };
}
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? failure(_Err, result.issues, ctx) : { success: true, data: result.value };
};
var COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
var COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
var validate = (schema, value, _ctx) => {
  const validator = schema._zod.bag.validator;
  if (validator !== undefined) {
    if (validator(value) !== COMPILE_INVALID)
      return true;
    if (validator.definite === true && _ctx === undefined)
      return false;
  }
  return validateFallback(schema, value, _ctx);
};
function validateFallback(schema, value, _ctx) {
  const ctx = _ctx ? { ..._ctx, async: false, abortEarly: true } : { async: false, abortEarly: true };
  const fallbackRun = schema._zod.bag.fallbackRun;
  let result;
  if (fallbackRun) {
    ctx[COMPILE_FALLBACK] = true;
    result = fallbackRun({ value, issues: [] }, ctx);
  } else {
    result = schema._zod.run({ value, issues: [] }, ctx);
  }
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  return result.issues.length === 0;
}
var validateAsync = async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true, abortEarly: true } : { async: true, abortEarly: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length === 0;
};
var _encode = (_Err) => {
  const parse = _parse(_Err);
  const fn = (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return parse(schema, value, ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _decode = (_Err) => {
  const parse = _parse(_Err);
  const fn = (schema, value, _ctx, _params) => {
    return parse(schema, value, _ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _encodeAsync = (_Err) => {
  const parseAsync = _parseAsync(_Err);
  const fn = async (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _decodeAsync = (_Err) => {
  const parseAsync = _parseAsync(_Err);
  const fn = async (schema, value, _ctx, _params) => {
    return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
function nanoidOfLength(length) {
  return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
}
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var email = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
function anchor(source) {
  return new RegExp(`^${source}$`);
}
var date = /* @__PURE__ */ anchor(dateSource);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const opts = ["Z"];
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const qualified = `${timeSource({ precision: args.precision, seconds: true })}(?:${opts.join("|")})`;
  const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var anyString = /^[\s\S]{0,}$/;
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a = inst._zod).onattach ?? (_a.onattach = []);
});
var _whenHasLength = (payload) => {
  const val = payload.value;
  return !nullish(val) && val.length !== undefined;
};
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin: numericOriginMap[typeof payload.value] ?? origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin: numericOriginMap[typeof payload.value] ?? origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? def.value !== BigInt(0) && payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units > def.maximum ? codePointLength(input) : units;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a, _b;
  $ZodCheck.init(inst, def);
  if (def.pattern)
    (_a = inst._zod).check ?? (_a.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/doc.js
class Doc {
  constructor(args = [], closed = {}) {
    this.content = [];
    this.indent = 0;
    this.args = args;
    this.closed = closed;
  }
  indented(fn) {
    this.indent += 1;
    try {
      fn(this);
    } finally {
      this.indent -= 1;
    }
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split(`
`).filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const content = this?.content ?? [``];
    const factory = new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {
${content.join(`
`)}
};`);
    return factory(...Object.values(this.closed));
  }
}

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 6,
  patch: 5
};

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const defChecks = inst._zod.def.checks;
  const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks, ctx) => {
      if (payload.memo)
        return payload;
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks) {
        if (ch._zod.def.when) {
          if (explicitlyAborted(payload))
            continue;
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError;
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            attachSchema(payload.issues, currLen, inst);
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          attachSchema(payload.issues, currLen, inst);
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary) => {
            return handleCanaryResult(canary, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return result.then((result) => runChecks(result, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
}, {
  get "~standard"() {
    return hide(this, "~standard", standardProps(this));
  },
  set "~standard"(value) {
    own(this, "~standard", value);
  }
});
var toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => finalizeIssue(iss, ctx, config())) } : { value: r.value };
async function validateAsync2(inst, value) {
  const ctx = { async: true };
  return toStandardResult(await inst._zod.run({ value, issues: [] }, ctx), ctx);
}
function standardProps(inst) {
  return {
    validate: (value) => {
      const ctx = { async: false };
      try {
        const r = inst._zod.run({ value, issues: [] }, ctx);
        if (!(r instanceof Promise))
          return toStandardResult(r, ctx);
      } catch (_) {}
      return validateAsync2(inst, value);
    },
    vendor: "zod",
    version: 1
  };
}
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = def.pattern ?? anyString;
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_) {}
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === undefined)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var URL_BAD_FORMAT = 1;
var URL_UNPARSEABLE = 2;
function canParseURL(input) {
  try {
    if (typeof URL !== "undefined" && typeof URL.canParse === "function")
      return URL.canParse(input);
    new URL(input);
    return true;
  } catch {
    return false;
  }
}
function validateURL(trimmed, def) {
  if (!("normalize" in def) && !("hostname" in def) && !("protocol" in def)) {
    return canParseURL(trimmed) || URL_UNPARSEABLE;
  }
  return parseURLObject(trimmed, def);
}
function parseURLObject(trimmed, def) {
  if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) {
    return URL_BAD_FORMAT;
  }
  try {
    if (typeof URL !== "undefined") {
      const URLStatic = URL;
      if (typeof URLStatic.parse === "function")
        return URLStatic.parse(trimmed) ?? URL_UNPARSEABLE;
    }
    return new URL(trimmed);
  } catch {
    return URL_UNPARSEABLE;
  }
}
var asciiTabOrNewline = /[\t\n\r]/g;
function stripTabAndNewline(value) {
  return value.replace(asciiTabOrNewline, "");
}
function urlHostnameOk(url, hostname) {
  hostname.lastIndex = 0;
  return hostname.test(url.hostname);
}
function urlProtocolOk(url, protocol) {
  protocol.lastIndex = 0;
  return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
}
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      const url = validateURL(trimmed, def);
      if (url === URL_BAD_FORMAT) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: payload.value,
          inst,
          continue: !def.abort
        });
        return;
      }
      if (url === URL_UNPARSEABLE) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          input: payload.value,
          inst,
          continue: !def.abort
        });
        return;
      }
      if (url === true) {
        payload.value = stripTabAndNewline(trimmed);
        return;
      }
      if (def.hostname && !urlHostnameOk(url, def.hostname)) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid hostname",
          pattern: def.hostname.source,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
      if (def.protocol && !urlProtocolOk(url, def.protocol)) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid protocol",
          pattern: def.protocol.source,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
      payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  if (def.length !== undefined && (!Number.isInteger(def.length) || def.length < 1))
    throw new Error(`Invalid nanoid length: ${def.length}`);
  def.pattern ?? (def.pattern = def.length === undefined ? nanoid : nanoidOfLength(def.length));
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
});
var ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
function isValidIPv6(value) {
  if (!ipv6Alphabet.test(value))
    return false;
  return canParseURL(`http://[${value}]`);
}
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (!isValidIPv6(payload.value)) {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
function isValidCIDRv6(value) {
  const parts = value.split("/");
  if (parts.length !== 2)
    return false;
  const [address, prefix] = parts;
  if (!prefix)
    return false;
  const prefixNum = Number(prefix);
  if (`${prefixNum}` !== prefix)
    return false;
  if (prefixNum < 0 || prefixNum > 128)
    return false;
  return isValidIPv6(address);
}
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (!isValidCIDRv6(payload.value)) {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64Charset);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var base64urlCharset = /^[A-Za-z0-9_-]*$/;
function isValidBase64URL(data) {
  if (!base64urlCharset.test(data))
    return false;
  const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64urlCharset);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? String(input) : undefined : undefined;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
    const proms = [];
    const abortEarly = ctx?.abortEarly;
    for (let i = 0;i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleArrayResult(result, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
        if (abortEarly && result.issues.length !== 0 && aborted(result))
          break;
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, optin, optout) {
  const isPresent = key in input;
  const isOptionalOut = optout === "optional";
  if (!isPresent && isOptionalOut && optin === "optional") {
    return;
  }
  if (result.issues.length) {
    if (optin !== undefined && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (!isPresent && optin === undefined) {
    if (!result.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: undefined,
        path: [key]
      });
    }
    return;
  }
  if (result.value === undefined) {
    if (isPresent || optin === "defaulted" && !isOptionalOut) {
      final.value[key] = undefined;
    }
  } else {
    final.value[key] = result.value;
  }
}
var NO_SYMBOL_KEYS = [];
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  const ownSymbols = Object.getOwnPropertySymbols(def.shape);
  const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
  const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
  for (const k of allKeys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    allKeys,
    symbolKeys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const optin = _catchall.optin;
  const optout = _catchall.optout;
  let seen = 0;
  for (const key in input) {
    if (abortEarly && payload.issues.length !== seen) {
      if (aborted(payload, seen))
        break;
      seen = payload.issues.length;
    }
    if (keySet.has(key))
      continue;
    if (key === "__proto__") {
      if (t === "never")
        unrecognized.push(key);
      continue;
    }
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
    } else {
      handlePropertyResult(r, payload, key, input, optin, optout);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst,
      continue: true
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  const sh = desc?.get ? desc.get.raw : def.shape ?? {};
  if (sh) {
    const get = () => {
      const newSh = { ...sh };
      Object.defineProperty(def, "shape", { value: newSh });
      get.raw = newSh;
      return newSh;
    };
    get.raw = sh;
    Object.defineProperty(def, "shape", { get });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazyInternal(inst, "propValues", (zod) => {
    const shape = zod.def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        if (!Object.prototype.hasOwnProperty.call(propValues, key)) {
          assignProp(propValues, key, new Set);
        }
        for (const v of field.values)
          propValues[key].add(v);
        if (field.optin !== undefined)
          propValues[key].add(undefined);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
    const proms = [];
    const shape = value.shape;
    const abortEarly = ctx?.abortEarly;
    let seen = payload.issues.length;
    for (const key of value.allKeys) {
      if (abortEarly && payload.issues.length !== seen) {
        if (aborted(payload, seen))
          break;
        seen = payload.issues.length;
      }
      if (key === "__proto__")
        continue;
      const el = shape[key];
      const optin = el._zod.optin;
      const optout = el._zod.optout;
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
      } else {
        handlePropertyResult(r, payload, key, input, optin, optout);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const memo = globalConfig.memoizer;
  const generateFastpass = (shape) => {
    const normalized = _normalized.value;
    const syms = normalized.symbolKeys;
    const doc = new Doc(["payload", "ctx"], { shape, inst, memo, syms });
    const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
    doc.write(`const input = payload.value;`);
    const ids = Object.create(null);
    let counter = 0;
    for (const key of normalized.allKeys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
    for (const key of normalized.allKeys) {
      if (key === "__proto__")
        continue;
      const id = ids[key];
      const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
      const isPresent = `${k} in input`;
      const schema = shape[key];
      const optin = schema?._zod?.optin;
      const isOptionalIn = optin !== undefined;
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(k)};`);
      if (isOptionalIn && isOptionalOut) {
        const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
        doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
      } else if (!isOptionalIn) {
        doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
        if (optin === "defaulted") {
          doc.write(`newResult[${k}] = ${id}.value;`);
        } else {
          doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
        }
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    return doc.compile();
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== undefined) ? "optional" : undefined);
  defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
  defineLazyInternal(inst, "values", (zod) => {
    if (zod.def.options.every((o) => o._zod.values)) {
      return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return;
  });
  defineLazyInternal(inst, "pattern", (zod) => {
    if (zod.def.options.every((o) => o._zod.pattern)) {
      const patterns = zod.def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return;
  });
  const first = def.options.length === 1 ? def.options[0]._zod.run : null;
  inst._zod.parse = (payload, ctx) => {
    if (first) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results) => {
      return handleUnionResults(results, payload, inst, ctx);
    });
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left, right]) => {
        return handleIntersectionResults(payload, left, right);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    if (Object.prototype.hasOwnProperty.call(newObj, "__proto__"))
      delete newObj.__proto__;
    for (const key of sharedKeys) {
      if (key === "__proto__")
        continue;
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = new Map;
  let unrecIssue;
  const keyIssues = new Map;
  const collect = (iss, side) => {
    let keys;
    if (iss.code === "unrecognized_keys" && !iss.path?.length) {
      unrecIssue ?? (unrecIssue = iss);
      keys = iss.keys;
    } else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
      const k = String(iss.path[0]);
      if (!keyIssues.has(k))
        keyIssues.set(k, iss);
      keys = [k];
    } else {
      return false;
    }
    for (const k of keys) {
      if (!unrecKeys.has(k))
        unrecKeys.set(k, {});
      unrecKeys.get(k)[side] = true;
    }
    return true;
  };
  for (const iss of left.issues) {
    if (!collect(iss, "l"))
      result.issues.push(iss);
  }
  for (const iss of right.issues) {
    if (!collect(iss, "r"))
      result.issues.push(iss);
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length) {
    const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
    if (aggregated.length)
      result.issues.push({ ...unrecIssue, keys: aggregated });
    for (const k of bothKeys) {
      if (!aggregated.includes(k) && keyIssues.has(k))
        result.issues.push(keyIssues.get(k));
    }
  }
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    if (aborted(result))
      return result;
    throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    const values = def.keyType._zod.values;
    if (values && !def.partial) {
      payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
      const recordKeys = new Set;
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          recordKeys.add(typeof key === "number" ? key.toString() : key);
          if (key === "__proto__")
            continue;
          const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          if (keyResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (keyResult.issues.length) {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
            continue;
          }
          const outKey = keyResult.value;
          if (outKey === "__proto__")
            continue;
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result) => {
              if (result.issues.length) {
                payload.issues.push(...prefixIssues(key, result.issues));
              }
              payload.value[outKey] = result.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[outKey] = result.value;
          }
        }
      }
      let unrecognized;
      for (const key in input) {
        if (!recordKeys.has(key)) {
          if (def.mode === "loose") {
            if (key === "__proto__")
              continue;
            payload.value[key] = input[key];
          } else {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          }
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized,
          continue: true
        });
      }
    } else {
      payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
      let unrecognized;
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__")
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(input, key))
          continue;
        let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
        if (checkNumericKey) {
          const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
          if (retryResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (retryResult.issues.length === 0) {
            keyResult = retryResult;
          }
        }
        if (keyResult.issues.length) {
          if (def.mode === "loose") {
            payload.value[key] = input[key];
          } else if (values) {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          } else {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
          }
          continue;
        }
        const outKey = keyResult.value;
        if (outKey === "__proto__")
          continue;
        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result) => {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[outKey] = result.value;
          }));
        } else {
          if (result.issues.length) {
            payload.issues.push(...prefixIssues(key, result.issues));
          }
          payload.value[outKey] = result.value;
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized,
          continue: true
        });
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  defineLazyInternal(inst, "pattern", (zod) => {
    const patternValues = getEnumValues(zod.def.entries).filter((k) => propertyKeyTypes.has(typeof k));
    return new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
  });
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  const values = new Set(def.values);
  inst._zod.values = values;
  defineLazyInternal(inst, "pattern", (zod) => {
    const vals = zod.def.values;
    return new RegExp(vals.length ? `^(${vals.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$` : "^[^\\s\\S]$");
  });
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  globalConfig.memoizer?.guard(inst);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output) => {
        payload.value = output;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError;
    }
    payload.value = _out;
    return payload;
  };
});
function handleOptionalResult(payload, result) {
  payload.value = result.issues.length ? undefined : result.value;
  return payload;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
  inst._zod.optout = "optional";
  defineLazyInternal(inst, "values", (zod) => {
    const values = zod.def.innerType._zod.values;
    return values ? new Set([...values, undefined]) : undefined;
  });
  defineLazyInternal(inst, "pattern", (zod) => {
    const pattern = zod.def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === undefined) {
      if (def.innerType._zod.optin !== "defaulted")
        return payload;
      const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
      if (result instanceof Promise)
        return result.then((result) => handleOptionalResult(payload, result));
      return handleOptionalResult(payload, result);
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
  defineLazyInternal(inst, "pattern", (zod) => {
    const pattern = zod.def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
  });
  defineLazyInternal(inst, "values", (zod) => {
    return zod.def.innerType._zod.values ? new Set([...zod.def.innerType._zod.values, null]) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "defaulted";
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleDefaultResult(result, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "defaulted";
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => {
    const v = zod.def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleNonOptionalResult(result, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === undefined) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
function handleCatchResult(payload, result, def, ctx) {
  if (!result.issues.length) {
    payload.value = result.value;
    if (result.memo)
      payload.memo = true;
    return payload;
  }
  payload.value = def.catchValue({
    ...result,
    value: payload.value,
    error: {
      issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
    },
    input: payload.value
  });
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleCatchResult(payload, result, def, ctx));
    }
    return handleCatchResult(payload, result, def, ctx);
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
  defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
  defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right) => handlePipeResult(right, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left) => handlePipeResult(left, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  if (!payload.memo)
    payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodLazy = /* @__PURE__ */ $constructor("$ZodLazy", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "innerType", () => {
    const d = def;
    if (!d._cachedInner)
      d._cachedInner = def.getter();
    return d._cachedInner;
  });
  defineLazyInternal(inst, "pattern", (zod) => zod.innerType?._zod?.pattern);
  defineLazyInternal(inst, "propValues", (zod) => zod.innerType?._zod?.propValues);
  defineLazyInternal(inst, "optin", (zod) => zod.innerType?._zod?.optin ?? undefined);
  defineLazyInternal(inst, "optout", (zod) => zod.innerType?._zod?.optout ?? undefined);
  inst._zod.parse = (payload, ctx) => {
    const inner = inst._zod.innerType;
    return inner._zod.run(payload, ctx);
  };
});
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r) => handleRefineResult(r, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      path: [...inst._zod.def.path ?? []],
      continue: !inst._zod.def.abort
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/memoizer.js
class $ZodCyclicError extends Error {
  constructor() {
    super(`Cannot parse a reference cycle that closes through a transform`);
    this.name = "ZodCyclicError";
  }
}
var STATE = "~memo";
var NO_ISSUES = [];
function isRef(value) {
  return value !== null && typeof value === "object";
}
function cloneIssues(issues) {
  return issues.map((iss) => iss.path ? { ...iss, path: iss.path.slice() } : { ...iss });
}
var recursive = /* @__PURE__ */ new WeakMap;
var NONE = 0;
var ASSUMED = 1;
var PROVEN = 2;
function isRecursive(inst, stack, resolve) {
  const cached = recursive.get(inst);
  if (cached !== undefined)
    return cached ? PROVEN : NONE;
  if (stack.has(inst))
    return PROVEN;
  stack.add(inst);
  let result = NONE;
  const check = (child) => {
    if (result !== PROVEN && child?._zod) {
      const answer = isRecursive(child, stack, resolve);
      if (answer > result)
        result = answer;
    }
  };
  const shape = (sh, spread) => {
    let answer = NONE;
    for (const key of Reflect.ownKeys(sh)) {
      const desc = Object.getOwnPropertyDescriptor(sh, key);
      if (spread && !desc.enumerable)
        continue;
      const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
      if (child > answer)
        answer = child;
    }
    return answer;
  };
  const merge = (answer) => {
    if (answer > result)
      result = answer;
  };
  const def = inst._zod.def;
  const kind = def.type;
  switch (kind) {
    case "object": {
      const raw = rawShape(def);
      merge(raw ? shape(raw, true) : ASSUMED);
      check(def.catchall);
      break;
    }
    case "array":
      check(def.element);
      break;
    case "tuple":
      for (const el of def.items)
        check(el);
      check(def.rest);
      break;
    case "record":
    case "map":
      check(def.keyType);
      check(def.valueType);
      break;
    case "set":
      check(def.valueType);
      break;
    case "union":
      for (const el of def.options)
        check(el);
      break;
    case "intersection":
      check(def.left);
      check(def.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      check(def.innerType);
      break;
    case "pipe":
      check(def.in);
      check(def.out);
      break;
    case "function":
      check(def.input);
      check(def.output);
      break;
    case "lazy": {
      const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : undefined);
      merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
      break;
    }
    case "template_literal":
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default: {
      for (const key in def) {
        const desc = Object.getOwnPropertyDescriptor(def, key);
        if (!desc || desc.get)
          continue;
        const value = desc.value;
        if (!value || typeof value !== "object")
          continue;
        if (value._zod)
          check(value);
        else if (Array.isArray(value))
          for (const el of value)
            check(el);
      }
    }
  }
  stack.delete(inst);
  return settle(inst, result);
}
function settle(inst, answer) {
  if (answer !== ASSUMED)
    recursive.set(inst, answer === PROVEN);
  return answer;
}
function bucketFor(state, inst) {
  let bucket = state.buckets.get(inst);
  if (!bucket) {
    bucket = new WeakMap;
    state.buckets.set(inst, bucket);
  }
  return bucket;
}
var handoff;
var open = [];
var memo = {
  alloc(_inst, payload, empty) {
    const bucket = handoff;
    if (!bucket)
      return empty;
    handoff = undefined;
    const entry = { value: empty, issues: null };
    bucket.set(payload.value, entry);
    open.push(entry);
    return empty;
  },
  guard(inst) {
    var _a;
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;
      const wrapped = (payload, ctx) => {
        if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value))
          throw new $ZodCyclicError;
        return base(payload, ctx);
      };
      inst._zod.parse = wrapped;
      if (inst._zod.run === base)
        inst._zod.run = wrapped;
    });
  },
  attach(inst) {
    var _a;
    let isRecursiveInst;
    let rechecked = false;
    let lastCtx;
    let lastBucket;
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;
      const wrapped = (payload, ctx) => {
        if (isRecursiveInst === undefined) {
          const walked = isRecursive(inst, new Set, false);
          if (walked === NONE) {
            inst._zod.parse = base;
            if (inst._zod.run === wrapped)
              inst._zod.run = base;
            return base(payload, ctx);
          }
          if (walked === PROVEN || rechecked)
            isRecursiveInst = true;
          else
            rechecked = true;
        }
        const input = payload.value;
        if (!isRef(input))
          return base(payload, ctx);
        let state = ctx[STATE];
        if (!state) {
          state = { buckets: new WeakMap, backEdges: undefined };
          ctx[STATE] = state;
        }
        let bucket;
        if (lastCtx === ctx) {
          bucket = lastBucket;
        } else {
          bucket = bucketFor(state, inst);
          lastCtx = ctx;
          lastBucket = bucket;
        }
        const hit = bucket.get(input);
        if (hit) {
          payload.value = hit.value;
          if (hit.issues) {
            if (hit.issues.length)
              payload.issues.push(...cloneIssues(hit.issues));
          } else {
            payload.memo = true;
            state.backEdges ?? (state.backEdges = new WeakSet);
            state.backEdges.add(hit.value);
          }
          return payload;
        }
        handoff = bucket;
        const depth = open.length;
        const result = base(payload, ctx);
        handoff = undefined;
        const entry = open.length > depth ? open.pop() : undefined;
        if (result instanceof Promise) {
          return result.then((r) => {
            if (entry)
              entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
            return r;
          });
        }
        if (entry)
          entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
        return result;
      };
      inst._zod.parse = wrapped;
      if (inst._zod.run === base)
        inst._zod.run = wrapped;
    });
  }
};
function memoizer() {
  return memo;
}
function isBackEdge(ctx, value) {
  const backEdges = ctx[STATE]?.backEdges;
  return backEdges !== undefined && isRef(value) && backEdges.has(value);
}
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/locales/en.js
var error = () => {
  const Sizable = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    currency_code: "currency code",
    credit_card: "credit card number",
    iban: "IBAN",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  function getTypeName(type, input) {
    if (type === "number" && typeof input === "number" && !Number.isFinite(input)) {
      return String(input);
    }
    return TypeDictionary[type] ?? type;
  }
  return (issue) => {
    switch (issue.code) {
      case "invalid_type": {
        const expected = getTypeName(issue.expected);
        const receivedType = parsedType(issue.input);
        const received = getTypeName(receivedType, issue.input);
        return `Invalid input: expected ${expected}, received ${received}`;
      }
      case "invalid_value":
        if (issue.values.length === 1)
          return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
        return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
      case "too_big": {
        const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing)
          return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
        return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
        }
        return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue;
        if (_issue.format === "starts_with") {
          return `Invalid string: must start with "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Invalid string: must end with "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Invalid string: must include "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Invalid string: must match pattern ${_issue.pattern}`;
        return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${issue.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${issue.origin}`;
      case "invalid_union":
        if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
          const opts = issue.options.map((o) => `'${o}'`).join(" | ");
          return `Invalid discriminator value. Expected ${opts}`;
        }
        if (issue.inclusive === false) {
          return "Invalid input: more than one option matched";
        }
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${issue.origin}`;
      default:
        return `Invalid input`;
    }
  };
};
function en_default() {
  return {
    localeError: error()
  };
}
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/registries.js
var _a2;
class $ZodRegistry {
  constructor() {
    this._map = new WeakMap;
    this._idmap = new Map;
  }
  add(schema, ..._meta) {
    const meta = _meta[0];
    this._map.set(schema, meta);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.set(meta.id, schema);
    }
    return this;
  }
  clear() {
    this._map = new WeakMap;
    this._idmap = new Map;
    return this;
  }
  remove(schema) {
    const meta = this._map.get(schema);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.delete(meta.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : undefined;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
}
function registry() {
  return new $ZodRegistry;
}
(_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/api.js
function snapshotChecks(def) {
  if (def.checks)
    def.checks = [...def.checks];
  return def;
}
function _string(Class, params) {
  return new Class(snapshotChecks({ type: "string", ...normalizeParams(params) }));
}
function _email(Class, params) {
  return new Class({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _guid(Class, params) {
  return new Class({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuid(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuidv4(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
function _uuidv6(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
function _uuidv7(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
function _url(Class, params) {
  return new Class({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _emoji2(Class, params) {
  return new Class({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _nanoid(Class, params) {
  return new Class({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid(Class, params) {
  return new Class({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid2(Class, params) {
  return new Class({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ulid(Class, params) {
  return new Class({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _xid(Class, params) {
  return new Class({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ksuid(Class, params) {
  return new Class({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv4(Class, params) {
  return new Class({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv6(Class, params) {
  return new Class({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv4(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv6(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64(Class, params) {
  return new Class({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64url(Class, params) {
  return new Class({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _e164(Class, params) {
  return new Class({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _jwt(Class, params) {
  return new Class({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _isoDateTime(Class, params) {
  return new Class({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDate(Class, params) {
  return new Class({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _isoTime(Class, params) {
  return new Class({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDuration(Class, params) {
  return new Class({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _number(Class, params) {
  return new Class(snapshotChecks({ type: "number", checks: [], ...normalizeParams(params) }));
}
function _int(Class, params) {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
function _unknown(Class) {
  return new Class({
    type: "unknown"
  });
}
function _never(Class, params) {
  return new Class({
    type: "never",
    ...normalizeParams(params)
  });
}
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
function _normalize(form) {
  return _overwrite((input) => input.normalize(form));
}
function _trim() {
  return _overwrite((input) => input.trim());
}
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase());
}
function _slugify() {
  return _overwrite((input) => slugify(input));
}
function _array(Class, element, params) {
  return new Class({
    type: "array",
    element,
    ...normalizeParams(params)
  });
}
function _refine(Class, fn, _params) {
  const schema = new Class({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
function _superRefine(fn, params) {
  const ch = _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        if (!("input" in _issue))
          _issue.input = payload.value;
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function assignProps(target, ...sources) {
  for (const source of sources) {
    for (const key of Reflect.ownKeys(source)) {
      if (Object.prototype.propertyIsEnumerable.call(source, key)) {
        assignProp(target, key, source[key]);
      }
    }
  }
  return target;
}
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {}),
    io: params?.io ?? "output",
    counter: 0,
    seen: new Map,
    sharedDefsExtractedFor: undefined,
    sharedEmitDoneFor: undefined,
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    intersections: [],
    deferred: [],
    external: params?.external ?? undefined
  };
}
function handleUnrepresentable(schema, ctx, json, params, message) {
  const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({ zodSchema: schema, path: params.path, message }) : ctx.unrepresentable;
  if (result === "any")
    return false;
  if (result === undefined || result === "throw")
    throw new Error(message);
  Object.assign(json, result);
  return true;
}
function processSchema(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
  ctx.seen.set(schema, result);
  ctx.sharedDefsExtractedFor = undefined;
  ctx.sharedEmitDoneFor = undefined;
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      processSchema(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta = ctx.metadataRegistry.get(schema);
  if (meta)
    assignProps(result.schema, meta);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result.schema)
    (_a = result.schema).default ?? (_a.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function encodeJSONPointerSegment(segment) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external)
    return;
  const idToSchema = new Map;
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id) => id);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}` };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    if (entry[1] === root && !entry[1].schema.id) {
      return { ref: uriPrefix };
    }
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + encodeJSONPointerSegment(defId) };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema = seen.schema;
    for (const key in schema) {
      delete schema[key];
    }
    schema.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error("Cycle detected: " + `#/${seen.cycle?.join("/")}/<root>` + '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
      }
    }
  }
  if (ctx.external)
    ctx.sharedDefsExtractedFor = ctx.external;
}
function compactTypeUnion(schema) {
  const options = schema.anyOf;
  if (!Array.isArray(options) || options.length === 0 || schema.type !== undefined)
    return;
  const types = [];
  for (const option of options) {
    if (!option || typeof option !== "object")
      return;
    compactTypeUnion(option);
    const keys = Object.keys(option);
    if (keys.length !== 1 || keys[0] !== "type")
      return;
    const type = option.type;
    for (const member of Array.isArray(type) ? type : [type]) {
      if (typeof member !== "string")
        return;
      if (!types.includes(member))
        types.push(member);
    }
  }
  delete schema.anyOf;
  schema.type = types.length === 1 ? types[0] : types;
}
var FOLDABLE_KEYS = new Set(["type", "properties", "required", "additionalProperties"]);
var UNION_KEYS = ["oneOf", "anyOf"];
function undeclaredConstraint(member) {
  const extra = member.additionalProperties;
  if (extra === undefined || extra === false || typeof extra !== "object" || extra === null)
    return null;
  return Object.keys(extra).length ? extra : null;
}
function foldObjects(members) {
  const objects = [];
  for (const member of members) {
    if (typeof member !== "object" || member.type !== "object")
      return null;
    for (const key in member) {
      if (!FOLDABLE_KEYS.has(key))
        return null;
    }
    objects.push(member);
  }
  const properties = {};
  const required = new Set;
  for (const object of objects) {
    for (const key in object.properties) {
      if (Object.prototype.hasOwnProperty.call(properties, key))
        continue;
      const parts = [];
      for (const other of objects) {
        const part = other.properties?.[key] ?? undeclaredConstraint(other);
        if (part === null || part === undefined)
          continue;
        if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part)))
          parts.push(part);
      }
      const merged = parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts };
      assignProp(properties, key, merged);
    }
    for (const key of object.required ?? [])
      required.add(key);
  }
  const folded = { type: "object", properties };
  if (required.size)
    folded.required = [...required];
  if (objects.every((object) => object.additionalProperties === false)) {
    folded.additionalProperties = false;
  } else {
    const constraints = [];
    for (const object of objects) {
      const constraint = undeclaredConstraint(object);
      if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint)))
        constraints.push(constraint);
    }
    if (constraints.length === 1)
      folded.additionalProperties = constraints[0];
    else if (constraints.length > 1)
      folded.additionalProperties = { allOf: constraints };
  }
  return folded;
}
function foldIntersection(json) {
  const allOf = json.allOf;
  if (!Array.isArray(allOf) || allOf.length < 2)
    return;
  for (const key of FOLDABLE_KEYS)
    if (key in json)
      return;
  const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
  let folded = null;
  if (!unions.length) {
    folded = foldObjects(allOf);
  } else {
    const union = unions[0];
    const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
    if (Object.keys(union).length !== 1)
      return;
    const rest = allOf.filter((m) => m !== union);
    const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
    if (branches.some((b) => !b))
      return;
    folded = { [keyword]: branches };
  }
  if (!folded)
    return;
  delete json.allOf;
  assignProps(json, folded);
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema = seen.def ?? seen.schema;
    const _cached = { ...schema };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema.allOf = schema.allOf ?? [];
        schema.allOf.push(refSchema);
      } else {
        assignProps(schema, refSchema);
      }
      assignProps(schema, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema,
      path: seen.path ?? []
    });
  };
  if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
    for (const entry of [...ctx.seen.entries()].reverse()) {
      flattenRef(entry[0]);
    }
    if (ctx.target !== "openapi-3.0") {
      for (const entry of ctx.seen.entries()) {
        compactTypeUnion(entry[1].def ?? entry[1].schema);
      }
    }
    for (const rewrite of ctx.deferred)
      rewrite();
    if (ctx.intersections.length) {
      const carriers = new Map;
      for (const seen of ctx.seen.values()) {
        for (const json of [seen.schema, seen.def]) {
          const allOf = json?.allOf;
          if (!Array.isArray(allOf))
            continue;
          const existing = carriers.get(allOf);
          if (existing)
            existing.push(json);
          else
            carriers.set(allOf, [json]);
        }
      }
      for (const allOf of ctx.intersections) {
        for (const json of carriers.get(allOf) ?? [])
          foldIntersection(json);
      }
    }
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {}
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== undefined && result.id === rootMetaId)
    delete result.id;
  const defs = ctx.external?.defs ?? {};
  if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.def && seen.defId) {
        if (seen.def.id === seen.defId)
          delete seen.def.id;
        assignProp(defs, seen.defId, seen.def);
      }
    }
  }
  if (ctx.external)
    ctx.sharedEmitDoneFor = ctx.external;
  if (ctx.external) {} else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: new Set };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  processSchema(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  processSchema(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/core/json-schema-processors.js
var narrowMin = (agg, key, value) => {
  if (agg[key] === undefined || value > agg[key])
    agg[key] = value;
};
var narrowMax = (agg, key, value) => {
  if (agg[key] === undefined || value < agg[key])
    agg[key] = value;
};
var narrowBoth = (agg, value) => {
  narrowMin(agg, "minimum", value);
  narrowMax(agg, "maximum", value);
};
var addDivisor = (agg, value) => {
  agg.multipleOf ?? (agg.multipleOf = []);
  if (!agg.multipleOf.includes(value))
    agg.multipleOf.push(value);
};
var addPattern = (agg, pattern) => {
  agg.patterns ?? (agg.patterns = new Set);
  agg.patterns.add(pattern);
};
var intersectMime = (agg, mime) => {
  agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
};
var setFormat = (agg, format) => {
  agg.format = format;
  if (format.includes("int"))
    agg.isInt = true;
};
var minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
var maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
var formatContributor = (ranges) => (agg, def) => {
  setFormat(agg, def.format);
  const [minimum, maximum] = ranges[def.format];
  narrowMin(agg, "minimum", minimum);
  narrowMax(agg, "maximum", maximum);
};
var contributors = {
  greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
  less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
  multiple_of: (agg, def) => addDivisor(agg, def.value),
  number_format: formatContributor(NUMBER_FORMAT_RANGES),
  bigint_format: formatContributor(BIGINT_FORMAT_RANGES),
  min_length: minContributor,
  max_length: maxContributor,
  length_equals: (agg, def) => narrowBoth(agg, def.length),
  min_size: minContributor,
  max_size: maxContributor,
  size_equals: (agg, def) => narrowBoth(agg, def.size),
  string_format: (agg, def) => {
    setFormat(agg, def.format);
    if (def.pattern)
      addPattern(agg, def.pattern);
    if (def.format === "base64" || def.format === "base64url")
      agg.contentEncoding = def.format;
    if (def.local || def.precision === -1)
      agg.laxFormat = true;
  },
  mime_type: (agg, def) => intersectMime(agg, def.mime)
};
function aggregateChecks(schema) {
  const agg = {};
  const def = schema._zod.def;
  const list = schema._zod.traits.has("$ZodCheck") ? [schema, ...def.checks ?? []] : def.checks ?? [];
  for (const ch of list)
    contributors[ch._zod.def.check]?.(agg, ch._zod.def);
  const bag = schema._zod.bag;
  if (bag.minimum !== undefined)
    narrowMin(agg, "minimum", bag.minimum);
  if (bag.exclusiveMinimum !== undefined)
    narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
  if (bag.maximum !== undefined)
    narrowMax(agg, "maximum", bag.maximum);
  if (bag.exclusiveMaximum !== undefined)
    narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
  if (bag.multipleOf !== undefined)
    addDivisor(agg, bag.multipleOf);
  if (bag.format !== undefined) {
    agg.format ?? (agg.format = bag.format);
    if (bag.format.includes("int"))
      agg.isInt = true;
  }
  if (bag.mime)
    intersectMime(agg, bag.mime);
  for (const pattern of bag.patterns ?? [])
    addPattern(agg, pattern);
  return agg;
}
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
};
var exactPatterns = new Map([
  [base64Charset, base64],
  [base64urlCharset, base64url]
]);
var exactPattern = (p) => exactPatterns.get(p) ?? p;
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time" || laxFormat) {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const patternList = [...patterns].map(exactPattern);
    if (patternList.length === 1)
      json.pattern = patternList[0].source;
    else if (patternList.length > 1) {
      json.allOf = [
        ...patternList.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
  json.type = isInt ? "integer" : "number";
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }
  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }
  if (multipleOf) {
    const divisors = new Set;
    for (const divisor of multipleOf) {
      if (Number.isFinite(divisor) && divisor !== 0)
        divisors.add(Math.abs(divisor));
      else
        handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
    }
    const [first, ...rest] = divisors;
    if (first !== undefined)
      json.multipleOf = first;
    if (rest.length)
      json.allOf = [...json.allOf ?? [], ...rest.map((m) => ({ multipleOf: m }))];
  }
};
var neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {};
var enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.length === 0) {
    json.not = {};
    return;
  }
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
var literalProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  if (def.values.length === 0) {
    json.not = {};
    return;
  }
  const vals = [];
  for (const val of def.values) {
    if (val === undefined) {
      if (handleUnrepresentable(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema"))
        return;
    } else if (typeof val === "bigint") {
      if (handleUnrepresentable(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema"))
        return;
      vals.push(Number(val));
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {} else if (vals.length === 1) {
    const val = vals[0];
    json.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.enum = [val];
    } else {
      json.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json.type = "boolean";
    if (vals.every((v) => v === null))
      json.type = "null";
    json.enum = vals;
  }
};
var customProcessor = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};
var transformProcessor = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = aggregateChecks(schema);
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = processSchema(def.element, ctx, {
    ...params,
    path: [...params.path, "items"]
  });
};
function inputOptin(schema) {
  const def = schema._zod.def;
  if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) {
    return inputOptin(def.out);
  }
  if (def.type === "catch") {
    return inputOptin(def.innerType);
  }
  return schema._zod.optin;
}
var objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const shape = def.shape;
  const symbolKeys = Object.getOwnPropertySymbols(shape);
  if (symbolKeys.length && handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) {
    return;
  }
  json.type = "object";
  json.properties = {};
  for (const key in shape) {
    assignProp(json.properties, key, processSchema(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    }));
  }
  const requiredKeys = [];
  for (const key of Object.keys(shape)) {
    const field = def.shape[key];
    if (ctx.io === "input" ? inputOptin(field) === undefined : field._zod.optout === undefined) {
      requiredKeys.push(key);
    }
  }
  if (requiredKeys.length > 0) {
    json.required = requiredKeys;
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = processSchema(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => processSchema(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = processSchema(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = processSchema(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => ("allOf" in val) && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
  ctx.intersections.push(allOf);
};
function stringifyKeyNames(bySchema, json, visited) {
  if (json.$ref) {
    if (visited.has(json))
      return json;
    visited.add(json);
    const def = bySchema.get(json)?.def;
    if (!def)
      return json;
    const inlined = stringifyKeyNames(bySchema, def, visited);
    return inlined === def ? json : inlined;
  }
  for (const keyword of ["anyOf", "oneOf"]) {
    const branches = json[keyword];
    if (!Array.isArray(branches))
      continue;
    const mapped = branches.map((branch) => stringifyKeyNames(bySchema, branch, visited));
    if (mapped.some((branch, i) => branch !== branches[i]))
      json = { ...json, [keyword]: mapped };
  }
  const types = Array.isArray(json.type) ? json.type : [json.type];
  const numericType = !types.includes("string") && types.some((t) => t === "number" || t === "integer");
  const values = json.enum ?? (json.const !== undefined ? [json.const] : undefined);
  if (!numericType && !values?.some((v) => typeof v === "number"))
    return json;
  const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, format, id, ...rest } = json;
  if (rest.enum)
    rest.enum = rest.enum.map((v) => typeof v === "number" ? String(v) : v);
  else if (typeof rest.const === "number")
    rest.const = String(rest.const);
  if (!numericType)
    return rest;
  rest.type = "string";
  if (!values)
    rest.pattern = (types.includes("number") ? number : integer).source;
  return rest;
}
var pendingRecords = new WeakMap;
function rewriteKeyNames(ctx) {
  const bySchema = new Map;
  for (const entry of ctx.seen.values()) {
    if (entry.def && !bySchema.has(entry.schema))
      bySchema.set(entry.schema, entry);
  }
  const rewrites = new Map;
  for (const record of pendingRecords.get(ctx) ?? []) {
    const seen = ctx.seen.get(record);
    const names = (seen?.def ?? seen?.schema)?.propertyNames;
    if (!names || names === true || rewrites.has(names))
      continue;
    const rewritten = stringifyKeyNames(bySchema, names, new Set);
    if (rewritten !== names)
      rewrites.set(names, rewritten);
  }
  if (!rewrites.size)
    return;
  for (const entry of ctx.seen.values()) {
    for (const carrier of [entry.schema, entry.def]) {
      const rewritten = carrier && rewrites.get(carrier.propertyNames);
      if (rewritten)
        carrier.propertyNames = rewritten;
    }
  }
}
var recordProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  const keyType = def.keyType;
  const patterns = aggregateChecks(keyType).patterns;
  if (def.mode === "loose" && patterns && patterns.size > 0) {
    const valueSchema = processSchema(def.valueType, ctx, {
      ...params,
      path: [...params.path, "patternProperties", "*"]
    });
    json.patternProperties = {};
    for (const pattern of patterns) {
      assignProp(json.patternProperties, exactPattern(pattern).source, valueSchema);
    }
  } else {
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json.propertyNames = processSchema(def.keyType, ctx, {
        ...params,
        path: [...params.path, "propertyNames"]
      });
      let pending = pendingRecords.get(ctx);
      if (!pending) {
        pending = [];
        pendingRecords.set(ctx, pending);
        ctx.deferred.push(() => rewriteKeyNames(ctx));
      }
      pending.push(schema);
    }
    json.additionalProperties = processSchema(def.valueType, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
  const keyValues = keyType._zod.values;
  const omittableOnInput = ctx.io === "input" && inputOptin(def.valueType) !== undefined;
  if (keyValues && !def.partial && !omittableOnInput) {
    const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
    if (validKeyValues.length > 0) {
      json.required = validKeyValues.map(String);
    }
  }
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(value, schema, ctx, json, params) {
  let unrepresentable = false;
  const serialized = JSON.stringify(value, (_, val) => {
    if (typeof val !== "bigint")
      return val;
    unrepresentable = true;
    return null;
  });
  if (!unrepresentable)
    return JSON.parse(serialized);
  handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
  return UNREPRESENTABLE_DEFAULT;
}
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
  if (value !== UNREPRESENTABLE_DEFAULT)
    json.default = value;
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io !== "input")
    return;
  const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
  if (value !== UNREPRESENTABLE_DEFAULT)
    json._prefault = value;
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(undefined);
  } catch {
    handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
  processSchema(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var lazyProcessor = (schema, ctx, _json, params) => {
  const innerType = schema._zod.innerType;
  processSchema(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/classic/errors.js
var _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function _lazyMethod(proto, key, make) {
  Object.defineProperty(proto, key, {
    configurable: true,
    enumerable: false,
    get() {
      const value = make(this);
      Object.defineProperty(this, key, { value, configurable: true, writable: true });
      return value;
    },
    set(value) {
      Object.defineProperty(this, key, { value, configurable: true, writable: true });
    }
  });
}
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  const proto = Object.getPrototypeOf(inst);
  if (_installedErrorProtos.has(proto))
    return;
  _installedErrorProtos.add(proto);
  _lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
  _lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
  _lazyMethod(proto, "addIssue", (self) => (issue) => {
    self.issues.push(issue);
    self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
  });
  _lazyMethod(proto, "addIssues", (self) => (issues) => {
    self.issues.push(...issues);
    self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
  });
  Object.defineProperty(proto, "isEmpty", {
    configurable: true,
    enumerable: false,
    get() {
      return this.issues.length === 0;
    }
  });
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, undefined, {
  Parent: Error
});

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/classic/parse.js
var parse2 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// node_modules/.bun/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function _ensureDefaultLocale() {
  if (!globalConfig.localeError)
    config(en_default());
}
function _ensureDefaultMemoizer() {
  if (!globalConfig.memoizer)
    config({ memoizer: memoizer() });
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  _ensureDefaultLocale();
  $ZodType.init(inst, def);
  inst.def = def;
  inst.type = def.type;
  return inst;
}, {
  check(...chks) {
    const def = this.def;
    return this.clone(mergeDefs(def, {
      checks: [
        ...def.checks ?? [],
        ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
      ]
    }), { parent: true });
  },
  with(...chks) {
    return this.check(...chks);
  },
  clone(def, params) {
    return clone(this, def, params);
  },
  brand() {
    return this;
  },
  register(reg, meta) {
    reg.add(this, meta);
    return this;
  },
  refine(check, params) {
    return this.check(refine(check, params));
  },
  superRefine(refinement, params) {
    return this.check(superRefine(refinement, params));
  },
  overwrite(fn) {
    return this.check(_overwrite(fn));
  },
  optional() {
    return optional(this);
  },
  exactOptional() {
    return exactOptional(this);
  },
  nullable() {
    return nullable(this);
  },
  nullish() {
    return optional(nullable(this));
  },
  nonoptional(params) {
    return nonoptional(this, params);
  },
  array() {
    return array(this);
  },
  or(arg) {
    return union([this, arg]);
  },
  and(arg) {
    return intersection(this, arg);
  },
  transform(tx) {
    return pipe(this, transform(tx));
  },
  default(d) {
    return _default(this, d);
  },
  prefault(d) {
    return prefault(this, d);
  },
  catch(params) {
    return _catch(this, params);
  },
  pipe(target) {
    return pipe(this, target);
  },
  readonly() {
    return readonly(this);
  },
  describe(description) {
    const cl = this.clone();
    globalRegistry.add(cl, { description });
    return cl;
  },
  meta(...args) {
    if (args.length === 0)
      return globalRegistry.get(this);
    const cl = this.clone();
    globalRegistry.add(cl, args[0]);
    return cl;
  },
  isOptional() {
    return this.safeParse(undefined).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(fn, ...args) {
    return args.length === 0 ? fn(this) : fn(this, ...args);
  },
  get "~standard"() {
    return hide(this, "~standard", {
      ...standardProps(this),
      jsonSchema: {
        input: createStandardJSONSchemaMethod(this, "input"),
        output: createStandardJSONSchemaMethod(this, "output")
      }
    });
  },
  set "~standard"(value) {
    own(this, "~standard", value);
  },
  parse: function _parse(data, params) {
    return parse2(this, data, params, { callee: _parse });
  },
  parseAsync: async function _parseAsync(data, params) {
    return await parseAsync(this, data, params, { callee: _parseAsync });
  },
  safeParse(data, params) {
    return safeParse(this, data, params);
  },
  async safeParseAsync(data, params) {
    return safeParseAsync(this, data, params);
  },
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(value) {
    own(this, "spa", value);
  },
  validate(data, params) {
    return validate(this, data, params);
  },
  validateAsync(data, params) {
    return validateAsync(this, data, params);
  },
  encode: function _encode(data, params) {
    return encode(this, data, params, { callee: _encode });
  },
  decode: function _decode(data, params) {
    return decode(this, data, params, { callee: _decode });
  },
  encodeAsync: async function _encodeAsync(data, params) {
    return await encodeAsync(this, data, params, { callee: _encodeAsync });
  },
  decodeAsync: async function _decodeAsync(data, params) {
    return await decodeAsync(this, data, params, { callee: _decodeAsync });
  },
  safeEncode(data, params) {
    return safeEncode(this, data, params);
  },
  safeDecode(data, params) {
    return safeDecode(this, data, params);
  },
  async safeEncodeAsync(data, params) {
    return safeEncodeAsync(this, data, params);
  },
  async safeDecodeAsync(data, params) {
    return safeDecodeAsync(this, data, params);
  },
  toJSONSchema(params) {
    return createToJSONSchemaMethod(this, {})(params);
  },
  get description() {
    return globalRegistry.get(this)?.description;
  },
  get _def() {
    return this._zod.def;
  }
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
}, /* @__PURE__ */ derived({
  format: (inst) => aggregateChecks(inst).format ?? null,
  minLength: (inst) => aggregateChecks(inst).minimum ?? null,
  maxLength: (inst) => aggregateChecks(inst).maximum ?? null
}, {
  regex(...args) {
    return this.check(_regex(...args));
  },
  includes(...args) {
    return this.check(_includes(...args));
  },
  startsWith(...args) {
    return this.check(_startsWith(...args));
  },
  endsWith(...args) {
    return this.check(_endsWith(...args));
  },
  min(...args) {
    return this.check(_minLength(...args));
  },
  max(...args) {
    return this.check(_maxLength(...args));
  },
  length(...args) {
    return this.check(_length(...args));
  },
  nonempty(...args) {
    return this.check(_minLength(1, ...args));
  },
  lowercase(params) {
    return this.check(_lowercase(params));
  },
  uppercase(params) {
    return this.check(_uppercase(params));
  },
  trim() {
    return this.check(_trim());
  },
  normalize(...args) {
    return this.check(_normalize(...args));
  },
  toLowerCase() {
    return this.check(_toLowerCase());
  },
  toUpperCase() {
    return this.check(_toUpperCase());
  },
  slugify() {
    return this.check(_slugify());
  }
}));
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
}, {
  email(params) {
    return this.check(_email(ZodEmail, params));
  },
  url(params) {
    return this.check(_url(ZodURL, params));
  },
  jwt(params) {
    return this.check(_jwt(ZodJWT, params));
  },
  emoji(params) {
    return this.check(_emoji2(ZodEmoji, params));
  },
  guid(params) {
    return this.check(_guid(ZodGUID, params));
  },
  uuid(params) {
    return this.check(_uuid(ZodUUID, params));
  },
  uuidv4(params) {
    return this.check(_uuidv4(ZodUUID, params));
  },
  uuidv6(params) {
    return this.check(_uuidv6(ZodUUID, params));
  },
  uuidv7(params) {
    return this.check(_uuidv7(ZodUUID, params));
  },
  nanoid(params) {
    return this.check(_nanoid(ZodNanoID, params));
  },
  cuid(params) {
    return this.check(_cuid(ZodCUID, params));
  },
  cuid2(params) {
    return this.check(_cuid2(ZodCUID2, params));
  },
  ulid(params) {
    return this.check(_ulid(ZodULID, params));
  },
  base64(params) {
    return this.check(_base64(ZodBase64, params));
  },
  base64url(params) {
    return this.check(_base64url(ZodBase64URL, params));
  },
  xid(params) {
    return this.check(_xid(ZodXID, params));
  },
  ksuid(params) {
    return this.check(_ksuid(ZodKSUID, params));
  },
  ipv4(params) {
    return this.check(_ipv4(ZodIPv4, params));
  },
  ipv6(params) {
    return this.check(_ipv6(ZodIPv6, params));
  },
  cidrv4(params) {
    return this.check(_cidrv4(ZodCIDRv4, params));
  },
  cidrv6(params) {
    return this.check(_cidrv6(ZodCIDRv6, params));
  },
  e164(params) {
    return this.check(_e164(ZodE164, params));
  },
  datetime(params) {
    return this.check(_isoDateTime(ZodISODateTime, params));
  },
  date(params) {
    return this.check(_isoDate(ZodISODate, params));
  },
  time(params) {
    return this.check(_isoTime(ZodISOTime, params));
  },
  duration(params) {
    return this.check(_isoDuration(ZodISODuration, params));
  }
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
  inst.isFinite = true;
}, /* @__PURE__ */ derived({
  minValue: (inst) => {
    const { minimum, exclusiveMinimum } = aggregateChecks(inst);
    return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
  },
  maxValue: (inst) => {
    const { maximum, exclusiveMaximum } = aggregateChecks(inst);
    return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
  },
  isInt: (inst) => {
    const { isInt, multipleOf } = aggregateChecks(inst);
    return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
  },
  format: (inst) => aggregateChecks(inst).format ?? null
}, {
  gt(value, params) {
    return this.check(_gt(value, params));
  },
  gte(value, params) {
    return this.check(_gte(value, params));
  },
  min(value, params) {
    return this.check(_gte(value, params));
  },
  lt(value, params) {
    return this.check(_lt(value, params));
  },
  lte(value, params) {
    return this.check(_lte(value, params));
  },
  max(value, params) {
    return this.check(_lte(value, params));
  },
  int(params) {
    return this.check(int(params));
  },
  safe(params) {
    return this.check(int(params));
  },
  positive(params) {
    return this.check(_gt(0, params));
  },
  nonnegative(params) {
    return this.check(_gte(0, params));
  },
  negative(params) {
    return this.check(_lt(0, params));
  },
  nonpositive(params) {
    return this.check(_lte(0, params));
  },
  multipleOf(value, params) {
    return this.check(_multipleOf(value, params));
  },
  step(value, params) {
    return this.check(_multipleOf(value, params));
  },
  finite() {
    return this;
  }
}));
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
}, {
  min(n, params) {
    return this.check(_minLength(n, params));
  },
  nonempty(params) {
    return this.check(_minLength(1, params));
  },
  max(n, params) {
    return this.check(_maxLength(n, params));
  },
  length(n, params) {
    return this.check(_length(n, params));
  },
  unwrap() {
    return this.element;
  }
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
}, {
  keyof() {
    return _enum(Object.keys(this._zod.def.shape));
  },
  catchall(catchall) {
    return this.clone(mergeDefs(this._zod.def, { catchall }));
  },
  passthrough() {
    return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
  },
  loose() {
    return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
  },
  strict() {
    return this.clone(mergeDefs(this._zod.def, { catchall: never() }));
  },
  strip() {
    return this.clone(mergeDefs(this._zod.def, { catchall: undefined }));
  },
  extend(incoming) {
    return extend(this, incoming);
  },
  safeExtend(incoming) {
    return safeExtend(this, incoming);
  },
  merge(other) {
    return merge(this, other);
  },
  pick(mask) {
    return pick(this, mask);
  },
  omit(mask) {
    return omit(this, mask);
  },
  partial(...args) {
    return partial(ZodOptional, this, args[0]);
  },
  exactPartial(...args) {
    return partial(ZodExactOptional, this, args[0], "exactPartial");
  },
  required(...args) {
    return required(ZodNonOptional, this, args[0]);
  }
});
function strictObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: never(),
    ...normalizeParams(params)
  });
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodRecord.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
  if (!valueType || !valueType._zod) {
    return new ZodRecord({
      type: "record",
      keyType: string2(),
      valueType: keyType,
      ...normalizeParams(valueType)
    });
  }
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...normalizeParams(params)
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = [...inst._zod.values];
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...normalizeParams(params)
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        if (!("input" in _issue))
          _issue.input = payload.value;
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output) => {
        payload.value = output;
        return payload;
      });
    }
    payload.value = output;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : constantCatch(catchValue)
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodLazy = /* @__PURE__ */ $constructor("ZodLazy", (inst, def) => {
  $ZodLazy.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => lazyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.getter();
});
function lazy(getter) {
  return new ZodLazy({
    type: "lazy",
    getter
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}
// packages/sdk/src/widgets.ts
var widgetSizeSchema = string2().regex(/^[1-4]x[1-4]$/, "Expected columns x rows, each between 1 and 4").transform((value) => value);
function widgetDimensions(size) {
  const [columns, rows] = widgetSizeSchema.parse(size).split("x").map(Number);
  return { columns, rows };
}
var textValue = union([
  string2().max(4000),
  strictObject({
    key: string2().max(160),
    args: record(string2(), union([string2().max(500), number2()])).optional()
  })
]);
var tone = _enum(["neutral", "success", "warning", "danger"]);
var node2 = lazy(() => union([
  strictObject({
    type: _enum(["row", "column", "list"]),
    gap: _enum(["xs", "sm", "md"]).optional(),
    children: array(node2).max(32)
  }),
  strictObject({
    type: literal("text"),
    text: textValue,
    variant: _enum(["title", "body", "caption"]).optional()
  }),
  strictObject({
    type: literal("metric"),
    value: union([string2().max(100), number2().finite()]),
    label: textValue.optional()
  }),
  strictObject({
    type: literal("badge"),
    text: textValue,
    tone: tone.optional()
  }),
  strictObject({
    type: literal("progress"),
    value: number2().min(0).max(1),
    label: textValue.optional()
  }),
  strictObject({ type: literal("divider") }),
  strictObject({
    type: literal("sparkline"),
    values: array(number2().finite()).min(2).max(120),
    tone: tone.optional()
  })
]));
function parseWidget(input) {
  let count = 0;
  const inspect = (value, depth) => {
    if (++count > 128 || depth > 8)
      throw new Error("Widget complexity limit");
    if (value && typeof value === "object" && "children" in value && Array.isArray(value.children))
      for (const child of value.children)
        inspect(child, depth + 1);
  };
  if (JSON.stringify(input).length > 65536)
    throw new Error("Widget size limit");
  inspect(input?.body, 0);
  return strictObject({ version: literal(1), body: node2 }).parse(input);
}

// packages/ui/src/widgets.module.css
var widgets_module_default = {
  widget: "widget_8OBq5w",
  row: "row_8OBq5w",
  column: "column_8OBq5w",
  list: "list_8OBq5w",
  title: "title_8OBq5w",
  body: "body_8OBq5w",
  caption: "caption_8OBq5w",
  metric: "metric_8OBq5w",
  badge: "badge_8OBq5w",
  divider: "divider_8OBq5w",
  progress: "progress_8OBq5w",
  sparkline: "sparkline_8OBq5w"
};

// packages/ui/src/widgets.tsx
var jsx_runtime = __toESM(require_jsx_runtime(), 1);
function Widget({
  snapshot,
  text = (value) => typeof value === "string" ? value : value.key
}) {
  let body;
  try {
    body = parseWidget(snapshot).body;
  } catch {
    return /* @__PURE__ */ jsx_runtime.jsx("span", {
      className: widgets_module_default.caption,
      children: "Invalid widget"
    });
  }
  const render = (node, key) => {
    if (node.type === "row" || node.type === "column" || node.type === "list")
      return /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: widgets_module_default[node.type],
        "data-gap": node.gap ?? "sm",
        children: node.children.map(render)
      }, key);
    if (node.type === "text")
      return /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: widgets_module_default[node.variant ?? "body"],
        children: text(node.text)
      }, key);
    if (node.type === "metric")
      return /* @__PURE__ */ jsx_runtime.jsxs("div", {
        children: [
          /* @__PURE__ */ jsx_runtime.jsx("strong", {
            className: widgets_module_default.metric,
            children: node.value
          }),
          node.label && /* @__PURE__ */ jsx_runtime.jsx("div", {
            className: widgets_module_default.caption,
            children: text(node.label)
          })
        ]
      }, key);
    if (node.type === "badge")
      return /* @__PURE__ */ jsx_runtime.jsx("span", {
        className: widgets_module_default.badge,
        "data-tone": node.tone,
        children: text(node.text)
      }, key);
    if (node.type === "divider")
      return /* @__PURE__ */ jsx_runtime.jsx("hr", {
        className: widgets_module_default.divider
      }, key);
    if (node.type === "progress")
      return /* @__PURE__ */ jsx_runtime.jsxs("div", {
        children: [
          node.label && /* @__PURE__ */ jsx_runtime.jsx("span", {
            className: widgets_module_default.caption,
            children: text(node.label)
          }),
          /* @__PURE__ */ jsx_runtime.jsx("progress", {
            className: widgets_module_default.progress,
            value: node.value,
            max: 1
          })
        ]
      }, key);
    if (node.type === "sparkline") {
      const min = Math.min(...node.values), max = Math.max(...node.values);
      const points = node.values.map((v, i) => `${i / (node.values.length - 1) * 200},${52 - (v - min) / (max - min || 1) * 45}`).join(" ");
      return /* @__PURE__ */ jsx_runtime.jsx("svg", {
        className: widgets_module_default.sparkline,
        viewBox: "0 0 200 60",
        "aria-label": "Trend",
        children: /* @__PURE__ */ jsx_runtime.jsx("polyline", {
          points,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          vectorEffect: "non-scaling-stroke"
        })
      }, key);
    }
    return null;
  };
  return /* @__PURE__ */ jsx_runtime.jsx("div", {
    className: widgets_module_default.widget,
    children: render(body, 0)
  });
}

// packages/ui/src/locales.ts
var words = {
  closing_stops_active_tasks_and: {
    en: "Closing stops active tasks and discards unsaved changes.",
    "zh-CN": "关闭应用将停止正在执行的任务，并放弃未保存的更改。"
  },
  application_disconnected: {
    en: "Application disconnected",
    "zh-CN": "应用连接已结束"
  },
  reload: {
    en: "Reload",
    "zh-CN": "重新载入"
  },
  connecting: {
    en: "Connecting…",
    "zh-CN": "正在连接…"
  },
  confirm: {
    en: "Confirm",
    "zh-CN": "确认"
  },
  cancel: {
    en: "Cancel",
    "zh-CN": "取消"
  },
  close: {
    en: "Close",
    "zh-CN": "关闭"
  }
};
var uiText = (locale, key) => words[key][locale === "zh-CN" ? "zh-CN" : "en"];

// packages/ui/src/index.tsx
var import_react2 = __toESM(require_react(), 1);

// packages/sdk/src/react.tsx
var import_react = __toESM(require_react(), 1);

// packages/ui/src/icons.tsx
var jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var paths = {
  grid: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "3",
        y: "3",
        width: "7",
        height: "7",
        rx: "1.5"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "14",
        y: "3",
        width: "7",
        height: "7",
        rx: "1.5"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "3",
        y: "14",
        width: "7",
        height: "7",
        rx: "1.5"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "14",
        y: "14",
        width: "7",
        height: "7",
        rx: "1.5"
      })
    ]
  }),
  search: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("circle", {
        cx: "10.5",
        cy: "10.5",
        r: "6.5"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "m16 16 5 5"
      })
    ]
  }),
  settings: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("circle", {
        cx: "12",
        cy: "12",
        r: "3"
      })
    ]
  }),
  sun: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("circle", {
        cx: "12",
        cy: "12",
        r: "4"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
      })
    ]
  }),
  moon: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.7 8.7 0 1 0 10.9 10.9Z"
  }),
  plus: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "M12 5v14M5 12h14"
  }),
  close: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "m6 6 12 12M6 18 18 6"
  }),
  minus: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "M5 12h14"
  }),
  expand: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"
    })
  }),
  arrow: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "M5 12h14m-5-5 5 5-5 5"
  }),
  check: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "m5 12 4 4L19 6"
  }),
  chevron: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "m8 10 4 4 4-4"
  }),
  translate: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "M3 5h12M9 3v2m4 0c0 5-4 9-9 11m1-8c1 4 4 7 8 9m1 4 4-11 4 11m-6-4h4"
    })
  }),
  note: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "4",
        y: "3",
        width: "16",
        height: "18",
        rx: "3"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "M8 8h8M8 12h8m-8 4h5"
      })
    ]
  }),
  board: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "3",
        y: "4",
        width: "18",
        height: "16",
        rx: "3"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "M9 4v16m6-16v16M6 8v3m6-3v6m6-6v2"
      })
    ]
  }),
  chart: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "M4 4v16h17M7 14l4-5 4 3 6-7"
    })
  }),
  bell: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-12 12a3 3 0 0 0 6 0"
    })
  }),
  phone: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "6",
        y: "2",
        width: "12",
        height: "20",
        rx: "3"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "M10 5h4m-3 14h2"
      })
    ]
  }),
  download: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"
    })
  }),
  refresh: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2M5 16a8 8 0 0 0 13 2"
    })
  }),
  copy: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "8",
        y: "8",
        width: "13",
        height: "13",
        rx: "2"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "M16 4V3H3v13h1"
      })
    ]
  }),
  trash: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"
    })
  }),
  pin: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "m8 3 8 0-1 7 4 4H5l4-4-1-7m4 11v7"
    })
  }),
  play: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "m8 4 12 8-12 8Z"
  }),
  stop: /* @__PURE__ */ jsx_runtime2.jsx("rect", {
    x: "5",
    y: "5",
    width: "14",
    height: "14",
    rx: "2"
  }),
  edit: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "m4 16 12-12 4 4L8 20H4Z"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "m13 7 4 4"
      })
    ]
  }),
  cloud: /* @__PURE__ */ jsx_runtime2.jsx("path", {
    d: "M7 18h11a4 4 0 0 0 1-8 7 7 0 0 0-13-1 4.5 4.5 0 0 0 1 9Z"
  }),
  help: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 3m0 3h.01"
      })
    ]
  }),
  keyboard: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("rect", {
        x: "2",
        y: "5",
        width: "20",
        height: "14",
        rx: "3"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("path", {
        d: "M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"
      })
    ]
  }),
  send: /* @__PURE__ */ jsx_runtime2.jsx(jsx_runtime2.Fragment, {
    children: /* @__PURE__ */ jsx_runtime2.jsx("path", {
      d: "m3 3 19 9-19 9 3-9-3-9Zm3 9h16"
    })
  }),
  more: /* @__PURE__ */ jsx_runtime2.jsxs(jsx_runtime2.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime2.jsx("circle", {
        cx: "5",
        cy: "12",
        r: "1"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("circle", {
        cx: "12",
        cy: "12",
        r: "1"
      }),
      /* @__PURE__ */ jsx_runtime2.jsx("circle", {
        cx: "19",
        cy: "12",
        r: "1"
      })
    ]
  })
};
function Icon({
  name,
  size = 18,
  ...props
}) {
  return /* @__PURE__ */ jsx_runtime2.jsx("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.65",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    ...props,
    children: paths[name]
  });
}

// packages/ui/src/ui.module.css
var ui_module_default = {
  button: "button_EIC9ug",
  inputWrap: "inputWrap_EIC9ug",
  input: "input_EIC9ug",
  textarea: "textarea_EIC9ug",
  checkbox: "checkbox_EIC9ug",
  dialog: "dialog_EIC9ug",
  wide: "wide_EIC9ug",
  dialogHeader: "dialogHeader_EIC9ug",
  dialogContent: "dialogContent_EIC9ug",
  menu: "menu_EIC9ug",
  select: "select_EIC9ug",
  notice: "notice_EIC9ug",
  pageHeader: "pageHeader_EIC9ug",
  surface: "surface_EIC9ug",
  toast: "toast_EIC9ug",
  actions: "actions_EIC9ug",
  failure: "failure_EIC9ug"
};

// packages/ui/src/index.tsx
var jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx_runtime3.jsx("button", {
    type: "button",
    ...props,
    "data-variant": variant,
    "data-size": size,
    className: ui_module_default.button + " " + className
  });
}
function Input({
  icon,
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx_runtime3.jsxs("span", {
    className: ui_module_default.inputWrap + " " + className,
    children: [
      icon,
      /* @__PURE__ */ jsx_runtime3.jsx("input", {
        ...props,
        className: ui_module_default.input
      })
    ]
  });
}
function Modal({
  open = true,
  title,
  children,
  onClose,
  className = "",
  contentClassName = "",
  closeLabel = uiText(typeof document !== "undefined" ? document.documentElement.lang : "en", "close"),
  wide = false
}) {
  const ref = import_react2.useRef(null), close = import_react2.useRef(onClose);
  close.current = onClose;
  const id = import_react2.useId();
  import_react2.useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement;
    if (open) {
      el.showModal();
      el.querySelector("[data-modal-autofocus]")?.focus();
    }
    const cancel = (e) => {
      e.preventDefault();
      close.current();
    };
    el.addEventListener("cancel", cancel);
    return () => {
      el.removeEventListener("cancel", cancel);
      el.close();
      previous?.focus();
    };
  }, [open]);
  return /* @__PURE__ */ jsx_runtime3.jsxs("dialog", {
    ref,
    className: ui_module_default.dialog + " " + (wide ? ui_module_default.wide : "") + " " + className,
    "aria-labelledby": id,
    onClick: (e) => {
      if (e.target !== e.currentTarget)
        return;
      const r = e.currentTarget.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        onClose();
    },
    children: [
      /* @__PURE__ */ jsx_runtime3.jsxs("header", {
        className: ui_module_default.dialogHeader,
        children: [
          /* @__PURE__ */ jsx_runtime3.jsx("h2", {
            id,
            children: title
          }),
          /* @__PURE__ */ jsx_runtime3.jsx(Button, {
            "aria-label": closeLabel,
            onClick: onClose,
            children: /* @__PURE__ */ jsx_runtime3.jsx(Icon, {
              name: "close"
            })
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("div", {
        className: ui_module_default.dialogContent + " " + contentClassName,
        children
      })
    ]
  });
}
function Menu({
  anchor,
  items,
  open,
  onClose,
  onSelect,
  align = "start",
  autoFocus = true,
  role = "menu"
}) {
  const ref = import_react2.useRef(null), target = import_react2.useRef(null);
  const close = import_react2.useRef(onClose);
  close.current = onClose;
  import_react2.useEffect(() => {
    if (!open)
      return;
    const el = ref.current, rect = target.current.getBoundingClientRect();
    el.showPopover();
    const box = el.getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(innerWidth - box.width - 8, align === "end" ? rect.right - box.width : rect.left)) + "px";
    el.style.top = Math.max(8, Math.min(innerHeight - box.height - 8, rect.bottom + 6)) + "px";
    if (autoFocus)
      (el.querySelector('button[aria-selected="true"]:not(:disabled)') ?? el.querySelector("button:not(:disabled)"))?.focus();
    const outside = (e) => {
      if (!el.contains(e.target) && !target.current?.contains(e.target))
        close.current();
    };
    document.addEventListener("pointerdown", outside, true);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      el.hidePopover();
      target.current?.querySelector("button")?.focus();
    };
  }, [open, align, autoFocus]);
  return /* @__PURE__ */ jsx_runtime3.jsxs(jsx_runtime3.Fragment, {
    children: [
      /* @__PURE__ */ jsx_runtime3.jsx("span", {
        ref: target,
        children: anchor
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("div", {
        popover: "manual",
        ref,
        className: ui_module_default.menu,
        role,
        onKeyDown: (e) => {
          const rows = [
            ...e.currentTarget.querySelectorAll("button:not(:disabled)")
          ];
          const index = rows.indexOf(document.activeElement);
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            rows[e.key === "Home" ? 0 : e.key === "End" ? rows.length - 1 : (index + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length]?.focus();
          }
          if (e.key === "Escape" || e.key === "Tab") {
            if (e.key === "Escape")
              e.preventDefault();
            onClose();
          }
        },
        children: items.map((item) => item.type === "separator" ? /* @__PURE__ */ jsx_runtime3.jsx("hr", {}, item.id) : /* @__PURE__ */ jsx_runtime3.jsxs("button", {
          role: role === "listbox" ? "option" : "menuitem",
          "aria-selected": role === "listbox" ? item.checked : undefined,
          disabled: item.disabled,
          "data-danger": item.danger || undefined,
          onClick: () => {
            onSelect(item.id);
            onClose();
          },
          children: [
            item.icon,
            item.label,
            item.checked && /* @__PURE__ */ jsx_runtime3.jsx(Icon, {
              name: "check",
              size: 14
            })
          ]
        }, item.id))
      })
    ]
  });
}
function Select({
  value,
  onValueChange,
  options,
  label,
  disabled,
  className = ""
}) {
  const [open, set] = import_react2.useState(false);
  return /* @__PURE__ */ jsx_runtime3.jsx(Menu, {
    role: "listbox",
    open,
    onClose: () => set(false),
    onSelect: onValueChange,
    items: options.map((o) => ({
      id: o.value,
      label: o.label,
      checked: o.value === value,
      disabled: o.disabled
    })),
    anchor: /* @__PURE__ */ jsx_runtime3.jsxs(Button, {
      className: ui_module_default.select + " " + className,
      role: "combobox",
      "aria-label": label,
      "aria-expanded": open,
      "aria-haspopup": "listbox",
      disabled,
      onClick: () => set(!open),
      children: [
        options.find((o) => o.value === value)?.label ?? label,
        /* @__PURE__ */ jsx_runtime3.jsx(Icon, {
          name: "chevron",
          size: 14
        })
      ]
    })
  });
}
function Notice({ children }) {
  return /* @__PURE__ */ jsx_runtime3.jsx("div", {
    role: "status",
    className: ui_module_default.notice,
    children
  });
}
function Toast({
  text,
  onClose
}) {
  const ref = import_react2.useRef(null);
  import_react2.useEffect(() => {
    ref.current?.showPopover();
    const timer = setTimeout(onClose, 3500);
    return () => {
      clearTimeout(timer);
      ref.current?.hidePopover();
    };
  }, [text, onClose]);
  return /* @__PURE__ */ jsx_runtime3.jsx("div", {
    ref,
    popover: "manual",
    role: "status",
    className: ui_module_default.toast,
    children: text
  });
}
function useTheme(theme = "system") {
  import_react2.useEffect(() => {
    const query = matchMedia("(prefers-color-scheme:dark)");
    const apply = () => {
      document.documentElement.dataset.theme = theme === "system" ? query.matches ? "dark" : "light" : theme;
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [theme]);
}
var icon = (name) => function OwnIcon(props) {
  return /* @__PURE__ */ jsx_runtime3.jsx(Icon, {
    ...props,
    name
  });
};
var IconEllipsisOutlineRegular = icon("more");
var IconEditOutlineRegular = icon("edit");
var IconCloseOutlineRegular = icon("close");
var IconPlusOutlineRegular = icon("plus");
var IconSearchOutlineRegular = icon("search");
var IconChecklistOutlineRegular = icon("board");
var IconCheckOutlineRegular = icon("check");
var IconArchiveOutlineRegular = icon("download");
var IconChevronDownOutlineRegular = icon("chevron");

// frontend/platform.module.css
var platform_module_default = {
  srOnly: "srOnly_YnqvlA",
  appsDialog: "appsDialog_YnqvlA",
  libraryActions: "libraryActions_YnqvlA",
  grid: "grid_YnqvlA",
  card: "card_YnqvlA",
  cardFooter: "cardFooter_YnqvlA",
  actions: "actions_YnqvlA",
  cardHeading: "cardHeading_YnqvlA",
  appIcon: "appIcon_YnqvlA",
  state: "state_YnqvlA",
  widgetButton: "widgetButton_YnqvlA",
  noWidget: "noWidget_YnqvlA",
  grow: "grow_YnqvlA",
  library: "library_YnqvlA",
  appRow: "appRow_YnqvlA",
  source: "source_YnqvlA",
  empty: "empty_YnqvlA",
  settings: "settings_YnqvlA",
  settingRow: "settingRow_YnqvlA",
  secondary: "secondary_YnqvlA",
  searchInput: "searchInput_YnqvlA",
  launcher: "launcher_YnqvlA",
  message: "message_YnqvlA",
  loading: "loading_YnqvlA",
  status: "status_YnqvlA"
};

// frontend/widget-preview.tsx
var jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var words2 = {
  en: {
    title: "Widget preview",
    size: "Size",
    theme: "Theme",
    language: "Language",
    state: "State",
    light: "Light",
    dark: "Dark",
    system: "System",
    running: "Running",
    closed: "Closed · cached snapshot",
    failed: "Failed · cached snapshot"
  },
  "zh-CN": {
    title: "小组件预览",
    size: "尺寸",
    theme: "主题",
    language: "语言",
    state: "运行状态",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
    running: "运行中",
    closed: "已关闭 · 缓存快照",
    failed: "已停止 · 缓存快照"
  }
};
function WidgetPreview({ id }) {
  const [value, set] = import_react4.useState(), [error, setError] = import_react4.useState(""), [locale, language] = import_react4.useState("zh-CN"), [theme, setTheme] = import_react4.useState("system"), [state, status] = import_react4.useState("running");
  useTheme(theme);
  const t = words2[locale];
  const size = value?.definition?.size ?? "1x1";
  const { columns, rows } = widgetDimensions(size);
  import_react4.useEffect(() => {
    let stopped = false, socket;
    const refresh = () => jsonHost("/widget-preview/" + id).then((v) => {
      if (!stopped) {
        set(v);
        setError("");
      }
    }).catch((e) => {
      if (!stopped)
        setError(String(e));
    });
    refresh();
    openHostSocket("/api/fn/v1/events").then((s) => {
      if (stopped) {
        s.close();
        return;
      }
      socket = s;
      s.onmessage = () => void refresh();
    });
    return () => {
      stopped = true;
      socket?.close();
    };
  }, [id]);
  const text = (v) => {
    if (typeof v === "string")
      return v;
    let result = value?.messages[locale]?.[v.key] ?? value?.messages.en?.[v.key] ?? v.key;
    for (const [key, text] of Object.entries(v.args ?? {}))
      result = result.replaceAll("{" + key + "}", String(text));
    return result;
  };
  const choices = (keys) => keys.map((value) => ({ value, label: t[value] }));
  return /* @__PURE__ */ jsx_runtime4.jsxs("main", {
    style: { padding: 32, maxWidth: 1100, margin: "auto" },
    children: [
      /* @__PURE__ */ jsx_runtime4.jsx("h1", {
        children: t.title
      }),
      /* @__PURE__ */ jsx_runtime4.jsxs("div", {
        style: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 },
        children: [
          /* @__PURE__ */ jsx_runtime4.jsxs("span", {
            children: [
              t.size,
              ": ",
              size.replace("x", " × ")
            ]
          }),
          /* @__PURE__ */ jsx_runtime4.jsx(Select, {
            label: t.theme,
            value: theme,
            onValueChange: setTheme,
            options: choices(["light", "dark", "system"])
          }),
          /* @__PURE__ */ jsx_runtime4.jsx(Select, {
            label: t.language,
            value: locale,
            onValueChange: (v) => language(v),
            options: [
              { value: "zh-CN", label: "简体中文" },
              { value: "en", label: "English" }
            ]
          }),
          /* @__PURE__ */ jsx_runtime4.jsx(Select, {
            label: t.state,
            value: state,
            onValueChange: status,
            options: choices(["running", "closed", "failed"])
          })
        ]
      }),
      error && /* @__PURE__ */ jsx_runtime4.jsx(Notice, {
        children: error
      }),
      /* @__PURE__ */ jsx_runtime4.jsx("div", {
        className: platform_module_default.grid,
        children: /* @__PURE__ */ jsx_runtime4.jsxs("section", {
          className: platform_module_default.card,
          "data-size": size,
          "data-columns": columns,
          style: {
            "--widget-columns": columns,
            "--widget-rows": rows
          },
          children: [
            /* @__PURE__ */ jsx_runtime4.jsxs("div", {
              className: platform_module_default.cardHeading,
              children: [
                /* @__PURE__ */ jsx_runtime4.jsx("span", {
                  className: platform_module_default.appIcon,
                  children: /* @__PURE__ */ jsx_runtime4.jsx(Icon, {
                    name: "grid",
                    size: 21
                  })
                }),
                /* @__PURE__ */ jsx_runtime4.jsx("span", {
                  children: value?.definition?.id ?? t.title
                })
              ]
            }),
            /* @__PURE__ */ jsx_runtime4.jsx("div", {
              className: platform_module_default.widgetButton,
              children: value && /* @__PURE__ */ jsx_runtime4.jsx(Widget, {
                snapshot: value.snapshot,
                text
              })
            }),
            /* @__PURE__ */ jsx_runtime4.jsx("footer", {
              className: platform_module_default.cardFooter,
              children: /* @__PURE__ */ jsx_runtime4.jsx("span", {
                children: t[state]
              })
            })
          ]
        })
      })
    ]
  });
}
// frontend/locales/en.json
var en_default2 = {
  closed: "Closed",
  starting: "Starting",
  running: "Running",
  minimized: "Minimized",
  stopping: "Stopping",
  needs_attention: "Needs attention",
  waiting_for_app: "Waiting for app",
  processing: "Processing",
  completed: "Completed",
  interrupted: "Interrupted",
  cancelled: "Cancelled",
  closing_stops_active_tasks: "Closing stops tasks and discards unsaved changes.",
  closing_stops_tasks_and_discards_unsaved_changes: "Closing stops tasks and discards unsaved changes.",
  opening_your_desktop: "Opening your desktop…",
  retry: "Retry",
  application_installed: "Application installed",
  close_this_app_to_update_its_data: "Close this app to update. Its data will be kept.",
  this_app_uses_the_standard_status_page: "This app uses the standard status page.",
  minimize: "Minimize",
  close_app: "Close app",
  close: "Close",
  fn_app_launcher: "Fn app launcher",
  desktop: "Desktop",
  apps: "Apps",
  search_apps: "Search apps",
  phone_messages: "Phone messages",
  settings: "Settings",
  personal_space: "PERSONAL SPACE",
  my_desktop: "My desktop",
  your_apps: "Your apps",
  your_everyday_tools_everything_you_want_to: "Your everyday tools. Everything you want to keep in view.",
  a_place_for_every_app_to_do: "A place for every app to do its best work.",
  done: "Done",
  edit_desktop: "Edit desktop",
  add_apps: "Add apps",
  install_package: "Install package",
  check_updates: "Check updates",
  open: "Open ",
  open_to_get_started: "Open to get started",
  updated: "Updated ",
  move_after: "Move after",
  remove_widget: "Remove widget",
  make_room_for_your_first_app: "Make room for your first app",
  install_an_app_to_keep_its_information: "Install an app to keep its information here.",
  browse_apps: "Browse apps",
  installed: "Installed",
  add_widget: "Add widget",
  menu_bar_shortcut: "Menu bar shortcut",
  update: "Update",
  open_ed07: "Open",
  app_actions: "App actions",
  uninstall: "Uninstall",
  uninstall_this_app_its_data_will_be: "Uninstall this app? Its data will be kept.",
  no_apps_installed_browse_a_market_or: "No apps installed. Browse a market or install a local package.",
  discover: "Discover",
  install: "Install",
  load_markets: "Load markets",
  app_sources: "App sources",
  source_name: "Source name",
  name: "Name",
  market_url: "Market URL",
  add_source: "Add source",
  show_desktop: "Show desktop",
  close_79c8: "Close ",
  search_installed_apps: "Search installed apps…",
  general: "General",
  models: "Models",
  phone: "Phone",
  make_fn_feel_like_yours: "Make Fn feel like yours",
  your_desktop_and_apps_share_these_preferences: "Your desktop and apps share these preferences.",
  appearance: "Appearance",
  system: "System",
  light: "Light",
  dark: "Dark",
  language: "Language",
  use_your_chatgpt_plan_with_models_managed: "Use your ChatGPT plan with models managed by Fn.",
  plan_usage_enabled: "Plan usage enabled",
  plan_consent_required: "Plan consent required",
  sign_in_again: "Sign in again",
  sign_out_of_this_account: "Sign out of this account?",
  signed_out_locally_remote_revocation_was_not: "Signed out locally. Remote revocation was not confirmed; disconnect the app in ChatGPT settings.",
  sign_out: "Sign out",
  default_model: "Default model",
  choose_model: "Choose model",
  manage_chatgpt_usage: "Manage ChatGPT usage",
  chat_anywhere_run_on_your_desktop: "Chat anywhere. Run on your desktop.",
  messages_wait_until_you_start_their_desktop: "Messages wait until you start their desktop app.",
  connected_to_icloud: "Connected to iCloud",
  not_connected: "Not connected",
  disconnect: "Disconnect",
  connect_icloud: "Connect iCloud",
  messages_appear_here_closed_apps_stay_closed: "Messages appear here. Closed apps stay closed.",
  start_app: "Start app",
  cancel: "Cancel",
  confirm: "Confirm",
  notifications: "Notifications",
  no_notifications: "No notifications",
  clear_notifications: "Clear notifications",
  dock: "Dock",
  running_apps: "Running apps"
};
// frontend/locales/zh-CN.json
var zh_CN_default = {
  closed: "已关闭",
  starting: "正在启动",
  running: "运行中",
  minimized: "已最小化",
  stopping: "正在停止",
  needs_attention: "需要处理",
  waiting_for_app: "等待启动应用",
  processing: "处理中",
  completed: "已完成",
  interrupted: "已中断",
  cancelled: "已取消",
  closing_stops_active_tasks: "关闭应用会停止任务并放弃未保存内容。",
  closing_stops_tasks_and_discards_unsaved_changes: "关闭应用会停止任务并放弃未保存内容。",
  opening_your_desktop: "正在打开桌面…",
  retry: "重试",
  application_installed: "应用已安装",
  close_this_app_to_update_its_data: "关闭应用后更新，业务数据会保留。",
  this_app_uses_the_standard_status_page: "此应用使用标准状态页，后台由应用自行实现。",
  minimize: "最小化",
  close_app: "关闭应用",
  close: "确认关闭",
  fn_app_launcher: "Fn 应用启动器",
  desktop: "桌面",
  apps: "应用",
  search_apps: "搜索应用",
  phone_messages: "手机消息",
  settings: "设置",
  personal_space: "个人空间",
  my_desktop: "我的桌面",
  your_apps: "应用中心",
  your_everyday_tools_everything_you_want_to: "常用的工具，关心的信息，都在这里。",
  a_place_for_every_app_to_do: "让每个应用，做好自己的事。",
  done: "完成整理",
  edit_desktop: "整理桌面",
  add_apps: "添加应用",
  install_package: "本地安装",
  check_updates: "检查更新",
  open: "打开 ",
  open_to_get_started: "打开应用开始使用",
  updated: "更新于 ",
  move_after: "后移",
  remove_widget: "移出桌面",
  make_room_for_your_first_app: "为桌面添加第一个应用",
  install_an_app_to_keep_its_information: "安装应用后，在这里查看关心的信息。",
  browse_apps: "前往应用中心",
  installed: "已安装",
  add_widget: "添加到桌面",
  menu_bar_shortcut: "菜单栏常用应用",
  update: "更新",
  open_ed07: "打开",
  app_actions: "应用操作",
  uninstall: "卸载应用",
  uninstall_this_app_its_data_will_be: "卸载应用？业务数据会保留。",
  no_apps_installed_browse_a_market_or: "还没有应用。可以从市场安装，或选择本地应用包。",
  discover: "发现应用",
  install: "安装",
  load_markets: "加载应用市场",
  app_sources: "应用来源",
  source_name: "来源名称",
  name: "名称",
  market_url: "市场地址",
  add_source: "添加来源",
  show_desktop: "显示桌面",
  close_79c8: "关闭 ",
  search_installed_apps: "搜索已安装的应用…",
  general: "通用",
  models: "模型",
  phone: "手机连接",
  make_fn_feel_like_yours: "让 Fn 更合你的习惯",
  your_desktop_and_apps_share_these_preferences: "桌面和所有应用共享这些设置。",
  appearance: "外观",
  system: "跟随系统",
  light: "浅色",
  dark: "深色",
  language: "语言",
  use_your_chatgpt_plan_with_models_managed: "使用 ChatGPT 账号的订阅额度，模型由 Fn 统一管理。",
  plan_usage_enabled: "已授权订阅使用",
  plan_consent_required: "需要授权订阅使用",
  sign_in_again: "重新登录",
  sign_out_of_this_account: "退出此账号？",
  signed_out_locally_remote_revocation_was_not: "本机已退出，但远端撤销尚未确认。可在 ChatGPT 设置中断开应用。",
  sign_out: "退出登录",
  default_model: "默认模型",
  choose_model: "选择模型",
  manage_chatgpt_usage: "管理 ChatGPT 用量",
  chat_anywhere_run_on_your_desktop: "随身聊天，桌面处理",
  messages_wait_until_you_start_their_desktop: "手机消息交给桌面应用处理，应用关闭时保持等待。",
  connected_to_icloud: "已连接 iCloud",
  not_connected: "尚未连接",
  disconnect: "断开连接",
  connect_icloud: "连接 iCloud",
  messages_appear_here_closed_apps_stay_closed: "消息会在这里显示。关闭的应用不会自动启动。",
  start_app: "启动应用处理",
  cancel: "取消",
  confirm: "确认",
  notifications: "通知",
  no_notifications: "暂无通知",
  clear_notifications: "清空通知",
  dock: "Dock 栏",
  running_apps: "运行中的应用"
};

// frontend/main.tsx
var import_react5 = __toESM(require_react(), 1);
var import_client2 = __toESM(require_client(), 1);

// framework/fia/packages/cli/dist/client.js
function browserBridge() {
  return typeof window === "undefined" ? undefined : window.__FIA_BROWSER__;
}
function frontendFetch(path, init) {
  const bridge = browserBridge();
  return bridge ? bridge.request(path, init) : fetch(path, { ...init, credentials: "same-origin" });
}
async function openWebSocket(path, protocols) {
  const url = new URL(path, window.location.href);
  if (url.origin !== window.location.origin || url.pathname !== "/_fia/native" && !url.pathname.startsWith("/api/"))
    throw new Error("WebSocket path must be an application endpoint");
  const bridge = browserBridge();
  if (bridge) {
    const response = await bridge.request("/_fia/browser/socket", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: url.pathname + url.search })
    });
    if (!response.ok)
      throw new Error("WebSocket authorization failed");
    const result = await response.json();
    const socket = new WebSocket(result.url, protocols);
    const off = bridge.onEnd(() => socket.close(4001, "Browser authorization ended"));
    socket.addEventListener("close", off, { once: true });
    socket.addEventListener("close", (event) => {
      if (event.code === 4001)
        bridge.expire();
    });
    return socket;
  }
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return new WebSocket(url, protocols);
}
function createNativeAPI(transport) {
  return {
    agent: {
      installCLI: (options) => transport.call("agent.installCLI", {}, options),
      status: (options) => transport.call("agent.status", {}, options),
      uninstallCLI: (options) => transport.call("agent.uninstallCLI", {}, options)
    },
    application: {
      show: (options) => transport.call("application.show", {}, options),
      info: (options) => transport.call("application.info", {}, options),
      setAppearance: (input, options) => transport.call("application.setAppearance", input, options),
      quit: (options) => transport.call("application.quit", {}, options)
    },
    clipboard: {
      readText: (options) => transport.call("clipboard.readText", {}, options),
      writeText: (input, options) => transport.call("clipboard.writeText", input, options)
    },
    dialogs: {
      openFiles: (input, options) => transport.call("dialogs.openFiles", input, {
        timeoutMs: 0,
        ...options
      }),
      saveFile: (input, options) => transport.call("dialogs.saveFile", input, { timeoutMs: 0, ...options })
    },
    keychain: {
      get: (input, options) => transport.call("keychain.get", input, { timeoutMs: 0, ...options }),
      set: (input, options) => transport.call("keychain.set", input, { timeoutMs: 0, ...options }),
      delete: (input, options) => transport.call("keychain.delete", input, { timeoutMs: 0, ...options })
    },
    cloudKit: {
      account: (input, options) => transport.call("cloudKit.account", input, options),
      ensureZone: (scope, options) => transport.call("cloudKit.ensureZone", scope, options),
      read: (input, options) => transport.call("cloudKit.read", input, options),
      commit: (input, options) => transport.call("cloudKit.commit", input, options),
      changes: (input, options) => transport.call("cloudKit.changes", input, options),
      subscribe: (input, options) => transport.call("cloudKit.subscribe", input, options),
      registerPush: (options) => transport.call("cloudKit.registerPush", {}, options),
      subscribeZone: (input, options) => transport.call("cloudKit.subscribeZone", input, options),
      unsubscribe: (input, options) => transport.call("cloudKit.unsubscribe", input, options)
    },
    notifications: {
      requestAuthorization: (options) => transport.call("notifications.requestAuthorization", {}, options),
      deliver: (input, options) => transport.call("notifications.deliver", input, options)
    },
    screens: {
      list: (options) => transport.call("screens.list", {}, options)
    },
    system: {
      openURL: (input, options) => transport.call("system.openURL", input, options),
      reveal: (input, options) => transport.call("system.reveal", input, options)
    },
    globalShortcuts: {
      set: (input, options) => transport.call("globalShortcuts.set", input, options)
    },
    screen: {
      requestAuthorization: (options) => transport.call("screen.requestAuthorization", {}, options),
      captureRegion: (options) => transport.call("screen.captureRegion", {}, options)
    },
    resources: {
      dispose: (input, options) => transport.call("resources.dispose", input, options)
    },
    processes: {
      spawn: (input, options) => transport.call("runtime.processes.spawn", input, options),
      stop: (input, options) => transport.call("runtime.processes.stop", input, options),
      state: (input, options) => transport.call("runtime.processes.state", input, options)
    },
    statusItem: {
      setMenu: (input, options) => transport.call("runtime.statusItem.setMenu", input, options)
    },
    windows: {
      create: (input, options) => transport.call("windows.create", input, options),
      update: (input, options) => transport.call("windows.update", input, options),
      setTitlebar: (input, options) => transport.call("windows.setTitlebar", input, options),
      open: (input, options) => transport.call("windows.open", input, options),
      hide: (input, options) => transport.call("windows.hide", input, options),
      focus: (input, options) => transport.call("windows.focus", input, options),
      close: (input, options) => transport.call("windows.close", input, options),
      state: (input, options) => transport.call("windows.state", input, options),
      minimize: (input, options) => transport.call("windows.minimize", input, options),
      maximize: (input, options) => transport.call("windows.maximize", input, options),
      restore: (input, options) => transport.call("windows.restore", input, options),
      toggleFullscreen: (input, options) => transport.call("windows.toggleFullscreen", input, options)
    },
    updates: {
      check: (options) => transport.call("updates.check", {}, { timeoutMs: 120000, ...options }),
      download: (options) => transport.call("updates.download", {}, { timeoutMs: 0, ...options }),
      apply: (options) => transport.call("updates.apply", {}, { timeoutMs: 0, ...options }),
      state: (options) => transport.call("updates.state", {}, options)
    }
  };
}
var API_MAX_BYTES = 1024 * 1024;
class NativeError extends Error {
  code;
  component;
  method;
  recoverable;
  details;
  constructor(payload) {
    super(payload.message);
    this.name = "NativeError";
    this.code = payload.code;
    this.component = payload.component;
    this.method = payload.method;
    this.recoverable = payload.recoverable;
    this.details = payload.details;
  }
}

class NativeResource {
  id;
  mimeType;
  size;
  expiresAt;
  #disposed = false;
  #transport;
  #request;
  constructor(descriptor, transport, request) {
    this.id = descriptor.id;
    this.mimeType = descriptor.contentType;
    this.size = descriptor.byteLength;
    this.expiresAt = new Date(descriptor.expiresAt);
    this.#transport = transport;
    this.#request = request;
  }
  get disposed() {
    return this.#disposed;
  }
  async blob() {
    this.#assertAvailable();
    const response = await this.#fetch();
    if (!response.ok)
      throw new NativeError({
        code: response.status === 404 ? "not_found" : "native_failure",
        component: "resource",
        message: `Could not read native resource ${this.id}`,
        recoverable: response.status >= 500
      });
    return await response.blob();
  }
  async arrayBuffer() {
    return await (await this.blob()).arrayBuffer();
  }
  async stream() {
    this.#assertAvailable();
    const response = await this.#fetch();
    if (!response.ok || response.body === null)
      throw new NativeError({
        code: response.status === 404 ? "not_found" : "native_failure",
        component: "resource",
        message: `Could not stream native resource ${this.id}`,
        recoverable: response.status >= 500
      });
    return response.body;
  }
  async dispose() {
    if (this.#disposed)
      return;
    await this.#transport.call("resources.dispose", { id: this.id });
    this.#disposed = true;
  }
  #assertAvailable() {
    if (this.#disposed)
      throw new NativeError({
        code: "unsafe_state",
        component: "resource",
        message: `Native resource ${this.id} was disposed`,
        recoverable: false
      });
  }
  async#fetch() {
    return await frontendFetch(this.#request.url, {
      credentials: this.#request.credentials,
      ...this.#request.headers === undefined ? {} : { headers: this.#request.headers }
    });
  }
}

class NativeClient extends EventTarget {
  api = createNativeAPI(this);
  application = this.api.application;
  agent = this.api.agent;
  clipboard = this.api.clipboard;
  dialogs = this.api.dialogs;
  keychain = this.api.keychain;
  notifications = this.api.notifications;
  cloudKit = this.api.cloudKit;
  screens = this.api.screens;
  screen = this.api.screen;
  system = this.api.system;
  globalShortcuts = this.api.globalShortcuts;
  windows = this.api.windows;
  resources = this.api.resources;
  updates = this.api.updates;
  #socket;
  #reconnect;
  #closed = false;
  #listeners = 0;
  async ready() {
    const query = new URLSearchParams(window.location.search);
    const response = await frontendFetch("/_fia/ready", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        windowId: query.get("fiaWindow") ?? "main",
        generation: query.get("fiaGeneration"),
        ...query.get("fiaBrowser") === "1" ? { browser: true } : {}
      })
    });
    if (!response.ok)
      throw new Error("FIA frontend readiness was rejected");
  }
  #connecting;
  #nextID = 1;
  #pending = new Map;
  async call(method, params = {}, options = {}) {
    if (!/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/u.test(method)) {
      throw new NativeError({
        code: "invalid_argument",
        component: "client",
        method,
        message: "Native method name is invalid",
        recoverable: false
      });
    }
    if (options.signal?.aborted === true)
      throw options.signal.reason;
    this.#closed = false;
    const socket = await this.#connect();
    if (options.signal?.aborted)
      throw options.signal.reason;
    if (this.#pending.size >= 128)
      throw new Error("Native request concurrency limit exceeded");
    const id = this.#nextID++;
    const message = JSON.stringify({
      v: 1,
      type: "request",
      id,
      method,
      params
    });
    if (new TextEncoder().encode(message).byteLength > 1024 * 1024)
      throw new Error("Native request exceeds protocol limit");
    const cancel = () => {
      if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify({ v: 1, type: "cancel", id }));
    };
    return await new Promise((resolve, reject) => {
      const pending = {
        method,
        resolve: (value) => resolve(value),
        reject
      };
      const timeout = options.timeoutMs ?? 30000;
      if (timeout > 0) {
        pending.timer = setTimeout(() => {
          this.#settle(id, () => {});
          cancel();
          reject(new NativeError({
            code: "timeout",
            component: "client",
            method,
            message: `Native method timed out after ${timeout} ms`,
            recoverable: true
          }));
        }, timeout);
      }
      if (options.signal !== undefined) {
        const abort = () => {
          this.#settle(id, () => reject(options.signal?.reason ?? new DOMException("Aborted", "AbortError")));
          cancel();
        };
        options.signal.addEventListener("abort", abort, { once: true });
        pending.removeAbort = () => options.signal?.removeEventListener("abort", abort);
      }
      this.#pending.set(id, pending);
      try {
        socket.send(message);
      } catch (error) {
        this.#settle(id, () => reject(error));
      }
    });
  }
  capabilities(options) {
    return this.call("native.capabilities", {}, options);
  }
  on(event, listener) {
    const handler = (message) => listener(message.detail);
    this.#closed = false;
    this.#listeners++;
    this.addEventListener(event, handler);
    this.#connect().catch(() => {});
    let active = true;
    return () => {
      if (active) {
        active = false;
        this.#listeners--;
        this.removeEventListener(event, handler);
      }
    };
  }
  resource(descriptor) {
    return new NativeResource(descriptor, this, {
      url: `/_fia/resources/${encodeURIComponent(descriptor.id)}`,
      credentials: "same-origin"
    });
  }
  close() {
    this.#closed = true;
    clearTimeout(this.#reconnect);
    this.#socket?.close(1000, "client closed");
    this.#socket = undefined;
    this.#connecting = undefined;
    for (const id of this.#pending.keys())
      this.#settle(id, (pending) => pending.reject(new Error("Native client closed")));
  }
  async#connect() {
    if (this.#socket?.readyState === WebSocket.OPEN)
      return this.#socket;
    if (this.#connecting !== undefined)
      return await this.#connecting;
    this.#connecting = openWebSocket("/_fia/native").then((socket) => new Promise((resolve, reject) => {
      this.#socket = socket;
      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error("Native connection timed out"));
      }, 5000);
      socket.addEventListener("open", () => {
        clearTimeout(timeout);
        if (this.#socket !== socket || this.#closed) {
          socket.close();
          reject(new Error("Native client closed"));
          return;
        }
        this.#connecting = undefined;
        resolve(socket);
      }, { once: true });
      socket.addEventListener("error", () => {
        clearTimeout(timeout);
        if (this.#socket === socket)
          this.#connecting = undefined;
        reject(new NativeError({
          code: "native_failure",
          component: "client",
          message: "Could not connect to the FIA Native Runtime",
          recoverable: true
        }));
      }, { once: true });
      socket.addEventListener("message", (event) => {
        if (this.#socket === socket)
          this.#receive(event.data);
      });
      socket.addEventListener("close", () => {
        clearTimeout(timeout);
        reject(new Error("Native connection closed"));
        if (this.#socket !== socket)
          return;
        this.#socket = undefined;
        this.#connecting = undefined;
        if (!this.#closed && !browserBridge()?.ended() && this.#listeners > 0)
          this.#reconnect = setTimeout(() => {
            this.#connect().catch(() => {});
          }, 500);
        for (const id of this.#pending.keys()) {
          this.#settle(id, (pending) => pending.reject(new NativeError({
            code: "native_failure",
            component: "client",
            method: pending.method,
            message: "The FIA Native Runtime disconnected",
            recoverable: true
          })));
        }
      });
    })).catch((error) => {
      this.#connecting = undefined;
      throw error;
    });
    return await this.#connecting;
  }
  #receive(value) {
    if (typeof value !== "string")
      return;
    let frame;
    try {
      frame = JSON.parse(value);
    } catch {
      return;
    }
    if (frame.v !== 1)
      return;
    if (frame.type === "event") {
      this.dispatchEvent(new CustomEvent(frame.event, { detail: frame.payload }));
      return;
    }
    const pending = this.#pending.get(frame.id);
    if (pending === undefined)
      return;
    this.#settle(frame.id, () => {
      if (frame.error !== undefined)
        pending.reject(new NativeError(frame.error));
      else
        pending.resolve(frame.result);
    });
  }
  #settle(id, action) {
    const pending = this.#pending.get(id);
    if (pending === undefined)
      return;
    this.#pending.delete(id);
    if (pending.timer !== undefined)
      clearTimeout(pending.timer);
    pending.removeAbort?.();
    action(pending);
  }
}
var native = new NativeClient;

// frontend/desktop.module.css
var desktop_module_default = {
  shell: "shell_-KP1AA",
  topbar: "topbar_-KP1AA",
  brand: "brand_-KP1AA",
  topActions: "topActions_-KP1AA",
  mainNav: "mainNav_-KP1AA",
  headingActions: "headingActions_-KP1AA",
  logo: "logo_-KP1AA",
  brandDivider: "brandDivider_-KP1AA",
  actionDivider: "actionDivider_-KP1AA",
  dockDivider: "dockDivider_-KP1AA",
  activeNav: "activeNav_-KP1AA",
  updateDot: "updateDot_-KP1AA",
  searchTrigger: "searchTrigger_-KP1AA",
  connectionButton: "connectionButton_-KP1AA",
  runningDot: "runningDot_-KP1AA",
  stoppedDot: "stoppedDot_-KP1AA",
  iconButton: "iconButton_-KP1AA",
  profileAvatar: "profileAvatar_-KP1AA",
  badge: "badge_-KP1AA",
  main: "main_-KP1AA",
  pageHeading: "pageHeading_-KP1AA",
  dateLine: "dateLine_-KP1AA",
  button: "button_-KP1AA",
  primaryButton: "primaryButton_-KP1AA",
  textButton: "textButton_-KP1AA",
  sectionBar: "sectionBar_-KP1AA",
  filterTabs: "filterTabs_-KP1AA",
  activeFilter: "activeFilter_-KP1AA",
  sectionHint: "sectionHint_-KP1AA",
  desktopGrid: "desktopGrid_-KP1AA",
  widget: "widget_-KP1AA",
  boardWidgetCard: "boardWidgetCard_-KP1AA",
  translateWidgetCard: "translateWidgetCard_-KP1AA",
  notesWidgetCard: "notesWidgetCard_-KP1AA",
  stocksWidgetCard: "stocksWidgetCard_-KP1AA",
  widgetHeader: "widgetHeader_-KP1AA",
  appIcon: "appIcon_-KP1AA",
  smallIcon: "smallIcon_-KP1AA",
  widgetStatus: "widgetStatus_-KP1AA",
  widgetContent: "widgetContent_-KP1AA",
  widgetHeading: "widgetHeading_-KP1AA",
  muted: "muted_-KP1AA",
  widgetFooter: "widgetFooter_-KP1AA",
  widgetHit: "widgetHit_-KP1AA",
  miniBoard: "miniBoard_-KP1AA",
  miniColumnLabel: "miniColumnLabel_-KP1AA",
  boardColumnTitle: "boardColumnTitle_-KP1AA",
  miniTask: "miniTask_-KP1AA",
  tagBar: "tagBar_-KP1AA",
  miniTaskMeta: "miniTaskMeta_-KP1AA",
  eyebrow: "eyebrow_-KP1AA",
  translationWidget: "translationWidget_-KP1AA",
  sourceQuote: "sourceQuote_-KP1AA",
  translatedQuote: "translatedQuote_-KP1AA",
  languagePair: "languagePair_-KP1AA",
  noteWidget: "noteWidget_-KP1AA",
  notePreview: "notePreview_-KP1AA",
  noteBullet: "noteBullet_-KP1AA",
  stockSummary: "stockSummary_-KP1AA",
  positive: "positive_-KP1AA",
  marketLabel: "marketLabel_-KP1AA",
  sparkline: "sparkline_-KP1AA",
  stockWidget: "stockWidget_-KP1AA",
  stockFooter: "stockFooter_-KP1AA",
  editingWidget: "editingWidget_-KP1AA",
  reorderControls: "reorderControls_-KP1AA",
  addWidget: "addWidget_-KP1AA",
  emptyDesktop: "emptyDesktop_-KP1AA",
  dock: "dock_-KP1AA",
  dockPermanent: "dockPermanent_-KP1AA",
  dockSystem: "dockSystem_-KP1AA",
  dockBadge: "dockBadge_-KP1AA",
  dockRunning: "dockRunning_-KP1AA",
  dockItem: "dockItem_-KP1AA",
  activeDock: "activeDock_-KP1AA",
  dockApp: "dockApp_-KP1AA",
  dockClose: "dockClose_-KP1AA",
  window: "window_-KP1AA",
  activeWindow: "activeWindow_-KP1AA",
  maximized: "maximized_-KP1AA",
  windowHeader: "windowHeader_-KP1AA",
  windowTitle: "windowTitle_-KP1AA",
  windowControls: "windowControls_-KP1AA",
  closeWindow: "closeWindow_-KP1AA",
  windowBody: "windowBody_-KP1AA",
  translationApp: "translationApp_-KP1AA",
  appToolbar: "appToolbar_-KP1AA",
  modelBadge: "modelBadge_-KP1AA",
  translationColumns: "translationColumns_-KP1AA",
  fieldLabel: "fieldLabel_-KP1AA",
  translationResult: "translationResult_-KP1AA",
  editorFooter: "editorFooter_-KP1AA",
  appBottom: "appBottom_-KP1AA",
  subtle: "subtle_-KP1AA",
  tinyTag: "tinyTag_-KP1AA",
  caret: "caret_-KP1AA",
  notesApp: "notesApp_-KP1AA",
  notesSidebar: "notesSidebar_-KP1AA",
  notesTitle: "notesTitle_-KP1AA",
  noteItem: "noteItem_-KP1AA",
  selectedNote: "selectedNote_-KP1AA",
  noteEditor: "noteEditor_-KP1AA",
  noteEditorMeta: "noteEditorMeta_-KP1AA",
  editorWordCount: "editorWordCount_-KP1AA",
  boardApp: "boardApp_-KP1AA",
  boardHeader: "boardHeader_-KP1AA",
  avatarGroup: "avatarGroup_-KP1AA",
  boardColumns: "boardColumns_-KP1AA",
  boardColumn: "boardColumn_-KP1AA",
  taskCard: "taskCard_-KP1AA",
  taskTag: "taskTag_-KP1AA",
  taskBottom: "taskBottom_-KP1AA",
  addTask: "addTask_-KP1AA",
  boardHint: "boardHint_-KP1AA",
  stocksApp: "stocksApp_-KP1AA",
  stockList: "stockList_-KP1AA",
  selectedStock: "selectedStock_-KP1AA",
  stockDetail: "stockDetail_-KP1AA",
  stockDetailHeader: "stockDetailHeader_-KP1AA",
  rangeTabs: "rangeTabs_-KP1AA",
  activeRange: "activeRange_-KP1AA",
  largeChart: "largeChart_-KP1AA",
  chartGrid: "chartGrid_-KP1AA",
  stockMetrics: "stockMetrics_-KP1AA",
  dialog: "dialog_-KP1AA",
  wideDialog: "wideDialog_-KP1AA",
  anchoredDialog: "anchoredDialog_-KP1AA",
  dialogHeader: "dialogHeader_-KP1AA",
  launcherSearch: "launcherSearch_-KP1AA",
  launcherList: "launcherList_-KP1AA",
  launcherBottom: "launcherBottom_-KP1AA",
  settingsLayout: "settingsLayout_-KP1AA",
  settingsNav: "settingsNav_-KP1AA",
  selectedSetting: "selectedSetting_-KP1AA",
  settingsVersion: "settingsVersion_-KP1AA",
  settingsContent: "settingsContent_-KP1AA",
  settingRow: "settingRow_-KP1AA",
  segmented: "segmented_-KP1AA",
  selectedSegment: "selectedSegment_-KP1AA",
  accountCard: "accountCard_-KP1AA",
  accountIcon: "accountIcon_-KP1AA",
  connectedLabel: "connectedLabel_-KP1AA",
  infoNote: "infoNote_-KP1AA",
  library: "library_-KP1AA",
  updateBanner: "updateBanner_-KP1AA",
  updateIllustration: "updateIllustration_-KP1AA",
  libraryList: "libraryList_-KP1AA",
  libraryRow: "libraryRow_-KP1AA",
  libraryInfo: "libraryInfo_-KP1AA",
  libraryFootnote: "libraryFootnote_-KP1AA",
  inboxBody: "inboxBody_-KP1AA",
  helpBody: "helpBody_-KP1AA",
  phoneConnection: "phoneConnection_-KP1AA",
  phoneDevice: "phoneDevice_-KP1AA",
  phoneInput: "phoneInput_-KP1AA",
  messageList: "messageList_-KP1AA",
  messageCard: "messageCard_-KP1AA",
  pendingMessage: "pendingMessage_-KP1AA",
  empty: "empty_-KP1AA",
  helpItem: "helpItem_-KP1AA",
  taskForm: "taskForm_-KP1AA",
  confirmBody: "confirmBody_-KP1AA",
  dialogActions: "dialogActions_-KP1AA",
  toast: "toast_-KP1AA",
  toastCheck: "toastCheck_-KP1AA"
};

// frontend/main.tsx
var jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
function AppIcon({ id, icon }) {
  const name = id.includes("translate") ? "translate" : id.includes("note") ? "note" : id.includes("kanban") ? "board" : id.includes("stock") ? "chart" : "grid";
  return /* @__PURE__ */ jsx_runtime5.jsx("span", {
    className: platform_module_default.appIcon,
    "data-icon": name,
    children: icon ? /* @__PURE__ */ jsx_runtime5.jsx("img", {
      src: icon,
      alt: "",
      width: 24,
      height: 24
    }) : /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
      name,
      size: 21
    })
  });
}
function Desktop() {
  const [state, setState] = import_react5.useState();
  const [error, setError] = import_react5.useState("");
  const [appMenu, setAppMenu] = import_react5.useState();
  const [panel, setPanel] = import_react5.useState();
  const [tab, setTab] = import_react5.useState("general");
  import_react5.useEffect(() => setAppMenu(undefined), [panel]);
  const [query, setQuery] = import_react5.useState("");
  const [editing, setEditing] = import_react5.useState(false);
  const [toast, setToast] = import_react5.useState("");
  const [confirmation, setConfirmation] = import_react5.useState();
  const [models, setModels] = import_react5.useState([]);
  const [marketName, setMarketName] = import_react5.useState("");
  const [marketURL, setMarketURL] = import_react5.useState("");
  const [drag, setDrag] = import_react5.useState();
  const [busy, setBusy] = import_react5.useState(false);
  const zh = (state?.preferences.locale ?? "zh-CN") === "zh-CN";
  const t = (key) => (zh ? zh_CN_default : en_default2)[key] ?? key;
  useTheme(state?.preferences.theme);
  import_react5.useEffect(() => {
    document.documentElement.lang = state?.preferences.locale ?? "zh-CN";
  }, [state?.preferences.locale]);
  const refresh = import_react5.useCallback(async () => {
    try {
      setState(await jsonHost("/state"));
      setError("");
    } catch (e) {
      setError(String(e));
    }
  }, []);
  const command = async (action, input = {}) => {
    try {
      const result = await jsonHost("/platform/" + action, input);
      await refresh();
      return result;
    } catch (e) {
      setToast(String(e instanceof Error ? e.message : e));
      throw e;
    }
  };
  const act = (action, input = {}) => {
    command(action, input).catch(() => {});
  };
  const text = (value, app) => {
    if (typeof value === "string")
      return value;
    let result = app.messages[state?.preferences.locale ?? "en"]?.[value.key] ?? app.messages.en?.[value.key] ?? value.key;
    for (const [key, v] of Object.entries(value.args ?? {}))
      result = result.replaceAll("{" + key + "}", String(v));
    return result;
  };
  const name = (app) => text(app.manifest.name, app);
  const label = (status) => ({
    closed: t("closed"),
    starting: t("starting"),
    running: t("running"),
    minimized: t("minimized"),
    stopping: t("stopping"),
    failed: t("needs_attention"),
    waiting: t("waiting_for_app"),
    processing: t("processing"),
    completed: t("completed"),
    interrupted: t("interrupted"),
    cancelled: t("cancelled")
  })[status] ?? status;
  const open = async (app) => {
    const browser = new URLSearchParams(location.search).get("fiaBrowser") === "1";
    const placeholder = browser ? window.open("about:blank", "_blank") : null;
    try {
      const result = await command("open", {
        instanceId: app.instanceId,
        browser
      });
      if (placeholder && result.url)
        placeholder.location.replace(result.url);
      setPanel(undefined);
    } catch {
      placeholder?.close();
    }
  };
  const close = (app) => {
    if (app.busy)
      setConfirmation({
        text: t("closing_stops_active_tasks"),
        action: () => act("close", { instanceId: app.instanceId, force: true })
      });
    else
      act("close", { instanceId: app.instanceId });
  };
  import_react5.useEffect(() => {
    let disposed = false;
    let socket;
    let timer;
    const connect = async () => {
      try {
        socket = await openHostSocket("/api/fn/v1/events?windowId=" + encodeURIComponent(new URLSearchParams(location.search).get("fiaWindow") ?? ""));
        if (disposed) {
          socket.close();
          return;
        }
        socket.onmessage = (e) => {
          const message = JSON.parse(e.data);
          if (message.type === "changed")
            refresh();
          if (message.type === "toast")
            setToast(message.value.text);
          if (message.type === "closeRequested")
            setConfirmation({
              text: t("closing_stops_tasks_and_discards_unsaved_changes"),
              action: () => {
                jsonHost("/platform/close", {
                  instanceId: message.value.instanceId,
                  force: true
                });
              }
            });
        };
        socket.onclose = () => {
          if (!disposed)
            timer = setTimeout(() => {
              connect();
              refresh();
            }, 1000);
        };
      } catch {
        if (!disposed)
          timer = setTimeout(() => void connect(), 1000);
      }
    };
    refresh().finally(() => native.ready().catch(() => {}));
    connect();
    return () => {
      disposed = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [refresh, zh]);
  import_react5.useEffect(() => {
    const listener = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPanel("search");
        setQuery("");
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
  import_react5.useEffect(() => {
    if (panel === "settings" && tab === "models")
      jsonHost("/models").then(setModels).catch((e) => setToast(String(e)));
  }, [panel, tab, state?.connections.length]);
  const prefs = (input) => act("preferences", input);
  const pin = (app, key) => {
    const list = state.preferences[key];
    const entries = key === "menu" || !app.manifest.contributes.widgets.length ? [app.instanceId] : app.manifest.contributes.widgets.map((w) => app.instanceId + "/" + w.id);
    prefs({
      [key]: entries.every((id) => list.includes(id)) ? list.filter((id) => !entries.includes(id)) : [...new Set([...list, ...entries])]
    });
  };
  const reorder = (source, target) => {
    const list = [...state.preferences.desktop];
    list.splice(list.indexOf(source), 1);
    list.splice(list.indexOf(target), 0, source);
    prefs({ desktop: list });
  };
  if (!state)
    return /* @__PURE__ */ jsx_runtime5.jsxs("div", {
      className: platform_module_default.loading,
      children: [
        /* @__PURE__ */ jsx_runtime5.jsx("strong", {
          children: "Fn"
        }),
        /* @__PURE__ */ jsx_runtime5.jsx("p", {
          children: error || t("opening_your_desktop")
        }),
        /* @__PURE__ */ jsx_runtime5.jsx(Button, {
          onClick: () => void refresh(),
          children: t("retry")
        })
      ]
    });
  const applications = state.applications;
  const running = applications.filter((a) => !["closed", "failed"].includes(a.state));
  const desktop = state.preferences.desktop.flatMap((key) => {
    const [id, widgetId] = key.split("/");
    const app = applications.find((a) => a.instanceId === id);
    if (!app)
      return [];
    const definition = app.manifest.contributes.widgets.find((w) => w.id === widgetId);
    const size = definition?.size ?? "1x1";
    return [
      {
        key,
        app,
        widget: widgetId ? app.widgets[widgetId] : undefined,
        size,
        ...widgetDimensions(size)
      }
    ];
  });
  const waiting = state.relay.messages.filter((m) => m.status === "waiting").length;
  const statusId = new URLSearchParams(location.search).get("status");
  const statusApp = applications.find((a) => a.instanceId === statusId);
  const install = async (item, confirmationId) => {
    setBusy(true);
    try {
      const result = await command(confirmationId ? "install-confirm" : item ? "install" : "install-local", confirmationId ? { confirmationId } : item);
      if (result?.confirmationId)
        setConfirmation({
          text: t("close_this_app_to_update_its_data"),
          action: () => {
            install(undefined, result.confirmationId);
          }
        });
      else if (result)
        setToast(t("application_installed"));
    } catch {} finally {
      setBusy(false);
    }
  };
  if (statusId)
    return /* @__PURE__ */ jsx_runtime5.jsxs("main", {
      className: platform_module_default.status,
      children: [
        /* @__PURE__ */ jsx_runtime5.jsx(AppIcon, {
          id: statusId
        }),
        /* @__PURE__ */ jsx_runtime5.jsx("h1", {
          children: statusApp ? name(statusApp) : statusId
        }),
        /* @__PURE__ */ jsx_runtime5.jsx("p", {
          children: label(statusApp?.state ?? "closed")
        }),
        statusApp?.error && /* @__PURE__ */ jsx_runtime5.jsx(Notice, {
          children: statusApp.error
        }),
        /* @__PURE__ */ jsx_runtime5.jsx("p", {
          children: t("this_app_uses_the_standard_status_page")
        }),
        /* @__PURE__ */ jsx_runtime5.jsxs("div", {
          className: platform_module_default.actions,
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx(Button, {
              onClick: () => act("minimize", { instanceId: statusId }),
              children: t("minimize")
            }),
            /* @__PURE__ */ jsx_runtime5.jsx(Button, {
              onClick: () => statusApp && close(statusApp),
              children: t("close_app")
            })
          ]
        }),
        confirmation && /* @__PURE__ */ jsx_runtime5.jsxs(Modal, {
          title: t("close_app"),
          onClose: () => setConfirmation(undefined),
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("p", {
              children: confirmation.text
            }),
            /* @__PURE__ */ jsx_runtime5.jsx(Button, {
              onClick: () => {
                confirmation.action();
                setConfirmation(undefined);
              },
              children: t("close")
            })
          ]
        })
      ]
    });
  return /* @__PURE__ */ jsx_runtime5.jsxs("div", {
    className: desktop_module_default.shell,
    children: [
      /* @__PURE__ */ jsx_runtime5.jsxs("header", {
        className: desktop_module_default.topbar,
        children: [
          /* @__PURE__ */ jsx_runtime5.jsxs("button", {
            className: desktop_module_default.searchTrigger,
            "aria-label": t("search_apps"),
            "aria-keyshortcuts": "Meta+K Control+K",
            onClick: () => {
              setPanel("search");
              setQuery("");
            },
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                name: "search",
                size: 16
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                children: t("search_apps")
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("kbd", {
                "aria-hidden": "true",
                children: "⌘ K"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime5.jsxs("div", {
            className: desktop_module_default.headingActions,
            children: [
              /* @__PURE__ */ jsx_runtime5.jsxs(Button, {
                variant: editing ? "primary" : "secondary",
                "aria-pressed": editing,
                onClick: () => setEditing(!editing),
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                    name: editing ? "check" : "edit",
                    size: 15
                  }),
                  editing ? t("done") : t("edit_desktop")
                ]
              }),
              /* @__PURE__ */ jsx_runtime5.jsxs(Button, {
                onClick: () => setPanel("apps"),
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                    name: "plus",
                    size: 16
                  }),
                  t("add_apps")
                ]
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime5.jsxs("main", {
        className: desktop_module_default.main,
        children: [
          /* @__PURE__ */ jsx_runtime5.jsx("h1", {
            className: platform_module_default.srOnly,
            children: t("my_desktop")
          }),
          error && /* @__PURE__ */ jsx_runtime5.jsx(Notice, {
            children: error
          }),
          /* @__PURE__ */ jsx_runtime5.jsx("div", {
            className: platform_module_default.grid,
            children: desktop.map(({ key, app, widget, size, columns, rows }, index) => /* @__PURE__ */ jsx_runtime5.jsxs("section", {
              className: platform_module_default.card,
              onClick: (event) => {
                if (!editing && !event.target.closest("button"))
                  open(app);
              },
              "data-size": size,
              "data-columns": columns,
              style: {
                "--widget-columns": columns,
                "--widget-rows": rows
              },
              draggable: editing,
              onDragStart: () => setDrag(key),
              onDragOver: (e) => {
                if (editing)
                  e.preventDefault();
              },
              onDrop: (e) => {
                e.preventDefault();
                if (drag && drag !== key)
                  reorder(drag, key);
                setDrag(undefined);
              },
              children: [
                /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                  className: platform_module_default.cardHeading,
                  children: [
                    /* @__PURE__ */ jsx_runtime5.jsx(AppIcon, {
                      id: app.manifest.id,
                      icon: app.manifest.icon ? "/pages/" + encodeURIComponent(app.instanceId) + "/icon" : undefined
                    }),
                    /* @__PURE__ */ jsx_runtime5.jsx("span", {
                      children: name(app)
                    }),
                    /* @__PURE__ */ jsx_runtime5.jsx("span", {
                      className: platform_module_default.state,
                      "data-running": running.includes(app),
                      children: label(app.state)
                    })
                  ]
                }),
                /* @__PURE__ */ jsx_runtime5.jsxs("button", {
                  className: platform_module_default.widgetButton,
                  "aria-label": t("open") + name(app),
                  onClick: () => void open(app),
                  children: [
                    widget && /* @__PURE__ */ jsx_runtime5.jsx(Widget, {
                      snapshot: widget.snapshot,
                      text: (value) => text(value, app)
                    }),
                    !widget && /* @__PURE__ */ jsx_runtime5.jsx("div", {
                      className: platform_module_default.noWidget,
                      children: app.manifest.description ? text(app.manifest.description, app) : t("open_to_get_started")
                    })
                  ]
                }),
                /* @__PURE__ */ jsx_runtime5.jsxs("footer", {
                  className: platform_module_default.cardFooter,
                  children: [
                    /* @__PURE__ */ jsx_runtime5.jsx("span", {
                      children: app.error || t("updated") + (widget ? new Intl.DateTimeFormat(zh ? "zh-CN" : "en", {
                        hour: "2-digit",
                        minute: "2-digit"
                      }).format(widget.updatedAt) : "—")
                    }),
                    editing ? /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                      className: platform_module_default.actions,
                      children: [
                        /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                          size: "sm",
                          disabled: !index,
                          onClick: () => reorder(key, desktop[index - 1].key),
                          children: "←"
                        }),
                        /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                          size: "sm",
                          disabled: index === desktop.length - 1,
                          "aria-label": t("move_after"),
                          onClick: () => reorder(desktop[index + 1].key, key),
                          children: "→"
                        }),
                        /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                          size: "sm",
                          "aria-label": t("remove_widget"),
                          onClick: () => prefs({
                            desktop: state.preferences.desktop.filter((id) => id !== key)
                          }),
                          children: /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                            name: "close",
                            size: 13
                          })
                        })
                      ]
                    }) : /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                      name: "arrow",
                      size: 14
                    })
                  ]
                })
              ]
            }, key))
          }),
          !desktop.length && /* @__PURE__ */ jsx_runtime5.jsxs("div", {
            className: platform_module_default.empty,
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                name: "grid",
                size: 36
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("h2", {
                children: t("make_room_for_your_first_app")
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("p", {
                children: t("install_an_app_to_keep_its_information")
              }),
              /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                variant: "primary",
                onClick: () => setPanel("apps"),
                children: t("browse_apps")
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime5.jsxs("nav", {
        className: desktop_module_default.dock,
        "aria-label": t("dock"),
        children: [
          /* @__PURE__ */ jsx_runtime5.jsxs("div", {
            className: desktop_module_default.dockPermanent,
            children: [
              /* @__PURE__ */ jsx_runtime5.jsxs("button", {
                className: desktop_module_default.dockSystem,
                "aria-haspopup": "dialog",
                "aria-expanded": panel === "apps",
                onClick: () => setPanel("apps"),
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                    name: "grid",
                    size: 21
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx("span", {
                    children: t("apps")
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime5.jsxs("button", {
                className: desktop_module_default.dockSystem,
                "aria-label": t("notifications"),
                "aria-haspopup": "dialog",
                "aria-expanded": panel === "notifications",
                onClick: () => setPanel("notifications"),
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                    name: "bell",
                    size: 21
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx("span", {
                    children: t("notifications")
                  }),
                  state.notifications.length > 0 && /* @__PURE__ */ jsx_runtime5.jsx("span", {
                    className: desktop_module_default.dockBadge,
                    children: state.notifications.length > 99 ? "99+" : state.notifications.length
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime5.jsxs("button", {
                className: desktop_module_default.dockSystem,
                "aria-label": t("settings"),
                "aria-haspopup": "dialog",
                "aria-expanded": panel === "settings" || panel === "phone",
                onClick: () => {
                  setTab("general");
                  setPanel("settings");
                },
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                    name: "settings",
                    size: 21
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx("span", {
                    children: t("settings")
                  }),
                  waiting > 0 && /* @__PURE__ */ jsx_runtime5.jsx("span", {
                    className: desktop_module_default.dockBadge,
                    children: waiting > 99 ? "99+" : waiting
                  })
                ]
              })
            ]
          }),
          running.length > 0 && /* @__PURE__ */ jsx_runtime5.jsxs(jsx_runtime5.Fragment, {
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                className: desktop_module_default.dockDivider,
                "aria-hidden": "true"
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("div", {
                className: desktop_module_default.dockRunning,
                "aria-label": t("running_apps"),
                children: running.map((app) => /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                  className: desktop_module_default.dockItem,
                  children: [
                    /* @__PURE__ */ jsx_runtime5.jsxs("button", {
                      className: desktop_module_default.dockApp,
                      onClick: () => void open(app),
                      title: name(app),
                      "aria-label": t("open") + name(app),
                      children: [
                        /* @__PURE__ */ jsx_runtime5.jsx(AppIcon, {
                          id: app.manifest.id,
                          icon: app.manifest.icon ? "/pages/" + encodeURIComponent(app.instanceId) + "/icon" : undefined
                        }),
                        /* @__PURE__ */ jsx_runtime5.jsx("i", {})
                      ]
                    }),
                    /* @__PURE__ */ jsx_runtime5.jsx("button", {
                      className: desktop_module_default.dockClose,
                      "aria-label": t("close_79c8") + name(app),
                      onClick: () => close(app),
                      children: /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                        name: "close",
                        size: 10
                      })
                    })
                  ]
                }, app.instanceId))
              })
            ]
          })
        ]
      }),
      panel === "apps" && /* @__PURE__ */ jsx_runtime5.jsx(Modal, {
        title: t("your_apps"),
        wide: true,
        className: platform_module_default.appsDialog,
        onClose: () => setPanel(undefined),
        children: /* @__PURE__ */ jsx_runtime5.jsxs("div", {
          className: platform_module_default.library,
          children: [
            /* @__PURE__ */ jsx_runtime5.jsxs("div", {
              className: platform_module_default.libraryActions,
              children: [
                /* @__PURE__ */ jsx_runtime5.jsxs(Button, {
                  disabled: busy,
                  onClick: () => void install(),
                  children: [
                    /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                      name: "plus",
                      size: 15
                    }),
                    t("install_package")
                  ]
                }),
                /* @__PURE__ */ jsx_runtime5.jsxs(Button, {
                  disabled: busy,
                  onClick: () => act("market-refresh"),
                  children: [
                    /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                      name: "refresh",
                      size: 15
                    }),
                    t("check_updates")
                  ]
                })
              ]
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("h3", {
              children: t("installed")
            }),
            applications.map((app) => {
              const available = state.catalog.find((i) => i.id === app.manifest.id && i.version !== app.manifest.version);
              return /* @__PURE__ */ jsx_runtime5.jsxs("section", {
                className: platform_module_default.appRow,
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx(AppIcon, {
                    id: app.manifest.id,
                    icon: app.manifest.icon ? "/pages/" + encodeURIComponent(app.instanceId) + "/icon" : undefined
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                    className: platform_module_default.grow,
                    children: [
                      /* @__PURE__ */ jsx_runtime5.jsx("strong", {
                        children: name(app)
                      }),
                      /* @__PURE__ */ jsx_runtime5.jsxs("p", {
                        children: [
                          label(app.state),
                          " · ",
                          app.manifest.version
                        ]
                      })
                    ]
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                    onClick: () => pin(app, "desktop"),
                    children: state.preferences.desktop.some((id) => id === app.instanceId || id.startsWith(app.instanceId + "/")) ? t("remove_widget") : t("add_widget")
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsxs(Button, {
                    onClick: () => pin(app, "menu"),
                    title: t("menu_bar_shortcut"),
                    children: [
                      /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                        name: "pin",
                        size: 15
                      }),
                      state.preferences.menu.includes(app.instanceId) ? "✓" : ""
                    ]
                  }),
                  available && /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                    disabled: busy,
                    onClick: () => void install(available),
                    children: t("update")
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                    variant: "primary",
                    onClick: () => void open(app),
                    children: t("open_ed07")
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx(Menu, {
                    open: appMenu === app.instanceId,
                    onClose: () => setAppMenu(undefined),
                    anchor: /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                      "aria-label": t("app_actions"),
                      onClick: () => setAppMenu(app.instanceId),
                      children: /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                        name: "more"
                      })
                    }),
                    items: [
                      {
                        id: "close",
                        label: t("close_app"),
                        disabled: app.state === "closed"
                      },
                      {
                        id: "uninstall",
                        label: t("uninstall"),
                        danger: true
                      }
                    ],
                    onSelect: (id) => {
                      if (id === "close")
                        close(app);
                      else
                        setConfirmation({
                          text: t("uninstall_this_app_its_data_will_be"),
                          action: () => act("uninstall", {
                            instanceId: app.instanceId,
                            force: true
                          })
                        });
                    }
                  })
                ]
              }, app.instanceId);
            }),
            !applications.length && /* @__PURE__ */ jsx_runtime5.jsx(Notice, {
              children: t("no_apps_installed_browse_a_market_or")
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("h3", {
              children: t("discover")
            }),
            state.catalog.map((item) => /* @__PURE__ */ jsx_runtime5.jsxs("section", {
              className: platform_module_default.appRow,
              children: [
                /* @__PURE__ */ jsx_runtime5.jsx(AppIcon, {
                  id: item.id
                }),
                /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                  className: platform_module_default.grow,
                  children: [
                    /* @__PURE__ */ jsx_runtime5.jsx("strong", {
                      children: item.name
                    }),
                    /* @__PURE__ */ jsx_runtime5.jsx("p", {
                      children: item.description
                    })
                  ]
                }),
                /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                  disabled: busy || applications.some((a) => a.manifest.id === item.id),
                  onClick: () => void install(item),
                  children: t("install")
                })
              ]
            }, item.marketId + item.id)),
            state.catalogErrors.map((error) => /* @__PURE__ */ jsx_runtime5.jsx(Notice, {
              children: error
            }, error)),
            !state.catalog.length && /* @__PURE__ */ jsx_runtime5.jsx(Button, {
              onClick: () => act("market-refresh"),
              children: t("load_markets")
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("h3", {
              children: t("app_sources")
            }),
            state.markets.map((m) => /* @__PURE__ */ jsx_runtime5.jsxs("div", {
              className: platform_module_default.source,
              children: [
                /* @__PURE__ */ jsx_runtime5.jsx("span", {
                  children: m.name
                }),
                /* @__PURE__ */ jsx_runtime5.jsx("small", {
                  children: m.url
                })
              ]
            }, m.id)),
            /* @__PURE__ */ jsx_runtime5.jsxs("div", {
              className: platform_module_default.actions,
              children: [
                /* @__PURE__ */ jsx_runtime5.jsx(Input, {
                  "aria-label": t("source_name"),
                  placeholder: t("name"),
                  value: marketName,
                  onChange: (e) => setMarketName(e.target.value)
                }),
                /* @__PURE__ */ jsx_runtime5.jsx(Input, {
                  "aria-label": t("market_url"),
                  placeholder: "https://…",
                  value: marketURL,
                  onChange: (e) => setMarketURL(e.target.value)
                }),
                /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                  disabled: !marketName || !marketURL,
                  onClick: () => act("market-add", { name: marketName, url: marketURL }),
                  children: t("add_source")
                })
              ]
            })
          ]
        })
      }),
      panel === "search" && /* @__PURE__ */ jsx_runtime5.jsxs(Modal, {
        title: t("search_apps"),
        onClose: () => setPanel(undefined),
        children: [
          /* @__PURE__ */ jsx_runtime5.jsx(Input, {
            className: platform_module_default.searchInput,
            autoFocus: true,
            type: "search",
            "aria-label": t("search_apps"),
            placeholder: t("search_installed_apps"),
            value: query,
            onChange: (e) => setQuery(e.target.value)
          }),
          /* @__PURE__ */ jsx_runtime5.jsx("div", {
            className: platform_module_default.launcher,
            children: applications.filter((a) => name(a).toLowerCase().includes(query.toLowerCase())).map((app) => /* @__PURE__ */ jsx_runtime5.jsxs("button", {
              onClick: () => void open(app),
              children: [
                /* @__PURE__ */ jsx_runtime5.jsx(AppIcon, {
                  id: app.manifest.id,
                  icon: app.manifest.icon ? "/pages/" + encodeURIComponent(app.instanceId) + "/icon" : undefined
                }),
                /* @__PURE__ */ jsx_runtime5.jsx("span", {
                  children: name(app)
                }),
                /* @__PURE__ */ jsx_runtime5.jsx("small", {
                  children: label(app.state)
                }),
                /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                  name: "arrow",
                  size: 14
                })
              ]
            }, app.instanceId))
          })
        ]
      }),
      panel === "settings" && /* @__PURE__ */ jsx_runtime5.jsx(Modal, {
        title: t("settings"),
        wide: true,
        onClose: () => setPanel(undefined),
        children: /* @__PURE__ */ jsx_runtime5.jsxs("div", {
          className: platform_module_default.settings,
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("nav", {
              children: [
                "general",
                "models",
                ...state.relay.available ? ["phone"] : []
              ].map((key) => /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                variant: tab === key ? "primary" : "ghost",
                onClick: () => setTab(key),
                children: key === "general" ? t("general") : key === "models" ? t("models") : t("phone")
              }, key))
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("section", {
              children: tab === "general" ? /* @__PURE__ */ jsx_runtime5.jsxs(jsx_runtime5.Fragment, {
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx("h3", {
                    children: t("make_fn_feel_like_yours")
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx("p", {
                    className: platform_module_default.secondary,
                    children: t("your_desktop_and_apps_share_these_preferences")
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                    className: platform_module_default.settingRow,
                    children: [
                      /* @__PURE__ */ jsx_runtime5.jsx("span", {
                        children: t("appearance")
                      }),
                      /* @__PURE__ */ jsx_runtime5.jsx(Select, {
                        value: state.preferences.theme,
                        onValueChange: (theme) => prefs({ theme }),
                        label: t("appearance"),
                        options: [
                          { value: "system", label: t("system") },
                          { value: "light", label: t("light") },
                          { value: "dark", label: t("dark") }
                        ]
                      })
                    ]
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                    className: platform_module_default.settingRow,
                    children: [
                      /* @__PURE__ */ jsx_runtime5.jsx("span", {
                        children: t("language")
                      }),
                      /* @__PURE__ */ jsx_runtime5.jsx(Select, {
                        value: state.preferences.locale,
                        onValueChange: (locale) => prefs({ locale }),
                        label: t("language"),
                        options: [
                          { value: "zh-CN", label: "简体中文" },
                          { value: "en", label: "English" }
                        ]
                      })
                    ]
                  })
                ]
              }) : tab === "models" ? /* @__PURE__ */ jsx_runtime5.jsxs(jsx_runtime5.Fragment, {
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx("h3", {
                    children: "ChatGPT"
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx("p", {
                    className: platform_module_default.secondary,
                    children: t("use_your_chatgpt_plan_with_models_managed")
                  }),
                  state.connections.map((account) => /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                    className: platform_module_default.settingRow,
                    children: [
                      /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                        children: [
                          account.email,
                          /* @__PURE__ */ jsx_runtime5.jsx("small", {
                            children: account.enabled ? t("plan_usage_enabled") : t("plan_consent_required")
                          })
                        ]
                      }),
                      !account.enabled && /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                        onClick: () => void command("login", { connectionId: account.id }).then(({ url }) => native.system.openURL({ url })).catch(() => {}),
                        children: t("sign_in_again")
                      }),
                      /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                        disabled: !account.enabled,
                        onClick: () => setConfirmation({
                          text: t("sign_out_of_this_account"),
                          action: () => void command("logout", {
                            connectionId: account.id
                          }).then((result) => {
                            if (!result.revoked)
                              setToast(t("signed_out_locally_remote_revocation_was_not"));
                          }).catch(() => {})
                        }),
                        children: t("sign_out")
                      })
                    ]
                  }, account.id)),
                  /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                    variant: "primary",
                    onClick: () => {
                      command("login").then(({ url }) => native.system.openURL({ url })).catch(() => {});
                    },
                    children: "Continue with ChatGPT"
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                    className: platform_module_default.settingRow,
                    children: [
                      /* @__PURE__ */ jsx_runtime5.jsx("span", {
                        children: t("default_model")
                      }),
                      /* @__PURE__ */ jsx_runtime5.jsx(Select, {
                        value: state.preferences.defaultModel ? state.preferences.defaultModel.connectionId + "/" + state.preferences.defaultModel.model : "",
                        label: t("choose_model"),
                        onValueChange: (value) => {
                          const model = models.find((m) => m.connectionId + "/" + m.id === value);
                          if (model)
                            prefs({
                              defaultModel: {
                                connectionId: model.connectionId,
                                model: model.id
                              }
                            });
                        },
                        options: models.map((m) => ({
                          value: m.connectionId + "/" + m.id,
                          label: m.name
                        }))
                      })
                    ]
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx("a", {
                    href: "https://chatgpt.com/#settings/usage",
                    target: "_blank",
                    rel: "noreferrer",
                    children: t("manage_chatgpt_usage")
                  })
                ]
              }) : /* @__PURE__ */ jsx_runtime5.jsxs(jsx_runtime5.Fragment, {
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx("h3", {
                    children: t("chat_anywhere_run_on_your_desktop")
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx("p", {
                    className: platform_module_default.secondary,
                    children: t("messages_wait_until_you_start_their_desktop")
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx(Notice, {
                    children: state.relay.error ?? (state.relay.connected ? t("connected_to_icloud") : t("not_connected"))
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                    className: platform_module_default.actions,
                    children: [
                      /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                        onClick: () => act(state.relay.connected ? "phone-disconnect" : "phone-connect"),
                        children: state.relay.connected ? t("disconnect") : t("connect_icloud")
                      }),
                      /* @__PURE__ */ jsx_runtime5.jsxs(Button, {
                        onClick: () => setPanel("phone"),
                        children: [
                          /* @__PURE__ */ jsx_runtime5.jsx(Icon, {
                            name: "phone",
                            size: 16
                          }),
                          t("phone_messages"),
                          waiting > 0 ? ` · ${waiting}` : ""
                        ]
                      })
                    ]
                  })
                ]
              })
            })
          ]
        })
      }),
      panel === "notifications" && /* @__PURE__ */ jsx_runtime5.jsxs(Modal, {
        title: t("notifications"),
        onClose: () => setPanel(undefined),
        children: [
          !state.notifications.length && /* @__PURE__ */ jsx_runtime5.jsx("p", {
            children: t("no_notifications")
          }),
          state.notifications.map((notice) => /* @__PURE__ */ jsx_runtime5.jsxs("article", {
            className: platform_module_default.message,
            children: [
              /* @__PURE__ */ jsx_runtime5.jsxs("small", {
                children: [
                  new Date(notice.createdAt).toLocaleString(state.preferences.locale),
                  " ",
                  "·",
                  " ",
                  applications.find((a) => a.instanceId === notice.instanceId)?.manifest.name && name(applications.find((a) => a.instanceId === notice.instanceId)) || "Fn"
                ]
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("p", {
                children: notice.text
              })
            ]
          }, notice.id)),
          !!state.notifications.length && /* @__PURE__ */ jsx_runtime5.jsx(Button, {
            onClick: () => act("notifications-clear"),
            children: t("clear_notifications")
          })
        ]
      }),
      panel === "phone" && state.relay.available && /* @__PURE__ */ jsx_runtime5.jsxs(Modal, {
        title: t("phone_messages"),
        onClose: () => setPanel(undefined),
        children: [
          !state.relay.connected && /* @__PURE__ */ jsx_runtime5.jsx(Button, {
            onClick: () => act("phone-connect"),
            children: t("connect_icloud")
          }),
          state.relay.error && /* @__PURE__ */ jsx_runtime5.jsx(Notice, {
            children: state.relay.error
          }),
          !state.relay.messages.length && /* @__PURE__ */ jsx_runtime5.jsx("p", {
            className: platform_module_default.secondary,
            children: t("messages_appear_here_closed_apps_stay_closed")
          }),
          state.relay.messages.map((message) => /* @__PURE__ */ jsx_runtime5.jsxs("div", {
            className: platform_module_default.message,
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx("small", {
                children: label(message.status)
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("p", {
                children: message.text
              }),
              message.reply && /* @__PURE__ */ jsx_runtime5.jsx("blockquote", {
                children: message.reply
              }),
              message.error && /* @__PURE__ */ jsx_runtime5.jsx(Notice, {
                children: message.error
              }),
              message.status === "waiting" && /* @__PURE__ */ jsx_runtime5.jsxs("div", {
                className: platform_module_default.actions,
                children: [
                  /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                    onClick: () => {
                      const app = applications.find((a) => a.instanceId === message.instanceId);
                      if (app)
                        open(app);
                    },
                    children: t("start_app")
                  }),
                  /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                    onClick: () => act("phone-cancel", { id: message.id }),
                    children: t("cancel")
                  })
                ]
              })
            ]
          }, message.id))
        ]
      }),
      confirmation && /* @__PURE__ */ jsx_runtime5.jsxs(Modal, {
        title: t("confirm"),
        onClose: () => setConfirmation(undefined),
        children: [
          /* @__PURE__ */ jsx_runtime5.jsx("p", {
            children: confirmation.text
          }),
          /* @__PURE__ */ jsx_runtime5.jsxs("div", {
            className: platform_module_default.actions,
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                onClick: () => setConfirmation(undefined),
                children: t("cancel")
              }),
              /* @__PURE__ */ jsx_runtime5.jsx(Button, {
                variant: "primary",
                onClick: () => {
                  confirmation.action();
                  setConfirmation(undefined);
                },
                children: t("confirm")
              })
            ]
          })
        ]
      }),
      toast && /* @__PURE__ */ jsx_runtime5.jsx(Toast, {
        text: toast,
        onClose: () => setToast("")
      })
    ]
  });
}
import_client2.createRoot(document.getElementById("root")).render(new URLSearchParams(location.search).has("widget-preview") ? /* @__PURE__ */ jsx_runtime5.jsx(WidgetPreview, {
  id: new URLSearchParams(location.search).get("widget-preview")
}) : /* @__PURE__ */ jsx_runtime5.jsx(Desktop, {}));

//# debugId=C01E04ACAB3ABE3E64756E2164756E21
//# sourceMappingURL=chunk-6n6svjgf.js.map
