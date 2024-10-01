export default function Footer() {
  return (
    <footer className="w-full px-6 py-4 sm:px-8 sm:py-6 md:px-12 lg:px-20 xl:px-24 bg-slate-200 dark:bg-black text-black dark:text-white">
      <p className="text-center text-arsenic dark:text-white font-medium">
        Made with ❤️ and{" "}
        <a target="_blank" href="https://flask.palletsprojects.com/en/3.0.x/">
          Flask
        </a>
        . WeBlog © {new Date().getFullYear()}.
      </p>
    </footer>
  );
}
