import type { Options } from 'tsup';

const env = process.env.NODE_ENV


const config: Options = {
  bundle: env === 'production',
  clean: true,
  dts: true,
  entry: [
    'src/**/*.ts'
  ],
  format: ['esm', "cjs"],
  minify: env === 'production',
  outDir: env === 'production' ? 'lib' : 'dist',
  skipNodeModulesBundle: true,
  sourcemap: true,
  splitting: true,
  target: "es2020",
  watch: env === 'development',
}

export default config