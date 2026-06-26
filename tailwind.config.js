/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // agro color utilities used dynamically
    { pattern: /bg-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /text-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /border-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /ring-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /hover:bg-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /hover:border-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /hover:text-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /focus:border-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /focus:ring-agro-(50|100|200|300|400|500|600|700|800|900|950)/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        agro: {
          50:  '#F0F7F0',
          100: '#E8F5E9',
          200: '#C8E6C9',
          300: '#A5D6A7',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
          950: '#0D3B12',
        },
      },
      backgroundImage: {
        'agro-gradient': 'linear-gradient(135deg, #1B5E20, #2E7D32, #388E3C)',
      },
    },
  },
  plugins: [],
}
