module.exports = {
  plugins: [
    require.resolve('postcss-import'),
    require.resolve('tailwindcss'),
    require.resolve('postcss-flexbugs-fixes'),
    [
      require.resolve('postcss-preset-env'),
      {
        stage: 3,
        features: {
          'nesting-rules': true,
        },
      },
    ],
  ],
};
