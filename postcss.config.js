import postcssImport from 'postcss-import';
import tailwind from 'tailwindcss';
import tailwindConfig from './tailwind.config.cjs';
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes';
import postcssPresetEnv from 'postcss-preset-env';

export default {
  plugins: [
    postcssImport(),
    tailwind(tailwindConfig),
    postcssFlexbugsFixes(),
    postcssPresetEnv({
      stage: 3,
      features: {
        'nesting-rules': true,
      },
    }),
  ],
};
