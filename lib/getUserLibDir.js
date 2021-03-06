"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserLibDir = getUserLibDir;

function _umi() {
  const data = require("umi");

  _umi = function _umi() {
    return data;
  };

  return data;
}

function _path() {
  const data = require("path");

  _path = function _path() {
    return data;
  };

  return data;
}

function getUserLibDir({
  library,
  pkg,
  cwd
}) {
  if (pkg.dependencies && pkg.dependencies[library] || pkg.devDependencies && pkg.devDependencies[library]) {
    return _umi().utils.winPath((0, _path().dirname)( // 通过 resolve 往上找，可支持 lerna 仓库
    // lerna 仓库如果用 yarn workspace 的依赖不一定在 node_modules，可能被提到根目录，并且没有 link
    _umi().utils.resolve.sync(`${library}/package.json`, {
      basedir: cwd
    })));
  }

  return null;
}