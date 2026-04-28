module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'crimson': '#C0152A',
            },
            fontFamily: {
                'bebas': ['"Bebas Neue"', 'sans-serif'],
                'dm': ['"DM Sans"', 'sans-serif'],
                'playfair': ['"Playfair Display"', 'serif'],
            },
        },
    },
    plugins: [],
}
