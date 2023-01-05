module.exports = {
  content: ['./src/**/*.html', './src/**/*.{ts,tsx}'],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    fontFamily: {
      body: ['Kulim Park'],
      numbers: ['Lato'],
    },
  },
};
