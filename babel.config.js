module.exports = (api) => {
  api.env();

  const presets = [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false,
        useBuiltIns: 'usage',
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ];

  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    'react-hot-loader/babel',
  ];

  return {
    presets,
    plugins,
  };
};
