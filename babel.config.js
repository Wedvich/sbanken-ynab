module.exports = api => {
  api.cache.never();

  const presets = [
    '@babel/typescript',
    '@babel/env',
    '@babel/react',
  ];

  const plugins = [
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
    }],
    'babel-plugin-redux-saga',
  ];

  if (process.env.NODE_ENV !== 'development') {
    plugins.push('react-hot-loader/babel');
  }

  return {
    presets,
    plugins,
  };
};
