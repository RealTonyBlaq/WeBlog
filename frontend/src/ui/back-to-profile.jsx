import { Link } from "react-router-dom";

export default function BackToProfile() {
  return (
    <Link to={"/dashboard"} className="w-40 flex items-center gap-2 font-medium md:text-lg mb-1 md:mb-2 dark:text-white hover:text-blue-500">
      <span className="icon-[solar--rewind-back-outline]"></span>
      <span>Back To Profile</span>
    </Link>
  );
}
