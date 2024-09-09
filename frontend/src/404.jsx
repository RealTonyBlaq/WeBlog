import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="h-[calc(100vh-128px)] sm:h-[calc(100vh-144px)] md:h-[calc(100vh-152px)] flex flex-col items-center justify-center bg-gray-100 dark:bg-eerie-black dark:text-white">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="mt-4 text-2xl text-gray-800 dark:text-white">Page Not Found</p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go back to Home
      </Link>
    </div>
  );
}
