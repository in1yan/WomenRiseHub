/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Next.js v15 expects Tailwind's PostCSS plugin to be the separate package
    // '@tailwindcss/postcss'. Keep autoprefixer as well.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

export default config
