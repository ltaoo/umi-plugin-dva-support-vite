import { createElement, useRef, useEffect, Component } from 'react';
import { ApplyPluginsType } from 'umi';
import dva from 'dva';
// @ts-ignore
import createLoading from '{{{ dvaLoadingPkgPath }}}';
import { plugin, history } from '../core/umiExports';
{{ ^LazyLoad }}
{{{ RegisterModelImports }}}
{{ /LazyLoad }}
{{ #dvaImmer }}
import dvaImmer, { enableES5, enableAllPlugins } from '{{{ dvaImmerPath }}}';
{{ /dvaImmer }}

let app:any = (() => {
  if (window.__dva_app__) {
    return window.__dva_app__;
  }
  return null;
})();

export {{ #LazyLoad }}async {{ /LazyLoad }}function _onCreate(options = {}) {
  const runtimeDva = plugin.applyPlugins({
    key: 'dva',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });
  {{ #LazyLoad }}
  {{{ RegisterModelImports }}}
  {{ /LazyLoad }}
  app = window.__dva_app__ || (() => {
    const app = dva({
      history,
      {{{ ExtendDvaConfig }}}
      ...(runtimeDva.config || {}),
      // @ts-ignore
      ...(typeof window !== 'undefined' && window.g_useSSR ? { initialState: window.g_initialProps } : {}),
      ...(options || {}),
    });
    {{{ EnhanceApp }}}
    app.use(createLoading());
    {{ #dvaImmer }}
    app.use(dvaImmer());
    {{ /dvaImmer }}
    {{ #dvaImmerES5 }}
    enableES5();
    {{ /dvaImmerES5 }}
    {{ #dvaImmerAllPlugins }}
    enableAllPlugins();
    {{ /dvaImmerAllPlugins }}
    (runtimeDva.plugins || []).forEach((plugin:any) => {
      app.use(plugin);
    });
    {{{ RegisterModels }}}
    window.__dva_app__ = app;
    return app;
  })();

   if (app && app.replaceModel) {
    {{{ ReplaceModels }}}
   }

  return app;
}

export function getApp() {
  return app;
}

/**
 * whether browser env
 *
 * @returns boolean
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
}

export const DvaContainer = (props) => {
  const children = useRef(props.children).current;
  useRef((() => {
    // run only in client, avoid override server _onCreate()
    if (isBrowser()) {
      _onCreate()
    }
  })());
  const Content = useRef((() => {
    const app = getApp();
    app.router(() => props.children);
    return app.start();
  })()).current;

  return createElement(Content);
}

if (import.meta.hot) {
    import.meta.hot.accept();
}
