import { baseConfig } from './rollup.base.config';

export default {
  ...baseConfig,
  plugins: baseConfig.plugins.concat([
    // add plugins here
  ]),
};
