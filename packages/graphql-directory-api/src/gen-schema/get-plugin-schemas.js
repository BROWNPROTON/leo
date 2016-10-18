/* @flow */
import {
  isFunction,
  cloneDeep
} from 'lodash';
import oDebug from 'debug';
const debug = oDebug('graphql-directory-api:get-plugin-schemas');
import type { PluginSpec } from './types';

export default function({
  plugins,
  data
}: PluginSpec) {
  return plugins.reduce((acc, pluginString) => {
    debug('reducing plugin schema', pluginString);
    try {
      require.resolve(`${pluginString}/schema`)
    } catch (e) {
      debug('No schema for plugin', pluginString);
      return acc;
    }
    const mkPluginSchema = require(`${pluginString}/schema`);
    /**
     * If plugin/schema is not a function, maybe we should allow it to not be
     * in the future?
     */
    if (!isFunction(mkPluginSchema)) {
      throw new Error(`plugin ${pluginString}/schema must export a function`);
    }
    // TODO: how do we handle conflicting keys? maybe just throw for now?
    return Object.assign({}, acc, mkPluginSchema(cloneDeep(data)));
  }, {})
}
