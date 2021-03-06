"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

function _fs() {
  const data = require("fs");

  _fs = function _fs() {
    return data;
  };

  return data;
}

var _getModels = require("./getModels/getModels");

var _getUserLibDir = require("./getUserLibDir");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const Mustache = _umi().utils.Mustache,
      lodash = _umi().utils.lodash,
      winPath = _umi().utils.winPath;

var _default = api => {
  const logger = api.logger;

  function getModelDir() {
    return api.config.singular ? 'model' : 'models';
  }

  function getSrcModelsPath() {
    return (0, _path().join)(api.paths.absSrcPath, getModelDir());
  }

  function getDvaDependency() {
    const _api$pkg = api.pkg,
          dependencies = _api$pkg.dependencies,
          devDependencies = _api$pkg.devDependencies;
    return (dependencies === null || dependencies === void 0 ? void 0 : dependencies.dva) || (devDependencies === null || devDependencies === void 0 ? void 0 : devDependencies.dva) || require('../package').dependencies.dva;
  } // ??????


  api.describe({
    key: 'dva',
    config: {
      schema(joi) {
        return joi.object({
          disableModelsReExport: joi.boolean(),
          lazyLoad: joi.boolean().description('lazy load dva model avoiding the import modules from umi undefined'),
          extraModels: joi.array().items(joi.string()),
          hmr: joi.boolean(),
          immer: joi.alternatives(joi.boolean(), joi.object()),
          skipModelValidate: joi.boolean()
        });
      }

    }
  });

  function getAllModels() {
    var _api$config$dva, _api$config$dva2;

    const srcModelsPath = getSrcModelsPath();
    const baseOpts = {
      skipModelValidate: (_api$config$dva = api.config.dva) === null || _api$config$dva === void 0 ? void 0 : _api$config$dva.skipModelValidate,
      extraModels: (_api$config$dva2 = api.config.dva) === null || _api$config$dva2 === void 0 ? void 0 : _api$config$dva2.extraModels
    };
    return lodash.uniq([...(0, _getModels.getModels)(_objectSpread({
      base: srcModelsPath,
      cwd: api.cwd
    }, baseOpts)), ...(0, _getModels.getModels)(_objectSpread({
      base: api.paths.absPagesPath,
      cwd: api.cwd,
      pattern: `**/${getModelDir()}/**/*.{ts,tsx,js,jsx}`
    }, baseOpts)), ...(0, _getModels.getModels)(_objectSpread({
      base: api.paths.absPagesPath,
      cwd: api.cwd,
      pattern: `**/model.{ts,tsx,js,jsx}`
    }, baseOpts))]);
  }

  let hasModels = false; // ??????????????????

  api.onStart(() => {
    hasModels = getAllModels().length > 0;
  });
  api.addDepInfo(() => {
    return {
      name: 'dva',
      range: getDvaDependency()
    };
  }); // ??????????????????

  api.onGenerateFiles({
    fn() {
      var _api$config$dva3, _api$config$dva4, _api$config$dva5, _api$config$dva6, _api$config$dva7, _api$config$dva8, _api$config, _api$config2, _api$config$dva10;

      const models = getAllModels();
      hasModels = models.length > 0;
      logger.debug('dva models:');
      logger.debug(models); // ?????? models ???????????????

      if (!hasModels) return; // dva.ts

      const dvaTpl = (0, _fs().readFileSync)((0, _path().join)(__dirname, 'dva.tpl'), 'utf-8');
      api.writeTmpFile({
        path: 'plugin-dva/dva.ts',
        content: Mustache.render(dvaTpl, {
          ExtendDvaConfig: '',
          EnhanceApp: '',
          dvaImmer: (_api$config$dva3 = api.config.dva) === null || _api$config$dva3 === void 0 ? void 0 : _api$config$dva3.immer,
          dvaImmerPath: winPath(require.resolve('dva-immer')),
          dvaImmerES5: lodash.isPlainObject((_api$config$dva4 = api.config.dva) === null || _api$config$dva4 === void 0 ? void 0 : _api$config$dva4.immer) && ((_api$config$dva5 = api.config.dva) === null || _api$config$dva5 === void 0 ? void 0 : _api$config$dva5.immer.enableES5),
          dvaImmerAllPlugins: lodash.isPlainObject((_api$config$dva6 = api.config.dva) === null || _api$config$dva6 === void 0 ? void 0 : _api$config$dva6.immer) && ((_api$config$dva7 = api.config.dva) === null || _api$config$dva7 === void 0 ? void 0 : _api$config$dva7.immer.enableAllPlugins),
          LazyLoad: (_api$config$dva8 = api.config.dva) === null || _api$config$dva8 === void 0 ? void 0 : _api$config$dva8.lazyLoad,
          RegisterModelImports: models.map((path, index) => {
            var _api$config$dva9;

            const modelName = `Model${lodash.upperFirst(lodash.camelCase((0, _path().basename)(path, (0, _path().extname)(path))))}${index}`;
            return ((_api$config$dva9 = api.config.dva) === null || _api$config$dva9 === void 0 ? void 0 : _api$config$dva9.lazyLoad) ? `const ${modelName} = (await import('${path}')).default;` : `import ${modelName} from '${path}';`;
          }).join('\r\n'),
          RegisterModels: models.map((path, index) => {
            // prettier-ignore
            return `
app.model({ namespace: '${(0, _path().basename)(path, (0, _path().extname)(path))}', ...Model${lodash.upperFirst(lodash.camelCase((0, _path().basename)(path, (0, _path().extname)(path))))}${index} });
          `.trim();
          }).join('\r\n'),
          ReplaceModels: models.map((path, index) => {
            // prettier-ignore
            return `
app.replaceModel({ namespace: '${(0, _path().basename)(path, (0, _path().extname)(path))}', ...Model${lodash.upperFirst(lodash.camelCase((0, _path().basename)(path, (0, _path().extname)(path))))}${index} });
          `.trim();
          }).join('\r\n'),
          // use esm version
          dvaLoadingPkgPath: winPath(require.resolve('dva-loading/dist/index.esm.js')),
          SSR: !!((_api$config = api.config) === null || _api$config === void 0 ? void 0 : _api$config.ssr)
        })
      }); // runtime.tsx

      const runtimeTpl = (0, _fs().readFileSync)((0, _path().join)(__dirname, 'runtime.tpl'), 'utf-8');
      api.writeTmpFile({
        path: 'plugin-dva/runtime.tsx',
        content: Mustache.render(runtimeTpl, {
          SSR: !!((_api$config2 = api.config) === null || _api$config2 === void 0 ? void 0 : _api$config2.ssr)
        })
      }); // exports.ts

      const exportsTpl = (0, _fs().readFileSync)((0, _path().join)(__dirname, 'exports.tpl'), 'utf-8');
      const dvaLibPath = winPath((0, _getUserLibDir.getUserLibDir)({
        library: 'dva',
        pkg: api.pkg,
        cwd: api.cwd
      }) || (0, _path().dirname)(require.resolve('dva/package.json')));

      const dvaVersion = require((0, _path().join)(dvaLibPath, 'package.json')).version;

      const exportMethods = dvaVersion.startsWith('2.6') ? ['connect', 'useDispatch', 'useStore', 'useSelector'] : ['connect'];
      logger.debug(`dva version: ${dvaVersion}`);
      logger.debug(`exported methods:`);
      logger.debug(exportMethods);
      api.writeTmpFile({
        path: 'plugin-dva/exports.ts',
        content: Mustache.render(exportsTpl, {
          exportMethods: exportMethods.join(', ')
        })
      }); // typings

      const connectTpl = (0, _fs().readFileSync)((0, _path().join)(__dirname, 'connect.tpl'), 'utf-8');
      api.writeTmpFile({
        path: 'plugin-dva/connect.ts',
        content: Mustache.render(connectTpl, {
          dvaHeadExport: ((_api$config$dva10 = api.config.dva) === null || _api$config$dva10 === void 0 ? void 0 : _api$config$dva10.disableModelsReExport) ? `` : models.map(path => {
            // prettier-ignore
            return `export * from '${winPath((0, _path().dirname)(path) + "/" + (0, _path().basename)(path, (0, _path().extname)(path)))}';`;
          }).join('\r\n'),
          dvaLoadingModels: models.map(path => {
            // prettier-ignore
            return `    ${(0, _path().basename)(path, (0, _path().extname)(path))} ?: boolean;`;
          }).join('\r\n')
        })
      });
    },

    // ?????? preset-built-in ??????
    // ?????????????????????????????????????????? hasModels ?????????????????????????????????
    stage: -1
  }); // src/models ?????????????????????????????????????????????

  api.addTmpGenerateWatcherPaths(() => [getSrcModelsPath()]); // dva ??????????????????????????????

  api.addProjectFirstLibraries(() => [{
    name: 'dva',
    path: (0, _path().dirname)(require.resolve('dva/package.json'))
  }]); // Babel Plugin for HMR

  api.modifyBabelOpts(babelOpts => {
    var _api$config$dva11;

    const hmr = (_api$config$dva11 = api.config.dva) === null || _api$config$dva11 === void 0 ? void 0 : _api$config$dva11.hmr;

    if (hmr) {
      const hmrOpts = lodash.isPlainObject(hmr) ? hmr : {};
      babelOpts.plugins.push([require.resolve('babel-plugin-dva-hmr'), hmrOpts]);
    }

    return babelOpts;
  }); // Runtime Plugin

  api.addRuntimePlugin(() => hasModels ? [(0, _path().join)(api.paths.absTmpPath, 'plugin-dva/runtime.tsx')] : []);
  api.addRuntimePluginKey(() => hasModels ? ['dva'] : []); // ????????????

  api.addUmiExports(() => hasModels ? [{
    exportAll: true,
    source: '../plugin-dva/exports'
  }, {
    exportAll: true,
    source: '../plugin-dva/connect'
  }] : []);
  api.registerCommand({
    name: 'dva',

    fn({
      args
    }) {
      if (args._[0] === 'list' && args._[1] === 'model') {
        const models = getAllModels();
        console.log();
        console.log(_umi().utils.chalk.bold('  Models in your project:'));
        console.log();
        models.forEach(model => {
          console.log(`    - ${(0, _path().relative)(api.cwd, model)}`);
        });
        console.log();
        console.log(`  Totally ${models.length}.`);
        console.log();
      }
    }

  });
};

exports.default = _default;