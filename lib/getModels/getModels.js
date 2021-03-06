"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModels = getModels;

function _umi() {
  const data = require("umi");

  _umi = function _umi() {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("fs");

  _fs = function _fs() {
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

var _isValidModel = require("./isValidModel");

function getModels(opts) {
  return _umi().utils.lodash.uniq(_umi().utils.glob.sync(opts.pattern || '**/*.{ts,tsx,js,jsx}', {
    cwd: opts.base
  }).map(f => (0, _path().join)(opts.base, f)).concat(opts.extraModels || []).map(_umi().utils.winPath)).filter(f => {
    if (/\.d.ts$/.test(f)) return false;
    if (/\.(test|e2e|spec).(j|t)sx?$/.test(f)) return false; // 允许通过配置下跳过 Model 校验

    if (opts.skipModelValidate) return true; // TODO: fs cache for performance

    try {
      return (0, _isValidModel.isValidModel)({
        content: (0, _fs().readFileSync)(f, 'utf-8')
      });
    } catch (error) {
      throw new Error(`Dva model ${_umi().utils.winPath((0, _path().relative)(opts.cwd, f))} parse failed, ${error}`);
    }
  });
}