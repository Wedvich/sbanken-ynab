module.exports = {
  content: ['./src/**/*.html', './src/**/*.{ts,tsx}'],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    fontFamily: {
      body: ['Kulim Park'],
      numbers: ['Lato'],
      code: [
        'Fira Code',
        'ui-monospace',
        'SFMono-Regular',
        'SF Mono',
        'Menlo',
        'Consolas',
        'Liberation Mono',
        'monospace',
      ],
    },
  },
};
