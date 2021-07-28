module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.html', './src/**/*.{ts,tsx}'],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    fontFamily: {
      body: ['Kulim Park'],
      numbers: ['Lato'],
    },
  },
};
