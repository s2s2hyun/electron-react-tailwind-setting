/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // WebkitAppRegion을 위한 커스텀 스타일 추가
      textStyles: {
        'drag': { '-webkit-app-region': 'drag' },
        'no-drag': { '-webkit-app-region': 'no-drag' }
      }
    },
  },
  plugins: [],
};