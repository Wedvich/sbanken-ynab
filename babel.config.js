module.exports = api => {
  api.cache.never();

  const presets = [
    '@babel/typescript',
    ['@babel/env', {
      corejs: 3,
      useBuiltIns: 'entry',
    }],
    '@babel/react',
  ];

  const plugins = [];

  if (process.env.NODE_ENV !== 'development') {
    plugins.push('react-hot-loader/babel');
  }

  return {
    presets,
    plugins,
  };
};
