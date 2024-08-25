import { NavLink, Outlet } from "react-router-dom";

const links = [

  {
    url: "/my_posts",
    name: "My Posts",
  },
  {
    url: "/my_bookmarks",
    name: "My Bookmarks",
  },
];

export default function DashBoard() {
  return (
    <div className="w-full grid md:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_3fr] gap-4 sm:gap-6 md:gap-8 xl:gap-12 sm:px-8 md:py-8 md:px-12 lg:px-20 xl:py-12 xl:px-24">
      <nav className="sticky top-0 left-0 md:static w-full md:h-56 p-4 md:p-6 rounded-lg bg-white dark:bg-dark-navy-blue text-arsenic dark:text-white">
        <ul className="w-full h-full grid grid-cols-2 md:block">
          {links.map((link) => (
            <li key={link.name} className="mb-1 md:mb-2">
              <NavLink
                to={`/dashboard${link.url}`}
                className={({ isActive, isPending }) =>
                  isActive
                    ? "text-arsenic bg-slate-100 p-2 w-full block font-semibold rounded hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic"
                    : isPending
                    ? "pending"
                    : "p-2 w-full block font-medium rounded hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic"
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="w-full px-6 py-4 md:p-0">
        <Outlet />
      </div>
    </div>
  );
}
