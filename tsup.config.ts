import type { Options } from 'tsup';

const config: Options = {
  dts: true,
  entry: [
    'src/index.ts'
  ],
  format: ['esm', "cjs"],
  sourcemap: true,
}

export default config