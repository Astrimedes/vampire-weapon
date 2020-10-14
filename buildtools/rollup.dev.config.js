import { baseConfig } from './rollup.base.config';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import watchAssets from 'rollup-plugin-watch-assets';

export default {
  ...baseConfig,
  plugins: baseConfig.plugins.concat([
    serve({
      contentBase: 'dist',
      port: 3000
    }),
    watchAssets( {
      assets: ['assets']
    }),
    livereload( {
      watch: ['dist', 'assets'],
      verbose: true
    })
  ])
};
