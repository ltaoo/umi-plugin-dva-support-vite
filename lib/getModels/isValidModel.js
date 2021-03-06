"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidModel = isValidModel;

function _umi() {
  const data = require("umi");

  _umi = function _umi() {
    return data;
  };

  return data;
}

const t = _umi().utils.t,
      traverse = _umi().utils.traverse,
      parser = _umi().utils.parser;

function getIdentifierDeclaration(node, path) {
  if (t.isIdentifier(node) && path.scope.hasBinding(node.name)) {
    let bindingNode = path.scope.getBinding(node.name).path.node;

    if (t.isVariableDeclarator(bindingNode)) {
      bindingNode = bindingNode.init;
    }

    return bindingNode;
  }

  return node;
}

function getTSNode(node) {
  if ( // <Model> {}
  t.isTSTypeAssertion(node) || // {} as Model
  t.isTSAsExpression(node)) {
    return node.expression;
  } else {
    return node;
  }
}

function isValidModel({
  content
}) {
  const parser = _umi().utils.parser;

  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'classProperties', 'dynamicImport', 'exportDefaultFrom', 'exportNamespaceFrom', 'functionBind', 'nullishCoalescingOperator', 'objectRestSpread', 'optionalChaining', 'decorators-legacy']
  });
  let isDvaModel = false;
  let imports = {};
  traverse.default(ast, {
    ImportDeclaration(path) {
      const _path$node = path.node,
            specifiers = _path$node.specifiers,
            source = _path$node.source;
      specifiers.forEach(specifier => {
        if (t.isImportDefaultSpecifier(specifier)) {
          imports[specifier.local.name] = source.value;
        }
      });
    },

    ExportDefaultDeclaration(path) {
      let node = path.node.declaration;
      node = getTSNode(node);
      node = getIdentifierDeclaration(node, path);
      node = getTSNode(node); // 支持 dva-model-extend

      if (t.isCallExpression(node) && t.isIdentifier(node.callee) && imports[node.callee.name] === 'dva-model-extend') {
        node = node.arguments[1];
        node = getTSNode(node);
        node = getIdentifierDeclaration(node, path);
        node = getTSNode(node);
      }

      if (t.isObjectExpression(node) && node.properties.some(property => {
        return ['state', 'reducers', 'subscriptions', 'effects', 'namespace'].includes(property.key.name);
      })) {
        isDvaModel = true;
      }
    }

  });
  return isDvaModel;
}