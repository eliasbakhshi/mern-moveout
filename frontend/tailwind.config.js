import flowbite from "flowbite/plugin";
import flowbiteReact from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./src/**/**/*.{html,js,ts,jsx,tsx}",
    "./index.html",
    flowbiteReact.content(),
  ],

  theme: {
    extend: {},
  },
  plugins: [flowbite, flowbiteReact.plugin()],
};
