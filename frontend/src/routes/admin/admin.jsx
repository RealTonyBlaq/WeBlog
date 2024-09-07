import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";
import toast from "react-hot-toast";
import { useEffect } from "react";

const links = [
  {
    url: "users",
    name: "Users",
    icon: <span className="icon-[mdi--users]"></span>,
  },
  {
    url: "articles",
    name: "Articles",
    icon: <span className="icon-[ooui--articles-rtl]"></span>,
  },
  {
    url: "tags",
    name: "Tags",
    icon: <span className="icon-[mdi--tags]"></span>,
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Please login to access this page");
      navigate("/login");
    } else if (!user.is_admin) {
      toast.error("You are not authorized to access this page.");
      navigate("/");
    }
  }, [user]);

  return (
    <div className="w-full h-[calc(100vh-128px)] sm:h-[calc(100vh-144px)] md:h-[calc(100vh-152px)] grid grid-cols-[2fr_9fr] xl:grid-cols-[1fr_4fr] lg:gap-8 xl:gap-12 p-4 md:py-8 md:px-8 lg:px-20 xl:py-12 xl:px-24">
      <nav className="w-full md:h-56 text-arsenic dark:text-white">
        <ul className="w-full h-full flex flex-col items-center md:items-start justify-center gap-2">
          {links.map((link) => (
            <li key={link.name} className="mb-1 md:mb-2">
              <NavLink
                to={`/admin/${link.url}`}
                className={({ isActive, isPending }) =>
                  isActive
                    ? "text-black dark:text-white bg-white dark:bg-black p-2 w-full flex items-center gap-1 md:gap-2 font-bold rounded hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic shadow"
                    : isPending
                    ? "pending"
                    : "p-2 w-full flex items-center gap-1 md:gap-2 font-medium rounded hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic"
                }
              >
                {link.icon} <span className="hidden md:block">{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="w-full h-full overflow-y-scroll px-6 py-4 md:p-0">
        <Outlet />
      </div>
    </div>
  );
}
