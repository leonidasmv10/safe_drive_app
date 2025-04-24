/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [ react(),
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'SafeDrive',
      short_name: 'SafeDrive',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#9f59f5',
    }
  })
],
};
