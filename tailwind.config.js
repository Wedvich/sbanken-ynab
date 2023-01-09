import forms from '@tailwindcss/forms';

export default {
  content: ['index.html', './src/**/*.{ts,tsx}'],
  plugins: [forms()],
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
