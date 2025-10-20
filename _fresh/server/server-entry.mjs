var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _internal, _buildCache, _additionalStyles, _getBuildCache, _commands;
function checkWindows() {
  const global2 = globalThis;
  const os = global2.Deno?.build?.os;
  return typeof os === "string" ? os === "windows" : global2.navigator?.platform?.startsWith("Win") ?? global2.process?.platform?.startsWith("win") ?? false;
}
const isWindows = checkWindows();
function assertPath(path) {
  if (typeof path !== "string") {
    throw new TypeError(`Path must be a string, received "${JSON.stringify(path)}"`);
  }
}
function assertArg$1(url) {
  url = url instanceof URL ? url : new URL(url);
  if (url.protocol !== "file:") {
    throw new TypeError(`URL must be a file URL: received "${url.protocol}"`);
  }
  return url;
}
function fromFileUrl$2(url) {
  url = assertArg$1(url);
  return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
const CHAR_UPPERCASE_A = 65;
const CHAR_LOWERCASE_A = 97;
const CHAR_UPPERCASE_Z = 90;
const CHAR_LOWERCASE_Z = 122;
const CHAR_DOT = 46;
const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const CHAR_COLON = 58;
function isPosixPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH;
}
function isPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH || code2 === CHAR_BACKWARD_SLASH;
}
function isWindowsDeviceRoot(code2) {
  return code2 >= CHAR_LOWERCASE_A && code2 <= CHAR_LOWERCASE_Z || code2 >= CHAR_UPPERCASE_A && code2 <= CHAR_UPPERCASE_Z;
}
function fromFileUrl$1(url) {
  url = assertArg$1(url);
  let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  if (url.hostname !== "") {
    path = `\\\\${url.hostname}${path}`;
  }
  return path;
}
function fromFileUrl(url) {
  return isWindows ? fromFileUrl$1(url) : fromFileUrl$2(url);
}
function isAbsolute$2(path) {
  assertPath(path);
  return path.length > 0 && isPosixPathSeparator(path.charCodeAt(0));
}
function isAbsolute$1(path) {
  assertPath(path);
  const len = path.length;
  if (len === 0) return false;
  const code2 = path.charCodeAt(0);
  if (isPathSeparator(code2)) {
    return true;
  } else if (isWindowsDeviceRoot(code2)) {
    if (len > 2 && path.charCodeAt(1) === CHAR_COLON) {
      if (isPathSeparator(path.charCodeAt(2))) return true;
    }
  }
  return false;
}
function isAbsolute(path) {
  return isWindows ? isAbsolute$1(path) : isAbsolute$2(path);
}
function assertArg(path) {
  assertPath(path);
  if (path.length === 0) return ".";
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code2;
  for (let i2 = 0; i2 <= path.length; ++i2) {
    if (i2 < path.length) code2 = path.charCodeAt(i2);
    else if (isPathSeparator2(code2)) break;
    else code2 = CHAR_FORWARD_SLASH;
    if (isPathSeparator2(code2)) {
      if (lastSlash === i2 - 1 || dots === 1) ;
      else if (lastSlash !== i2 - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i2;
            dots = 0;
            continue;
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i2;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) res += `${separator}..`;
          else res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += separator + path.slice(lastSlash + 1, i2);
        else res = path.slice(lastSlash + 1, i2);
        lastSegmentLength = i2 - lastSlash - 1;
      }
      lastSlash = i2;
      dots = 0;
    } else if (code2 === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
function normalize$1(path) {
  if (path instanceof URL) {
    path = fromFileUrl$2(path);
  }
  assertArg(path);
  const isAbsolute2 = isPosixPathSeparator(path.charCodeAt(0));
  const trailingSeparator = isPosixPathSeparator(path.charCodeAt(path.length - 1));
  path = normalizeString(path, !isAbsolute2, "/", isPosixPathSeparator);
  if (path.length === 0 && !isAbsolute2) path = ".";
  if (path.length > 0 && trailingSeparator) path += "/";
  if (isAbsolute2) return `/${path}`;
  return path;
}
function join$2(path, ...paths) {
  if (path === void 0) return ".";
  if (path instanceof URL) {
    path = fromFileUrl$2(path);
  }
  paths = path ? [path, ...paths] : paths;
  paths.forEach((path2) => assertPath(path2));
  const joined = paths.filter((path2) => path2.length > 0).join("/");
  return joined === "" ? "." : normalize$1(joined);
}
function normalize(path) {
  if (path instanceof URL) {
    path = fromFileUrl$1(path);
  }
  assertArg(path);
  const len = path.length;
  let rootEnd = 0;
  let device;
  let isAbsolute2 = false;
  const code2 = path.charCodeAt(0);
  if (len > 1) {
    if (isPathSeparator(code2)) {
      isAbsolute2 = true;
      if (isPathSeparator(path.charCodeAt(1))) {
        let j2 = 2;
        let last = j2;
        for (; j2 < len; ++j2) {
          if (isPathSeparator(path.charCodeAt(j2))) break;
        }
        if (j2 < len && j2 !== last) {
          const firstPart = path.slice(last, j2);
          last = j2;
          for (; j2 < len; ++j2) {
            if (!isPathSeparator(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            last = j2;
            for (; j2 < len; ++j2) {
              if (isPathSeparator(path.charCodeAt(j2))) break;
            }
            if (j2 === len) {
              return `\\\\${firstPart}\\${path.slice(last)}\\`;
            } else if (j2 !== last) {
              device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
              rootEnd = j2;
            }
          }
        }
      } else {
        rootEnd = 1;
      }
    } else if (isWindowsDeviceRoot(code2)) {
      if (path.charCodeAt(1) === CHAR_COLON) {
        device = path.slice(0, 2);
        rootEnd = 2;
        if (len > 2) {
          if (isPathSeparator(path.charCodeAt(2))) {
            isAbsolute2 = true;
            rootEnd = 3;
          }
        }
      }
    }
  } else if (isPathSeparator(code2)) {
    return "\\";
  }
  let tail;
  if (rootEnd < len) {
    tail = normalizeString(path.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
  } else {
    tail = "";
  }
  if (tail.length === 0 && !isAbsolute2) tail = ".";
  if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
    tail += "\\";
  }
  if (device === void 0) {
    if (isAbsolute2) {
      if (tail.length > 0) return `\\${tail}`;
      else return "\\";
    }
    return tail;
  } else if (isAbsolute2) {
    if (tail.length > 0) return `${device}\\${tail}`;
    else return `${device}\\`;
  }
  return device + tail;
}
function join$1(path, ...paths) {
  if (path instanceof URL) {
    path = fromFileUrl$1(path);
  }
  paths = path ? [path, ...paths] : paths;
  paths.forEach((path2) => assertPath(path2));
  paths = paths.filter((path2) => path2.length > 0);
  if (paths.length === 0) return ".";
  let needsReplace = true;
  let slashCount = 0;
  const firstPart = paths[0];
  if (isPathSeparator(firstPart.charCodeAt(0))) {
    ++slashCount;
    const firstLen = firstPart.length;
    if (firstLen > 1) {
      if (isPathSeparator(firstPart.charCodeAt(1))) {
        ++slashCount;
        if (firstLen > 2) {
          if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
          else {
            needsReplace = false;
          }
        }
      }
    }
  }
  let joined = paths.join("\\");
  if (needsReplace) {
    for (; slashCount < joined.length; ++slashCount) {
      if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
    }
    if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
  }
  return normalize(joined);
}
function join(path, ...paths) {
  return isWindows ? join$1(path, ...paths) : join$2(path, ...paths);
}
function resolve$1(...pathSegments) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
    let path;
    if (i2 >= 0) path = pathSegments[i2];
    else {
      const { Deno: Deno2 } = globalThis;
      if (typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a current working directory (CWD)");
      }
      path = Deno2.cwd();
    }
    assertPath(path);
    if (path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isPosixPathSeparator(path.charCodeAt(0));
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) return `/${resolvedPath}`;
    else return "/";
  } else if (resolvedPath.length > 0) return resolvedPath;
  else return ".";
}
function assertArgs(from, to) {
  assertPath(from);
  assertPath(to);
  if (from === to) return "";
}
function relative$2(from, to) {
  assertArgs(from, to);
  from = resolve$1(from);
  to = resolve$1(to);
  if (from === to) return "";
  let fromStart = 1;
  const fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (!isPosixPathSeparator(from.charCodeAt(fromStart))) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 1;
  const toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (!isPosixPathSeparator(to.charCodeAt(toStart))) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (isPosixPathSeparator(to.charCodeAt(toStart + i2))) {
          return to.slice(toStart + i2 + 1);
        } else if (i2 === 0) {
          return to.slice(toStart + i2);
        }
      } else if (fromLen > length) {
        if (isPosixPathSeparator(from.charCodeAt(fromStart + i2))) {
          lastCommonSep = i2;
        } else if (i2 === 0) {
          lastCommonSep = 0;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i2);
    const toCode = to.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (isPosixPathSeparator(fromCode)) lastCommonSep = i2;
  }
  let out = "";
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || isPosixPathSeparator(from.charCodeAt(i2))) {
      if (out.length === 0) out += "..";
      else out += "/..";
    }
  }
  if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
  else {
    toStart += lastCommonSep;
    if (isPosixPathSeparator(to.charCodeAt(toStart))) ++toStart;
    return to.slice(toStart);
  }
}
function resolve(...pathSegments) {
  let resolvedDevice = "";
  let resolvedTail = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1; i2--) {
    let path;
    const { Deno: Deno2 } = globalThis;
    if (i2 >= 0) {
      path = pathSegments[i2];
    } else if (!resolvedDevice) {
      if (typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a drive-letter-less path without a current working directory (CWD)");
      }
      path = Deno2.cwd();
    } else {
      if (typeof Deno2?.env?.get !== "function" || typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a current working directory (CWD)");
      }
      path = Deno2.cwd();
      if (path === void 0 || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
        path = `${resolvedDevice}\\`;
      }
    }
    assertPath(path);
    const len = path.length;
    if (len === 0) continue;
    let rootEnd = 0;
    let device = "";
    let isAbsolute2 = false;
    const code2 = path.charCodeAt(0);
    if (len > 1) {
      if (isPathSeparator(code2)) {
        isAbsolute2 = true;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j2 = 2;
          let last = j2;
          for (; j2 < len; ++j2) {
            if (isPathSeparator(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            const firstPart = path.slice(last, j2);
            last = j2;
            for (; j2 < len; ++j2) {
              if (!isPathSeparator(path.charCodeAt(j2))) break;
            }
            if (j2 < len && j2 !== last) {
              last = j2;
              for (; j2 < len; ++j2) {
                if (isPathSeparator(path.charCodeAt(j2))) break;
              }
              if (j2 === len) {
                device = `\\\\${firstPart}\\${path.slice(last)}`;
                rootEnd = j2;
              } else if (j2 !== last) {
                device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
                rootEnd = j2;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code2)) {
        if (path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2) {
            if (isPathSeparator(path.charCodeAt(2))) {
              isAbsolute2 = true;
              rootEnd = 3;
            }
          }
        }
      }
    } else if (isPathSeparator(code2)) {
      rootEnd = 1;
      isAbsolute2 = true;
    }
    if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }
    if (resolvedDevice.length === 0 && device.length > 0) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
      resolvedAbsolute = isAbsolute2;
    }
    if (resolvedAbsolute && resolvedDevice.length > 0) break;
  }
  resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
  return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function relative$1(from, to) {
  assertArgs(from, to);
  const fromOrig = resolve(from);
  const toOrig = resolve(to);
  if (fromOrig === toOrig) return "";
  from = fromOrig.toLowerCase();
  to = toOrig.toLowerCase();
  if (from === to) return "";
  let fromStart = 0;
  let fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; fromEnd - 1 > fromStart; --fromEnd) {
    if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 0;
  let toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; toEnd - 1 > toStart; --toEnd) {
    if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i2) === CHAR_BACKWARD_SLASH) {
          return toOrig.slice(toStart + i2 + 1);
        } else if (i2 === 2) {
          return toOrig.slice(toStart + i2);
        }
      }
      if (fromLen > length) {
        if (from.charCodeAt(fromStart + i2) === CHAR_BACKWARD_SLASH) {
          lastCommonSep = i2;
        } else if (i2 === 2) {
          lastCommonSep = 3;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i2);
    const toCode = to.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (fromCode === CHAR_BACKWARD_SLASH) lastCommonSep = i2;
  }
  if (i2 !== length && lastCommonSep === -1) {
    return toOrig;
  }
  let out = "";
  if (lastCommonSep === -1) lastCommonSep = 0;
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || from.charCodeAt(i2) === CHAR_BACKWARD_SLASH) {
      if (out.length === 0) out += "..";
      else out += "\\..";
    }
  }
  if (out.length > 0) {
    return out + toOrig.slice(toStart + lastCommonSep, toEnd);
  } else {
    toStart += lastCommonSep;
    if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) ++toStart;
    return toOrig.slice(toStart, toEnd);
  }
}
function relative(from, to) {
  return isWindows ? relative$1(from, to) : relative$2(from, to);
}
var exports$K = {};
Object.defineProperty(exports$K, "__esModule", { value: true });
exports$K.VERSION = void 0;
exports$K.VERSION = "1.9.0";
var _VERSION = exports$K.VERSION;
const _default$K = exports$K.default ?? exports$K;
_default$K.VERSION = _VERSION;
var __require$J = exports$K;
var __esModule$J = exports$K.__esModule;
const _mod2$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  VERSION: _VERSION,
  __esModule: __esModule$J,
  __require: __require$J,
  default: _default$K
}, Symbol.toStringTag, { value: "Module" }));
var exports$J = {};
Object.defineProperty(exports$J, "__esModule", { value: true });
const version_1$1 = __require$J ?? _default$K ?? _mod2$6;
const re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function _makeCompatibilityCheck(ownVersion) {
  const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  const rejectedVersions = /* @__PURE__ */ new Set();
  const myVersionMatch = ownVersion.match(re);
  if (!myVersionMatch) {
    return () => false;
  }
  const ownVersionParsed = { major: +myVersionMatch[1], minor: +myVersionMatch[2], patch: +myVersionMatch[3], prerelease: myVersionMatch[4] };
  if (ownVersionParsed.prerelease != null) {
    return function isExactmatch(globalVersion) {
      return globalVersion === ownVersion;
    };
  }
  function _reject(v2) {
    rejectedVersions.add(v2);
    return false;
  }
  function _accept(v2) {
    acceptedVersions.add(v2);
    return true;
  }
  return function isCompatible(globalVersion) {
    if (acceptedVersions.has(globalVersion)) {
      return true;
    }
    if (rejectedVersions.has(globalVersion)) {
      return false;
    }
    const globalVersionMatch = globalVersion.match(re);
    if (!globalVersionMatch) {
      return _reject(globalVersion);
    }
    const globalVersionParsed = { major: +globalVersionMatch[1], minor: +globalVersionMatch[2], patch: +globalVersionMatch[3], prerelease: globalVersionMatch[4] };
    if (globalVersionParsed.prerelease != null) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major !== globalVersionParsed.major) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) {
      return _accept(globalVersion);
    }
    return _reject(globalVersion);
  };
}
exports$J._makeCompatibilityCheck = _makeCompatibilityCheck;
exports$J.isCompatible = _makeCompatibilityCheck(version_1$1.VERSION);
var _makeCompatibilityCheck2 = exports$J._makeCompatibilityCheck;
var _isCompatible = exports$J.isCompatible;
const _default$J = exports$J.default ?? exports$J;
_default$J._makeCompatibilityCheck = _makeCompatibilityCheck2;
_default$J.isCompatible = _isCompatible;
var __require$I = exports$J;
var __esModule$I = exports$J.__esModule;
const _mod3$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$I,
  __require: __require$I,
  _makeCompatibilityCheck: _makeCompatibilityCheck2,
  default: _default$J,
  isCompatible: _isCompatible
}, Symbol.toStringTag, { value: "Module" }));
var exports$I = {};
Object.defineProperty(exports$I, "__esModule", { value: true });
exports$I._globalThis = void 0;
exports$I._globalThis = typeof globalThis === "object" ? globalThis : global;
var _globalThis = exports$I._globalThis;
const _default$I = exports$I.default ?? exports$I;
_default$I._globalThis = _globalThis;
var __require$H = exports$I;
var __esModule$H = exports$I.__esModule;
const _ns$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$H,
  __require: __require$H,
  _globalThis,
  default: _default$I
}, Symbol.toStringTag, { value: "Module" }));
var exports$H = {};
var __createBinding$1 = Object.create ? function(o2, m2, k2, k22) {
  if (k22 === void 0) k22 = k2;
  Object.defineProperty(o2, k22, { enumerable: true, get: function() {
    return m2[k2];
  } });
} : function(o2, m2, k2, k22) {
  if (k22 === void 0) k22 = k2;
  o2[k22] = m2[k2];
};
(function(m2, exports2) {
  for (var p2 in m2) if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2)) __createBinding$1(exports2, m2, p2);
});
Object.defineProperty(exports$H, "__esModule", { value: true });
const _default$H = exports$H.default ?? exports$H;
for (var _k$1 in _ns$1) if (_k$1 !== "default" && _k$1 !== "__esModule" && Object.prototype.hasOwnProperty.call(_ns$1, _k$1)) _default$H[_k$1] = _ns$1[_k$1];
var __require$G = exports$H;
var __esModule$G = exports$H.__esModule;
const _ns = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$G,
  __require: __require$G,
  _globalThis,
  default: _default$H
}, Symbol.toStringTag, { value: "Module" }));
var exports$G = {};
var __createBinding = Object.create ? function(o2, m2, k2, k22) {
  if (k22 === void 0) k22 = k2;
  Object.defineProperty(o2, k22, { enumerable: true, get: function() {
    return m2[k2];
  } });
} : function(o2, m2, k2, k22) {
  if (k22 === void 0) k22 = k2;
  o2[k22] = m2[k2];
};
(function(m2, exports2) {
  for (var p2 in m2) if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2)) __createBinding(exports2, m2, p2);
});
Object.defineProperty(exports$G, "__esModule", { value: true });
const _default$G = exports$G.default ?? exports$G;
for (var _k in _ns) if (_k !== "default" && _k !== "__esModule" && Object.prototype.hasOwnProperty.call(_ns, _k)) _default$G[_k] = _ns[_k];
var __require$F = exports$G;
var __esModule$F = exports$G.__esModule;
const _mod$c = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$F,
  __require: __require$F,
  _globalThis,
  default: _default$G
}, Symbol.toStringTag, { value: "Module" }));
var exports$F = {};
Object.defineProperty(exports$F, "__esModule", { value: true });
const platform_1 = __require$F ?? _default$G ?? _mod$c;
const version_1 = __require$J ?? _default$K ?? _mod2$6;
const semver_1 = __require$I ?? _default$J ?? _mod3$3;
const major = version_1.VERSION.split(".")[0];
const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(`opentelemetry.js.api.${major}`);
const _global = platform_1._globalThis;
function registerGlobal(type, instance, diag2, allowOverride = false) {
  var _a;
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : { version: version_1.VERSION };
  if (!allowOverride && api[type]) {
    const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
    diag2.error(err.stack || err.message);
    return false;
  }
  if (api.version !== version_1.VERSION) {
    const err = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${version_1.VERSION}`);
    diag2.error(err.stack || err.message);
    return false;
  }
  api[type] = instance;
  diag2.debug(`@opentelemetry/api: Registered a global for ${type} v${version_1.VERSION}.`);
  return true;
}
exports$F.registerGlobal = registerGlobal;
function getGlobal(type) {
  var _a, _b;
  const globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
  if (!globalVersion || !(0, semver_1.isCompatible)(globalVersion)) {
    return;
  }
  return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
exports$F.getGlobal = getGlobal;
function unregisterGlobal(type, diag2) {
  diag2.debug(`@opentelemetry/api: Unregistering a global for ${type} v${version_1.VERSION}.`);
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) {
    delete api[type];
  }
}
exports$F.unregisterGlobal = unregisterGlobal;
var _registerGlobal = exports$F.registerGlobal;
var _getGlobal = exports$F.getGlobal;
var _unregisterGlobal = exports$F.unregisterGlobal;
const _default$F = exports$F.default ?? exports$F;
_default$F.registerGlobal = _registerGlobal;
_default$F.getGlobal = _getGlobal;
_default$F.unregisterGlobal = _unregisterGlobal;
var __require$E = exports$F;
var __esModule$E = exports$F.__esModule;
const _mod2$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$E,
  __require: __require$E,
  default: _default$F,
  getGlobal: _getGlobal,
  registerGlobal: _registerGlobal,
  unregisterGlobal: _unregisterGlobal
}, Symbol.toStringTag, { value: "Module" }));
var exports$E = {};
Object.defineProperty(exports$E, "__esModule", { value: true });
exports$E.DiagLogLevel = void 0;
(function(DiagLogLevel) {
  DiagLogLevel[DiagLogLevel["NONE"] = 0] = "NONE";
  DiagLogLevel[DiagLogLevel["ERROR"] = 30] = "ERROR";
  DiagLogLevel[DiagLogLevel["WARN"] = 50] = "WARN";
  DiagLogLevel[DiagLogLevel["INFO"] = 60] = "INFO";
  DiagLogLevel[DiagLogLevel["DEBUG"] = 70] = "DEBUG";
  DiagLogLevel[DiagLogLevel["VERBOSE"] = 80] = "VERBOSE";
  DiagLogLevel[DiagLogLevel["ALL"] = 9999] = "ALL";
})(exports$E.DiagLogLevel || (exports$E.DiagLogLevel = {}));
var _DiagLogLevel$1 = exports$E.DiagLogLevel;
const _default$E = exports$E.default ?? exports$E;
_default$E.DiagLogLevel = _DiagLogLevel$1;
var __require$D = exports$E;
var __esModule$D = exports$E.__esModule;
const _mod4$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagLogLevel: _DiagLogLevel$1,
  __esModule: __esModule$D,
  __require: __require$D,
  default: _default$E
}, Symbol.toStringTag, { value: "Module" }));
var exports$D = {};
Object.defineProperty(exports$D, "__esModule", { value: true });
exports$D.createLogLevelDiagLogger = void 0;
const types_1$2 = __require$D ?? _default$E ?? _mod4$2;
function createLogLevelDiagLogger(maxLevel, logger) {
  if (maxLevel < types_1$2.DiagLogLevel.NONE) {
    maxLevel = types_1$2.DiagLogLevel.NONE;
  } else if (maxLevel > types_1$2.DiagLogLevel.ALL) {
    maxLevel = types_1$2.DiagLogLevel.ALL;
  }
  logger = logger || {};
  function _filterFunc(funcName, theLevel) {
    const theFunc = logger[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) {
      return theFunc.bind(logger);
    }
    return function() {
    };
  }
  return { error: _filterFunc("error", types_1$2.DiagLogLevel.ERROR), warn: _filterFunc("warn", types_1$2.DiagLogLevel.WARN), info: _filterFunc("info", types_1$2.DiagLogLevel.INFO), debug: _filterFunc("debug", types_1$2.DiagLogLevel.DEBUG), verbose: _filterFunc("verbose", types_1$2.DiagLogLevel.VERBOSE) };
}
exports$D.createLogLevelDiagLogger = createLogLevelDiagLogger;
var _createLogLevelDiagLogger = exports$D.createLogLevelDiagLogger;
const _default$D = exports$D.default ?? exports$D;
_default$D.createLogLevelDiagLogger = _createLogLevelDiagLogger;
var __require$C = exports$D;
var __esModule$C = exports$D.__esModule;
const _mod2$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$C,
  __require: __require$C,
  createLogLevelDiagLogger: _createLogLevelDiagLogger,
  default: _default$D
}, Symbol.toStringTag, { value: "Module" }));
var exports$C = {};
Object.defineProperty(exports$C, "__esModule", { value: true });
exports$C.DiagComponentLogger = void 0;
const global_utils_1$5 = __require$E ?? _default$F ?? _mod2$5;
class DiagComponentLogger {
  constructor(props) {
    this._namespace = props.namespace || "DiagComponentLogger";
  }
  debug(...args) {
    return logProxy("debug", this._namespace, args);
  }
  error(...args) {
    return logProxy("error", this._namespace, args);
  }
  info(...args) {
    return logProxy("info", this._namespace, args);
  }
  warn(...args) {
    return logProxy("warn", this._namespace, args);
  }
  verbose(...args) {
    return logProxy("verbose", this._namespace, args);
  }
}
exports$C.DiagComponentLogger = DiagComponentLogger;
function logProxy(funcName, namespace, args) {
  const logger = (0, global_utils_1$5.getGlobal)("diag");
  if (!logger) {
    return;
  }
  args.unshift(namespace);
  return logger[funcName](...args);
}
var _DiagComponentLogger = exports$C.DiagComponentLogger;
const _default$C = exports$C.default ?? exports$C;
_default$C.DiagComponentLogger = _DiagComponentLogger;
var __require$B = exports$C;
var __esModule$B = exports$C.__esModule;
const _mod$b = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagComponentLogger: _DiagComponentLogger,
  __esModule: __esModule$B,
  __require: __require$B,
  default: _default$C
}, Symbol.toStringTag, { value: "Module" }));
var exports$B = {};
Object.defineProperty(exports$B, "__esModule", { value: true });
exports$B.DiagAPI = void 0;
const ComponentLogger_1 = __require$B ?? _default$C ?? _mod$b;
const logLevelLogger_1 = __require$C ?? _default$D ?? _mod2$4;
const types_1$1 = __require$D ?? _default$E ?? _mod4$2;
const global_utils_1$4 = __require$E ?? _default$F ?? _mod2$5;
const API_NAME$4 = "diag";
class DiagAPI {
  /**
  * Private internal constructor
  * @private
  */
  constructor() {
    function _logProxy(funcName) {
      return function(...args) {
        const logger = (0, global_utils_1$4.getGlobal)("diag");
        if (!logger) return;
        return logger[funcName](...args);
      };
    }
    const self = this;
    const setLogger = (logger, optionsOrLogLevel = { logLevel: types_1$1.DiagLogLevel.INFO }) => {
      var _a, _b, _c;
      if (logger === self) {
        const err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
        self.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
        return false;
      }
      if (typeof optionsOrLogLevel === "number") {
        optionsOrLogLevel = { logLevel: optionsOrLogLevel };
      }
      const oldLogger = (0, global_utils_1$4.getGlobal)("diag");
      const newLogger = (0, logLevelLogger_1.createLogLevelDiagLogger)((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : types_1$1.DiagLogLevel.INFO, logger);
      if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
        const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
        oldLogger.warn(`Current logger will be overwritten from ${stack}`);
        newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
      }
      return (0, global_utils_1$4.registerGlobal)("diag", newLogger, self, true);
    };
    self.setLogger = setLogger;
    self.disable = () => {
      (0, global_utils_1$4.unregisterGlobal)(API_NAME$4, self);
    };
    self.createComponentLogger = (options2) => {
      return new ComponentLogger_1.DiagComponentLogger(options2);
    };
    self.verbose = _logProxy("verbose");
    self.debug = _logProxy("debug");
    self.info = _logProxy("info");
    self.warn = _logProxy("warn");
    self.error = _logProxy("error");
  }
  /** Get the singleton instance of the DiagAPI API */
  static instance() {
    if (!this._instance) {
      this._instance = new DiagAPI();
    }
    return this._instance;
  }
}
exports$B.DiagAPI = DiagAPI;
var _DiagAPI = exports$B.DiagAPI;
const _default$B = exports$B.default ?? exports$B;
_default$B.DiagAPI = _DiagAPI;
var __require$A = exports$B;
var __esModule$A = exports$B.__esModule;
const _mod$a = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagAPI: _DiagAPI,
  __esModule: __esModule$A,
  __require: __require$A,
  default: _default$B
}, Symbol.toStringTag, { value: "Module" }));
var exports$A = {};
Object.defineProperty(exports$A, "__esModule", { value: true });
function createContextKey(description) {
  return Symbol.for(description);
}
exports$A.createContextKey = createContextKey;
class BaseContext {
  /**
  * Construct a new context which inherits values from an optional parent context.
  *
  * @param parentContext a context from which to inherit values
  */
  constructor(parentContext) {
    const self = this;
    self._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
    self.getValue = (key) => self._currentContext.get(key);
    self.setValue = (key, value) => {
      const context = new BaseContext(self._currentContext);
      context._currentContext.set(key, value);
      return context;
    };
    self.deleteValue = (key) => {
      const context = new BaseContext(self._currentContext);
      context._currentContext.delete(key);
      return context;
    };
  }
}
exports$A.ROOT_CONTEXT = new BaseContext();
var _createContextKey$1 = exports$A.createContextKey;
var _ROOT_CONTEXT$1 = exports$A.ROOT_CONTEXT;
const _default$A = exports$A.default ?? exports$A;
_default$A.createContextKey = _createContextKey$1;
_default$A.ROOT_CONTEXT = _ROOT_CONTEXT$1;
var __require$z = exports$A;
var __esModule$z = exports$A.__esModule;
const _mod2$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ROOT_CONTEXT: _ROOT_CONTEXT$1,
  __esModule: __esModule$z,
  __require: __require$z,
  createContextKey: _createContextKey$1,
  default: _default$A
}, Symbol.toStringTag, { value: "Module" }));
var exports$z = {};
Object.defineProperty(exports$z, "__esModule", { value: true });
exports$z.NoopContextManager = void 0;
const context_1$5 = __require$z ?? _default$A ?? _mod2$3;
class NoopContextManager {
  active() {
    return context_1$5.ROOT_CONTEXT;
  }
  with(_context2, fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  bind(_context2, target) {
    return target;
  }
  enable() {
    return this;
  }
  disable() {
    return this;
  }
}
exports$z.NoopContextManager = NoopContextManager;
var _NoopContextManager = exports$z.NoopContextManager;
const _default$z = exports$z.default ?? exports$z;
_default$z.NoopContextManager = _NoopContextManager;
var __require$y = exports$z;
var __esModule$y = exports$z.__esModule;
const _mod$9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopContextManager: _NoopContextManager,
  __esModule: __esModule$y,
  __require: __require$y,
  default: _default$z
}, Symbol.toStringTag, { value: "Module" }));
var exports$y = {};
Object.defineProperty(exports$y, "__esModule", { value: true });
exports$y.ContextAPI = void 0;
const NoopContextManager_1 = __require$y ?? _default$z ?? _mod$9;
const global_utils_1$3 = __require$E ?? _default$F ?? _mod2$5;
const diag_1$5 = __require$A ?? _default$B ?? _mod$a;
const API_NAME$3 = "context";
const NOOP_CONTEXT_MANAGER = new NoopContextManager_1.NoopContextManager();
class ContextAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
  }
  /** Get the singleton instance of the Context API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new ContextAPI();
    }
    return this._instance;
  }
  /**
  * Set the current context manager.
  *
  * @returns true if the context manager was successfully registered, else false
  */
  setGlobalContextManager(contextManager) {
    return (0, global_utils_1$3.registerGlobal)(API_NAME$3, contextManager, diag_1$5.DiagAPI.instance());
  }
  /**
  * Get the currently active context
  */
  active() {
    return this._getContextManager().active();
  }
  /**
  * Execute a function with an active context
  *
  * @param context context to be active during function execution
  * @param fn function to execute in a context
  * @param thisArg optional receiver to be used for calling fn
  * @param args optional arguments forwarded to fn
  */
  with(context, fn, thisArg, ...args) {
    return this._getContextManager().with(context, fn, thisArg, ...args);
  }
  /**
  * Bind a context to a target function or event emitter
  *
  * @param context context to bind to the event emitter or function. Defaults to the currently active context
  * @param target function or event emitter to bind
  */
  bind(context, target) {
    return this._getContextManager().bind(context, target);
  }
  _getContextManager() {
    return (0, global_utils_1$3.getGlobal)(API_NAME$3) || NOOP_CONTEXT_MANAGER;
  }
  /** Disable and remove the global context manager */
  disable() {
    this._getContextManager().disable();
    (0, global_utils_1$3.unregisterGlobal)(API_NAME$3, diag_1$5.DiagAPI.instance());
  }
}
exports$y.ContextAPI = ContextAPI;
var _ContextAPI = exports$y.ContextAPI;
const _default$y = exports$y.default ?? exports$y;
_default$y.ContextAPI = _ContextAPI;
var __require$x = exports$y;
var __esModule$x = exports$y.__esModule;
const _mod$8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ContextAPI: _ContextAPI,
  __esModule: __esModule$x,
  __require: __require$x,
  default: _default$y
}, Symbol.toStringTag, { value: "Module" }));
var exports$x = {};
Object.defineProperty(exports$x, "__esModule", { value: true });
exports$x.TraceFlags = void 0;
(function(TraceFlags) {
  TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
  TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
})(exports$x.TraceFlags || (exports$x.TraceFlags = {}));
var _TraceFlags$1 = exports$x.TraceFlags;
const _default$x = exports$x.default ?? exports$x;
_default$x.TraceFlags = _TraceFlags$1;
var __require$w = exports$x;
var __esModule$w = exports$x.__esModule;
const _mod11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceFlags: _TraceFlags$1,
  __esModule: __esModule$w,
  __require: __require$w,
  default: _default$x
}, Symbol.toStringTag, { value: "Module" }));
var exports$w = {};
Object.defineProperty(exports$w, "__esModule", { value: true });
const trace_flags_1$1 = __require$w ?? _default$x ?? _mod11;
exports$w.INVALID_SPANID = "0000000000000000";
exports$w.INVALID_TRACEID = "00000000000000000000000000000000";
exports$w.INVALID_SPAN_CONTEXT = { traceId: exports$w.INVALID_TRACEID, spanId: exports$w.INVALID_SPANID, traceFlags: trace_flags_1$1.TraceFlags.NONE };
var _INVALID_SPANID$1 = exports$w.INVALID_SPANID;
var _INVALID_TRACEID$1 = exports$w.INVALID_TRACEID;
var _INVALID_SPAN_CONTEXT$1 = exports$w.INVALID_SPAN_CONTEXT;
const _default$w = exports$w.default ?? exports$w;
_default$w.INVALID_SPANID = _INVALID_SPANID$1;
_default$w.INVALID_TRACEID = _INVALID_TRACEID$1;
_default$w.INVALID_SPAN_CONTEXT = _INVALID_SPAN_CONTEXT$1;
var __require$v = exports$w;
var __esModule$v = exports$w.__esModule;
const _mod14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  INVALID_SPANID: _INVALID_SPANID$1,
  INVALID_SPAN_CONTEXT: _INVALID_SPAN_CONTEXT$1,
  INVALID_TRACEID: _INVALID_TRACEID$1,
  __esModule: __esModule$v,
  __require: __require$v,
  default: _default$w
}, Symbol.toStringTag, { value: "Module" }));
var exports$v = {};
Object.defineProperty(exports$v, "__esModule", { value: true });
exports$v.NonRecordingSpan = void 0;
const invalid_span_constants_1$2 = __require$v ?? _default$w ?? _mod14;
class NonRecordingSpan {
  constructor(_spanContext = invalid_span_constants_1$2.INVALID_SPAN_CONTEXT) {
    this._spanContext = _spanContext;
  }
  // Returns a SpanContext.
  spanContext() {
    return this._spanContext;
  }
  // By default does nothing
  setAttribute(_key, _value) {
    return this;
  }
  // By default does nothing
  setAttributes(_attributes) {
    return this;
  }
  // By default does nothing
  addEvent(_name, _attributes) {
    return this;
  }
  addLink(_link) {
    return this;
  }
  addLinks(_links) {
    return this;
  }
  // By default does nothing
  setStatus(_status) {
    return this;
  }
  // By default does nothing
  updateName(_name) {
    return this;
  }
  // By default does nothing
  end(_endTime) {
  }
  // isRecording always returns false for NonRecordingSpan.
  isRecording() {
    return false;
  }
  // By default does nothing
  recordException(_exception, _time) {
  }
}
exports$v.NonRecordingSpan = NonRecordingSpan;
var _NonRecordingSpan = exports$v.NonRecordingSpan;
const _default$v = exports$v.default ?? exports$v;
_default$v.NonRecordingSpan = _NonRecordingSpan;
var __require$u = exports$v;
var __esModule$u = exports$v.__esModule;
const _mod3$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NonRecordingSpan: _NonRecordingSpan,
  __esModule: __esModule$u,
  __require: __require$u,
  default: _default$v
}, Symbol.toStringTag, { value: "Module" }));
var exports$u = {};
Object.defineProperty(exports$u, "__esModule", { value: true });
const context_1$4 = __require$z ?? _default$A ?? _mod2$3;
const NonRecordingSpan_1$2 = __require$u ?? _default$v ?? _mod3$2;
const context_2$1 = __require$x ?? _default$y ?? _mod$8;
const SPAN_KEY = (0, context_1$4.createContextKey)("OpenTelemetry Context Key SPAN");
function getSpan(context) {
  return context.getValue(SPAN_KEY) || void 0;
}
exports$u.getSpan = getSpan;
function getActiveSpan() {
  return getSpan(context_2$1.ContextAPI.getInstance().active());
}
exports$u.getActiveSpan = getActiveSpan;
function setSpan(context, span) {
  return context.setValue(SPAN_KEY, span);
}
exports$u.setSpan = setSpan;
function deleteSpan(context) {
  return context.deleteValue(SPAN_KEY);
}
exports$u.deleteSpan = deleteSpan;
function setSpanContext(context, spanContext) {
  return setSpan(context, new NonRecordingSpan_1$2.NonRecordingSpan(spanContext));
}
exports$u.setSpanContext = setSpanContext;
function getSpanContext(context) {
  var _a;
  return (_a = getSpan(context)) === null || _a === void 0 ? void 0 : _a.spanContext();
}
exports$u.getSpanContext = getSpanContext;
var _getSpan = exports$u.getSpan;
var _getActiveSpan = exports$u.getActiveSpan;
var _setSpan = exports$u.setSpan;
var _deleteSpan = exports$u.deleteSpan;
var _setSpanContext = exports$u.setSpanContext;
var _getSpanContext = exports$u.getSpanContext;
const _default$u = exports$u.default ?? exports$u;
_default$u.getSpan = _getSpan;
_default$u.getActiveSpan = _getActiveSpan;
_default$u.setSpan = _setSpan;
_default$u.deleteSpan = _deleteSpan;
_default$u.setSpanContext = _setSpanContext;
_default$u.getSpanContext = _getSpanContext;
var __require$t = exports$u;
var __esModule$t = exports$u.__esModule;
const _mod4$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$t,
  __require: __require$t,
  default: _default$u,
  deleteSpan: _deleteSpan,
  getActiveSpan: _getActiveSpan,
  getSpan: _getSpan,
  getSpanContext: _getSpanContext,
  setSpan: _setSpan,
  setSpanContext: _setSpanContext
}, Symbol.toStringTag, { value: "Module" }));
var exports$t = {};
Object.defineProperty(exports$t, "__esModule", { value: true });
const invalid_span_constants_1$1 = __require$v ?? _default$w ?? _mod14;
const NonRecordingSpan_1$1 = __require$u ?? _default$v ?? _mod3$2;
const VALID_TRACEID_REGEX = /^([0-9a-f]{32})$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
function isValidTraceId(traceId) {
  return VALID_TRACEID_REGEX.test(traceId) && traceId !== invalid_span_constants_1$1.INVALID_TRACEID;
}
exports$t.isValidTraceId = isValidTraceId;
function isValidSpanId(spanId) {
  return VALID_SPANID_REGEX.test(spanId) && spanId !== invalid_span_constants_1$1.INVALID_SPANID;
}
exports$t.isValidSpanId = isValidSpanId;
function isSpanContextValid(spanContext) {
  return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
exports$t.isSpanContextValid = isSpanContextValid;
function wrapSpanContext(spanContext) {
  return new NonRecordingSpan_1$1.NonRecordingSpan(spanContext);
}
exports$t.wrapSpanContext = wrapSpanContext;
var _isValidTraceId$1 = exports$t.isValidTraceId;
var _isValidSpanId$1 = exports$t.isValidSpanId;
var _isSpanContextValid$1 = exports$t.isSpanContextValid;
var _wrapSpanContext = exports$t.wrapSpanContext;
const _default$t = exports$t.default ?? exports$t;
_default$t.isValidTraceId = _isValidTraceId$1;
_default$t.isValidSpanId = _isValidSpanId$1;
_default$t.isSpanContextValid = _isSpanContextValid$1;
_default$t.wrapSpanContext = _wrapSpanContext;
var __require$s = exports$t;
var __esModule$s = exports$t.__esModule;
const _mod13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$s,
  __require: __require$s,
  default: _default$t,
  isSpanContextValid: _isSpanContextValid$1,
  isValidSpanId: _isValidSpanId$1,
  isValidTraceId: _isValidTraceId$1,
  wrapSpanContext: _wrapSpanContext
}, Symbol.toStringTag, { value: "Module" }));
var exports$s = {};
Object.defineProperty(exports$s, "__esModule", { value: true });
exports$s.NoopTracer = void 0;
const context_1$3 = __require$x ?? _default$y ?? _mod$8;
const context_utils_1$1 = __require$t ?? _default$u ?? _mod4$1;
const NonRecordingSpan_1 = __require$u ?? _default$v ?? _mod3$2;
const spancontext_utils_1$2 = __require$s ?? _default$t ?? _mod13;
const contextApi = context_1$3.ContextAPI.getInstance();
class NoopTracer {
  // startSpan starts a noop span.
  startSpan(name, options2, context = contextApi.active()) {
    const root2 = Boolean(options2 === null || options2 === void 0 ? void 0 : options2.root);
    if (root2) {
      return new NonRecordingSpan_1.NonRecordingSpan();
    }
    const parentFromContext = context && (0, context_utils_1$1.getSpanContext)(context);
    if (isSpanContext(parentFromContext) && (0, spancontext_utils_1$2.isSpanContextValid)(parentFromContext)) {
      return new NonRecordingSpan_1.NonRecordingSpan(parentFromContext);
    } else {
      return new NonRecordingSpan_1.NonRecordingSpan();
    }
  }
  startActiveSpan(name, arg2, arg3, arg4) {
    let opts;
    let ctx;
    let fn;
    if (arguments.length < 2) {
      return;
    } else if (arguments.length === 2) {
      fn = arg2;
    } else if (arguments.length === 3) {
      opts = arg2;
      fn = arg3;
    } else {
      opts = arg2;
      ctx = arg3;
      fn = arg4;
    }
    const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = (0, context_utils_1$1.setSpan)(parentContext, span);
    return contextApi.with(contextWithSpanSet, fn, void 0, span);
  }
}
exports$s.NoopTracer = NoopTracer;
function isSpanContext(spanContext) {
  return typeof spanContext === "object" && typeof spanContext["spanId"] === "string" && typeof spanContext["traceId"] === "string" && typeof spanContext["traceFlags"] === "number";
}
var _NoopTracer = exports$s.NoopTracer;
const _default$s = exports$s.default ?? exports$s;
_default$s.NoopTracer = _NoopTracer;
var __require$r = exports$s;
var __esModule$r = exports$s.__esModule;
const _mod$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTracer: _NoopTracer,
  __esModule: __esModule$r,
  __require: __require$r,
  default: _default$s
}, Symbol.toStringTag, { value: "Module" }));
var exports$r = {};
Object.defineProperty(exports$r, "__esModule", { value: true });
exports$r.NoopTracerProvider = void 0;
const NoopTracer_1$1 = __require$r ?? _default$s ?? _mod$7;
class NoopTracerProvider {
  getTracer(_name, _version, _options) {
    return new NoopTracer_1$1.NoopTracer();
  }
}
exports$r.NoopTracerProvider = NoopTracerProvider;
var _NoopTracerProvider = exports$r.NoopTracerProvider;
const _default$r = exports$r.default ?? exports$r;
_default$r.NoopTracerProvider = _NoopTracerProvider;
var __require$q = exports$r;
var __esModule$q = exports$r.__esModule;
const _mod2$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTracerProvider: _NoopTracerProvider,
  __esModule: __esModule$q,
  __require: __require$q,
  default: _default$r
}, Symbol.toStringTag, { value: "Module" }));
var exports$q = {};
Object.defineProperty(exports$q, "__esModule", { value: true });
exports$q.ProxyTracer = void 0;
const NoopTracer_1 = __require$r ?? _default$s ?? _mod$7;
const NOOP_TRACER = new NoopTracer_1.NoopTracer();
class ProxyTracer {
  constructor(_provider, name, version2, options2) {
    this._provider = _provider;
    this.name = name;
    this.version = version2;
    this.options = options2;
  }
  startSpan(name, options2, context) {
    return this._getTracer().startSpan(name, options2, context);
  }
  startActiveSpan(_name, _options, _context2, _fn) {
    const tracer2 = this._getTracer();
    return Reflect.apply(tracer2.startActiveSpan, tracer2, arguments);
  }
  /**
  * Try to get a tracer from the proxy tracer provider.
  * If the proxy tracer provider has no delegate, return a noop tracer.
  */
  _getTracer() {
    if (this._delegate) {
      return this._delegate;
    }
    const tracer2 = this._provider.getDelegateTracer(this.name, this.version, this.options);
    if (!tracer2) {
      return NOOP_TRACER;
    }
    this._delegate = tracer2;
    return this._delegate;
  }
}
exports$q.ProxyTracer = ProxyTracer;
var _ProxyTracer$1 = exports$q.ProxyTracer;
const _default$q = exports$q.default ?? exports$q;
_default$q.ProxyTracer = _ProxyTracer$1;
var __require$p = exports$q;
var __esModule$p = exports$q.__esModule;
const _mod8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ProxyTracer: _ProxyTracer$1,
  __esModule: __esModule$p,
  __require: __require$p,
  default: _default$q
}, Symbol.toStringTag, { value: "Module" }));
var exports$p = {};
Object.defineProperty(exports$p, "__esModule", { value: true });
exports$p.ProxyTracerProvider = void 0;
const ProxyTracer_1$1 = __require$p ?? _default$q ?? _mod8;
const NoopTracerProvider_1 = __require$q ?? _default$r ?? _mod2$2;
const NOOP_TRACER_PROVIDER = new NoopTracerProvider_1.NoopTracerProvider();
class ProxyTracerProvider {
  /**
  * Get a {@link ProxyTracer}
  */
  getTracer(name, version2, options2) {
    var _a;
    return (_a = this.getDelegateTracer(name, version2, options2)) !== null && _a !== void 0 ? _a : new ProxyTracer_1$1.ProxyTracer(this, name, version2, options2);
  }
  getDelegate() {
    var _a;
    return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
  }
  /**
  * Set the delegate tracer provider
  */
  setDelegate(delegate) {
    this._delegate = delegate;
  }
  getDelegateTracer(name, version2, options2) {
    var _a;
    return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version2, options2);
  }
}
exports$p.ProxyTracerProvider = ProxyTracerProvider;
var _ProxyTracerProvider$1 = exports$p.ProxyTracerProvider;
const _default$p = exports$p.default ?? exports$p;
_default$p.ProxyTracerProvider = _ProxyTracerProvider$1;
var __require$o = exports$p;
var __esModule$o = exports$p.__esModule;
const _mod9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ProxyTracerProvider: _ProxyTracerProvider$1,
  __esModule: __esModule$o,
  __require: __require$o,
  default: _default$p
}, Symbol.toStringTag, { value: "Module" }));
var exports$o = {};
Object.defineProperty(exports$o, "__esModule", { value: true });
exports$o.TraceAPI = void 0;
const global_utils_1$2 = __require$E ?? _default$F ?? _mod2$5;
const ProxyTracerProvider_1$1 = __require$o ?? _default$p ?? _mod9;
const spancontext_utils_1$1 = __require$s ?? _default$t ?? _mod13;
const context_utils_1 = __require$t ?? _default$u ?? _mod4$1;
const diag_1$4 = __require$A ?? _default$B ?? _mod$a;
const API_NAME$2 = "trace";
class TraceAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this._proxyTracerProvider = new ProxyTracerProvider_1$1.ProxyTracerProvider();
    this.wrapSpanContext = spancontext_utils_1$1.wrapSpanContext;
    this.isSpanContextValid = spancontext_utils_1$1.isSpanContextValid;
    this.deleteSpan = context_utils_1.deleteSpan;
    this.getSpan = context_utils_1.getSpan;
    this.getActiveSpan = context_utils_1.getActiveSpan;
    this.getSpanContext = context_utils_1.getSpanContext;
    this.setSpan = context_utils_1.setSpan;
    this.setSpanContext = context_utils_1.setSpanContext;
  }
  /** Get the singleton instance of the Trace API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new TraceAPI();
    }
    return this._instance;
  }
  /**
  * Set the current global tracer.
  *
  * @returns true if the tracer provider was successfully registered, else false
  */
  setGlobalTracerProvider(provider) {
    const success = (0, global_utils_1$2.registerGlobal)(API_NAME$2, this._proxyTracerProvider, diag_1$4.DiagAPI.instance());
    if (success) {
      this._proxyTracerProvider.setDelegate(provider);
    }
    return success;
  }
  /**
  * Returns the global tracer provider.
  */
  getTracerProvider() {
    return (0, global_utils_1$2.getGlobal)(API_NAME$2) || this._proxyTracerProvider;
  }
  /**
  * Returns a tracer from the global tracer provider.
  */
  getTracer(name, version2) {
    return this.getTracerProvider().getTracer(name, version2);
  }
  /** Remove the global tracer provider */
  disable() {
    (0, global_utils_1$2.unregisterGlobal)(API_NAME$2, diag_1$4.DiagAPI.instance());
    this._proxyTracerProvider = new ProxyTracerProvider_1$1.ProxyTracerProvider();
  }
}
exports$o.TraceAPI = TraceAPI;
var _TraceAPI = exports$o.TraceAPI;
const _default$o = exports$o.default ?? exports$o;
_default$o.TraceAPI = _TraceAPI;
var __require$n = exports$o;
var __esModule$n = exports$o.__esModule;
const _mod$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceAPI: _TraceAPI,
  __esModule: __esModule$n,
  __require: __require$n,
  default: _default$o
}, Symbol.toStringTag, { value: "Module" }));
var exports$n = {};
Object.defineProperty(exports$n, "__esModule", { value: true });
exports$n.trace = void 0;
const trace_1 = __require$n ?? _default$o ?? _mod$6;
exports$n.trace = trace_1.TraceAPI.getInstance();
var _trace$1 = exports$n.trace;
const _default$n = exports$n.default ?? exports$n;
_default$n.trace = _trace$1;
var __require$m = exports$n;
var __esModule$m = exports$n.__esModule;
const _mod19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$m,
  __require: __require$m,
  default: _default$n,
  trace: _trace$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$m = {};
Object.defineProperty(exports$m, "__esModule", { value: true });
exports$m.baggageEntryMetadataSymbol = void 0;
exports$m.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
var _baggageEntryMetadataSymbol = exports$m.baggageEntryMetadataSymbol;
const _default$m = exports$m.default ?? exports$m;
_default$m.baggageEntryMetadataSymbol = _baggageEntryMetadataSymbol;
var __require$l = exports$m;
var __esModule$l = exports$m.__esModule;
const _mod3$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$l,
  __require: __require$l,
  baggageEntryMetadataSymbol: _baggageEntryMetadataSymbol,
  default: _default$m
}, Symbol.toStringTag, { value: "Module" }));
var exports$l = {};
Object.defineProperty(exports$l, "__esModule", { value: true });
exports$l.BaggageImpl = void 0;
class BaggageImpl {
  constructor(entries) {
    this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
  }
  getEntry(key) {
    const entry = this._entries.get(key);
    if (!entry) {
      return void 0;
    }
    return Object.assign({}, entry);
  }
  getAllEntries() {
    return Array.from(this._entries.entries()).map(([k2, v2]) => [k2, v2]);
  }
  setEntry(key, entry) {
    const newBaggage = new BaggageImpl(this._entries);
    newBaggage._entries.set(key, entry);
    return newBaggage;
  }
  removeEntry(key) {
    const newBaggage = new BaggageImpl(this._entries);
    newBaggage._entries.delete(key);
    return newBaggage;
  }
  removeEntries(...keys) {
    const newBaggage = new BaggageImpl(this._entries);
    for (const key of keys) {
      newBaggage._entries.delete(key);
    }
    return newBaggage;
  }
  clear() {
    return new BaggageImpl();
  }
}
exports$l.BaggageImpl = BaggageImpl;
var _BaggageImpl = exports$l.BaggageImpl;
const _default$l = exports$l.default ?? exports$l;
_default$l.BaggageImpl = _BaggageImpl;
var __require$k = exports$l;
var __esModule$k = exports$l.__esModule;
const _mod2$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BaggageImpl: _BaggageImpl,
  __esModule: __esModule$k,
  __require: __require$k,
  default: _default$l
}, Symbol.toStringTag, { value: "Module" }));
var exports$k = {};
Object.defineProperty(exports$k, "__esModule", { value: true });
const diag_1$3 = __require$A ?? _default$B ?? _mod$a;
const baggage_impl_1 = __require$k ?? _default$l ?? _mod2$1;
const symbol_1 = __require$l ?? _default$m ?? _mod3$1;
const diag = diag_1$3.DiagAPI.instance();
function createBaggage(entries = {}) {
  return new baggage_impl_1.BaggageImpl(new Map(Object.entries(entries)));
}
exports$k.createBaggage = createBaggage;
function baggageEntryMetadataFromString(str) {
  if (typeof str !== "string") {
    diag.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
    str = "";
  }
  return { __TYPE__: symbol_1.baggageEntryMetadataSymbol, toString() {
    return str;
  } };
}
exports$k.baggageEntryMetadataFromString = baggageEntryMetadataFromString;
var _createBaggage = exports$k.createBaggage;
var _baggageEntryMetadataFromString$1 = exports$k.baggageEntryMetadataFromString;
const _default$k = exports$k.default ?? exports$k;
_default$k.createBaggage = _createBaggage;
_default$k.baggageEntryMetadataFromString = _baggageEntryMetadataFromString$1;
var __require$j = exports$k;
var __esModule$j = exports$k.__esModule;
const _mod$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$j,
  __require: __require$j,
  baggageEntryMetadataFromString: _baggageEntryMetadataFromString$1,
  createBaggage: _createBaggage,
  default: _default$k
}, Symbol.toStringTag, { value: "Module" }));
var exports$j = {};
Object.defineProperty(exports$j, "__esModule", { value: true });
const context_1$2 = __require$x ?? _default$y ?? _mod$8;
const context_2 = __require$z ?? _default$A ?? _mod2$3;
const BAGGAGE_KEY = (0, context_2.createContextKey)("OpenTelemetry Baggage Key");
function getBaggage(context) {
  return context.getValue(BAGGAGE_KEY) || void 0;
}
exports$j.getBaggage = getBaggage;
function getActiveBaggage() {
  return getBaggage(context_1$2.ContextAPI.getInstance().active());
}
exports$j.getActiveBaggage = getActiveBaggage;
function setBaggage(context, baggage) {
  return context.setValue(BAGGAGE_KEY, baggage);
}
exports$j.setBaggage = setBaggage;
function deleteBaggage(context) {
  return context.deleteValue(BAGGAGE_KEY);
}
exports$j.deleteBaggage = deleteBaggage;
var _getBaggage = exports$j.getBaggage;
var _getActiveBaggage = exports$j.getActiveBaggage;
var _setBaggage = exports$j.setBaggage;
var _deleteBaggage = exports$j.deleteBaggage;
const _default$j = exports$j.default ?? exports$j;
_default$j.getBaggage = _getBaggage;
_default$j.getActiveBaggage = _getActiveBaggage;
_default$j.setBaggage = _setBaggage;
_default$j.deleteBaggage = _deleteBaggage;
var __require$i = exports$j;
var __esModule$i = exports$j.__esModule;
const _mod4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$i,
  __require: __require$i,
  default: _default$j,
  deleteBaggage: _deleteBaggage,
  getActiveBaggage: _getActiveBaggage,
  getBaggage: _getBaggage,
  setBaggage: _setBaggage
}, Symbol.toStringTag, { value: "Module" }));
var exports$i = {};
Object.defineProperty(exports$i, "__esModule", { value: true });
exports$i.defaultTextMapGetter = { get(carrier, key) {
  if (carrier == null) {
    return void 0;
  }
  return carrier[key];
}, keys(carrier) {
  if (carrier == null) {
    return [];
  }
  return Object.keys(carrier);
} };
exports$i.defaultTextMapSetter = { set(carrier, key, value) {
  if (carrier == null) {
    return;
  }
  carrier[key] = value;
} };
var _defaultTextMapGetter$1 = exports$i.defaultTextMapGetter;
var _defaultTextMapSetter$1 = exports$i.defaultTextMapSetter;
const _default$i = exports$i.default ?? exports$i;
_default$i.defaultTextMapGetter = _defaultTextMapGetter$1;
_default$i.defaultTextMapSetter = _defaultTextMapSetter$1;
var __require$h = exports$i;
var __esModule$h = exports$i.__esModule;
const _mod7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$h,
  __require: __require$h,
  default: _default$i,
  defaultTextMapGetter: _defaultTextMapGetter$1,
  defaultTextMapSetter: _defaultTextMapSetter$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$h = {};
Object.defineProperty(exports$h, "__esModule", { value: true });
exports$h.NoopTextMapPropagator = void 0;
class NoopTextMapPropagator {
  /** Noop inject function does nothing */
  inject(_context2, _carrier) {
  }
  /** Noop extract function does nothing and returns the input context */
  extract(context, _carrier) {
    return context;
  }
  fields() {
    return [];
  }
}
exports$h.NoopTextMapPropagator = NoopTextMapPropagator;
var _NoopTextMapPropagator = exports$h.NoopTextMapPropagator;
const _default$h = exports$h.default ?? exports$h;
_default$h.NoopTextMapPropagator = _NoopTextMapPropagator;
var __require$g = exports$h;
var __esModule$g = exports$h.__esModule;
const _mod2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTextMapPropagator: _NoopTextMapPropagator,
  __esModule: __esModule$g,
  __require: __require$g,
  default: _default$h
}, Symbol.toStringTag, { value: "Module" }));
var exports$g = {};
Object.defineProperty(exports$g, "__esModule", { value: true });
exports$g.PropagationAPI = void 0;
const global_utils_1$1 = __require$E ?? _default$F ?? _mod2$5;
const NoopTextMapPropagator_1 = __require$g ?? _default$h ?? _mod2;
const TextMapPropagator_1$1 = __require$h ?? _default$i ?? _mod7;
const context_helpers_1 = __require$i ?? _default$j ?? _mod4;
const utils_1$1 = __require$j ?? _default$k ?? _mod$5;
const diag_1$2 = __require$A ?? _default$B ?? _mod$a;
const API_NAME$1 = "propagation";
const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator_1.NoopTextMapPropagator();
class PropagationAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this.createBaggage = utils_1$1.createBaggage;
    this.getBaggage = context_helpers_1.getBaggage;
    this.getActiveBaggage = context_helpers_1.getActiveBaggage;
    this.setBaggage = context_helpers_1.setBaggage;
    this.deleteBaggage = context_helpers_1.deleteBaggage;
  }
  /** Get the singleton instance of the Propagator API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new PropagationAPI();
    }
    return this._instance;
  }
  /**
  * Set the current propagator.
  *
  * @returns true if the propagator was successfully registered, else false
  */
  setGlobalPropagator(propagator) {
    return (0, global_utils_1$1.registerGlobal)(API_NAME$1, propagator, diag_1$2.DiagAPI.instance());
  }
  /**
  * Inject context into a carrier to be propagated inter-process
  *
  * @param context Context carrying tracing data to inject
  * @param carrier carrier to inject context into
  * @param setter Function used to set values on the carrier
  */
  inject(context, carrier, setter = TextMapPropagator_1$1.defaultTextMapSetter) {
    return this._getGlobalPropagator().inject(context, carrier, setter);
  }
  /**
  * Extract context from a carrier
  *
  * @param context Context which the newly created context will inherit from
  * @param carrier Carrier to extract context from
  * @param getter Function used to extract keys from a carrier
  */
  extract(context, carrier, getter = TextMapPropagator_1$1.defaultTextMapGetter) {
    return this._getGlobalPropagator().extract(context, carrier, getter);
  }
  /**
  * Return a list of all fields which may be used by the propagator.
  */
  fields() {
    return this._getGlobalPropagator().fields();
  }
  /** Remove the global propagator */
  disable() {
    (0, global_utils_1$1.unregisterGlobal)(API_NAME$1, diag_1$2.DiagAPI.instance());
  }
  _getGlobalPropagator() {
    return (0, global_utils_1$1.getGlobal)(API_NAME$1) || NOOP_TEXT_MAP_PROPAGATOR;
  }
}
exports$g.PropagationAPI = PropagationAPI;
var _PropagationAPI = exports$g.PropagationAPI;
const _default$g = exports$g.default ?? exports$g;
_default$g.PropagationAPI = _PropagationAPI;
var __require$f = exports$g;
var __esModule$f = exports$g.__esModule;
const _mod$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PropagationAPI: _PropagationAPI,
  __esModule: __esModule$f,
  __require: __require$f,
  default: _default$g
}, Symbol.toStringTag, { value: "Module" }));
var exports$f = {};
Object.defineProperty(exports$f, "__esModule", { value: true });
exports$f.propagation = void 0;
const propagation_1 = __require$f ?? _default$g ?? _mod$4;
exports$f.propagation = propagation_1.PropagationAPI.getInstance();
var _propagation$1 = exports$f.propagation;
const _default$f = exports$f.default ?? exports$f;
_default$f.propagation = _propagation$1;
var __require$e = exports$f;
var __esModule$e = exports$f.__esModule;
const _mod18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$e,
  __require: __require$e,
  default: _default$f,
  propagation: _propagation$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$e = {};
Object.defineProperty(exports$e, "__esModule", { value: true });
class NoopMeter {
  constructor() {
  }
  /**
  * @see {@link Meter.createGauge}
  */
  createGauge(_name, _options) {
    return exports$e.NOOP_GAUGE_METRIC;
  }
  /**
  * @see {@link Meter.createHistogram}
  */
  createHistogram(_name, _options) {
    return exports$e.NOOP_HISTOGRAM_METRIC;
  }
  /**
  * @see {@link Meter.createCounter}
  */
  createCounter(_name, _options) {
    return exports$e.NOOP_COUNTER_METRIC;
  }
  /**
  * @see {@link Meter.createUpDownCounter}
  */
  createUpDownCounter(_name, _options) {
    return exports$e.NOOP_UP_DOWN_COUNTER_METRIC;
  }
  /**
  * @see {@link Meter.createObservableGauge}
  */
  createObservableGauge(_name, _options) {
    return exports$e.NOOP_OBSERVABLE_GAUGE_METRIC;
  }
  /**
  * @see {@link Meter.createObservableCounter}
  */
  createObservableCounter(_name, _options) {
    return exports$e.NOOP_OBSERVABLE_COUNTER_METRIC;
  }
  /**
  * @see {@link Meter.createObservableUpDownCounter}
  */
  createObservableUpDownCounter(_name, _options) {
    return exports$e.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
  }
  /**
  * @see {@link Meter.addBatchObservableCallback}
  */
  addBatchObservableCallback(_callback, _observables) {
  }
  /**
  * @see {@link Meter.removeBatchObservableCallback}
  */
  removeBatchObservableCallback(_callback) {
  }
}
exports$e.NoopMeter = NoopMeter;
class NoopMetric {
}
exports$e.NoopMetric = NoopMetric;
class NoopCounterMetric extends NoopMetric {
  add(_value, _attributes) {
  }
}
exports$e.NoopCounterMetric = NoopCounterMetric;
class NoopUpDownCounterMetric extends NoopMetric {
  add(_value, _attributes) {
  }
}
exports$e.NoopUpDownCounterMetric = NoopUpDownCounterMetric;
class NoopGaugeMetric extends NoopMetric {
  record(_value, _attributes) {
  }
}
exports$e.NoopGaugeMetric = NoopGaugeMetric;
class NoopHistogramMetric extends NoopMetric {
  record(_value, _attributes) {
  }
}
exports$e.NoopHistogramMetric = NoopHistogramMetric;
class NoopObservableMetric {
  addCallback(_callback) {
  }
  removeCallback(_callback) {
  }
}
exports$e.NoopObservableMetric = NoopObservableMetric;
class NoopObservableCounterMetric extends NoopObservableMetric {
}
exports$e.NoopObservableCounterMetric = NoopObservableCounterMetric;
class NoopObservableGaugeMetric extends NoopObservableMetric {
}
exports$e.NoopObservableGaugeMetric = NoopObservableGaugeMetric;
class NoopObservableUpDownCounterMetric extends NoopObservableMetric {
}
exports$e.NoopObservableUpDownCounterMetric = NoopObservableUpDownCounterMetric;
exports$e.NOOP_METER = new NoopMeter();
exports$e.NOOP_COUNTER_METRIC = new NoopCounterMetric();
exports$e.NOOP_GAUGE_METRIC = new NoopGaugeMetric();
exports$e.NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
exports$e.NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
exports$e.NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
exports$e.NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
exports$e.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
function createNoopMeter() {
  return exports$e.NOOP_METER;
}
exports$e.createNoopMeter = createNoopMeter;
var _NOOP_GAUGE_METRIC = exports$e.NOOP_GAUGE_METRIC;
var _NOOP_HISTOGRAM_METRIC = exports$e.NOOP_HISTOGRAM_METRIC;
var _NOOP_COUNTER_METRIC = exports$e.NOOP_COUNTER_METRIC;
var _NOOP_UP_DOWN_COUNTER_METRIC = exports$e.NOOP_UP_DOWN_COUNTER_METRIC;
var _NOOP_OBSERVABLE_GAUGE_METRIC = exports$e.NOOP_OBSERVABLE_GAUGE_METRIC;
var _NOOP_OBSERVABLE_COUNTER_METRIC = exports$e.NOOP_OBSERVABLE_COUNTER_METRIC;
var _NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = exports$e.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
var _NoopMeter = exports$e.NoopMeter;
var _NoopMetric = exports$e.NoopMetric;
var _NoopCounterMetric = exports$e.NoopCounterMetric;
var _NoopUpDownCounterMetric = exports$e.NoopUpDownCounterMetric;
var _NoopGaugeMetric = exports$e.NoopGaugeMetric;
var _NoopHistogramMetric = exports$e.NoopHistogramMetric;
var _NoopObservableMetric = exports$e.NoopObservableMetric;
var _NoopObservableCounterMetric = exports$e.NoopObservableCounterMetric;
var _NoopObservableGaugeMetric = exports$e.NoopObservableGaugeMetric;
var _NoopObservableUpDownCounterMetric = exports$e.NoopObservableUpDownCounterMetric;
var _NOOP_METER = exports$e.NOOP_METER;
var _createNoopMeter$1 = exports$e.createNoopMeter;
const _default$e = exports$e.default ?? exports$e;
_default$e.NOOP_GAUGE_METRIC = _NOOP_GAUGE_METRIC;
_default$e.NOOP_HISTOGRAM_METRIC = _NOOP_HISTOGRAM_METRIC;
_default$e.NOOP_COUNTER_METRIC = _NOOP_COUNTER_METRIC;
_default$e.NOOP_UP_DOWN_COUNTER_METRIC = _NOOP_UP_DOWN_COUNTER_METRIC;
_default$e.NOOP_OBSERVABLE_GAUGE_METRIC = _NOOP_OBSERVABLE_GAUGE_METRIC;
_default$e.NOOP_OBSERVABLE_COUNTER_METRIC = _NOOP_OBSERVABLE_COUNTER_METRIC;
_default$e.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = _NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
_default$e.NoopMeter = _NoopMeter;
_default$e.NoopMetric = _NoopMetric;
_default$e.NoopCounterMetric = _NoopCounterMetric;
_default$e.NoopUpDownCounterMetric = _NoopUpDownCounterMetric;
_default$e.NoopGaugeMetric = _NoopGaugeMetric;
_default$e.NoopHistogramMetric = _NoopHistogramMetric;
_default$e.NoopObservableMetric = _NoopObservableMetric;
_default$e.NoopObservableCounterMetric = _NoopObservableCounterMetric;
_default$e.NoopObservableGaugeMetric = _NoopObservableGaugeMetric;
_default$e.NoopObservableUpDownCounterMetric = _NoopObservableUpDownCounterMetric;
_default$e.NOOP_METER = _NOOP_METER;
_default$e.createNoopMeter = _createNoopMeter$1;
var __require$d = exports$e;
var __esModule$d = exports$e.__esModule;
const _mod5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NOOP_COUNTER_METRIC: _NOOP_COUNTER_METRIC,
  NOOP_GAUGE_METRIC: _NOOP_GAUGE_METRIC,
  NOOP_HISTOGRAM_METRIC: _NOOP_HISTOGRAM_METRIC,
  NOOP_METER: _NOOP_METER,
  NOOP_OBSERVABLE_COUNTER_METRIC: _NOOP_OBSERVABLE_COUNTER_METRIC,
  NOOP_OBSERVABLE_GAUGE_METRIC: _NOOP_OBSERVABLE_GAUGE_METRIC,
  NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC: _NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC,
  NOOP_UP_DOWN_COUNTER_METRIC: _NOOP_UP_DOWN_COUNTER_METRIC,
  NoopCounterMetric: _NoopCounterMetric,
  NoopGaugeMetric: _NoopGaugeMetric,
  NoopHistogramMetric: _NoopHistogramMetric,
  NoopMeter: _NoopMeter,
  NoopMetric: _NoopMetric,
  NoopObservableCounterMetric: _NoopObservableCounterMetric,
  NoopObservableGaugeMetric: _NoopObservableGaugeMetric,
  NoopObservableMetric: _NoopObservableMetric,
  NoopObservableUpDownCounterMetric: _NoopObservableUpDownCounterMetric,
  NoopUpDownCounterMetric: _NoopUpDownCounterMetric,
  __esModule: __esModule$d,
  __require: __require$d,
  createNoopMeter: _createNoopMeter$1,
  default: _default$e
}, Symbol.toStringTag, { value: "Module" }));
var exports$d = {};
Object.defineProperty(exports$d, "__esModule", { value: true });
const NoopMeter_1$1 = __require$d ?? _default$e ?? _mod5;
class NoopMeterProvider {
  getMeter(_name, _version, _options) {
    return NoopMeter_1$1.NOOP_METER;
  }
}
exports$d.NoopMeterProvider = NoopMeterProvider;
exports$d.NOOP_METER_PROVIDER = new NoopMeterProvider();
var _NoopMeterProvider = exports$d.NoopMeterProvider;
var _NOOP_METER_PROVIDER = exports$d.NOOP_METER_PROVIDER;
const _default$d = exports$d.default ?? exports$d;
_default$d.NoopMeterProvider = _NoopMeterProvider;
_default$d.NOOP_METER_PROVIDER = _NOOP_METER_PROVIDER;
var __require$c = exports$d;
var __esModule$c = exports$d.__esModule;
const _mod$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NOOP_METER_PROVIDER: _NOOP_METER_PROVIDER,
  NoopMeterProvider: _NoopMeterProvider,
  __esModule: __esModule$c,
  __require: __require$c,
  default: _default$d
}, Symbol.toStringTag, { value: "Module" }));
var exports$c = {};
Object.defineProperty(exports$c, "__esModule", { value: true });
exports$c.MetricsAPI = void 0;
const NoopMeterProvider_1 = __require$c ?? _default$d ?? _mod$3;
const global_utils_1 = __require$E ?? _default$F ?? _mod2$5;
const diag_1$1 = __require$A ?? _default$B ?? _mod$a;
const API_NAME = "metrics";
class MetricsAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
  }
  /** Get the singleton instance of the Metrics API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new MetricsAPI();
    }
    return this._instance;
  }
  /**
  * Set the current global meter provider.
  * Returns true if the meter provider was successfully registered, else false.
  */
  setGlobalMeterProvider(provider) {
    return (0, global_utils_1.registerGlobal)(API_NAME, provider, diag_1$1.DiagAPI.instance());
  }
  /**
  * Returns the global meter provider.
  */
  getMeterProvider() {
    return (0, global_utils_1.getGlobal)(API_NAME) || NoopMeterProvider_1.NOOP_METER_PROVIDER;
  }
  /**
  * Returns a meter from the global meter provider.
  */
  getMeter(name, version2, options2) {
    return this.getMeterProvider().getMeter(name, version2, options2);
  }
  /** Remove the global meter provider */
  disable() {
    (0, global_utils_1.unregisterGlobal)(API_NAME, diag_1$1.DiagAPI.instance());
  }
}
exports$c.MetricsAPI = MetricsAPI;
var _MetricsAPI = exports$c.MetricsAPI;
const _default$c = exports$c.default ?? exports$c;
_default$c.MetricsAPI = _MetricsAPI;
var __require$b = exports$c;
var __esModule$b = exports$c.__esModule;
const _mod$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MetricsAPI: _MetricsAPI,
  __esModule: __esModule$b,
  __require: __require$b,
  default: _default$c
}, Symbol.toStringTag, { value: "Module" }));
var exports$b = {};
Object.defineProperty(exports$b, "__esModule", { value: true });
exports$b.metrics = void 0;
const metrics_1 = __require$b ?? _default$c ?? _mod$2;
exports$b.metrics = metrics_1.MetricsAPI.getInstance();
var _metrics$1 = exports$b.metrics;
const _default$b = exports$b.default ?? exports$b;
_default$b.metrics = _metrics$1;
var __require$a = exports$b;
var __esModule$a = exports$b.__esModule;
const _mod17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$a,
  __require: __require$a,
  default: _default$b,
  metrics: _metrics$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$a = {};
Object.defineProperty(exports$a, "__esModule", { value: true });
exports$a.diag = void 0;
const diag_1 = __require$A ?? _default$B ?? _mod$a;
exports$a.diag = diag_1.DiagAPI.instance();
var _diag$1 = exports$a.diag;
const _default$a = exports$a.default ?? exports$a;
_default$a.diag = _diag$1;
var __require$9 = exports$a;
var __esModule$9 = exports$a.__esModule;
const _mod16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$9,
  __require: __require$9,
  default: _default$a,
  diag: _diag$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$9 = {};
Object.defineProperty(exports$9, "__esModule", { value: true });
exports$9.context = void 0;
const context_1$1 = __require$x ?? _default$y ?? _mod$8;
exports$9.context = context_1$1.ContextAPI.getInstance();
var _context$1 = exports$9.context;
const _default$9 = exports$9.default ?? exports$9;
_default$9.context = _context$1;
var __require$8 = exports$9;
var __esModule$8 = exports$9.__esModule;
const _mod15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$8,
  __require: __require$8,
  context: _context$1,
  default: _default$9
}, Symbol.toStringTag, { value: "Module" }));
var exports$8 = {};
Object.defineProperty(exports$8, "__esModule", { value: true });
const VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
function validateKey(key) {
  return VALID_KEY_REGEX.test(key);
}
exports$8.validateKey = validateKey;
function validateValue(value) {
  return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
}
exports$8.validateValue = validateValue;
var _validateKey = exports$8.validateKey;
var _validateValue = exports$8.validateValue;
const _default$8 = exports$8.default ?? exports$8;
_default$8.validateKey = _validateKey;
_default$8.validateValue = _validateValue;
var __require$7 = exports$8;
var __esModule$7 = exports$8.__esModule;
const _mod$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$7,
  __require: __require$7,
  default: _default$8,
  validateKey: _validateKey,
  validateValue: _validateValue
}, Symbol.toStringTag, { value: "Module" }));
var exports$7 = {};
Object.defineProperty(exports$7, "__esModule", { value: true });
exports$7.TraceStateImpl = void 0;
const tracestate_validators_1 = __require$7 ?? _default$8 ?? _mod$1;
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ",";
const LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
class TraceStateImpl {
  constructor(rawTraceState) {
    this._internalState = /* @__PURE__ */ new Map();
    if (rawTraceState) this._parse(rawTraceState);
  }
  set(key, value) {
    const traceState = this._clone();
    if (traceState._internalState.has(key)) {
      traceState._internalState.delete(key);
    }
    traceState._internalState.set(key, value);
    return traceState;
  }
  unset(key) {
    const traceState = this._clone();
    traceState._internalState.delete(key);
    return traceState;
  }
  get(key) {
    return this._internalState.get(key);
  }
  serialize() {
    return this._keys().reduce((agg, key) => {
      agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
      return agg;
    }, []).join(LIST_MEMBERS_SEPARATOR);
  }
  _parse(rawTraceState) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN) return;
    this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reverse().reduce((agg, part) => {
      const listMember = part.trim();
      const i2 = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
      if (i2 !== -1) {
        const key = listMember.slice(0, i2);
        const value = listMember.slice(i2 + 1, part.length);
        if ((0, tracestate_validators_1.validateKey)(key) && (0, tracestate_validators_1.validateValue)(value)) {
          agg.set(key, value);
        }
      }
      return agg;
    }, /* @__PURE__ */ new Map());
    if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
      this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
    }
  }
  _keys() {
    return Array.from(this._internalState.keys()).reverse();
  }
  _clone() {
    const traceState = new TraceStateImpl();
    traceState._internalState = new Map(this._internalState);
    return traceState;
  }
}
exports$7.TraceStateImpl = TraceStateImpl;
var _TraceStateImpl = exports$7.TraceStateImpl;
const _default$7 = exports$7.default ?? exports$7;
_default$7.TraceStateImpl = _TraceStateImpl;
var __require$6 = exports$7;
var __esModule$6 = exports$7.__esModule;
const _mod = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceStateImpl: _TraceStateImpl,
  __esModule: __esModule$6,
  __require: __require$6,
  default: _default$7
}, Symbol.toStringTag, { value: "Module" }));
var exports$6 = {};
Object.defineProperty(exports$6, "__esModule", { value: true });
exports$6.createTraceState = void 0;
const tracestate_impl_1 = __require$6 ?? _default$7 ?? _mod;
function createTraceState(rawTraceState) {
  return new tracestate_impl_1.TraceStateImpl(rawTraceState);
}
exports$6.createTraceState = createTraceState;
var _createTraceState$1 = exports$6.createTraceState;
const _default$6 = exports$6.default ?? exports$6;
_default$6.createTraceState = _createTraceState$1;
var __require$5 = exports$6;
var __esModule$5 = exports$6.__esModule;
const _mod12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __esModule: __esModule$5,
  __require: __require$5,
  createTraceState: _createTraceState$1,
  default: _default$6
}, Symbol.toStringTag, { value: "Module" }));
var exports$5 = {};
Object.defineProperty(exports$5, "__esModule", { value: true });
exports$5.SpanStatusCode = void 0;
(function(SpanStatusCode) {
  SpanStatusCode[SpanStatusCode["UNSET"] = 0] = "UNSET";
  SpanStatusCode[SpanStatusCode["OK"] = 1] = "OK";
  SpanStatusCode[SpanStatusCode["ERROR"] = 2] = "ERROR";
})(exports$5.SpanStatusCode || (exports$5.SpanStatusCode = {}));
var _SpanStatusCode$1 = exports$5.SpanStatusCode;
const _default$5 = exports$5.default ?? exports$5;
_default$5.SpanStatusCode = _SpanStatusCode$1;
var __require$4 = exports$5;
var __esModule$4 = exports$5.__esModule;
const _mod10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SpanStatusCode: _SpanStatusCode$1,
  __esModule: __esModule$4,
  __require: __require$4,
  default: _default$5
}, Symbol.toStringTag, { value: "Module" }));
var exports$4 = {};
Object.defineProperty(exports$4, "__esModule", { value: true });
exports$4.SpanKind = void 0;
(function(SpanKind) {
  SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
  SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
  SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
  SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
  SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
})(exports$4.SpanKind || (exports$4.SpanKind = {}));
var _SpanKind$1 = exports$4.SpanKind;
const _default$4 = exports$4.default ?? exports$4;
_default$4.SpanKind = _SpanKind$1;
var __require$3 = exports$4;
var __esModule$3 = exports$4.__esModule;
const _mod1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SpanKind: _SpanKind$1,
  __esModule: __esModule$3,
  __require: __require$3,
  default: _default$4
}, Symbol.toStringTag, { value: "Module" }));
var exports$3 = {};
Object.defineProperty(exports$3, "__esModule", { value: true });
exports$3.SamplingDecision = void 0;
(function(SamplingDecision) {
  SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
  SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
  SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
})(exports$3.SamplingDecision || (exports$3.SamplingDecision = {}));
var _SamplingDecision$1 = exports$3.SamplingDecision;
const _default$3 = exports$3.default ?? exports$3;
_default$3.SamplingDecision = _SamplingDecision$1;
var __require$2 = exports$3;
var __esModule$2 = exports$3.__esModule;
const _mod0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SamplingDecision: _SamplingDecision$1,
  __esModule: __esModule$2,
  __require: __require$2,
  default: _default$3
}, Symbol.toStringTag, { value: "Module" }));
var exports$2 = {};
Object.defineProperty(exports$2, "__esModule", { value: true });
exports$2.ValueType = void 0;
(function(ValueType) {
  ValueType[ValueType["INT"] = 0] = "INT";
  ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
})(exports$2.ValueType || (exports$2.ValueType = {}));
var _ValueType$1 = exports$2.ValueType;
const _default$2 = exports$2.default ?? exports$2;
_default$2.ValueType = _ValueType$1;
var __require$1 = exports$2;
var __esModule$1 = exports$2.__esModule;
const _mod6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ValueType: _ValueType$1,
  __esModule: __esModule$1,
  __require: __require$1,
  default: _default$2
}, Symbol.toStringTag, { value: "Module" }));
var exports$1 = {};
Object.defineProperty(exports$1, "__esModule", { value: true });
exports$1.DiagConsoleLogger = void 0;
const consoleMap = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
class DiagConsoleLogger {
  constructor() {
    function _consoleFunc(funcName) {
      return function(...args) {
        if (console) {
          let theFunc = console[funcName];
          if (typeof theFunc !== "function") {
            theFunc = console.log;
          }
          if (typeof theFunc === "function") {
            return theFunc.apply(console, args);
          }
        }
      };
    }
    for (let i2 = 0; i2 < consoleMap.length; i2++) {
      this[consoleMap[i2].n] = _consoleFunc(consoleMap[i2].c);
    }
  }
}
exports$1.DiagConsoleLogger = DiagConsoleLogger;
var _DiagConsoleLogger$1 = exports$1.DiagConsoleLogger;
const _default$1 = exports$1.default ?? exports$1;
_default$1.DiagConsoleLogger = _DiagConsoleLogger$1;
var __require = exports$1;
var __esModule = exports$1.__esModule;
const _mod3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagConsoleLogger: _DiagConsoleLogger$1,
  __esModule,
  __require,
  default: _default$1
}, Symbol.toStringTag, { value: "Module" }));
var exports = {};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __require$j ?? _default$k ?? _mod$5;
exports.baggageEntryMetadataFromString = utils_1.baggageEntryMetadataFromString;
var context_1 = __require$z ?? _default$A ?? _mod2$3;
exports.createContextKey = context_1.createContextKey;
exports.ROOT_CONTEXT = context_1.ROOT_CONTEXT;
var consoleLogger_1 = __require ?? _default$1 ?? _mod3;
exports.DiagConsoleLogger = consoleLogger_1.DiagConsoleLogger;
var types_1 = __require$D ?? _default$E ?? _mod4$2;
exports.DiagLogLevel = types_1.DiagLogLevel;
var NoopMeter_1 = __require$d ?? _default$e ?? _mod5;
exports.createNoopMeter = NoopMeter_1.createNoopMeter;
var Metric_1 = __require$1 ?? _default$2 ?? _mod6;
exports.ValueType = Metric_1.ValueType;
var TextMapPropagator_1 = __require$h ?? _default$i ?? _mod7;
exports.defaultTextMapGetter = TextMapPropagator_1.defaultTextMapGetter;
exports.defaultTextMapSetter = TextMapPropagator_1.defaultTextMapSetter;
var ProxyTracer_1 = __require$p ?? _default$q ?? _mod8;
exports.ProxyTracer = ProxyTracer_1.ProxyTracer;
var ProxyTracerProvider_1 = __require$o ?? _default$p ?? _mod9;
exports.ProxyTracerProvider = ProxyTracerProvider_1.ProxyTracerProvider;
var SamplingResult_1 = __require$2 ?? _default$3 ?? _mod0;
exports.SamplingDecision = SamplingResult_1.SamplingDecision;
var span_kind_1 = __require$3 ?? _default$4 ?? _mod1;
exports.SpanKind = span_kind_1.SpanKind;
var status_1 = __require$4 ?? _default$5 ?? _mod10;
exports.SpanStatusCode = status_1.SpanStatusCode;
var trace_flags_1 = __require$w ?? _default$x ?? _mod11;
exports.TraceFlags = trace_flags_1.TraceFlags;
var utils_2 = __require$5 ?? _default$6 ?? _mod12;
exports.createTraceState = utils_2.createTraceState;
var spancontext_utils_1 = __require$s ?? _default$t ?? _mod13;
exports.isSpanContextValid = spancontext_utils_1.isSpanContextValid;
exports.isValidTraceId = spancontext_utils_1.isValidTraceId;
exports.isValidSpanId = spancontext_utils_1.isValidSpanId;
var invalid_span_constants_1 = __require$v ?? _default$w ?? _mod14;
exports.INVALID_SPANID = invalid_span_constants_1.INVALID_SPANID;
exports.INVALID_TRACEID = invalid_span_constants_1.INVALID_TRACEID;
exports.INVALID_SPAN_CONTEXT = invalid_span_constants_1.INVALID_SPAN_CONTEXT;
const context_api_1 = __require$8 ?? _default$9 ?? _mod15;
exports.context = context_api_1.context;
const diag_api_1 = __require$9 ?? _default$a ?? _mod16;
exports.diag = diag_api_1.diag;
const metrics_api_1 = __require$a ?? _default$b ?? _mod17;
exports.metrics = metrics_api_1.metrics;
const propagation_api_1 = __require$e ?? _default$f ?? _mod18;
exports.propagation = propagation_api_1.propagation;
const trace_api_1 = __require$m ?? _default$n ?? _mod19;
exports.trace = trace_api_1.trace;
exports.default = { context: context_api_1.context, diag: diag_api_1.diag, metrics: metrics_api_1.metrics, propagation: propagation_api_1.propagation, trace: trace_api_1.trace };
var _baggageEntryMetadataFromString = exports.baggageEntryMetadataFromString;
var _createContextKey = exports.createContextKey;
var _ROOT_CONTEXT = exports.ROOT_CONTEXT;
var _DiagConsoleLogger = exports.DiagConsoleLogger;
var _DiagLogLevel = exports.DiagLogLevel;
var _createNoopMeter = exports.createNoopMeter;
var _ValueType = exports.ValueType;
var _defaultTextMapGetter = exports.defaultTextMapGetter;
var _defaultTextMapSetter = exports.defaultTextMapSetter;
var _ProxyTracer = exports.ProxyTracer;
var _ProxyTracerProvider = exports.ProxyTracerProvider;
var _SamplingDecision = exports.SamplingDecision;
var _SpanKind = exports.SpanKind;
var _SpanStatusCode = exports.SpanStatusCode;
var _TraceFlags = exports.TraceFlags;
var _createTraceState = exports.createTraceState;
var _isSpanContextValid = exports.isSpanContextValid;
var _isValidTraceId = exports.isValidTraceId;
var _isValidSpanId = exports.isValidSpanId;
var _INVALID_SPANID = exports.INVALID_SPANID;
var _INVALID_TRACEID = exports.INVALID_TRACEID;
var _INVALID_SPAN_CONTEXT = exports.INVALID_SPAN_CONTEXT;
var _context = exports.context;
var _diag = exports.diag;
var _metrics = exports.metrics;
var _propagation = exports.propagation;
var _trace = exports.trace;
const _default = exports.default ?? exports;
_default.baggageEntryMetadataFromString = _baggageEntryMetadataFromString;
_default.createContextKey = _createContextKey;
_default.ROOT_CONTEXT = _ROOT_CONTEXT;
_default.DiagConsoleLogger = _DiagConsoleLogger;
_default.DiagLogLevel = _DiagLogLevel;
_default.createNoopMeter = _createNoopMeter;
_default.ValueType = _ValueType;
_default.defaultTextMapGetter = _defaultTextMapGetter;
_default.defaultTextMapSetter = _defaultTextMapSetter;
_default.ProxyTracer = _ProxyTracer;
_default.ProxyTracerProvider = _ProxyTracerProvider;
_default.SamplingDecision = _SamplingDecision;
_default.SpanKind = _SpanKind;
_default.SpanStatusCode = _SpanStatusCode;
_default.TraceFlags = _TraceFlags;
_default.createTraceState = _createTraceState;
_default.isSpanContextValid = _isSpanContextValid;
_default.isValidTraceId = _isValidTraceId;
_default.isValidSpanId = _isValidSpanId;
_default.INVALID_SPANID = _INVALID_SPANID;
_default.INVALID_TRACEID = _INVALID_TRACEID;
_default.INVALID_SPAN_CONTEXT = _INVALID_SPAN_CONTEXT;
_default.context = _context;
_default.diag = _diag;
_default.metrics = _metrics;
_default.propagation = _propagation;
_default.trace = _trace;
exports.__esModule;
let BUILD_ID = "f79edb9edef467007affc214509c4839528b5ff2";
const DENO_DEPLOYMENT_ID = void 0;
function setBuildId(id) {
  BUILD_ID = id;
}
const { Deno: Deno$1 } = globalThis;
const noColor = typeof Deno$1?.noColor === "boolean" ? Deno$1.noColor : false;
let enabled = !noColor;
function code(open, close) {
  return { open: `\x1B[${open.join(";")}m`, close: `\x1B[${close}m`, regexp: new RegExp(`\\x1b\\[${close}m`, "g") };
}
function run(str, code2) {
  return enabled ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}` : str;
}
function bold(str) {
  return run(str, code([1], 22));
}
function cyan(str) {
  return run(str, code([36], 39));
}
function clampAndTruncate(n2, max = 255, min = 0) {
  return Math.trunc(Math.max(Math.min(n2, max), min));
}
function rgb8(str, color) {
  return run(str, code([38, 5, clampAndTruncate(color)], 39));
}
function bgRgb8(str, color) {
  return run(str, code([48, 5, clampAndTruncate(color)], 49));
}
var n$2, l$4, u$4, t$3, i$4, r$3, o$4, e$2, f$4, c$4, s$4, a$4, h$4, p$5 = {}, v$4 = [], y$3 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, w$3 = Array.isArray;
function d$3(n2, l2) {
  for (var u2 in l2) n2[u2] = l2[u2];
  return n2;
}
function g$3(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _$3(l2, u2, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n$2.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
  return m$2(l2, e2, i2, r2, null);
}
function m$2(n2, t2, i2, r2, o2) {
  var e2 = { type: n2, props: t2, key: i2, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o2 ? ++u$4 : o2, __i: -1, __u: 0 };
  return null == o2 && null != l$4.vnode && l$4.vnode(e2), e2;
}
function k$2(n2) {
  return n2.children;
}
function x$3(n2, l2) {
  this.props = n2, this.context = l2;
}
function S(n2, l2) {
  if (null == l2) return n2.__ ? S(n2.__, n2.__i + 1) : null;
  for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
  return "function" == typeof n2.type ? S(n2) : null;
}
function C$2(n2) {
  var l2, u2;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l2 = 0; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) {
      n2.__e = n2.__c.base = u2.__e;
      break;
    }
    return C$2(n2);
  }
}
function M$1(n2) {
  (!n2.__d && (n2.__d = true) && i$4.push(n2) && !$$1.__r++ || r$3 != l$4.debounceRendering) && ((r$3 = l$4.debounceRendering) || o$4)($$1);
}
function $$1() {
  for (var n2, u2, t2, r2, o2, f2, c2, s2 = 1; i$4.length; ) i$4.length > s2 && i$4.sort(e$2), n2 = i$4.shift(), s2 = i$4.length, n2.__d && (t2 = void 0, r2 = void 0, o2 = (r2 = (u2 = n2).__v).__e, f2 = [], c2 = [], u2.__P && ((t2 = d$3({}, r2)).__v = r2.__v + 1, l$4.vnode && l$4.vnode(t2), O$1(u2.__P, t2, r2, u2.__n, u2.__P.namespaceURI, 32 & r2.__u ? [o2] : null, f2, null == o2 ? S(r2) : o2, !!(32 & r2.__u), c2), t2.__v = r2.__v, t2.__.__k[t2.__i] = t2, N$1(f2, t2, c2), r2.__e = r2.__ = null, t2.__e != o2 && C$2(t2)));
  $$1.__r = 0;
}
function I$1(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, y2, w2, d2, g2, _2, m2 = t2 && t2.__k || v$4, b2 = l2.length;
  for (f2 = P$1(u2, l2, m2, f2, b2), a2 = 0; a2 < b2; a2++) null != (y2 = u2.__k[a2]) && (h2 = -1 == y2.__i ? p$5 : m2[y2.__i] || p$5, y2.__i = a2, g2 = O$1(n2, y2, h2, i2, r2, o2, e2, f2, c2, s2), w2 = y2.__e, y2.ref && h2.ref != y2.ref && (h2.ref && B$2(h2.ref, null, y2), s2.push(y2.ref, y2.__c || w2, y2)), null == d2 && null != w2 && (d2 = w2), (_2 = !!(4 & y2.__u)) || h2.__k === y2.__k ? f2 = A$1(y2, f2, n2, _2) : "function" == typeof y2.type && void 0 !== g2 ? f2 = g2 : w2 && (f2 = w2.nextSibling), y2.__u &= -7);
  return u2.__e = d2, f2;
}
function P$1(n2, l2, u2, t2, i2) {
  var r2, o2, e2, f2, c2, s2 = u2.length, a2 = s2, h2 = 0;
  for (n2.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? (f2 = r2 + h2, (o2 = n2.__k[r2] = "string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? m$2(null, o2, null, null, null) : w$3(o2) ? m$2(k$2, { children: o2 }, null, null, null) : null == o2.constructor && o2.__b > 0 ? m$2(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : o2).__ = n2, o2.__b = n2.__b + 1, e2 = null, -1 != (c2 = o2.__i = L(o2, u2, f2, a2)) && (a2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > s2 ? h2-- : i2 < s2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (a2) for (r2 = 0; r2 < s2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = S(e2)), D$2(e2, e2));
  return t2;
}
function A$1(n2, l2, u2, t2) {
  var i2, r2;
  if ("function" == typeof n2.type) {
    for (i2 = n2.__k, r2 = 0; i2 && r2 < i2.length; r2++) i2[r2] && (i2[r2].__ = n2, l2 = A$1(i2[r2], l2, u2, t2));
    return l2;
  }
  n2.__e != l2 && (t2 && (l2 && n2.type && !l2.parentNode && (l2 = S(n2)), u2.insertBefore(n2.__e, l2 || null)), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 == l2.nodeType);
  return l2;
}
function L(n2, l2, u2, t2) {
  var i2, r2, o2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], s2 = null != c2 && 0 == (2 & c2.__u);
  if (null === c2 && null == n2.key || s2 && e2 == c2.key && f2 == c2.type) return u2;
  if (t2 > (s2 ? 1 : 0)) {
    for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length; ) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
  }
  return -1;
}
function T$1(n2, l2, u2) {
  "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || y$3.test(l2) ? u2 : u2 + "px";
}
function j$1(n2, l2, u2, t2, i2) {
  var r2, o2;
  n: if ("style" == l2) {
    if ("string" == typeof u2) n2.style.cssText = u2;
    else {
      if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || T$1(n2.style, l2, "");
      if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || T$1(n2.style, l2, u2[l2]);
    }
  } else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(f$4, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2.u = t2.u : (u2.u = c$4, n2.addEventListener(l2, r2 ? a$4 : s$4, r2)) : n2.removeEventListener(l2, r2 ? a$4 : s$4, r2);
  else {
    if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u2 ? "" : u2;
      break n;
    } catch (n3) {
    }
    "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
  }
}
function F$2(n2) {
  return function(u2) {
    if (this.l) {
      var t2 = this.l[u2.type + n2];
      if (null == u2.t) u2.t = c$4++;
      else if (u2.t < t2.u) return;
      return t2(l$4.event ? l$4.event(u2) : u2);
    }
  };
}
function O$1(n2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, p2, v2, y2, _2, m2, b2, S2, C2, M2, $2, P2, A2, H2, L2, T2, j2 = u2.type;
  if (null != u2.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (a2 = l$4.__b) && a2(u2);
  n: if ("function" == typeof j2) try {
    if (b2 = u2.props, S2 = "prototype" in j2 && j2.prototype.render, C2 = (a2 = j2.contextType) && i2[a2.__c], M2 = a2 ? C2 ? C2.props.value : a2.__ : i2, t2.__c ? m2 = (h2 = u2.__c = t2.__c).__ = h2.__E : (S2 ? u2.__c = h2 = new j2(b2, M2) : (u2.__c = h2 = new x$3(b2, M2), h2.constructor = j2, h2.render = E$1), C2 && C2.sub(h2), h2.props = b2, h2.state || (h2.state = {}), h2.context = M2, h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), S2 && null == h2.__s && (h2.__s = h2.state), S2 && null != j2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = d$3({}, h2.__s)), d$3(h2.__s, j2.getDerivedStateFromProps(b2, h2.__s))), v2 = h2.props, y2 = h2.state, h2.__v = u2, p2) S2 && null == j2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), S2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
    else {
      if (S2 && null == j2.getDerivedStateFromProps && b2 !== v2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(b2, M2), !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(b2, h2.__s, M2) || u2.__v == t2.__v) {
        for (u2.__v != t2.__v && (h2.props = b2, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
          n3 && (n3.__ = u2);
        }), $2 = 0; $2 < h2._sb.length; $2++) h2.__h.push(h2._sb[$2]);
        h2._sb = [], h2.__h.length && e2.push(h2);
        break n;
      }
      null != h2.componentWillUpdate && h2.componentWillUpdate(b2, h2.__s, M2), S2 && null != h2.componentDidUpdate && h2.__h.push(function() {
        h2.componentDidUpdate(v2, y2, _2);
      });
    }
    if (h2.context = M2, h2.props = b2, h2.__P = n2, h2.__e = false, P2 = l$4.__r, A2 = 0, S2) {
      for (h2.state = h2.__s, h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), H2 = 0; H2 < h2._sb.length; H2++) h2.__h.push(h2._sb[H2]);
      h2._sb = [];
    } else do {
      h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
    } while (h2.__d && ++A2 < 25);
    h2.state = h2.__s, null != h2.getChildContext && (i2 = d$3(d$3({}, i2), h2.getChildContext())), S2 && !p2 && null != h2.getSnapshotBeforeUpdate && (_2 = h2.getSnapshotBeforeUpdate(v2, y2)), L2 = a2, null != a2 && a2.type === k$2 && null == a2.key && (L2 = V(a2.props.children)), f2 = I$1(n2, w$3(L2) ? L2 : [L2], u2, t2, i2, r2, o2, e2, f2, c2, s2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), m2 && (h2.__E = h2.__ = null);
  } catch (n3) {
    if (u2.__v = null, c2 || null != o2) {
      if (n3.then) {
        for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
        o2[o2.indexOf(f2)] = null, u2.__e = f2;
      } else {
        for (T2 = o2.length; T2--; ) g$3(o2[T2]);
        z$2(u2);
      }
    } else u2.__e = t2.__e, u2.__k = t2.__k, n3.then || z$2(u2);
    l$4.__e(n3, u2, t2);
  }
  else null == o2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = q$2(t2.__e, u2, t2, i2, r2, o2, e2, c2, s2);
  return (a2 = l$4.diffed) && a2(u2), 128 & u2.__u ? void 0 : f2;
}
function z$2(n2) {
  n2 && n2.__c && (n2.__c.__e = true), n2 && n2.__k && n2.__k.forEach(z$2);
}
function N$1(n2, u2, t2) {
  for (var i2 = 0; i2 < t2.length; i2++) B$2(t2[i2], t2[++i2], t2[++i2]);
  l$4.__c && l$4.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l$4.__e(n3, u3.__v);
    }
  });
}
function V(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b && n2.__b > 0 ? n2 : w$3(n2) ? n2.map(V) : d$3({}, n2);
}
function q$2(u2, t2, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, v2, y2, d2, _2, m2, b2 = i2.props, k2 = t2.props, x2 = t2.type;
  if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
    for (a2 = 0; a2 < e2.length; a2++) if ((d2 = e2[a2]) && "setAttribute" in d2 == !!x2 && (x2 ? d2.localName == x2 : 3 == d2.nodeType)) {
      u2 = d2, e2[a2] = null;
      break;
    }
  }
  if (null == u2) {
    if (null == x2) return document.createTextNode(k2);
    u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l$4.__m && l$4.__m(t2, e2), c2 = false), e2 = null;
  }
  if (null == x2) b2 === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = e2 && n$2.call(u2.childNodes), b2 = i2.props || p$5, !c2 && null != e2) for (b2 = {}, a2 = 0; a2 < u2.attributes.length; a2++) b2[(d2 = u2.attributes[a2]).name] = d2.value;
    for (a2 in b2) if (d2 = b2[a2], "children" == a2) ;
    else if ("dangerouslySetInnerHTML" == a2) v2 = d2;
    else if (!(a2 in k2)) {
      if ("value" == a2 && "defaultValue" in k2 || "checked" == a2 && "defaultChecked" in k2) continue;
      j$1(u2, a2, null, d2, o2);
    }
    for (a2 in k2) d2 = k2[a2], "children" == a2 ? y2 = d2 : "dangerouslySetInnerHTML" == a2 ? h2 = d2 : "value" == a2 ? _2 = d2 : "checked" == a2 ? m2 = d2 : c2 && "function" != typeof d2 || b2[a2] === d2 || j$1(u2, a2, d2, b2[a2], o2);
    if (h2) c2 || v2 && (h2.__html == v2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
    else if (v2 && (u2.innerHTML = ""), I$1("template" == t2.type ? u2.content : u2, w$3(y2) ? y2 : [y2], t2, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && S(i2, 0), c2, s2), null != e2) for (a2 = e2.length; a2--; ) g$3(e2[a2]);
    c2 || (a2 = "value", "progress" == x2 && null == _2 ? u2.removeAttribute("value") : null != _2 && (_2 !== u2[a2] || "progress" == x2 && !_2 || "option" == x2 && _2 != b2[a2]) && j$1(u2, a2, _2, b2[a2], o2), a2 = "checked", null != m2 && m2 != u2[a2] && j$1(u2, a2, m2, b2[a2], o2));
  }
  return u2;
}
function B$2(n2, u2, t2) {
  try {
    if ("function" == typeof n2) {
      var i2 = "function" == typeof n2.__u;
      i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
    } else n2.current = u2;
  } catch (n3) {
    l$4.__e(n3, t2);
  }
}
function D$2(n2, u2, t2) {
  var i2, r2;
  if (l$4.unmount && l$4.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || B$2(i2, null, u2)), null != (i2 = n2.__c)) {
    if (i2.componentWillUnmount) try {
      i2.componentWillUnmount();
    } catch (n3) {
      l$4.__e(n3, u2);
    }
    i2.base = i2.__P = null;
  }
  if (i2 = n2.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && D$2(i2[r2], u2, t2 || "function" != typeof n2.type);
  t2 || g$3(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function E$1(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function Q(n2) {
  function l2(n3) {
    var u2, t2;
    return this.getChildContext || (u2 = /* @__PURE__ */ new Set(), (t2 = {})[l2.__c] = this, this.getChildContext = function() {
      return t2;
    }, this.componentWillUnmount = function() {
      u2 = null;
    }, this.shouldComponentUpdate = function(n4) {
      this.props.value != n4.value && u2.forEach(function(n5) {
        n5.__e = true, M$1(n5);
      });
    }, this.sub = function(n4) {
      u2.add(n4);
      var l3 = n4.componentWillUnmount;
      n4.componentWillUnmount = function() {
        u2 && u2.delete(n4), l3 && l3.call(n4);
      };
    }), n3.children;
  }
  return l2.__c = "__cC" + h$4++, l2.__ = n2, l2.Provider = l2.__l = (l2.Consumer = function(n3, l3) {
    return n3.children(l3);
  }).contextType = l2, l2;
}
n$2 = v$4.slice, l$4 = { __e: function(n2, l2, u2, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, u$4 = 0, t$3 = function(n2) {
  return null != n2 && null == n2.constructor;
}, x$3.prototype.setState = function(n2, l2) {
  var u2;
  u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = d$3({}, this.state), "function" == typeof n2 && (n2 = n2(d$3({}, u2), this.props)), n2 && d$3(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), M$1(this));
}, x$3.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M$1(this));
}, x$3.prototype.render = k$2, i$4 = [], o$4 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$2 = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, $$1.__r = 0, f$4 = /(PointerCapture)$|Capture$/i, c$4 = 0, s$4 = F$2(false), a$4 = F$2(true), h$4 = 0;
var t$2 = /["&<]/;
function n$1(r2) {
  if (0 === r2.length || false === t$2.test(r2)) return r2;
  for (var e2 = 0, n2 = 0, o2 = "", f2 = ""; n2 < r2.length; n2++) {
    switch (r2.charCodeAt(n2)) {
      case 34:
        f2 = "&quot;";
        break;
      case 38:
        f2 = "&amp;";
        break;
      case 60:
        f2 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== e2 && (o2 += r2.slice(e2, n2)), o2 += f2, e2 = n2 + 1;
  }
  return n2 !== e2 && (o2 += r2.slice(e2, n2)), o2;
}
var o$3 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, f$3 = 0, i$3 = Array.isArray;
function u$3(e2, t2, n2, o2, i2, u2) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f$3, __i: -1, __u: 0, __source: i2, __self: u2 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l$4.vnode && l$4.vnode(l2), l2;
}
function a$3(r2) {
  var t2 = u$3(k$2, { tpl: r2, exprs: [].slice.call(arguments, 1) });
  return t2.key = t2.__v, t2;
}
var c$3 = {}, p$4 = /[A-Z]/g;
function l$3(e2, t2) {
  if (l$4.attr) {
    var f2 = l$4.attr(e2, t2);
    if ("string" == typeof f2) return f2;
  }
  if (t2 = (function(r2) {
    return null !== r2 && "object" == typeof r2 && "function" == typeof r2.valueOf ? r2.valueOf() : r2;
  })(t2), "ref" === e2 || "key" === e2) return "";
  if ("style" === e2 && "object" == typeof t2) {
    var i2 = "";
    for (var u2 in t2) {
      var a2 = t2[u2];
      if (null != a2 && "" !== a2) {
        var l2 = "-" == u2[0] ? u2 : c$3[u2] || (c$3[u2] = u2.replace(p$4, "-$&").toLowerCase()), s2 = ";";
        "number" != typeof a2 || l2.startsWith("--") || o$3.test(l2) || (s2 = "px;"), i2 = i2 + l2 + ":" + a2 + s2;
      }
    }
    return e2 + '="' + n$1(i2) + '"';
  }
  return null == t2 || false === t2 || "function" == typeof t2 || "object" == typeof t2 ? "" : true === t2 ? e2 : e2 + '="' + n$1("" + t2) + '"';
}
function s$3(r2) {
  if (null == r2 || "boolean" == typeof r2 || "function" == typeof r2) return null;
  if ("object" == typeof r2) {
    if (void 0 === r2.constructor) return r2;
    if (i$3(r2)) {
      for (var e2 = 0; e2 < r2.length; e2++) r2[e2] = s$3(r2[e2]);
      return r2;
    }
  }
  return n$1("" + r2);
}
const INTERNAL_PREFIX = "/_frsh";
const DEV_ERROR_OVERLAY_URL = `${INTERNAL_PREFIX}/error_overlay`;
const PARTIAL_SEARCH_PARAM = "fresh-partial";
const ASSET_CACHE_BUST_KEY = "__frsh_c";
const DATA_CURRENT = "data-current";
const DATA_ANCESTOR = "data-ancestor";
const DATA_FRESH_KEY = "data-frsh-key";
const CLIENT_NAV_ATTR = "f-client-nav";
var OptionsType = /* @__PURE__ */ (function(OptionsType2) {
  OptionsType2["ATTR"] = "attr";
  OptionsType2["VNODE"] = "vnode";
  OptionsType2["HOOK"] = "__h";
  OptionsType2["DIFF"] = "__b";
  OptionsType2["RENDER"] = "__r";
  OptionsType2["DIFFED"] = "diffed";
  OptionsType2["ERROR"] = "__e";
  return OptionsType2;
})({});
function matchesUrl(current, needle) {
  let href = new URL(needle, "http://localhost").pathname;
  if (href !== "/" && href.endsWith("/")) {
    href = href.slice(0, -1);
  }
  if (current !== "/" && current.endsWith("/")) {
    current = current.slice(0, -1);
  }
  if (current === href) {
    return 2;
  } else if (current.startsWith(href + "/") || href === "/") {
    return 1;
  }
  return 0;
}
function setActiveUrl(vnode, pathname) {
  const props = vnode.props;
  const hrefProp = props.href;
  if (typeof hrefProp === "string" && hrefProp.startsWith("/")) {
    const match = matchesUrl(pathname, hrefProp);
    if (match === 2) {
      props[DATA_CURRENT] = "true";
      props["aria-current"] = "page";
    } else if (match === 1) {
      props[DATA_ANCESTOR] = "true";
      props["aria-current"] = "true";
    }
  }
}
var PartialMode = /* @__PURE__ */ (function(PartialMode2) {
  PartialMode2[PartialMode2["Replace"] = 0] = "Replace";
  PartialMode2[PartialMode2["Append"] = 1] = "Append";
  PartialMode2[PartialMode2["Prepend"] = 2] = "Prepend";
  return PartialMode2;
})({});
function assetInternal(path, buildId) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  try {
    const url = new URL(path, "https://freshassetcache.local");
    if (url.protocol !== "https:" || url.host !== "freshassetcache.local" || url.searchParams.has(ASSET_CACHE_BUST_KEY)) {
      return path;
    }
    url.searchParams.set(ASSET_CACHE_BUST_KEY, buildId);
    return url.pathname + url.search + url.hash;
  } catch (err) {
    console.warn(`Failed to create asset() URL, falling back to regular path ('${path}'):`, err);
    return path;
  }
}
function assetSrcSetInternal(srcset, buildId) {
  if (srcset.includes("(")) return srcset;
  const parts = srcset.split(",");
  const constructed = [];
  for (const part of parts) {
    const trimmed = part.trimStart();
    const leadingWhitespace = part.length - trimmed.length;
    if (trimmed === "") return srcset;
    let urlEnd = trimmed.indexOf(" ");
    if (urlEnd === -1) urlEnd = trimmed.length;
    const leading = part.substring(0, leadingWhitespace);
    const url = trimmed.substring(0, urlEnd);
    const trailing = trimmed.substring(urlEnd);
    constructed.push(leading + assetInternal(url, buildId) + trailing);
  }
  return constructed.join(",");
}
function assetHashingHook(vnode, buildId) {
  if (vnode.type === "img" || vnode.type === "source") {
    const { props } = vnode;
    if (props["data-fresh-disable-lock"]) return;
    if (typeof props.src === "string") {
      props.src = assetInternal(props.src, buildId);
    }
    if (typeof props.srcset === "string") {
      props.srcset = assetSrcSetInternal(props.srcset, buildId);
    }
  }
}
const HeadContext = Q(false);
function Head(props) {
  return _$3(HeadContext, { value: true }, props.children);
}
function asset(path) {
  return assetInternal(path, BUILD_ID);
}
function Partial(props) {
  return props.children;
}
Partial.displayName = "Partial";
const UNDEFINED = -1;
const NULL = -2;
const NAN = -3;
const INFINITY_POS = -4;
const INFINITY_NEG = -5;
const ZERO_NEG = -6;
const HOLE = -7;
function stringify(data, custom) {
  const out = [];
  const indexes = /* @__PURE__ */ new Map();
  const res = serializeInner(out, indexes, data, custom);
  if (res < 0) {
    return String(res);
  }
  return `[${out.join(",")}]`;
}
function serializeInner(out, indexes, value, custom) {
  const seenIdx = indexes.get(value);
  if (seenIdx !== void 0) return seenIdx;
  if (value === void 0) return UNDEFINED;
  if (value === null) return NULL;
  if (Number.isNaN(value)) return NAN;
  if (value === Infinity) return INFINITY_POS;
  if (value === -Infinity) return INFINITY_NEG;
  if (value === 0 && 1 / value < 0) return ZERO_NEG;
  const idx = out.length;
  out.push("");
  indexes.set(value, idx);
  let str = "";
  if (typeof value === "number") {
    str += String(value);
  } else if (typeof value === "boolean") {
    str += String(value);
  } else if (typeof value === "bigint") {
    str += `["BigInt","${value}"]`;
  } else if (typeof value === "string") {
    str += JSON.stringify(value);
  } else if (Array.isArray(value)) {
    str += "[";
    for (let i2 = 0; i2 < value.length; i2++) {
      if (i2 in value) {
        str += serializeInner(out, indexes, value[i2], custom);
      } else {
        str += HOLE;
      }
      if (i2 < value.length - 1) {
        str += ",";
      }
    }
    str += "]";
  } else if (typeof value === "object") {
    if (custom !== void 0) {
      for (const k2 in custom) {
        const fn = custom[k2];
        if (fn === void 0) continue;
        const res = fn(value);
        if (res === void 0) continue;
        const innerIdx = serializeInner(out, indexes, res.value, custom);
        str = `["${k2}",${innerIdx}]`;
        out[idx] = str;
        return idx;
      }
    }
    if (value instanceof URL) {
      str += `["URL","${value.href}"]`;
    } else if (value instanceof Date) {
      str += `["Date","${value.toISOString()}"]`;
    } else if (value instanceof RegExp) {
      str += `["RegExp",${JSON.stringify(value.source)}, "${value.flags}"]`;
    } else if (value instanceof Uint8Array) {
      str += `["Uint8Array","${b64encode(value.buffer)}"]`;
    } else if (value instanceof Set) {
      const items = new Array(value.size);
      let i2 = 0;
      value.forEach((v2) => {
        items[i2++] = serializeInner(out, indexes, v2, custom);
      });
      str += `["Set",[${items.join(",")}]]`;
    } else if (value instanceof Map) {
      const items = new Array(value.size * 2);
      let i2 = 0;
      value.forEach((v2, k2) => {
        items[i2++] = serializeInner(out, indexes, k2, custom);
        items[i2++] = serializeInner(out, indexes, v2, custom);
      });
      str += `["Map",[${items.join(",")}]]`;
    } else {
      str += "{";
      const keys = Object.keys(value);
      for (let i2 = 0; i2 < keys.length; i2++) {
        const key = keys[i2];
        str += JSON.stringify(key) + ":";
        str += serializeInner(out, indexes, value[key], custom);
        if (i2 < keys.length - 1) {
          str += ",";
        }
      }
      str += "}";
    }
  } else if (typeof value === "function") {
    throw new Error(`Serializing functions is not supported.`);
  }
  out[idx] = str;
  return idx;
}
const base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
function b64encode(buffer) {
  const uint8 = new Uint8Array(buffer);
  let result = "", i2;
  const l2 = uint8.length;
  for (i2 = 2; i2 < l2; i2 += 3) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc[(uint8[i2 - 1] & 15) << 2 | uint8[i2] >> 6];
    result += base64abc[uint8[i2] & 63];
  }
  if (i2 === l2 + 1) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4];
    result += "==";
  }
  if (i2 === l2) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc[(uint8[i2 - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
const rawToEntityEntries = [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"]];
Object.fromEntries([...rawToEntityEntries.map(([raw, entity]) => [entity, raw]), ["&apos;", "'"], ["&nbsp;", " "]]);
const rawToEntity = new Map(rawToEntityEntries);
const rawRe = new RegExp(`[${[...rawToEntity.keys()].join("")}]`, "g");
function escape(str) {
  return str.replaceAll(rawRe, (m2) => rawToEntity.get(m2));
}
const STATUS_CODE = {
  /** RFC 7231, 6.2.1 */
  Continue: 100,
  /** RFC 7231, 6.2.2 */
  SwitchingProtocols: 101,
  /** RFC 2518, 10.1 */
  Processing: 102,
  /** RFC 8297 **/
  EarlyHints: 103,
  /** RFC 7231, 6.3.1 */
  OK: 200,
  /** RFC 7231, 6.3.2 */
  Created: 201,
  /** RFC 7231, 6.3.3 */
  Accepted: 202,
  /** RFC 7231, 6.3.4 */
  NonAuthoritativeInfo: 203,
  /** RFC 7231, 6.3.5 */
  NoContent: 204,
  /** RFC 7231, 6.3.6 */
  ResetContent: 205,
  /** RFC 7233, 4.1 */
  PartialContent: 206,
  /** RFC 4918, 11.1 */
  MultiStatus: 207,
  /** RFC 5842, 7.1 */
  AlreadyReported: 208,
  /** RFC 3229, 10.4.1 */
  IMUsed: 226,
  /** RFC 7231, 6.4.1 */
  MultipleChoices: 300,
  /** RFC 7231, 6.4.2 */
  MovedPermanently: 301,
  /** RFC 7231, 6.4.3 */
  Found: 302,
  /** RFC 7231, 6.4.4 */
  SeeOther: 303,
  /** RFC 7232, 4.1 */
  NotModified: 304,
  /** RFC 7231, 6.4.5 */
  UseProxy: 305,
  /** RFC 7231, 6.4.7 */
  TemporaryRedirect: 307,
  /** RFC 7538, 3 */
  PermanentRedirect: 308,
  /** RFC 7231, 6.5.1 */
  BadRequest: 400,
  /** RFC 7235, 3.1 */
  Unauthorized: 401,
  /** RFC 7231, 6.5.2 */
  PaymentRequired: 402,
  /** RFC 7231, 6.5.3 */
  Forbidden: 403,
  /** RFC 7231, 6.5.4 */
  NotFound: 404,
  /** RFC 7231, 6.5.5 */
  MethodNotAllowed: 405,
  /** RFC 7231, 6.5.6 */
  NotAcceptable: 406,
  /** RFC 7235, 3.2 */
  ProxyAuthRequired: 407,
  /** RFC 7231, 6.5.7 */
  RequestTimeout: 408,
  /** RFC 7231, 6.5.8 */
  Conflict: 409,
  /** RFC 7231, 6.5.9 */
  Gone: 410,
  /** RFC 7231, 6.5.10 */
  LengthRequired: 411,
  /** RFC 7232, 4.2 */
  PreconditionFailed: 412,
  /** RFC 7231, 6.5.11 */
  ContentTooLarge: 413,
  /** RFC 7231, 6.5.12 */
  URITooLong: 414,
  /** RFC 7231, 6.5.13 */
  UnsupportedMediaType: 415,
  /** RFC 7233, 4.4 */
  RangeNotSatisfiable: 416,
  /** RFC 7231, 6.5.14 */
  ExpectationFailed: 417,
  /** RFC 7168, 2.3.3 */
  Teapot: 418,
  /** RFC 7540, 9.1.2 */
  MisdirectedRequest: 421,
  /** RFC 4918, 11.2 */
  UnprocessableEntity: 422,
  /** RFC 4918, 11.3 */
  Locked: 423,
  /** RFC 4918, 11.4 */
  FailedDependency: 424,
  /** RFC 8470, 5.2 */
  TooEarly: 425,
  /** RFC 7231, 6.5.15 */
  UpgradeRequired: 426,
  /** RFC 6585, 3 */
  PreconditionRequired: 428,
  /** RFC 6585, 4 */
  TooManyRequests: 429,
  /** RFC 6585, 5 */
  RequestHeaderFieldsTooLarge: 431,
  /** RFC 7725, 3 */
  UnavailableForLegalReasons: 451,
  /** RFC 7231, 6.6.1 */
  InternalServerError: 500,
  /** RFC 7231, 6.6.2 */
  NotImplemented: 501,
  /** RFC 7231, 6.6.3 */
  BadGateway: 502,
  /** RFC 7231, 6.6.4 */
  ServiceUnavailable: 503,
  /** RFC 7231, 6.6.5 */
  GatewayTimeout: 504,
  /** RFC 7231, 6.6.6 */
  HTTPVersionNotSupported: 505,
  /** RFC 2295, 8.1 */
  VariantAlsoNegotiates: 506,
  /** RFC 4918, 11.5 */
  InsufficientStorage: 507,
  /** RFC 5842, 7.2 */
  LoopDetected: 508,
  /** RFC 2774, 7 */
  NotExtended: 510,
  /** RFC 6585, 6 */
  NetworkAuthenticationRequired: 511
};
const STATUS_TEXT = { [STATUS_CODE.Accepted]: "Accepted", [STATUS_CODE.AlreadyReported]: "Already Reported", [STATUS_CODE.BadGateway]: "Bad Gateway", [STATUS_CODE.BadRequest]: "Bad Request", [STATUS_CODE.Conflict]: "Conflict", [STATUS_CODE.Continue]: "Continue", [STATUS_CODE.Created]: "Created", [STATUS_CODE.EarlyHints]: "Early Hints", [STATUS_CODE.ExpectationFailed]: "Expectation Failed", [STATUS_CODE.FailedDependency]: "Failed Dependency", [STATUS_CODE.Forbidden]: "Forbidden", [STATUS_CODE.Found]: "Found", [STATUS_CODE.GatewayTimeout]: "Gateway Timeout", [STATUS_CODE.Gone]: "Gone", [STATUS_CODE.HTTPVersionNotSupported]: "HTTP Version Not Supported", [STATUS_CODE.IMUsed]: "IM Used", [STATUS_CODE.InsufficientStorage]: "Insufficient Storage", [STATUS_CODE.InternalServerError]: "Internal Server Error", [STATUS_CODE.LengthRequired]: "Length Required", [STATUS_CODE.Locked]: "Locked", [STATUS_CODE.LoopDetected]: "Loop Detected", [STATUS_CODE.MethodNotAllowed]: "Method Not Allowed", [STATUS_CODE.MisdirectedRequest]: "Misdirected Request", [STATUS_CODE.MovedPermanently]: "Moved Permanently", [STATUS_CODE.MultiStatus]: "Multi Status", [STATUS_CODE.MultipleChoices]: "Multiple Choices", [STATUS_CODE.NetworkAuthenticationRequired]: "Network Authentication Required", [STATUS_CODE.NoContent]: "No Content", [STATUS_CODE.NonAuthoritativeInfo]: "Non Authoritative Info", [STATUS_CODE.NotAcceptable]: "Not Acceptable", [STATUS_CODE.NotExtended]: "Not Extended", [STATUS_CODE.NotFound]: "Not Found", [STATUS_CODE.NotImplemented]: "Not Implemented", [STATUS_CODE.NotModified]: "Not Modified", [STATUS_CODE.OK]: "OK", [STATUS_CODE.PartialContent]: "Partial Content", [STATUS_CODE.PaymentRequired]: "Payment Required", [STATUS_CODE.PermanentRedirect]: "Permanent Redirect", [STATUS_CODE.PreconditionFailed]: "Precondition Failed", [STATUS_CODE.PreconditionRequired]: "Precondition Required", [STATUS_CODE.Processing]: "Processing", [STATUS_CODE.ProxyAuthRequired]: "Proxy Auth Required", [STATUS_CODE.ContentTooLarge]: "Content Too Large", [STATUS_CODE.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large", [STATUS_CODE.RequestTimeout]: "Request Timeout", [STATUS_CODE.URITooLong]: "URI Too Long", [STATUS_CODE.RangeNotSatisfiable]: "Range Not Satisfiable", [STATUS_CODE.ResetContent]: "Reset Content", [STATUS_CODE.SeeOther]: "See Other", [STATUS_CODE.ServiceUnavailable]: "Service Unavailable", [STATUS_CODE.SwitchingProtocols]: "Switching Protocols", [STATUS_CODE.Teapot]: "I'm a teapot", [STATUS_CODE.TemporaryRedirect]: "Temporary Redirect", [STATUS_CODE.TooEarly]: "Too Early", [STATUS_CODE.TooManyRequests]: "Too Many Requests", [STATUS_CODE.Unauthorized]: "Unauthorized", [STATUS_CODE.UnavailableForLegalReasons]: "Unavailable For Legal Reasons", [STATUS_CODE.UnprocessableEntity]: "Unprocessable Entity", [STATUS_CODE.UnsupportedMediaType]: "Unsupported Media Type", [STATUS_CODE.UpgradeRequired]: "Upgrade Required", [STATUS_CODE.UseProxy]: "Use Proxy", [STATUS_CODE.VariantAlsoNegotiates]: "Variant Also Negotiates" };
class HttpError extends Error {
  /**
  * The HTTP status code.
  *
  * @example Basic usage
  * ```ts
  * import { App, HttpError } from "fresh";
  * import { expect } from "@std/expect";
  *
  * const app = new App()
  *   .get("/", () => new Response("ok"))
  *   .get("/not-found", () => {
  *      throw new HttpError(404, "Nothing here");
  *    });
  *
  * const handler = app.handler();
  *
  * try {
  *   await handler(new Request("http://localhost/not-found"))
  * } catch (error) {
  *   expect(error).toBeInstanceOf(HttpError);
  *   expect(error.status).toBe(404);
  *   expect(error.message).toBe("Nothing here");
  * }
  * ```
  */
  status;
  /**
  * Constructs a new instance.
  *
  * @param status The HTTP status code.
  * @param message The error message. Defaults to the status text of the given
  * status code.
  * @param options Optional error options.
  */
  constructor(status, message = STATUS_TEXT[status], options2) {
    super(message, options2);
    this.name = this.constructor.name;
    this.status = status;
  }
}
function tabs2Spaces(str) {
  return str.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length));
}
function createCodeFrame(text, lineNum, columnNum) {
  const before = 2;
  const after = 3;
  const lines = text.split("\n");
  if (lines.length <= lineNum || lines[lineNum].length < columnNum) {
    return;
  }
  const start = Math.max(0, lineNum - before);
  const end = Math.min(lines.length, lineNum + after + 1);
  const maxLineNum = String(end).length;
  const padding = " ".repeat(maxLineNum);
  const spaceLines = [];
  let maxLineLen = 0;
  for (let i2 = start; i2 < end; i2++) {
    const line = tabs2Spaces(lines[i2]);
    spaceLines.push(line);
    if (line.length > maxLineLen) maxLineLen = line.length;
  }
  const activeLine = spaceLines[lineNum - start];
  const count = Math.max(0, activeLine.length - lines[lineNum].length + columnNum);
  const sep = "|";
  let out = "";
  for (let i2 = 0; i2 < spaceLines.length; i2++) {
    const line = spaceLines[i2];
    const currentLine = (padding + (i2 + start + 1)).slice(-maxLineNum);
    if (i2 === lineNum - start) {
      out += `> ${currentLine} ${sep} ${line}
`;
      const columnMarker = "^";
      out += `  ${padding} ${sep} ${" ".repeat(count)}${columnMarker}
`;
    } else {
      out += `  ${currentLine} ${sep} ${line}
`;
    }
  }
  return out;
}
const STACK_FRAME = /^\s*at\s+(?:(.*)\s+)?\((.*):(\d+):(\d+)\)$/;
function getFirstUserFile(stack, rootDir) {
  const lines = stack.split("\n");
  for (let i2 = 0; i2 < lines.length; i2++) {
    const match = lines[i2].match(STACK_FRAME);
    if (match) {
      const fnName = match[1] ?? "";
      const file = match[2];
      const line = +match[3];
      const column = +match[4];
      if (file.startsWith("file://")) {
        const filePath = fromFileUrl(file);
        if (relative(rootDir, filePath).startsWith(".")) {
          continue;
        }
        return { fnName, file, line, column };
      }
    }
  }
}
function getCodeFrame(stack, rootDir) {
  const file = getFirstUserFile(stack, rootDir);
  if (file) {
    try {
      const filePath = fromFileUrl(file.file);
      const text = Deno.readTextFileSync(filePath);
      return createCodeFrame(text, file.line - 1, file.column - 1);
    } catch {
    }
  }
}
const SCRIPT_ESCAPE = /<\/(style|script)/gi;
const COMMENT_ESCAPE = /<!--/gi;
function escapeScript(content, options2 = {}) {
  return content.replaceAll(SCRIPT_ESCAPE, "<\\/$1").replaceAll(COMMENT_ESCAPE, options2.json ? "\\u003C!--" : "\\x3C!--");
}
class UniqueNamer {
  #seen = /* @__PURE__ */ new Map();
  getUniqueName(name) {
    name = name.replaceAll(/([^A-Za-z0-9_$]+)/g, "_");
    if (/^\d/.test(name) || JS_RESERVED.has(name)) {
      name = "_" + name;
    }
    const count = this.#seen.get(name);
    if (count === void 0) {
      this.#seen.set(name, 1);
    } else {
      this.#seen.set(name, count + 1);
      name = `${name}_${count}`;
    }
    return name;
  }
}
const JS_RESERVED = /* @__PURE__ */ new Set(["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "let", "static", "yield", "await", "enum", "implements", "interface", "package", "private", "protected", "public", "abstract", "boolean", "byte", "char", "double", "final", "float", "goto", "int", "long", "native", "short", "synchronized", "throws", "transient", "volatile", "arguments", "as", "async", "eval", "from", "get", "of", "set"]);
function isLazy(value) {
  return typeof value === "function";
}
var t$1, r$2, u$2, i$2, o$2 = 0, f$2 = [], c$2 = l$4, e$1 = c$2.__b, a$2 = c$2.__r, v$3 = c$2.diffed, l$2 = c$2.__c, m$1 = c$2.unmount, s$2 = c$2.__;
function p$3(n2, t2) {
  c$2.__h && c$2.__h(r$2, n2, o$2 || t2), o$2 = 0;
  var u2 = r$2.__H || (r$2.__H = { __: [], __h: [] });
  return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
}
function d$2(n2) {
  return o$2 = 1, h$3(D$1, n2);
}
function h$3(n2, u2, i2) {
  var o2 = p$3(t$1++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [D$1(void 0, u2), function(n3) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r$2, !r$2.__f)) {
    var f2 = function(n3, t2, r2) {
      if (!o2.__c.__H) return true;
      var u3 = o2.__c.__H.__.filter(function(n4) {
        return !!n4.__c;
      });
      if (u3.every(function(n4) {
        return !n4.__N;
      })) return !c2 || c2.call(this, n3, t2, r2);
      var i3 = o2.__c.props !== n3;
      return u3.forEach(function(n4) {
        if (n4.__N) {
          var t3 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
        }
      }), c2 && c2.call(this, n3, t2, r2) || i3;
    };
    r$2.__f = true;
    var c2 = r$2.shouldComponentUpdate, e2 = r$2.componentWillUpdate;
    r$2.componentWillUpdate = function(n3, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n3, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n3, t2, r2);
    }, r$2.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function T(n2, r2) {
  var u2 = p$3(t$1++, 7);
  return C$1(u2.__H, r2) && (u2.__ = n2(), u2.__H = r2, u2.__h = n2), u2.__;
}
function x$2(n2) {
  var u2 = r$2.context[n2.__c], i2 = p$3(t$1++, 9);
  return i2.c = n2, u2 ? (null == i2.__ && (i2.__ = true, u2.sub(r$2)), u2.props.value) : n2.__;
}
function j() {
  for (var n2; n2 = f$2.shift(); ) if (n2.__P && n2.__H) try {
    n2.__H.__h.forEach(z$1), n2.__H.__h.forEach(B$1), n2.__H.__h = [];
  } catch (t2) {
    n2.__H.__h = [], c$2.__e(t2, n2.__v);
  }
}
c$2.__b = function(n2) {
  r$2 = null, e$1 && e$1(n2);
}, c$2.__ = function(n2, t2) {
  n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), s$2 && s$2(n2, t2);
}, c$2.__r = function(n2) {
  a$2 && a$2(n2), t$1 = 0;
  var i2 = (r$2 = n2.__c).__H;
  i2 && (u$2 === r$2 ? (i2.__h = [], r$2.__h = [], i2.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i2.__h.forEach(z$1), i2.__h.forEach(B$1), i2.__h = [], t$1 = 0)), u$2 = r$2;
}, c$2.diffed = function(n2) {
  v$3 && v$3(n2);
  var t2 = n2.__c;
  t2 && t2.__H && (t2.__H.__h.length && (1 !== f$2.push(t2) && i$2 === c$2.requestAnimationFrame || ((i$2 = c$2.requestAnimationFrame) || w$2)(j)), t2.__H.__.forEach(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = void 0;
  })), u$2 = r$2 = null;
}, c$2.__c = function(n2, t2) {
  t2.some(function(n3) {
    try {
      n3.__h.forEach(z$1), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B$1(n4);
      });
    } catch (r2) {
      t2.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t2 = [], c$2.__e(r2, n3.__v);
    }
  }), l$2 && l$2(n2, t2);
}, c$2.unmount = function(n2) {
  m$1 && m$1(n2);
  var t2, r2 = n2.__c;
  r2 && r2.__H && (r2.__H.__.forEach(function(n3) {
    try {
      z$1(n3);
    } catch (n4) {
      t2 = n4;
    }
  }), r2.__H = void 0, t2 && c$2.__e(t2, r2.__v));
};
var k$1 = "function" == typeof requestAnimationFrame;
function w$2(n2) {
  var t2, r2 = function() {
    clearTimeout(u2), k$1 && cancelAnimationFrame(t2), setTimeout(n2);
  }, u2 = setTimeout(r2, 35);
  k$1 && (t2 = requestAnimationFrame(r2));
}
function z$1(n2) {
  var t2 = r$2, u2 = n2.__c;
  "function" == typeof u2 && (n2.__c = void 0, u2()), r$2 = t2;
}
function B$1(n2) {
  var t2 = r$2;
  n2.__c = n2.__(), r$2 = t2;
}
function C$1(n2, t2) {
  return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n2[r2];
  });
}
function D$1(n2, t2) {
  return "function" == typeof t2 ? t2(n2) : t2;
}
const options = l$4;
class RenderState {
  ctx;
  buildCache;
  partialId;
  nonce;
  partialDepth;
  partialCount;
  error;
  // deno-lint-ignore no-explicit-any
  slots;
  // deno-lint-ignore no-explicit-any
  islandProps;
  islands;
  islandAssets;
  // deno-lint-ignore no-explicit-any
  encounteredPartials;
  owners;
  ownerStack;
  headComponents;
  // TODO: merge into bitmask field
  renderedHtmlTag;
  renderedHtmlBody;
  renderedHtmlHead;
  hasRuntimeScript;
  constructor(ctx, buildCache, partialId) {
    this.ctx = ctx;
    this.buildCache = buildCache;
    this.partialId = partialId;
    this.partialDepth = 0;
    this.partialCount = 0;
    this.error = null;
    this.slots = [];
    this.islandProps = [];
    this.islands = /* @__PURE__ */ new Set();
    this.islandAssets = /* @__PURE__ */ new Set();
    this.encounteredPartials = /* @__PURE__ */ new Set();
    this.owners = /* @__PURE__ */ new Map();
    this.ownerStack = [];
    this.headComponents = /* @__PURE__ */ new Map();
    this.renderedHtmlTag = false;
    this.renderedHtmlBody = false;
    this.renderedHtmlHead = false;
    this.hasRuntimeScript = false;
    this.nonce = crypto.randomUUID().replace(/-/g, "");
  }
  clear() {
    this.islands.clear();
    this.encounteredPartials.clear();
    this.owners.clear();
    this.slots = [];
    this.islandProps = [];
    this.ownerStack = [];
  }
}
let RENDER_STATE = null;
function setRenderState(state) {
  RENDER_STATE = state;
}
const oldVNodeHook = options[OptionsType.VNODE];
options[OptionsType.VNODE] = (vnode) => {
  if (RENDER_STATE !== null) {
    RENDER_STATE.owners.set(vnode, RENDER_STATE.ownerStack.at(-1));
    if (vnode.type === "a") {
      setActiveUrl(vnode, RENDER_STATE.ctx.url.pathname);
    }
  }
  assetHashingHook(vnode, BUILD_ID);
  if (typeof vnode.type === "function") {
    if (vnode.type === Partial) {
      const props = vnode.props;
      const key = normalizeKey(vnode.key);
      const mode = !props.mode || props.mode === "replace" ? PartialMode.Replace : props.mode === "append" ? PartialMode.Append : PartialMode.Prepend;
      props.children = wrapWithMarker(props.children, "partial", `${props.name}:${mode}:${key}`);
    }
  } else if (typeof vnode.type === "string") {
    if (vnode.type === "body") {
      const scripts = _$3(FreshScripts, null);
      if (vnode.props.children == null) {
        vnode.props.children = scripts;
      } else if (Array.isArray(vnode.props.children)) {
        vnode.props.children.push(scripts);
      } else {
        vnode.props.children = [vnode.props.children, scripts];
      }
    }
    if (CLIENT_NAV_ATTR in vnode.props) {
      vnode.props[CLIENT_NAV_ATTR] = String(vnode.props[CLIENT_NAV_ATTR]);
    }
  }
  oldVNodeHook?.(vnode);
};
const oldAttrHook = options[OptionsType.ATTR];
options[OptionsType.ATTR] = (name, value) => {
  if (name === CLIENT_NAV_ATTR) {
    return `${CLIENT_NAV_ATTR}="${String(Boolean(value))}"`;
  } else if (name === "key") {
    return `${DATA_FRESH_KEY}="${escape(String(value))}"`;
  }
  return oldAttrHook?.(name, value);
};
const PATCHED = /* @__PURE__ */ new WeakSet();
function normalizeKey(key) {
  const value = key ?? "";
  const s2 = typeof value !== "string" ? String(value) : value;
  return s2.replaceAll(":", "_");
}
const oldDiff = options[OptionsType.DIFF];
options[OptionsType.DIFF] = (vnode) => {
  if (RENDER_STATE !== null) {
    patcher: if (typeof vnode.type === "function" && vnode.type !== k$2) {
      if (vnode.type === Partial) {
        RENDER_STATE.partialDepth++;
        const name = vnode.props.name;
        if (typeof name === "string") {
          if (RENDER_STATE.encounteredPartials.has(name)) {
            throw new Error(`Rendered response contains duplicate partial name: "${name}"`);
          }
          RENDER_STATE.encounteredPartials.add(name);
        }
        if (hasIslandOwner(RENDER_STATE, vnode)) {
          throw new Error(`<Partial> components cannot be used inside islands.`);
        }
      } else if (!PATCHED.has(vnode)) {
        const island = RENDER_STATE.buildCache.islandRegistry.get(vnode.type);
        const insideIsland = hasIslandOwner(RENDER_STATE, vnode);
        if (island === void 0) {
          if (insideIsland) break patcher;
          if (vnode.key !== void 0) {
            const key = normalizeKey(vnode.key);
            const originalType2 = vnode.type;
            vnode.type = (props) => {
              const child = _$3(originalType2, props);
              PATCHED.add(child);
              return wrapWithMarker(child, "key", key);
            };
          }
          break patcher;
        }
        const { islands: islands2, islandProps, islandAssets } = RENDER_STATE;
        if (insideIsland) {
          for (let i2 = 0; i2 < island.css.length; i2++) {
            const css2 = island.css[i2];
            islandAssets.add(css2);
          }
          break patcher;
        }
        islands2.add(island);
        const originalType = vnode.type;
        vnode.type = (props) => {
          for (const name in props) {
            const value = props[name];
            if (name === "children" || t$3(value) && !isSignal(value)) {
              const slotId = RENDER_STATE.slots.length;
              RENDER_STATE.slots.push({ id: slotId, name, vnode: value });
              props[name] = _$3(Slot, { name, id: slotId }, value);
            }
          }
          const propsIdx = islandProps.push({ slots: [], props }) - 1;
          const child = _$3(originalType, props);
          PATCHED.add(child);
          const key = normalizeKey(vnode.key);
          return wrapWithMarker(child, "island", `${island.name}:${propsIdx}:${key}`);
        };
      }
    } else if (typeof vnode.type === "string") {
      switch (vnode.type) {
        case "html":
          RENDER_STATE.renderedHtmlTag = true;
          break;
        case "head": {
          RENDER_STATE.renderedHtmlHead = true;
          const entryAssets2 = RENDER_STATE.buildCache.getEntryAssets();
          const items = [];
          if (entryAssets2.length > 0) {
            for (let i2 = 0; i2 < entryAssets2.length; i2++) {
              const id = entryAssets2[i2];
              if (id.endsWith(".css")) {
                items.push(
                  // deno-lint-ignore no-explicit-any
                  _$3("link", { rel: "stylesheet", href: asset(id) })
                );
              }
            }
          }
          items.push(_$3(RemainingHead, null));
          if (Array.isArray(vnode.props.children)) {
            vnode.props.children.push(...items);
          } else if (vnode.props.children !== null && typeof vnode.props.children === "object") {
            items.unshift(vnode.props.children);
            vnode.props.children = items;
          } else {
            vnode.props.children = items;
          }
          break;
        }
        case "body":
          RENDER_STATE.renderedHtmlBody = true;
          break;
        case "title":
        case "meta":
        case "link":
        case "script":
        case "style":
        case "base":
        case "noscript":
        case "template":
          {
            if (PATCHED.has(vnode)) {
              break;
            }
            const originalType = vnode.type;
            let cacheKey = vnode.key ?? (originalType === "title" ? "title" : null);
            if (cacheKey === null) {
              const props = vnode.props;
              const keys = Object.keys(vnode.props);
              keys.sort();
              cacheKey = `${originalType}`;
              for (let i2 = 0; i2 < keys.length; i2++) {
                const key = keys[i2];
                if (key === "children" || key === "nonce" || key === "ref") {
                  continue;
                } else if (key === "dangerouslySetInnerHTML") {
                  cacheKey += String(props[key].__html);
                  continue;
                } else if (originalType === "meta" && key === "content") {
                  continue;
                }
                cacheKey += `::${props[key]}`;
              }
            }
            const originalKey = vnode.key;
            vnode.type = (props) => {
              const value = x$2(HeadContext);
              if (originalKey) {
                props["data-key"] = originalKey;
              }
              const vnode2 = _$3(originalType, props);
              PATCHED.add(vnode2);
              if (RENDER_STATE !== null) {
                if (value) {
                  RENDER_STATE.headComponents.set(cacheKey, vnode2);
                  return null;
                } else if (value !== void 0) {
                  const cached = RENDER_STATE.headComponents.get(cacheKey);
                  if (cached !== void 0) {
                    RENDER_STATE.headComponents.delete(cacheKey);
                    return cached;
                  }
                }
              }
              return vnode2;
            };
          }
          break;
      }
      if (vnode.key !== void 0 && (RENDER_STATE.partialDepth > 0 || hasIslandOwner(RENDER_STATE, vnode))) {
        vnode.props[DATA_FRESH_KEY] = String(vnode.key);
      }
    }
  }
  oldDiff?.(vnode);
};
const oldRender = options[OptionsType.RENDER];
options[OptionsType.RENDER] = (vnode) => {
  if (typeof vnode.type === "function" && vnode.type !== k$2 && RENDER_STATE !== null) {
    RENDER_STATE.ownerStack.push(vnode);
  }
  oldRender?.(vnode);
};
const oldDiffed = options[OptionsType.DIFFED];
options[OptionsType.DIFFED] = (vnode) => {
  if (typeof vnode.type === "function" && vnode.type !== k$2 && RENDER_STATE !== null) {
    RENDER_STATE.ownerStack.pop();
    if (vnode.type === Partial) {
      RENDER_STATE.partialDepth--;
    }
  }
  oldDiffed?.(vnode);
};
function RemainingHead() {
  if (RENDER_STATE !== null) {
    const items = [];
    if (RENDER_STATE.headComponents.size > 0) {
      items.push(...RENDER_STATE.headComponents.values());
    }
    RENDER_STATE.islands.forEach((island) => {
      if (island.css.length > 0) {
        for (let i2 = 0; i2 < island.css.length; i2++) {
          const css2 = island.css[i2];
          items.push(_$3("link", { rel: "stylesheet", href: css2 }));
        }
      }
    });
    RENDER_STATE.islandAssets.forEach((css2) => {
      items.push(_$3("link", { rel: "stylesheet", href: css2 }));
    });
    if (items.length > 0) {
      return _$3(k$2, null, items);
    }
  }
  return null;
}
function Slot(props) {
  if (RENDER_STATE !== null) {
    RENDER_STATE.slots[props.id] = null;
  }
  return wrapWithMarker(props.children, "slot", `${props.id}:${props.name}`);
}
function hasIslandOwner(current, vnode) {
  let tmpVNode = vnode;
  let owner;
  while ((owner = current.owners.get(tmpVNode)) !== void 0) {
    if (current.buildCache.islandRegistry.has(owner.type)) {
      return true;
    }
    tmpVNode = owner;
  }
  return false;
}
function wrapWithMarker(vnode, kind, markerText) {
  return _$3(k$2, null, _$3(k$2, {
    // @ts-ignore unstable property is not typed
    UNSTABLE_comment: `frsh:${kind}:${markerText}`
  }), vnode, _$3(k$2, {
    // @ts-ignore unstable property is not typed
    UNSTABLE_comment: "/frsh:" + kind
  }));
}
function isSignal(x2) {
  return x2 !== null && typeof x2 === "object" && typeof x2.peek === "function" && "value" in x2;
}
function isComputedSignal(x2) {
  return isSignal(x2) && ("x" in x2 && typeof x2.x === "function" || "_fn" in x2 && typeof x2._fn === "function");
}
function isVNode(x2) {
  return x2 !== null && typeof x2 === "object" && "type" in x2 && "ref" in x2 && "__k" in x2 && t$3(x2);
}
const stringifiers = { Computed: (value) => {
  return isComputedSignal(value) ? { value: value.peek() } : void 0;
}, Signal: (value) => {
  return isSignal(value) ? { value: value.peek() } : void 0;
}, Slot: (value) => {
  if (isVNode(value) && value.type === Slot) {
    const props = value.props;
    return { value: { name: props.name, id: props.id } };
  }
} };
function FreshScripts() {
  if (RENDER_STATE === null) return null;
  if (RENDER_STATE.hasRuntimeScript) {
    return null;
  }
  RENDER_STATE.hasRuntimeScript = true;
  const { slots } = RENDER_STATE;
  return _$3(k$2, null, slots.map((slot) => {
    if (slot === null) return null;
    return _$3("template", { key: slot.id, id: `frsh-${slot.id}-${slot.name}` }, slot.vnode);
  }), _$3(FreshRuntimeScript, null));
}
function FreshRuntimeScript() {
  const { islands: islands2, nonce, ctx, islandProps, partialId, buildCache } = RENDER_STATE;
  const basePath = ctx.config.basePath;
  const islandArr = Array.from(islands2);
  if (ctx.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
    const islands22 = islandArr.map((island) => {
      return { exportName: island.exportName, chunk: island.file, name: island.name };
    });
    const serializedProps = stringify(islandProps, stringifiers);
    const json = { islands: islands22, props: serializedProps };
    return _$3("script", { id: `__FRSH_STATE_${partialId}`, type: "application/json", dangerouslySetInnerHTML: { __html: escapeScript(JSON.stringify(json), { json: true }) } });
  } else {
    const islandImports = islandArr.map((island) => {
      const named = island.exportName === "default" ? island.name : island.exportName === island.name ? `{ ${island.exportName} }` : `{ ${island.exportName} as ${island.name} }`;
      const islandSpec = island.file.startsWith(".") ? island.file.slice(1) : island.file;
      return `import ${named} from "${basePath}${islandSpec}";`;
    }).join("");
    const islandObj = "{" + islandArr.map((island) => island.name).join(",") + "}";
    const serializedProps = escapeScript(JSON.stringify(stringify(islandProps, stringifiers)), { json: true });
    const runtimeUrl = buildCache.clientEntry.startsWith(".") ? buildCache.clientEntry.slice(1) : buildCache.clientEntry;
    const scriptContent = `import { boot } from "${basePath}${runtimeUrl}";${islandImports}boot(${islandObj},${serializedProps});`;
    return _$3(k$2, null, _$3("script", { type: "module", nonce, dangerouslySetInnerHTML: { __html: scriptContent } }), buildCache.features.errorOverlay ? _$3(ShowErrorOverlay, null) : null);
  }
}
function ShowErrorOverlay() {
  if (RENDER_STATE === null) return null;
  const { ctx } = RENDER_STATE;
  const error = ctx.error;
  if (error === null || error === void 0) return null;
  if (error instanceof HttpError && error.status < 500) {
    return null;
  }
  const basePath = ctx.config.basePath;
  const searchParams = new URLSearchParams();
  if (typeof error === "object") {
    if ("message" in error) {
      searchParams.append("message", String(error.message));
    }
    if ("stack" in error && typeof error.stack === "string") {
      searchParams.append("stack", error.stack);
      const codeFrame = getCodeFrame(error.stack, ctx.config.root);
      if (codeFrame !== void 0) {
        searchParams.append("code-frame", codeFrame);
      }
    }
  } else {
    searchParams.append("message", String(error));
  }
  return _$3("iframe", { id: "fresh-error-overlay", src: `${basePath}${DEV_ERROR_OVERLAY_URL}?${searchParams.toString()}`, style: "unset: all; position: fixed; top: 0; left: 0; z-index: 99999; width: 100%; height: 100%; border: none;" });
}
const version$1 = "2.1.1";
const denoJson = {
  version: version$1
};
const CURRENT_FRESH_VERSION = denoJson.version;
const tracer = _trace.getTracer("fresh", CURRENT_FRESH_VERSION);
function recordSpanError(span, err) {
  if (err instanceof Error) {
    span.recordException(err);
  } else {
    span.setStatus({ code: _SpanStatusCode.ERROR, message: String(err) });
  }
}
function isAsyncAnyComponent(fn) {
  return typeof fn === "function" && fn.constructor.name === "AsyncFunction";
}
async function renderAsyncAnyComponent(fn, props) {
  return await tracer.startActiveSpan("invoke async component", async (span) => {
    span.setAttribute("fresh.span_type", "fs_routes/async_component");
    try {
      const result = await fn(props);
      span.setAttribute("fresh.component_response", result instanceof Response ? "http" : "jsx");
      return result;
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
}
async function renderRouteComponent(ctx, def, child) {
  const vnodeProps = { Component: child, config: ctx.config, data: def.props, error: ctx.error, info: ctx.info, isPartial: ctx.isPartial, params: ctx.params, req: ctx.req, state: ctx.state, url: ctx.url, route: ctx.route };
  if (isAsyncAnyComponent(def.component)) {
    const result = await renderAsyncAnyComponent(def.component, vnodeProps);
    if (result instanceof Response) {
      return result;
    }
    return result;
  }
  return _$3(def.component, vnodeProps);
}
var r$1 = "diffed", o$1 = "__c", i$1 = "__s", a$1 = "__c", c$1 = "__k", s$1 = "__d", u$1 = "__s", l$1 = /[\s\n\\/='"\0<>]/, f$1 = /^(xlink|xmlns|xml)([A-Z])/, p$2 = /^(?:accessK|auto[A-Z]|cell|ch|col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z])/, h$2 = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, d$1 = /* @__PURE__ */ new Set(["draggable", "spellcheck"]);
function v$2(e2) {
  void 0 !== e2.__g ? e2.__g |= 8 : e2[s$1] = true;
}
function m(e2) {
  void 0 !== e2.__g ? e2.__g &= -9 : e2[s$1] = false;
}
function _$2(e2) {
  return void 0 !== e2.__g ? !!(8 & e2.__g) : true === e2[s$1];
}
var y$2 = /["&<]/;
function g$2(e2) {
  if (0 === e2.length || false === y$2.test(e2)) return e2;
  for (var t2 = 0, n2 = 0, r2 = "", o2 = ""; n2 < e2.length; n2++) {
    switch (e2.charCodeAt(n2)) {
      case 34:
        o2 = "&quot;";
        break;
      case 38:
        o2 = "&amp;";
        break;
      case 60:
        o2 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== t2 && (r2 += e2.slice(t2, n2)), r2 += o2, t2 = n2 + 1;
  }
  return n2 !== t2 && (r2 += e2.slice(t2, n2)), r2;
}
var b$2 = {}, x$1 = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), k = /[A-Z]/g;
function w$1(e2) {
  var t2 = "";
  for (var n2 in e2) {
    var r2 = e2[n2];
    if (null != r2 && "" !== r2) {
      var o2 = "-" == n2[0] ? n2 : b$2[n2] || (b$2[n2] = n2.replace(k, "-$&").toLowerCase()), i2 = ";";
      "number" != typeof r2 || o2.startsWith("--") || x$1.has(o2) || (i2 = "px;"), t2 = t2 + o2 + ":" + r2 + i2;
    }
  }
  return t2 || void 0;
}
function C() {
  this.__d = true;
}
function A(e2, t2) {
  return { __v: e2, context: t2, props: e2.props, setState: C, forceUpdate: C, __d: true, __h: new Array(0) };
}
var D, P, $, U, F$1 = {}, M = [], W = Array.isArray, z = Object.assign, H = "", N = "<!--$s-->", q$1 = "<!--/$s-->";
function B(a2, s2, u2) {
  var l2 = l$4[i$1];
  l$4[i$1] = true, D = l$4.__b, P = l$4[r$1], $ = l$4.__r, U = l$4.unmount;
  var f2 = _$3(k$2, null);
  f2[c$1] = [a2];
  try {
    var p2 = O(a2, s2 || F$1, false, void 0, f2, false, u2);
    return W(p2) ? p2.join(H) : p2;
  } catch (e2) {
    if (e2.then) throw new Error('Use "renderToStringAsync" for suspenseful rendering.');
    throw e2;
  } finally {
    l$4[o$1] && l$4[o$1](a2, M), l$4[i$1] = l2, M.length = 0;
  }
}
function I(e2, t2) {
  var n2, r2 = e2.type, o2 = true;
  return e2[a$1] ? (o2 = false, (n2 = e2[a$1]).state = n2[u$1]) : n2 = new r2(e2.props, t2), e2[a$1] = n2, n2.__v = e2, n2.props = e2.props, n2.context = t2, v$2(n2), null == n2.state && (n2.state = F$1), null == n2[u$1] && (n2[u$1] = n2.state), r2.getDerivedStateFromProps ? n2.state = z({}, n2.state, r2.getDerivedStateFromProps(n2.props, n2.state)) : o2 && n2.componentWillMount ? (n2.componentWillMount(), n2.state = n2[u$1] !== n2.state ? n2[u$1] : n2.state) : !o2 && n2.componentWillUpdate && n2.componentWillUpdate(), $ && $(e2), n2.render(n2.props, n2.state, t2);
}
function O(t2, r2, o2, i2, s2, y2, b2) {
  if (null == t2 || true === t2 || false === t2 || t2 === H) return H;
  var x2 = typeof t2;
  if ("object" != x2) return "function" == x2 ? H : "string" == x2 ? g$2(t2) : t2 + H;
  if (W(t2)) {
    var k2, C2 = H;
    s2[c$1] = t2;
    for (var S2 = t2.length, L2 = 0; L2 < S2; L2++) {
      var E2 = t2[L2];
      if (null != E2 && "boolean" != typeof E2) {
        var j2, T2 = O(E2, r2, o2, i2, s2, y2, b2);
        "string" == typeof T2 ? C2 += T2 : (k2 || (k2 = new Array(S2)), C2 && k2.push(C2), C2 = H, W(T2) ? (j2 = k2).push.apply(j2, T2) : k2.push(T2));
      }
    }
    return k2 ? (C2 && k2.push(C2), k2) : C2;
  }
  if (void 0 !== t2.constructor) return H;
  t2.__ = s2, D && D(t2);
  var Z = t2.type, M2 = t2.props;
  if ("function" == typeof Z) {
    var B2, V2, K, J = r2;
    if (Z === k$2) {
      if ("tpl" in M2) {
        for (var Q2 = H, X = 0; X < M2.tpl.length; X++) if (Q2 += M2.tpl[X], M2.exprs && X < M2.exprs.length) {
          var Y = M2.exprs[X];
          if (null == Y) continue;
          "object" != typeof Y || void 0 !== Y.constructor && !W(Y) ? Q2 += Y : Q2 += O(Y, r2, o2, i2, t2, y2, b2);
        }
        return Q2;
      }
      if ("UNSTABLE_comment" in M2) return "<!--" + g$2(M2.UNSTABLE_comment) + "-->";
      V2 = M2.children;
    } else {
      if (null != (B2 = Z.contextType)) {
        var ee = r2[B2.__c];
        J = ee ? ee.props.value : B2.__;
      }
      var te = Z.prototype && "function" == typeof Z.prototype.render;
      if (te) V2 = /**#__NOINLINE__**/
      I(t2, J), K = t2[a$1];
      else {
        t2[a$1] = K = /**#__NOINLINE__**/
        A(t2, J);
        for (var ne = 0; _$2(K) && ne++ < 25; ) {
          m(K), $ && $(t2);
          try {
            V2 = Z.call(K, M2, J);
          } catch (e2) {
            throw e2;
          }
        }
        v$2(K);
      }
      if (null != K.getChildContext && (r2 = z({}, r2, K.getChildContext())), te && l$4.errorBoundaries && (Z.getDerivedStateFromError || K.componentDidCatch)) {
        V2 = null != V2 && V2.type === k$2 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2;
        try {
          return O(V2, r2, o2, i2, t2, y2, false);
        } catch (e2) {
          return Z.getDerivedStateFromError && (K[u$1] = Z.getDerivedStateFromError(e2)), K.componentDidCatch && K.componentDidCatch(e2, F$1), _$2(K) ? (V2 = I(t2, r2), null != (K = t2[a$1]).getChildContext && (r2 = z({}, r2, K.getChildContext())), O(V2 = null != V2 && V2.type === k$2 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2, r2, o2, i2, t2, y2, b2)) : H;
        } finally {
          P && P(t2), U && U(t2);
        }
      }
    }
    V2 = null != V2 && V2.type === k$2 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2;
    try {
      var re2 = O(V2, r2, o2, i2, t2, y2, b2);
      return P && P(t2), l$4.unmount && l$4.unmount(t2), t2._suspended ? "string" == typeof re2 ? N + re2 + q$1 : W(re2) ? (re2.unshift(N), re2.push(q$1), re2) : re2.then(function(e2) {
        return N + e2 + q$1;
      }) : re2;
    } catch (n2) {
      if (b2 && b2.onError) {
        var oe = b2.onError(n2, t2, function(e2, t3) {
          return O(e2, r2, o2, i2, t3, y2, b2);
        });
        if (void 0 !== oe) return oe;
        var ie = l$4.__e;
        return ie && ie(n2, t2), H;
      }
      throw n2;
    }
  }
  var ae, ce = "<" + Z, se = H;
  for (var ue in M2) {
    var le = M2[ue];
    if ("function" != typeof (le = G(le) ? le.value : le) || "class" === ue || "className" === ue) {
      switch (ue) {
        case "children":
          ae = le;
          continue;
        case "key":
        case "ref":
        case "__self":
        case "__source":
          continue;
        case "htmlFor":
          if ("for" in M2) continue;
          ue = "for";
          break;
        case "className":
          if ("class" in M2) continue;
          ue = "class";
          break;
        case "defaultChecked":
          ue = "checked";
          break;
        case "defaultSelected":
          ue = "selected";
          break;
        case "defaultValue":
        case "value":
          switch (ue = "value", Z) {
            case "textarea":
              ae = le;
              continue;
            case "select":
              i2 = le;
              continue;
            case "option":
              i2 != le || "selected" in M2 || (ce += " selected");
          }
          break;
        case "dangerouslySetInnerHTML":
          se = le && le.__html;
          continue;
        case "style":
          "object" == typeof le && (le = w$1(le));
          break;
        case "acceptCharset":
          ue = "accept-charset";
          break;
        case "httpEquiv":
          ue = "http-equiv";
          break;
        default:
          if (f$1.test(ue)) ue = ue.replace(f$1, "$1:$2").toLowerCase();
          else {
            if (l$1.test(ue)) continue;
            "-" !== ue[4] && !d$1.has(ue) || null == le ? o2 ? h$2.test(ue) && (ue = "panose1" === ue ? "panose-1" : ue.replace(/([A-Z])/g, "-$1").toLowerCase()) : p$2.test(ue) && (ue = ue.toLowerCase()) : le += H;
          }
      }
      null != le && false !== le && (ce = true === le || le === H ? ce + " " + ue : ce + " " + ue + '="' + ("string" == typeof le ? g$2(le) : le + H) + '"');
    }
  }
  if (l$1.test(Z)) throw new Error(Z + " is not a valid HTML tag name in " + ce + ">");
  if (se || ("string" == typeof ae ? se = g$2(ae) : null != ae && false !== ae && true !== ae && (se = O(ae, r2, "svg" === Z || "foreignObject" !== Z && o2, i2, t2, y2, b2))), P && P(t2), U && U(t2), !se && R.has(Z)) return ce + "/>";
  var fe = "</" + Z + ">", pe = ce + ">";
  return W(se) ? [pe].concat(se, [fe]) : "string" != typeof se ? [pe, se, fe] : pe + se + fe;
}
var R = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]);
function G(e2) {
  return null !== e2 && "object" == typeof e2 && "function" == typeof e2.peek && "value" in e2;
}
let getBuildCache;
let getInternals;
let setAdditionalStyles;
class Context {
  constructor(req, url, info, route, params, config2, next, buildCache) {
    __privateAdd(this, _internal, { app: null, layouts: [] });
    /** Reference to the resolved Fresh configuration */
    __publicField(this, "config");
    /**
    * The request url parsed into an `URL` instance. This is typically used
    * to apply logic based on the pathname of the incoming url or when
    * certain search parameters are set.
    */
    __publicField(this, "url");
    /** The original incoming {@linkcode Request} object. */
    __publicField(this, "req");
    /** The matched route pattern. */
    __publicField(this, "route");
    /** The url parameters of the matched route pattern. */
    __publicField(this, "params");
    /** State object that is shared with all middlewares. */
    __publicField(this, "state", {});
    __publicField(this, "data");
    /** Error value if an error was caught (Default: null) */
    __publicField(this, "error", null);
    __publicField(this, "info");
    /**
    * Whether the current Request is a partial request.
    *
    * Partials in Fresh will append the query parameter
    * {@linkcode PARTIAL_SEARCH_PARAM} to the URL. This property can
    * be used to determine if only `<Partial>`'s need to be rendered.
    */
    __publicField(this, "isPartial");
    /**
    * Call the next middleware.
    * ```ts
    * const myMiddleware: Middleware = (ctx) => {
    *   // do something
    *
    *   // Call the next middleware
    *   return ctx.next();
    * }
    *
    * const myMiddleware2: Middleware = async (ctx) => {
    *   // do something before the next middleware
    *   doSomething()
    *
    *   const res = await ctx.next();
    *
    *   // do something after the middleware
    *   doSomethingAfter()
    *
    *   // Return the `Response`
    *   return res
    * }
    */
    __publicField(this, "next");
    __privateAdd(this, _buildCache);
    __privateAdd(this, _additionalStyles, null);
    __publicField(this, "Component");
    this.url = url;
    this.req = req;
    this.info = info;
    this.params = params;
    this.route = route;
    this.config = config2;
    this.isPartial = url.searchParams.has(PARTIAL_SEARCH_PARAM);
    this.next = next;
    __privateSet(this, _buildCache, buildCache);
  }
  /**
  * Return a redirect response to the specified path. This is the
  * preferred way to do redirects in Fresh.
  *
  * ```ts
  * ctx.redirect("/foo/bar") // redirect user to "<yoursite>/foo/bar"
  *
  * // Disallows protocol relative URLs for improved security. This
  * // redirects the user to `<yoursite>/evil.com` which is safe,
  * // instead of redirecting to `http://evil.com`.
  * ctx.redirect("//evil.com/");
  * ```
  */
  redirect(pathOrUrl, status = 302) {
    let location = pathOrUrl;
    if (pathOrUrl !== "/" && pathOrUrl.startsWith("/")) {
      let idx = pathOrUrl.indexOf("?");
      if (idx === -1) {
        idx = pathOrUrl.indexOf("#");
      }
      const pathname = idx > -1 ? pathOrUrl.slice(0, idx) : pathOrUrl;
      const search = idx > -1 ? pathOrUrl.slice(idx) : "";
      location = `${pathname.replaceAll(/\/+/g, "/")}${search}`;
    }
    return new Response(null, { status, headers: { location } });
  }
  /**
  * Render JSX and return an HTML `Response` instance.
  * ```tsx
  * ctx.render(<h1>hello world</h1>);
  * ```
  */
  async render(vnode, init = {}, config2 = {}) {
    if (arguments.length === 0) {
      throw new Error(`No arguments passed to: ctx.render()`);
    } else if (vnode !== null && !t$3(vnode)) {
      throw new Error(`Non-JSX element passed to: ctx.render()`);
    }
    const defs = config2.skipInheritedLayouts ? [] : __privateGet(this, _internal).layouts;
    const appDef = config2.skipAppWrapper ? null : __privateGet(this, _internal).app;
    const props = this;
    for (let i2 = defs.length - 1; i2 >= 0; i2--) {
      const child = vnode;
      props.Component = () => child;
      const def = defs[i2];
      const result = await renderRouteComponent(this, def, () => child);
      if (result instanceof Response) {
        return result;
      }
      vnode = result;
    }
    let appChild = vnode;
    let appVNode;
    let hasApp = true;
    if (isAsyncAnyComponent(appDef)) {
      props.Component = () => appChild;
      const result = await renderAsyncAnyComponent(appDef, props);
      if (result instanceof Response) {
        return result;
      }
      appVNode = result;
    } else if (appDef !== null) {
      appVNode = _$3(appDef, { Component: () => appChild, config: this.config, data: null, error: this.error, info: this.info, isPartial: this.isPartial, params: this.params, req: this.req, state: this.state, url: this.url, route: this.route });
    } else {
      hasApp = false;
      appVNode = appChild ?? _$3(k$2, null);
    }
    const headers = init.headers !== void 0 ? init.headers instanceof Headers ? init.headers : new Headers(init.headers) : new Headers();
    headers.set("Content-Type", "text/html; charset=utf-8");
    const responseInit = { status: init.status ?? 200, headers, statusText: init.statusText };
    let partialId = "";
    if (this.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
      partialId = crypto.randomUUID();
      headers.set("X-Fresh-Id", partialId);
    }
    const html = tracer.startActiveSpan("render", (span) => {
      span.setAttribute("fresh.span_type", "render");
      const state = new RenderState(this, __privateGet(this, _buildCache), partialId);
      if (__privateGet(this, _additionalStyles) !== null) {
        for (let i2 = 0; i2 < __privateGet(this, _additionalStyles).length; i2++) {
          const css2 = __privateGet(this, _additionalStyles)[i2];
          state.islandAssets.add(css2);
        }
      }
      try {
        setRenderState(state);
        let html2 = B(vnode ?? _$3(k$2, null));
        if (hasApp) {
          appChild = a$3([html2]);
          html2 = B(appVNode);
        }
        if (!state.renderedHtmlBody || !state.renderedHtmlHead || !state.renderedHtmlTag) {
          let fallback = a$3([html2]);
          if (!state.renderedHtmlBody) {
            let scripts = null;
            if (this.url.pathname !== this.config.basePath + DEV_ERROR_OVERLAY_URL) {
              scripts = _$3(FreshScripts, null);
            }
            fallback = _$3("body", null, fallback, scripts);
          }
          if (!state.renderedHtmlHead) {
            fallback = _$3(k$2, null, _$3("head", null, _$3("meta", { charset: "utf-8" })), fallback);
          }
          if (!state.renderedHtmlTag) {
            fallback = _$3("html", null, fallback);
          }
          html2 = B(fallback);
        }
        return `<!DOCTYPE html>${html2}`;
      } catch (err) {
        if (err instanceof Error) {
          span.recordException(err);
        } else {
          span.setStatus({ code: _SpanStatusCode.ERROR, message: String(err) });
        }
        throw err;
      } finally {
        const basePath = this.config.basePath;
        const runtimeUrl = state.buildCache.clientEntry.startsWith(".") ? state.buildCache.clientEntry.slice(1) : state.buildCache.clientEntry;
        let link = `<${encodeURI(`${basePath}${runtimeUrl}`)}>; rel="modulepreload"; as="script"`;
        state.islands.forEach((island) => {
          const specifier = `${basePath}${island.file.startsWith(".") ? island.file.slice(1) : island.file}`;
          link += `, <${encodeURI(specifier)}>; rel="modulepreload"; as="script"`;
        });
        if (link !== "") {
          headers.append("Link", link);
        }
        state.clear();
        setRenderState(null);
        span.end();
      }
    });
    return new Response(html, responseInit);
  }
}
_internal = new WeakMap();
_buildCache = new WeakMap();
_additionalStyles = new WeakMap();
getInternals = (ctx) => __privateGet(ctx, _internal);
getBuildCache = (ctx) => __privateGet(ctx, _buildCache);
setAdditionalStyles = (ctx, css2) => __privateSet(ctx, _additionalStyles, css2);
async function runMiddlewares(middlewares, ctx) {
  return await tracer.startActiveSpan("middlewares", { attributes: { "fresh.middleware.count": middlewares.length } }, async (span) => {
    try {
      let fn = ctx.next;
      let i2 = middlewares.length;
      while (i2--) {
        const local = fn;
        let next = middlewares[i2];
        const idx = i2;
        fn = async () => {
          const internals = getInternals(ctx);
          const { app: prevApp, layouts: prevLayouts } = internals;
          ctx.next = local;
          try {
            const result = await next(ctx);
            if (typeof result === "function") {
              middlewares[idx] = result;
              next = result;
              return await result(ctx);
            }
            return result;
          } catch (err) {
            ctx.error = err;
            throw err;
          } finally {
            internals.app = prevApp;
            internals.layouts = prevLayouts;
          }
        };
      }
      return await fn();
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
}
function newByMethod() {
  return { GET: [], POST: [], PATCH: [], DELETE: [], PUT: [], HEAD: [], OPTIONS: [] };
}
const IS_PATTERN = /[*:{}+?()]/;
const EMPTY = [];
class UrlPatternRouter {
  #statics = /* @__PURE__ */ new Map();
  #dynamics = /* @__PURE__ */ new Map();
  #dynamicArr = [];
  #allowed = /* @__PURE__ */ new Map();
  getAllowedMethods(pattern) {
    const allowed = this.#allowed.get(pattern);
    if (allowed === void 0) return EMPTY;
    return Array.from(allowed);
  }
  add(method, pathname, handlers2) {
    let allowed = this.#allowed.get(pathname);
    if (allowed === void 0) {
      allowed = /* @__PURE__ */ new Set();
      this.#allowed.set(pathname, allowed);
    }
    allowed.add(method);
    let byMethod;
    if (IS_PATTERN.test(pathname)) {
      let def = this.#dynamics.get(pathname);
      if (def === void 0) {
        def = { pattern: new URLPattern({ pathname }), byMethod: newByMethod() };
        this.#dynamics.set(pathname, def);
        this.#dynamicArr.push(def);
      }
      byMethod = def.byMethod;
    } else {
      let def = this.#statics.get(pathname);
      if (def === void 0) {
        def = { pattern: pathname, byMethod: newByMethod() };
        this.#statics.set(pathname, def);
      }
      byMethod = def.byMethod;
    }
    byMethod[method].push(...handlers2);
  }
  match(method, url, init = []) {
    const result = { params: /* @__PURE__ */ Object.create(null), handlers: init, methodMatch: false, pattern: null };
    const staticMatch = this.#statics.get(url.pathname);
    if (staticMatch !== void 0) {
      result.pattern = url.pathname;
      const handlers2 = staticMatch.byMethod[method];
      if (handlers2.length > 0) {
        result.methodMatch = true;
        result.handlers.push(...handlers2);
      }
      return result;
    }
    for (let i2 = 0; i2 < this.#dynamicArr.length; i2++) {
      const route = this.#dynamicArr[i2];
      const match = route.pattern.exec(url);
      if (match === null) continue;
      result.pattern = route.pattern.pathname;
      const handlers2 = route.byMethod[method];
      if (handlers2.length > 0) {
        result.methodMatch = true;
        result.handlers.push(...handlers2);
        for (const [key, value] of Object.entries(match.pathname.groups)) {
          result.params[key] = value === void 0 ? "" : decodeURI(value);
        }
      }
      break;
    }
    return result;
  }
}
function patternToSegments(path, root2, includeLast = false) {
  const out = [root2];
  if (path === "/" || path === "*" || path === "/*") return out;
  let start = -1;
  for (let i2 = 0; i2 < path.length; i2++) {
    const ch = path[i2];
    if (ch === "/") {
      if (i2 > 0) {
        const raw = path.slice(start + 1, i2);
        out.push(raw);
      }
      start = i2;
    }
  }
  if (includeLast && start < path.length - 1) {
    out.push(path.slice(start + 1));
  }
  return out;
}
function mergePath(basePath, path, isMounting) {
  if (basePath.endsWith("*")) basePath = basePath.slice(0, -1);
  if (basePath === "/") basePath = "";
  if (path === "*") path = isMounting ? "" : "/*";
  else if (path === "/*") path = "/*";
  const s2 = basePath !== "" && path === "/" ? "" : path;
  return basePath + s2;
}
function toRoutePath(path) {
  if (path === "") return "*";
  return path;
}
function isHandlerByMethod(handler2) {
  return handler2 !== null && !Array.isArray(handler2) && typeof handler2 === "object";
}
function newSegment(pattern, parent) {
  return { pattern, middlewares: [], layout: null, app: null, errorRoute: null, notFound: null, parent, children: /* @__PURE__ */ new Map() };
}
function getOrCreateSegment(root2, path, includeLast) {
  let current = root2;
  const segments = patternToSegments(path, root2.pattern, includeLast);
  for (let i2 = 0; i2 < segments.length; i2++) {
    const seg = segments[i2];
    if (seg === root2.pattern) {
      current = root2;
    } else {
      let child = current.children.get(seg);
      if (child === void 0) {
        child = newSegment(seg, current);
        current.children.set(seg, child);
      }
      current = child;
    }
  }
  return current;
}
function segmentToMiddlewares(segment) {
  const result = [];
  const stack = [];
  let current = segment;
  while (current !== null) {
    stack.push(current);
    current = current.parent;
  }
  const root2 = stack.at(-1);
  for (let i2 = stack.length - 1; i2 >= 0; i2--) {
    const seg = stack[i2];
    const { layout, app: app2, errorRoute } = seg;
    result.push(async function segmentMiddleware(ctx) {
      const internals = getInternals(ctx);
      const prevApp = internals.app;
      const prevLayouts = internals.layouts;
      if (app2 !== null) {
        internals.app = app2;
      }
      if (layout !== null) {
        if (layout.config?.skipAppWrapper) {
          internals.app = null;
        }
        const def = { props: null, component: layout.component };
        if (layout.config?.skipInheritedLayouts) {
          internals.layouts = [def];
        } else {
          internals.layouts = [...internals.layouts, def];
        }
      }
      try {
        return await ctx.next();
      } catch (err) {
        const status = err instanceof HttpError ? err.status : 500;
        if (root2.notFound !== null && status === 404) {
          return await root2.notFound(ctx);
        }
        if (errorRoute !== null) {
          return await renderRoute(ctx, errorRoute, status);
        }
        throw err;
      } finally {
        internals.app = prevApp;
        internals.layouts = prevLayouts;
      }
    });
    if (seg.middlewares.length > 0) {
      result.push(...seg.middlewares);
    }
  }
  return result;
}
async function renderRoute(ctx, route, status = 200) {
  const internals = getInternals(ctx);
  if (route.config?.skipAppWrapper) {
    internals.app = null;
  }
  if (route.config?.skipInheritedLayouts) {
    internals.layouts = [];
  }
  const method = ctx.req.method.toUpperCase();
  const handlers2 = route.handler;
  if (handlers2 === void 0) {
    throw new Error(`Unexpected missing handlers`);
  }
  const headers = new Headers();
  headers.set("Content-Type", "text/html;charset=utf-8");
  const res = await tracer.startActiveSpan("handler", { attributes: { "fresh.span_type": "fs_routes/handler" } }, async (span) => {
    try {
      const fn = isHandlerByMethod(handlers2) ? handlers2[method] ?? null : handlers2;
      if (fn === null) return await ctx.next();
      return await fn(ctx);
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
  if (res instanceof Response) {
    return res;
  }
  if (typeof res.status === "number") {
    status = res.status;
  }
  if (res.headers !== void 0) {
    if (res.headers instanceof Headers) {
      res.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    } else if (Array.isArray(res.headers)) {
      for (let i2 = 0; i2 < res.headers.length; i2++) {
        const entry = res.headers[i2];
        headers.set(entry[0], entry[1]);
      }
    } else {
      for (const [name, value] of Object.entries(res.headers)) {
        headers.set(name, value);
      }
    }
  }
  let vnode = null;
  if (route.component !== void 0) {
    const result = await renderRouteComponent(ctx, {
      component: route.component,
      // deno-lint-ignore no-explicit-any
      props: res.data
    }, () => null);
    if (result instanceof Response) {
      return result;
    }
    vnode = result;
  }
  return ctx.render(vnode, { headers, status });
}
const DEFAULT_NOT_FOUND = () => {
  throw new HttpError(404);
};
const DEFAULT_NOT_ALLOWED_METHOD = () => {
  throw new HttpError(405);
};
const DEFAULT_RENDER = () => (
  // deno-lint-ignore no-explicit-any
  Promise.resolve({ data: {} })
);
function ensureHandler(route) {
  if (route.handler === void 0) {
    route.handler = route.component !== void 0 ? DEFAULT_RENDER : DEFAULT_NOT_FOUND;
  } else if (isHandlerByMethod(route.handler)) {
    if (route.component !== void 0 && !route.handler.GET) {
      route.handler.GET = DEFAULT_RENDER;
    }
  }
}
var CommandType = /* @__PURE__ */ (function(CommandType2) {
  CommandType2["Middleware"] = "middleware";
  CommandType2["Layout"] = "layout";
  CommandType2["App"] = "app";
  CommandType2["Route"] = "route";
  CommandType2["Error"] = "error";
  CommandType2["NotFound"] = "notFound";
  CommandType2["Handler"] = "handler";
  CommandType2["FsRoute"] = "fsRoute";
  return CommandType2;
})({});
function newErrorCmd(pattern, routeOrMiddleware, includeLastSegment) {
  const route = typeof routeOrMiddleware === "function" ? { handler: routeOrMiddleware } : routeOrMiddleware;
  ensureHandler(route);
  return { type: "error", pattern, item: route, includeLastSegment };
}
function newAppCmd(component) {
  return { type: "app", component };
}
function newLayoutCmd(pattern, component, config2, includeLastSegment) {
  return { type: "layout", pattern, component, config: config2, includeLastSegment };
}
function newMiddlewareCmd(pattern, fns, includeLastSegment) {
  return { type: "middleware", pattern, fns, includeLastSegment };
}
function newNotFoundCmd(routeOrMiddleware) {
  const route = typeof routeOrMiddleware === "function" ? { handler: routeOrMiddleware } : routeOrMiddleware;
  ensureHandler(route);
  return { type: "notFound", fn: (ctx) => renderRoute(ctx, route) };
}
function newRouteCmd(pattern, route, config2, includeLastSegment) {
  let normalized;
  if (isLazy(route)) {
    normalized = async () => {
      const result = await route();
      ensureHandler(result);
      return result;
    };
  } else {
    ensureHandler(route);
    normalized = route;
  }
  return { type: "route", pattern, route: normalized, config: config2, includeLastSegment };
}
function newHandlerCmd(method, pattern, fns, includeLastSegment) {
  return { type: "handler", pattern, method, fns, includeLastSegment };
}
function applyCommands(router, commands, basePath) {
  const root2 = newSegment("", null);
  applyCommandsInner(root2, router, commands, basePath);
  return { rootMiddlewares: segmentToMiddlewares(root2) };
}
function applyCommandsInner(root2, router, commands, basePath) {
  for (let i2 = 0; i2 < commands.length; i2++) {
    const cmd = commands[i2];
    switch (cmd.type) {
      case "middleware": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.middlewares.push(...cmd.fns);
        break;
      }
      case "notFound": {
        root2.notFound = cmd.fn;
        break;
      }
      case "error": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.errorRoute = cmd.item;
        break;
      }
      case "app": {
        root2.app = cmd.component;
        break;
      }
      case "layout": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.layout = { component: cmd.component, config: cmd.config ?? null };
        break;
      }
      case "route": {
        const { pattern, route, config: config2 } = cmd;
        const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
        const fns = segmentToMiddlewares(segment);
        if (isLazy(route)) {
          const routePath = mergePath(basePath, config2?.routeOverride ?? pattern, false);
          let def;
          fns.push(async (ctx) => {
            if (def === void 0) {
              def = await route();
            }
            if (def.css !== void 0) {
              setAdditionalStyles(ctx, def.css);
            }
            return renderRoute(ctx, def);
          });
          if (config2 === void 0 || config2.methods === "ALL") {
            router.add("GET", routePath, fns);
            router.add("DELETE", routePath, fns);
            router.add("HEAD", routePath, fns);
            router.add("OPTIONS", routePath, fns);
            router.add("PATCH", routePath, fns);
            router.add("POST", routePath, fns);
            router.add("PUT", routePath, fns);
          } else if (Array.isArray(config2.methods)) {
            for (let i3 = 0; i3 < config2.methods.length; i3++) {
              const method = config2.methods[i3];
              router.add(method, routePath, fns);
            }
          }
        } else {
          fns.push((ctx) => renderRoute(ctx, route));
          const routePath = toRoutePath(mergePath(basePath, route.config?.routeOverride ?? pattern, false));
          if (typeof route.handler === "function") {
            router.add("GET", routePath, fns);
            router.add("DELETE", routePath, fns);
            router.add("HEAD", routePath, fns);
            router.add("OPTIONS", routePath, fns);
            router.add("PATCH", routePath, fns);
            router.add("POST", routePath, fns);
            router.add("PUT", routePath, fns);
          } else if (isHandlerByMethod(route.handler)) {
            for (const method of Object.keys(route.handler)) {
              router.add(method, routePath, fns);
            }
          }
        }
        break;
      }
      case "handler": {
        const { pattern, fns, method } = cmd;
        const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
        const result = segmentToMiddlewares(segment);
        result.push(...fns);
        const resPath = toRoutePath(mergePath(basePath, pattern, false));
        if (method === "ALL") {
          router.add("GET", resPath, result);
          router.add("DELETE", resPath, result);
          router.add("HEAD", resPath, result);
          router.add("OPTIONS", resPath, result);
          router.add("PATCH", resPath, result);
          router.add("POST", resPath, result);
          router.add("PUT", resPath, result);
        } else {
          router.add(method, resPath, result);
        }
        break;
      }
      case "fsRoute": {
        const items = cmd.getItems();
        applyCommandsInner(root2, router, items, basePath);
        break;
      }
      default:
        throw new Error(`Unknown command: ${JSON.stringify(cmd)}`);
    }
  }
}
function isFreshFile(mod, commandType) {
  if (mod === null || typeof mod !== "object") return false;
  return typeof mod.default === "function" || commandType === CommandType.Middleware && Array.isArray(mod.default) || typeof mod.config === "object" || typeof mod.handlers === "object" || typeof mod.handlers === "function" || typeof mod.handler === "object" || typeof mod.handler === "function";
}
function fsItemsToCommands(items) {
  const commands = [];
  for (let i2 = 0; i2 < items.length; i2++) {
    const item = items[i2];
    const { filePath, type, mod: rawMod, pattern, routePattern } = item;
    switch (type) {
      case CommandType.Middleware: {
        if (isLazy(rawMod)) continue;
        const { handlers: handlers2, mod } = validateFsMod(filePath, rawMod, type);
        let middlewares = handlers2 ?? mod.default ?? null;
        if (middlewares === null) continue;
        if (isHandlerByMethod(middlewares)) {
          warnInvalidRoute(`Middleware does not support object handlers with GET, POST, etc. in ${filePath}`);
          continue;
        }
        if (!Array.isArray(middlewares)) {
          middlewares = [middlewares];
        }
        commands.push(newMiddlewareCmd(pattern, middlewares, true));
        continue;
      }
      case CommandType.Layout: {
        const { handlers: handlers2, mod } = validateFsMod(filePath, rawMod, type);
        if (handlers2 !== null) {
          warnInvalidRoute("Layout does not support handlers");
        }
        if (!mod.default) continue;
        commands.push(newLayoutCmd(pattern, mod.default, mod.config, true));
        continue;
      }
      case CommandType.Error: {
        const { handlers: handlers2, mod } = validateFsMod(filePath, rawMod, type);
        commands.push(newErrorCmd(pattern, {
          component: mod.default ?? void 0,
          config: mod.config ?? void 0,
          // deno-lint-ignore no-explicit-any
          handler: handlers2 ?? void 0
        }, true));
        continue;
      }
      case CommandType.NotFound: {
        const { handlers: handlers2, mod } = validateFsMod(filePath, rawMod, type);
        commands.push(newNotFoundCmd({
          config: mod.config,
          component: mod.default,
          // deno-lint-ignore no-explicit-any
          handler: handlers2 ?? void 0
        }));
        continue;
      }
      case CommandType.App: {
        const { mod } = validateFsMod(filePath, rawMod, type);
        if (mod.default === void 0) continue;
        commands.push(newAppCmd(mod.default));
        continue;
      }
      case CommandType.Route: {
        let normalized;
        let config2 = {};
        if (isLazy(rawMod)) {
          normalized = async () => {
            return await tracer.startActiveSpan("lazy-route", { attributes: { "fresh.route_name": rawMod.name ?? "anonymous" } }, async (span) => {
              try {
                const result = await rawMod();
                return normalizeRoute(filePath, result, routePattern, type);
              } catch (err) {
                recordSpanError(span, err);
                throw err;
              } finally {
                span.end();
              }
            });
          };
          config2.methods = item.overrideConfig?.methods ?? "ALL";
          config2.routeOverride = item.overrideConfig?.routeOverride ?? routePattern;
        } else {
          normalized = normalizeRoute(filePath, rawMod, routePattern, type);
          if (rawMod.config) {
            config2 = rawMod.config;
          }
        }
        commands.push(newRouteCmd(pattern, normalized, config2, false));
        continue;
      }
      case CommandType.Handler:
        throw new Error(`Not supported`);
      case CommandType.FsRoute:
        throw new Error(`Nested FsRoutes are not supported`);
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
  }
  return commands;
}
function warnInvalidRoute(message) {
  console.warn(`🍋 %c[WARNING] Unsupported route config: ${message}`, "color:rgb(251, 184, 0)");
}
function validateFsMod(filePath, mod, commandType) {
  if (!isFreshFile(mod, commandType)) {
    throw new Error(`Expected a route, middleware, layout or error template, but couldn't find relevant exports in: ${filePath}`);
  }
  const handlers2 = mod.handlers ?? mod.handler ?? null;
  if (typeof handlers2 === "function" && handlers2.length > 1) {
    throw new Error(`Handlers must only have one argument but found more than one. Check the function signature in: ${filePath}`);
  }
  return { handlers: handlers2, mod };
}
function normalizeRoute(filePath, rawMod, routePattern, commandType) {
  const { handlers: handlers2, mod } = validateFsMod(filePath, rawMod, commandType);
  return {
    config: { ...mod.config, routeOverride: mod.config?.routeOverride ?? routePattern },
    // deno-lint-ignore no-explicit-any
    handler: handlers2 ?? void 0,
    component: mod.default,
    css: rawMod.css
  };
}
class MockBuildCache {
  #files;
  root = "";
  clientEntry = "";
  islandRegistry = /* @__PURE__ */ new Map();
  features = { errorOverlay: false };
  constructor(files, mode) {
    this.features.errorOverlay = mode === "development";
    this.#files = files;
  }
  getEntryAssets() {
    return [];
  }
  getFsRoutes() {
    return fsItemsToCommands(this.#files);
  }
  readFile(_pathname) {
    return Promise.resolve(null);
  }
}
const DEFAULT_CONN_INFO = { localAddr: { transport: "tcp", hostname: "localhost", port: 8080 }, remoteAddr: { transport: "tcp", hostname: "localhost", port: 1234 } };
const defaultOptionsHandler = (methods) => {
  return () => Promise.resolve(new Response(null, { status: 204, headers: { Allow: methods.join(", ") } }));
};
const DEFAULT_ERROR_HANDLER = async (ctx) => {
  const { error } = ctx;
  if (error instanceof HttpError) {
    if (error.status >= 500) {
      console.error(error);
    }
    return new Response(error.message, { status: error.status });
  }
  console.error(error);
  return new Response("Internal server error", { status: 500 });
};
function createOnListen(basePath, options2) {
  return (params) => {
    const pathname = basePath + "/";
    const protocol = "key" in options2 && options2.key && options2.cert ? "https:" : "http:";
    let hostname = params.hostname;
    if (Deno.build.os === "windows" && (hostname === "0.0.0.0" || hostname === "::")) {
      hostname = "localhost";
    }
    hostname = hostname.startsWith("::") ? `[${hostname}]` : hostname;
    console.log();
    console.log(bgRgb8(rgb8(" 🍋 Fresh ready   ", 0), 121));
    const sep = options2.remoteAddress ? "" : "\n";
    const space = options2.remoteAddress ? " " : "";
    const localLabel = bold("Local:");
    const address = cyan(`${protocol}//${hostname}:${params.port}${pathname}`);
    const helper = hostname === "0.0.0.0" || hostname === "::" ? cyan(` (${protocol}//localhost:${params.port}${pathname})`) : "";
    console.log(`    ${localLabel}  ${space}${address}${helper}${sep}`);
    if (options2.remoteAddress) {
      const remoteLabel = bold("Remote:");
      const remoteAddress = cyan(options2.remoteAddress);
      console.log(`    ${remoteLabel}  ${remoteAddress}
`);
    }
  };
}
async function listenOnFreePort(options2, handler2) {
  let firstError = null;
  for (let port = 8e3; port < 8020; port++) {
    try {
      return await Deno.serve({ ...options2, port }, handler2);
    } catch (err) {
      if (err instanceof Deno.errors.AddrInUse) {
        if (!firstError) firstError = err;
        continue;
      }
      throw err;
    }
  }
  throw firstError;
}
let setBuildCache;
class App {
  constructor(config2 = {}) {
    __privateAdd(this, _getBuildCache, () => null);
    __privateAdd(this, _commands, []);
    /**
    * The final resolved Fresh configuration.
    */
    __publicField(this, "config");
    this.config = { root: ".", basePath: config2.basePath ?? "", mode: config2.mode ?? "production" };
  }
  use(pathOrMiddleware, ...middlewares) {
    let pattern;
    let fns;
    if (typeof pathOrMiddleware === "string") {
      pattern = pathOrMiddleware;
      fns = middlewares;
    } else {
      pattern = "*";
      middlewares.unshift(pathOrMiddleware);
      fns = middlewares;
    }
    __privateGet(this, _commands).push(newMiddlewareCmd(pattern, fns, true));
    return this;
  }
  /**
  * Set the app's 404 error handler. Can be a {@linkcode Route} or a {@linkcode Middleware}.
  */
  notFound(routeOrMiddleware) {
    __privateGet(this, _commands).push(newNotFoundCmd(routeOrMiddleware));
    return this;
  }
  onError(path, routeOrMiddleware) {
    __privateGet(this, _commands).push(newErrorCmd(path, routeOrMiddleware, true));
    return this;
  }
  appWrapper(component) {
    __privateGet(this, _commands).push(newAppCmd(component));
    return this;
  }
  layout(path, component, config2) {
    __privateGet(this, _commands).push(newLayoutCmd(path, component, config2, true));
    return this;
  }
  route(path, route, config2) {
    __privateGet(this, _commands).push(newRouteCmd(path, route, config2, false));
    return this;
  }
  /**
  * Add middlewares for GET requests at the specified path.
  */
  get(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("GET", path, middlewares, false));
    return this;
  }
  /**
  * Add middlewares for POST requests at the specified path.
  */
  post(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("POST", path, middlewares, false));
    return this;
  }
  /**
  * Add middlewares for PATCH requests at the specified path.
  */
  patch(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("PATCH", path, middlewares, false));
    return this;
  }
  /**
  * Add middlewares for PUT requests at the specified path.
  */
  put(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("PUT", path, middlewares, false));
    return this;
  }
  /**
  * Add middlewares for DELETE requests at the specified path.
  */
  delete(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("DELETE", path, middlewares, false));
    return this;
  }
  /**
  * Add middlewares for HEAD requests at the specified path.
  */
  head(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("HEAD", path, middlewares, false));
    return this;
  }
  /**
  * Add middlewares for all HTTP verbs at the specified path.
  */
  all(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("ALL", path, middlewares, false));
    return this;
  }
  /**
  * Insert file routes collected in {@linkcode Builder} at this point.
  * @param pattern Append file routes at this pattern instead of the root
  * @returns
  */
  fsRoutes(pattern = "*") {
    __privateGet(this, _commands).push({ type: CommandType.FsRoute, pattern, getItems: () => {
      const buildCache = __privateGet(this, _getBuildCache).call(this);
      if (buildCache === null) return [];
      return buildCache.getFsRoutes();
    }, includeLastSegment: false });
    return this;
  }
  /**
  * Merge another {@linkcode App} instance into this app at the
  * specified path.
  */
  mountApp(path, app2) {
    for (let i2 = 0; i2 < __privateGet(app2, _commands).length; i2++) {
      const cmd = __privateGet(app2, _commands)[i2];
      if (cmd.type !== CommandType.App && cmd.type !== CommandType.NotFound) {
        let effectivePattern = cmd.pattern;
        if (app2.config.basePath) {
          effectivePattern = mergePath(app2.config.basePath, cmd.pattern, false);
        }
        const clone = { ...cmd, pattern: mergePath(path, effectivePattern, true), includeLastSegment: cmd.pattern === "/" || cmd.includeLastSegment };
        __privateGet(this, _commands).push(clone);
        continue;
      }
      __privateGet(this, _commands).push(cmd);
    }
    const self = this;
    __privateSet(app2, _getBuildCache, () => {
      var _a;
      return __privateGet(_a = self, _getBuildCache).call(_a);
    });
    return this;
  }
  /**
  * Create handler function for `Deno.serve` or to be used in
  * testing.
  */
  handler() {
    let buildCache = __privateGet(this, _getBuildCache).call(this);
    if (buildCache === null) {
      if (this.config.mode === "production" && DENO_DEPLOYMENT_ID !== void 0) ;
      else {
        buildCache = new MockBuildCache([], this.config.mode);
      }
    }
    const router = new UrlPatternRouter();
    const { rootMiddlewares } = applyCommands(router, __privateGet(this, _commands), this.config.basePath);
    return async (req, conn = DEFAULT_CONN_INFO) => {
      const url = new URL(req.url);
      url.pathname = url.pathname.replace(/\/+/g, "/");
      const method = req.method.toUpperCase();
      const matched = router.match(method, url);
      let { params, pattern, handlers: handlers2, methodMatch } = matched;
      const span = _trace.getActiveSpan();
      if (span && pattern) {
        span.updateName(`${method} ${pattern}`);
        span.setAttribute("http.route", pattern);
      }
      let next;
      if (pattern === null || !methodMatch) {
        handlers2 = rootMiddlewares;
      }
      if (matched.pattern !== null && !methodMatch) {
        if (method === "OPTIONS") {
          const allowed = router.getAllowedMethods(matched.pattern);
          next = defaultOptionsHandler(allowed);
        } else {
          next = DEFAULT_NOT_ALLOWED_METHOD;
        }
      } else {
        next = DEFAULT_NOT_FOUND;
      }
      const ctx = new Context(req, url, conn, matched.pattern, params, this.config, next, buildCache);
      try {
        if (handlers2.length === 0) return await next();
        const result = await runMiddlewares(handlers2, ctx);
        if (!(result instanceof Response)) {
          throw new Error(`Expected a "Response" instance to be returned, but got: ${result}`);
        }
        return result;
      } catch (err) {
        ctx.error = err;
        return await DEFAULT_ERROR_HANDLER(ctx);
      }
    };
  }
  /**
  * Spawn a server for this app.
  */
  async listen(options2 = {}) {
    if (!options2.onListen) {
      options2.onListen = createOnListen(this.config.basePath, options2);
    }
    const handler2 = this.handler();
    if (options2.port) {
      await Deno.serve(options2, handler2);
      return;
    }
    await listenOnFreePort(options2, handler2);
  }
}
_getBuildCache = new WeakMap();
_commands = new WeakMap();
setBuildCache = (app2, cache, mode) => {
  app2.config.root = cache.root;
  app2.config.mode = mode;
  __privateSet(app2, _getBuildCache, () => cache);
};
class ProdBuildCache {
  root;
  #snapshot;
  islandRegistry;
  clientEntry;
  features;
  constructor(root2, snapshot2) {
    this.root = root2;
    this.features = { errorOverlay: false };
    setBuildId(snapshot2.version);
    this.#snapshot = snapshot2;
    this.islandRegistry = snapshot2.islands;
    this.clientEntry = snapshot2.clientEntry;
  }
  getEntryAssets() {
    return this.#snapshot.entryAssets;
  }
  getFsRoutes() {
    return fsItemsToCommands(this.#snapshot.fsRoutes);
  }
  async readFile(pathname) {
    const { staticFiles: staticFiles2 } = this.#snapshot;
    const info = staticFiles2.get(pathname);
    if (info === void 0) return null;
    const filePath = isAbsolute(info.filePath) ? info.filePath : join(this.root, info.filePath);
    const [stat, file] = await Promise.all([Deno.stat(filePath), Deno.open(filePath)]);
    return { hash: info.hash, contentType: info.contentType, size: stat.size, readable: file.readable, close: () => file.close() };
  }
}
class IslandPreparer {
  #namer = new UniqueNamer();
  prepare(registry, mod, chunkName, modName, css2) {
    for (const [name, value] of Object.entries(mod)) {
      if (typeof value !== "function") continue;
      const islandName = name === "default" ? modName : name;
      const uniqueName = this.#namer.getUniqueName(islandName);
      const fn = value;
      registry.set(fn, { exportName: name, file: chunkName, fn, name: uniqueName, css: css2 });
    }
  }
}
const i = Symbol.for("preact-signals");
function t() {
  if (r > 1) {
    r--;
    return;
  }
  let i2, t2 = false;
  while (void 0 !== s) {
    let o2 = s;
    s = void 0;
    f++;
    while (void 0 !== o2) {
      const n2 = o2.o;
      o2.o = void 0;
      o2.f &= -3;
      if (!(8 & o2.f) && v$1(o2)) try {
        o2.c();
      } catch (o3) {
        if (!t2) {
          i2 = o3;
          t2 = true;
        }
      }
      o2 = n2;
    }
  }
  f = 0;
  r--;
  if (t2) throw i2;
}
function o(i2) {
  if (r > 0) return i2();
  r++;
  try {
    return i2();
  } finally {
    t();
  }
}
let n, s;
function h$1(i2) {
  const t2 = n;
  n = void 0;
  try {
    return i2();
  } finally {
    n = t2;
  }
}
let r = 0, f = 0, e = 0;
function u(i2) {
  if (void 0 === n) return;
  let t2 = i2.n;
  if (void 0 === t2 || t2.t !== n) {
    t2 = { i: 0, S: i2, p: n.s, n: void 0, t: n, e: void 0, x: void 0, r: t2 };
    if (void 0 !== n.s) n.s.n = t2;
    n.s = t2;
    i2.n = t2;
    if (32 & n.f) i2.S(t2);
    return t2;
  } else if (-1 === t2.i) {
    t2.i = 0;
    if (void 0 !== t2.n) {
      t2.n.p = t2.p;
      if (void 0 !== t2.p) t2.p.n = t2.n;
      t2.p = n.s;
      t2.n = void 0;
      n.s.n = t2;
      n.s = t2;
    }
    return t2;
  }
}
function c(i2, t2) {
  this.v = i2;
  this.i = 0;
  this.n = void 0;
  this.t = void 0;
  this.W = null == t2 ? void 0 : t2.watched;
  this.Z = null == t2 ? void 0 : t2.unwatched;
  this.name = null == t2 ? void 0 : t2.name;
}
c.prototype.brand = i;
c.prototype.h = function() {
  return true;
};
c.prototype.S = function(i2) {
  const t2 = this.t;
  if (t2 !== i2 && void 0 === i2.e) {
    i2.x = t2;
    this.t = i2;
    if (void 0 !== t2) t2.e = i2;
    else h$1(() => {
      var i3;
      null == (i3 = this.W) || i3.call(this);
    });
  }
};
c.prototype.U = function(i2) {
  if (void 0 !== this.t) {
    const t2 = i2.e, o2 = i2.x;
    if (void 0 !== t2) {
      t2.x = o2;
      i2.e = void 0;
    }
    if (void 0 !== o2) {
      o2.e = t2;
      i2.x = void 0;
    }
    if (i2 === this.t) {
      this.t = o2;
      if (void 0 === o2) h$1(() => {
        var i3;
        null == (i3 = this.Z) || i3.call(this);
      });
    }
  }
};
c.prototype.subscribe = function(i2) {
  return E(() => {
    const t2 = this.value, o2 = n;
    n = void 0;
    try {
      i2(t2);
    } finally {
      n = o2;
    }
  }, { name: "sub" });
};
c.prototype.valueOf = function() {
  return this.value;
};
c.prototype.toString = function() {
  return this.value + "";
};
c.prototype.toJSON = function() {
  return this.value;
};
c.prototype.peek = function() {
  const i2 = n;
  n = void 0;
  try {
    return this.value;
  } finally {
    n = i2;
  }
};
Object.defineProperty(c.prototype, "value", { get() {
  const i2 = u(this);
  if (void 0 !== i2) i2.i = this.i;
  return this.v;
}, set(i2) {
  if (i2 !== this.v) {
    if (f > 100) throw new Error("Cycle detected");
    this.v = i2;
    this.i++;
    e++;
    r++;
    try {
      for (let i3 = this.t; void 0 !== i3; i3 = i3.x) i3.t.N();
    } finally {
      t();
    }
  }
} });
function d(i2, t2) {
  return new c(i2, t2);
}
function v$1(i2) {
  for (let t2 = i2.s; void 0 !== t2; t2 = t2.n) if (t2.S.i !== t2.i || !t2.S.h() || t2.S.i !== t2.i) return true;
  return false;
}
function l(i2) {
  for (let t2 = i2.s; void 0 !== t2; t2 = t2.n) {
    const o2 = t2.S.n;
    if (void 0 !== o2) t2.r = o2;
    t2.S.n = t2;
    t2.i = -1;
    if (void 0 === t2.n) {
      i2.s = t2;
      break;
    }
  }
}
function y$1(i2) {
  let t2, o2 = i2.s;
  while (void 0 !== o2) {
    const i3 = o2.p;
    if (-1 === o2.i) {
      o2.S.U(o2);
      if (void 0 !== i3) i3.n = o2.n;
      if (void 0 !== o2.n) o2.n.p = i3;
    } else t2 = o2;
    o2.S.n = o2.r;
    if (void 0 !== o2.r) o2.r = void 0;
    o2 = i3;
  }
  i2.s = t2;
}
function a(i2, t2) {
  c.call(this, void 0);
  this.x = i2;
  this.s = void 0;
  this.g = e - 1;
  this.f = 4;
  this.W = null == t2 ? void 0 : t2.watched;
  this.Z = null == t2 ? void 0 : t2.unwatched;
  this.name = null == t2 ? void 0 : t2.name;
}
a.prototype = new c();
a.prototype.h = function() {
  this.f &= -3;
  if (1 & this.f) return false;
  if (32 == (36 & this.f)) return true;
  this.f &= -5;
  if (this.g === e) return true;
  this.g = e;
  this.f |= 1;
  if (this.i > 0 && !v$1(this)) {
    this.f &= -2;
    return true;
  }
  const i2 = n;
  try {
    l(this);
    n = this;
    const i3 = this.x();
    if (16 & this.f || this.v !== i3 || 0 === this.i) {
      this.v = i3;
      this.f &= -17;
      this.i++;
    }
  } catch (i3) {
    this.v = i3;
    this.f |= 16;
    this.i++;
  }
  n = i2;
  y$1(this);
  this.f &= -2;
  return true;
};
a.prototype.S = function(i2) {
  if (void 0 === this.t) {
    this.f |= 36;
    for (let i3 = this.s; void 0 !== i3; i3 = i3.n) i3.S.S(i3);
  }
  c.prototype.S.call(this, i2);
};
a.prototype.U = function(i2) {
  if (void 0 !== this.t) {
    c.prototype.U.call(this, i2);
    if (void 0 === this.t) {
      this.f &= -33;
      for (let i3 = this.s; void 0 !== i3; i3 = i3.n) i3.S.U(i3);
    }
  }
};
a.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 6;
    for (let i2 = this.t; void 0 !== i2; i2 = i2.x) i2.t.N();
  }
};
Object.defineProperty(a.prototype, "value", { get() {
  if (1 & this.f) throw new Error("Cycle detected");
  const i2 = u(this);
  this.h();
  if (void 0 !== i2) i2.i = this.i;
  if (16 & this.f) throw this.v;
  return this.v;
} });
function w(i2, t2) {
  return new a(i2, t2);
}
function _$1(i2) {
  const o2 = i2.u;
  i2.u = void 0;
  if ("function" == typeof o2) {
    r++;
    const s2 = n;
    n = void 0;
    try {
      o2();
    } catch (t2) {
      i2.f &= -2;
      i2.f |= 8;
      b$1(i2);
      throw t2;
    } finally {
      n = s2;
      t();
    }
  }
}
function b$1(i2) {
  for (let t2 = i2.s; void 0 !== t2; t2 = t2.n) t2.S.U(t2);
  i2.x = void 0;
  i2.s = void 0;
  _$1(i2);
}
function g$1(i2) {
  if (n !== this) throw new Error("Out-of-order effect");
  y$1(this);
  n = i2;
  this.f &= -2;
  if (8 & this.f) b$1(this);
  t();
}
function p$1(i2, t2) {
  this.x = i2;
  this.u = void 0;
  this.s = void 0;
  this.o = void 0;
  this.f = 32;
  this.name = null == t2 ? void 0 : t2.name;
}
p$1.prototype.c = function() {
  const i2 = this.S();
  try {
    if (8 & this.f) return;
    if (void 0 === this.x) return;
    const t2 = this.x();
    if ("function" == typeof t2) this.u = t2;
  } finally {
    i2();
  }
};
p$1.prototype.S = function() {
  if (1 & this.f) throw new Error("Cycle detected");
  this.f |= 1;
  this.f &= -9;
  _$1(this);
  l(this);
  r++;
  const i2 = n;
  n = this;
  return g$1.bind(this, i2);
};
p$1.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 2;
    this.o = s;
    s = this;
  }
};
p$1.prototype.d = function() {
  this.f |= 8;
  if (!(1 & this.f)) b$1(this);
};
p$1.prototype.dispose = function() {
  this.d();
};
function E(i2, t2) {
  const o2 = new p$1(i2, t2);
  try {
    o2.c();
  } catch (i3) {
    o2.d();
    throw i3;
  }
  const n2 = o2.d.bind(o2);
  n2[Symbol.dispose] = n2;
  return n2;
}
let h, p, v = [];
E(function() {
  h = this.N;
})();
function y(i2, n2) {
  l$4[i2] = n2.bind(null, l$4[i2] || (() => {
  }));
}
function _(i2) {
  if (p) p();
  p = i2 && i2.S();
}
function g({ data: i2 }) {
  const t2 = useSignal(i2);
  t2.value = i2;
  const [e2, f2] = T(() => {
    let i3 = this, e3 = this.__v;
    while (e3 = e3.__) if (e3.__c) {
      e3.__c.__$f |= 4;
      break;
    }
    const o2 = w(() => {
      let i4 = t2.value.value;
      return 0 === i4 ? 0 : true === i4 ? "" : i4 || "";
    }), f3 = w(() => !Array.isArray(o2.value) && !t$3(o2.value)), r2 = E(function() {
      this.N = F;
      if (f3.value) {
        const t3 = o2.value;
        if (i3.__v && i3.__v.__e && 3 === i3.__v.__e.nodeType) i3.__v.__e.data = t3;
      }
    }), u2 = this.__$u.d;
    this.__$u.d = function() {
      r2();
      u2.call(this);
    };
    return [f3, o2];
  }, []);
  return e2.value ? f2.peek() : f2.value;
}
g.displayName = "ReactiveTextNode";
Object.defineProperties(c.prototype, { constructor: { configurable: true, value: void 0 }, type: { configurable: true, value: g }, props: { configurable: true, get() {
  return { data: this };
} }, __b: { configurable: true, value: 1 } });
y("__b", (i2, t2) => {
  if ("function" == typeof t2.type && "undefined" != typeof window && window.__PREACT_SIGNALS_DEVTOOLS__) window.__PREACT_SIGNALS_DEVTOOLS__.exitComponent();
  if ("string" == typeof t2.type) {
    let i3, n2 = t2.props;
    for (let e2 in n2) {
      if ("children" === e2) continue;
      let o2 = n2[e2];
      if (o2 instanceof c) {
        if (!i3) t2.__np = i3 = {};
        i3[e2] = o2;
        n2[e2] = o2.peek();
      }
    }
  }
  i2(t2);
});
y("__r", (i2, t2) => {
  if ("function" == typeof t2.type && "undefined" != typeof window && window.__PREACT_SIGNALS_DEVTOOLS__) window.__PREACT_SIGNALS_DEVTOOLS__.enterComponent(t2.type.displayName || t2.type.name || "Unknown");
  if (t2.type !== k$2) {
    _();
    let i3, n2 = t2.__c;
    if (n2) {
      n2.__$f &= -2;
      i3 = n2.__$u;
      if (void 0 === i3) n2.__$u = i3 = (function(i4) {
        let t3;
        E(function() {
          t3 = this;
        });
        t3.c = () => {
          n2.__$f |= 1;
          n2.setState({});
        };
        return t3;
      })();
    }
    _(i3);
  }
  i2(t2);
});
y("__e", (i2, t2, n2, e2) => {
  if ("undefined" != typeof window && window.__PREACT_SIGNALS_DEVTOOLS__) window.__PREACT_SIGNALS_DEVTOOLS__.exitComponent();
  _();
  i2(t2, n2, e2);
});
y("diffed", (i2, t2) => {
  if ("function" == typeof t2.type && "undefined" != typeof window && window.__PREACT_SIGNALS_DEVTOOLS__) window.__PREACT_SIGNALS_DEVTOOLS__.exitComponent();
  _();
  let n2;
  if ("string" == typeof t2.type && (n2 = t2.__e)) {
    let i3 = t2.__np, e2 = t2.props;
    if (i3) {
      let t3 = n2.U;
      if (t3) for (let n3 in t3) {
        let e3 = t3[n3];
        if (void 0 !== e3 && !(n3 in i3)) {
          e3.d();
          t3[n3] = void 0;
        }
      }
      else {
        t3 = {};
        n2.U = t3;
      }
      for (let o2 in i3) {
        let f2 = t3[o2], r2 = i3[o2];
        if (void 0 === f2) {
          f2 = b(n2, o2, r2, e2);
          t3[o2] = f2;
        } else f2.o(r2, e2);
      }
    }
  }
  i2(t2);
});
function b(i2, t2, n2, e2) {
  const o2 = t2 in i2 && void 0 === i2.ownerSVGElement, f2 = d(n2);
  return { o: (i3, t3) => {
    f2.value = i3;
    e2 = t3;
  }, d: E(function() {
    this.N = F;
    const n3 = f2.value.value;
    if (e2[t2] !== n3) {
      e2[t2] = n3;
      if (o2) i2[t2] = n3;
      else if (n3) i2.setAttribute(t2, n3);
      else i2.removeAttribute(t2);
    }
  }) };
}
y("unmount", (i2, t2) => {
  if ("string" == typeof t2.type) {
    let i3 = t2.__e;
    if (i3) {
      const t3 = i3.U;
      if (t3) {
        i3.U = void 0;
        for (let i4 in t3) {
          let n2 = t3[i4];
          if (n2) n2.d();
        }
      }
    }
  } else {
    let i3 = t2.__c;
    if (i3) {
      const t3 = i3.__$u;
      if (t3) {
        i3.__$u = void 0;
        t3.d();
      }
    }
  }
  i2(t2);
});
y("__h", (i2, t2, n2, e2) => {
  if (e2 < 3 || 9 === e2) t2.__$f |= 2;
  i2(t2, n2, e2);
});
x$3.prototype.shouldComponentUpdate = function(i2, t2) {
  const n2 = this.__$u, e2 = n2 && void 0 !== n2.s;
  for (let i3 in t2) return true;
  if (this.__f || "boolean" == typeof this.u && true === this.u) {
    const i3 = 2 & this.__$f;
    if (!(e2 || i3 || 4 & this.__$f)) return true;
    if (1 & this.__$f) return true;
  } else {
    if (!(e2 || 4 & this.__$f)) return true;
    if (3 & this.__$f) return true;
  }
  for (let t3 in i2) if ("__source" !== t3 && i2[t3] !== this.props[t3]) return true;
  for (let t3 in this.props) if (!(t3 in i2)) return true;
  return false;
};
function useSignal(i2, t2) {
  return d$2(() => d(i2, t2))[0];
}
const q = (i2) => {
  queueMicrotask(() => {
    queueMicrotask(i2);
  });
};
function x() {
  o(() => {
    let i2;
    while (i2 = v.shift()) h.call(i2);
  });
}
function F() {
  if (1 === v.push(this)) (l$4.requestAnimationFrame || q)(x);
}
const $$_tpl_1$1 = ['<div><div class="text-center pb-4"><button ', ' class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer text-xs text-black/60"><svg class="block mx-auto" viewBox="0 0 24 24" fill="currentColor" style="height:20px;"><path d="M6,6A2,2,0,0,1,8,4,1,1,0,0,0,8,2,4,4,0,0,0,4,6V9a2,2,0,0,1-2,2,1,1,0,0,0,0,2,2,2,0,0,1,2,2v3a4,4,0,0,0,4,4,1,1,0,0,0,0-2,2,2,0,0,1-2-2V15a4,4,0,0,0-1.38-3A4,4,0,0,0,6,9Zm16,5a2,2,0,0,1-2-2V6a4,4,0,0,0-4-4,1,1,0,0,0,0,2,2,2,0,0,1,2,2V9a4,4,0,0,0,1.38,3A4,4,0,0,0,18,15v3a2,2,0,0,1-2,2,1,1,0,0,0,0,2,4,4,0,0,0,4-4V15a2,2,0,0,1,2-2,1,1,0,0,0,0-2Z"></path></svg>JSON</button></div>', "</div>"];
const $$_tpl_2 = ['<div class="fixed inset-0 bg-white z-50 overflow-auto"><div class="py-8"><div class="max-w-xl mx-auto px-4"><div class="flex justify-between items-center mb-6 pb-4 border-b border-black/10"><h2 class="text-lg font-monospace">JSON Loaded (<span>', "ms</span>)</h2><button ", ' class="text-2xl text-gray-500 hover:text-black cursor-pointer">×</button></div><pre class="text-[0.8em] leading-[1.6em] whitespace-no-wrap overflow-x-auto bg-gray-50 border border-gray-200 p-4 rounded-md font-monospace">', "</pre></div></div></div>"];
const isVisible = d(false);
function JsonViewer({ data, processingTime }) {
  const showOverlay = () => {
    isVisible.value = true;
    document.body.style.overflow = "hidden";
  };
  const hideOverlay = () => {
    isVisible.value = false;
    document.body.style.overflow = "";
  };
  const handleKeyDown = (e2) => {
    if (e2.key === "Escape" && isVisible.value) {
      hideOverlay();
    }
  };
  if (typeof document !== "undefined") {
    document.addEventListener("keydown", handleKeyDown);
  }
  return a$3($$_tpl_1$1, l$3("onclick", showOverlay), s$3(isVisible.value && a$3($$_tpl_2, s$3(processingTime || 0), l$3("onclick", hideOverlay), s$3(JSON.stringify(data, null, 2)))));
}
const JsonViewer$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: JsonViewer
}, Symbol.toStringTag, { value: "Module" }));
const $$_tpl_1 = ["<div ", " ", ">", "</div>"];
function LocalDate({ date, class: className = "" }) {
  const formatLocalDate = (dateString) => {
    try {
      const dateObj = new Date(dateString);
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return new Intl.DateTimeFormat("en-US", { timeZone: userTimezone, year: "2-digit", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(dateObj);
    } catch (error) {
      const dateObj = new Date(dateString);
      return dateObj.toISOString().replace("T", " ").slice(0, 19) + " UTC";
    }
  };
  return a$3($$_tpl_1, l$3("datetime", date), l$3("class", className), s$3(formatLocalDate(date)));
}
const LocalDate$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LocalDate
}, Symbol.toStringTag, { value: "Module" }));
const TrackingForm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
function staticFiles$1() {
  return async function freshServeStaticFiles(ctx) {
    const { req, url, config: config2 } = ctx;
    const buildCache = getBuildCache(ctx);
    if (buildCache === null) return await ctx.next();
    let pathname = decodeURIComponent(url.pathname);
    if (config2.basePath) {
      pathname = pathname !== config2.basePath ? pathname.slice(config2.basePath.length) : "/";
    }
    const startTime = performance.now() + performance.timeOrigin;
    const file = await buildCache.readFile(pathname);
    if (pathname === "/" || file === null) {
      if (pathname === "/favicon.ico") {
        return new Response(null, { status: 404 });
      }
      return await ctx.next();
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      file.close();
      return new Response("Method Not Allowed", { status: 405 });
    }
    const span = tracer.startSpan("static file", { attributes: { "fresh.span_type": "static_file" }, startTime });
    try {
      const cacheKey = url.searchParams.get(ASSET_CACHE_BUST_KEY);
      if (cacheKey !== null && BUILD_ID !== cacheKey) {
        url.searchParams.delete(ASSET_CACHE_BUST_KEY);
        const location = url.pathname + url.search;
        file.close();
        span.setAttribute("fresh.cache", "invalid_bust_key");
        span.setAttribute("fresh.cache_key", cacheKey);
        return new Response(null, { status: 307, headers: { location } });
      }
      const etag = file.hash;
      const headers = new Headers({ "Content-Type": file.contentType, vary: "If-None-Match" });
      const ifNoneMatch = req.headers.get("If-None-Match");
      if (ifNoneMatch !== null && (ifNoneMatch === etag || ifNoneMatch === `W/"${etag}"`)) {
        file.close();
        span.setAttribute("fresh.cache", "not_modified");
        return new Response(null, { status: 304, headers });
      } else if (etag !== null) {
        headers.set("Etag", `W/"${etag}"`);
      }
      if (ctx.config.mode !== "development" && (BUILD_ID === cacheKey || url.pathname.startsWith(`${ctx.config.basePath}/_fresh/js/${BUILD_ID}/`))) {
        span.setAttribute("fresh.cache", "immutable");
        headers.append("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        span.setAttribute("fresh.cache", "no_cache");
        headers.append("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
      }
      headers.set("Content-Length", String(file.size));
      if (req.method === "HEAD") {
        file.close();
        return new Response(null, { status: 200, headers });
      }
      return new Response(file.readable, { headers });
    } finally {
      span.end();
    }
  };
}
function createDefine() {
  return { handlers(handlers2) {
    return handlers2;
  }, page(render) {
    return render;
  }, layout(render) {
    return render;
  }, middleware(middleware) {
    return middleware;
  } };
}
const define = createDefine();
const _app = define.page(function App2({ Component }) {
  return u$3("html", { children: [u$3("head", { children: [u$3("meta", { charset: "utf-8" }), u$3("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), u$3("link", { rel: "icon", href: "https://cdn.eg1.io/images/favicon.png" }), u$3("title", { children: "EG1: Where is it?" })] }), u$3("body", { class: "!block", style: "display: none;", children: u$3(Component, null) })] });
});
const routeCss$1 = ["__FRESH_CSS_PLACEHOLDER__"];
const css$1 = routeCss$1;
const config$1 = void 0;
const handler$1 = void 0;
const handlers$1 = void 0;
const _freshRoute____app = _app;
const fsRoute_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  config: config$1,
  css: css$1,
  default: _freshRoute____app,
  handler: handler$1,
  handlers: handlers$1
}, Symbol.toStringTag, { value: "Module" }));
function getEnv(key, env) {
  try {
    if (typeof globalThis.Deno !== "undefined") {
      return globalThis.Deno.env.get(key);
    }
    if (globalThis.__CF_ENV__) {
      return globalThis.__CF_ENV__[key];
    }
    return process.env[key];
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
  }
  return void 0;
}
const _middleware = define.middleware(async (ctx) => {
  const url = ctx.url;
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response("Missing 'id' query parameter", { status: 400 });
  }
  const apiBaseUrl = getEnv("API_BASE_URL");
  const apiToken = getEnv("API_TOKEN");
  if (!apiToken) {
    console.error("API_TOKEN environment variable is not set");
    return new Response("API configuration error", { status: 500 });
  }
  let trackingId = id;
  if (id.includes("%26") || id.includes("&")) {
    trackingId = decodeURIComponent(id);
    if (!trackingId.includes("?") && trackingId.includes("&")) {
      const parts = trackingId.split("&");
      trackingId = parts[0] + "?" + parts.slice(1).join("&");
    }
  } else if (!id.includes("?")) {
    const additionalParams = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== "id") {
        additionalParams.append(key, value);
      }
    }
    if (additionalParams.toString()) {
      trackingId = `${id}?${additionalParams.toString()}`;
    }
  }
  const startTime = performance.now();
  const response = await fetch(`${apiBaseUrl}/whereis/${trackingId}`, { method: "GET", headers: { Accept: "application/json", Authorization: `Bearer ${apiToken}` } });
  const endTime = performance.now();
  const data = await response.json();
  ctx.state.data = data;
  ctx.state.APItime = (endTime - startTime).toFixed(2);
  return await ctx.next();
});
const routeCss = ["__FRESH_CSS_PLACEHOLDER__"];
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___whereis__middleware = _middleware;
const fsRoute_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  config,
  css,
  default: _freshRoute___whereis__middleware,
  handler,
  handlers
}, Symbol.toStringTag, { value: "Module" }));
const clientEntry = "./assets/client-entry-Cjd2iXaX.js";
const version = "f79edb9edef467007affc214509c4839528b5ff2";
const islands = /* @__PURE__ */ new Map();
const islandPreparer = new IslandPreparer();
islandPreparer.prepare(islands, JsonViewer$1, "/assets/fresh-island__JsonViewer-4T7qEA6U.js", "JsonViewer", []);
islandPreparer.prepare(islands, LocalDate$1, "/assets/fresh-island__LocalDate-OaitGR-G.js", "LocalDate", []);
islandPreparer.prepare(islands, TrackingForm, "/assets/fresh-island__TrackingForm-l0sNRNKZ.js", "TrackingForm", []);
const staticFiles = /* @__PURE__ */ new Map([
  ["/assets/jsxRuntime.module-CBr80xu0.js", { "name": "/assets/jsxRuntime.module-CBr80xu0.js", "hash": "239420b427884b2fae3d1866cb45300fc8652cc09cd0148a5e5ef7d8c2099711", "filePath": "client/assets/jsxRuntime.module-CBr80xu0.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/assets/preact.module-B5DG9wGp.js", { "name": "/assets/preact.module-B5DG9wGp.js", "hash": "39abe25fc21708deb80d8d3366ff9fc8e4a2de469aea68775071c25356945c12", "filePath": "client/assets/preact.module-B5DG9wGp.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/assets/signals.module-CWNDFXwB.js", { "name": "/assets/signals.module-CWNDFXwB.js", "hash": "eb92a0b5f0b8064d25bcd182882c85f635302ce21d03d595d49caa2e28a59489", "filePath": "client/assets/signals.module-CWNDFXwB.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/assets/client-entry-Cjd2iXaX.js", { "name": "/assets/client-entry-Cjd2iXaX.js", "hash": "bf34cd3861d97ed8606e1bc6efabed28f764682d4a11d0b80665254e2594ac8b", "filePath": "client/assets/client-entry-Cjd2iXaX.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/assets/client-entry-C-R5Vn3a.css", { "name": "/assets/client-entry-C-R5Vn3a.css", "hash": "99680011b83787b62ebd17fe19a4d5139ad065dbfe9419c4efaec6ad52043bba", "filePath": "client/assets/client-entry-C-R5Vn3a.css", "contentType": "text/css; charset=UTF-8" }],
  ["/assets/fresh-island__JsonViewer-4T7qEA6U.js", { "name": "/assets/fresh-island__JsonViewer-4T7qEA6U.js", "hash": "5a0cba36656ff5fdaa1964885de8b1b71f7be1e217fb82d657761e23c1a19eb0", "filePath": "client/assets/fresh-island__JsonViewer-4T7qEA6U.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/assets/fresh-island__LocalDate-OaitGR-G.js", { "name": "/assets/fresh-island__LocalDate-OaitGR-G.js", "hash": "67145ee87aba5a53231c6a9d5603838f587951e3ffd79a9442d17e7797b13d41", "filePath": "client/assets/fresh-island__LocalDate-OaitGR-G.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/assets/fresh-island__TrackingForm-l0sNRNKZ.js", { "name": "/assets/fresh-island__TrackingForm-l0sNRNKZ.js", "hash": "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b", "filePath": "client/assets/fresh-island__TrackingForm-l0sNRNKZ.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/favicon.ico", { "name": "/favicon.ico", "hash": "ceefc31bd51194e03c78f9d35f9ca4d8b474b01280f83cd1490fb96a87c0dd12", "filePath": "client/favicon.ico", "contentType": "image/vnd.microsoft.icon" }],
  ["/submit.js", { "name": "/submit.js", "hash": "5dc86c0f35024e009c4202627a696aee9109e43c9f55d19c1c5d61fb50b4b1fb", "filePath": "client/submit.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/tracking.js", { "name": "/tracking.js", "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "filePath": "client/tracking.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/logo.svg", { "name": "/logo.svg", "hash": "bf1196aeac0c511ec4b81b846993de208012c4158fba73d17b575236164d63ce", "filePath": "client/logo.svg", "contentType": "image/svg+xml" }]
]);
const entryAssets = ["/assets/client-entry-C-R5Vn3a.css"];
const fsRoutes = [
  { id: "/_app", mod: fsRoute_0, type: "app", pattern: "*", routePattern: "*" },
  { id: "/index", mod: () => import("./assets/_fresh-route___index-BfSo0-4D.mjs"), type: "route", pattern: "/", routePattern: "/" },
  { id: "/whereis/_middleware", mod: fsRoute_2, type: "middleware", pattern: "/whereis", routePattern: "/whereis" },
  { id: "/whereis/index", mod: () => import("./assets/_fresh-route___whereis_index-BXq2gIbn.mjs"), type: "route", pattern: "/whereis/", routePattern: "/whereis" }
];
const snapshot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clientEntry,
  entryAssets,
  fsRoutes,
  islands,
  staticFiles,
  version
}, Symbol.toStringTag, { value: "Module" }));
const app = new App();
app.use(staticFiles$1());
app.fsRoutes();
const root = join(import.meta.dirname, "..");
setBuildCache(app, new ProdBuildCache(root, snapshot), "production");
const _fresh_server_entry = {
  fetch: app.handler()
};
function registerStaticFile(prepared) {
  staticFiles.set(prepared.name, {
    name: prepared.name,
    contentType: prepared.contentType,
    filePath: prepared.filePath
  });
}
export {
  Head as H,
  JsonViewer as J,
  LocalDate as L,
  a$3 as a,
  u$3 as b,
  createDefine as c,
  define as d,
  _fresh_server_entry as default,
  l$3 as l,
  registerStaticFile,
  s$3 as s,
  useSignal as u
};
