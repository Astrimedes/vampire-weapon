
import copy from 'rollup-plugin-copy';

const baseConfig = {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    copy({
      targets: [
        { src: 'assets/*', dest: 'dist' }
      ]
    })
  ]
};

export { baseConfig };
