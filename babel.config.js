module.exports = api => {
  api.cache.never();

  const presets = ['@babel/typescript', '@babel/env', '@babel/react'];

  const plugins = [
    [
      '@babel/transform-runtime',
      {
        corejs: 3,
      },
    ],
    '@babel/proposal-class-properties',
    'redux-saga',
    '@babel/syntax-dynamic-import',
  ];

  if (process.env.NODE_ENV !== 'development') {
    plugins.push('react-hot-loader/babel');
  }

  return {
    presets,
    plugins,
  };
};
