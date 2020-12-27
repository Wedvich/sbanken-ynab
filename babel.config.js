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

  const plugins = ['@babel/plugin-proposal-class-properties'];

  if (process.env.NODE_ENV === 'development') {
    plugins.push('react-refresh/babel');
  }

  return {
    presets,
    plugins,
  };
};
