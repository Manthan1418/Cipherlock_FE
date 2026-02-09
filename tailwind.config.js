/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4f46e5',
                secondary: '#1f2937',
                accent: '#22d3ee',
                dark: '#111827',
                'dark-lighter': '#1f2937'
            }
        },
    },
    plugins: [],
}
