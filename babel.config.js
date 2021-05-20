module.exports = (api) => {
  api.env();

  const presets = [
    [
      require.resolve('@babel/preset-env'),
      {
        corejs: 3,
        modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false,
        useBuiltIns: 'usage',
      },
    ],
    [require.resolve('@babel/preset-typescript'), { jsxPragma: 'h' }],
  ];

  const plugins = [
    [
      require.resolve('@babel/plugin-transform-react-jsx'),
      {
        pragma: 'h',
        pragmaFrag: 'Fragment',
      },
    ],
  ];

  if (process.env.NODE_ENV === 'development') {
    plugins.push(require.resolve('@prefresh/babel-plugin'));
  }

  return {
    presets,
    plugins,
  };
};
