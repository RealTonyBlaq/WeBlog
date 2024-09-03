import { useEffect, useState } from "react";
import SearchBar from "./search-bar";
import { Link, useNavigate } from "react-router-dom";
import { useOutsideClick } from "../lib/useOutsideClick";
import toast from "react-hot-toast";
import { logout } from "../api/auth";
import { useAuth } from "../lib/useAuth";

export default function Header() {
  const { user, setUser } = useAuth();
  const [darkTheme, setTheme] = useState();
  const [showMenu, setMenu] = useState(false);
  const [showUserMenu, setUserMenu] = useState(false);

  const navigate = useNavigate();

  const handleToggleMenu = () => setMenu((prev) => !prev);
  const handleToggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      // remove 'dark' from the classlist
      document.documentElement.classList.remove("dark");
      // set theme in localstorage to 'light'
      localStorage.setItem("theme", "light");
    } else {
      // add 'dark' to the classlist
      document.documentElement.classList.add("dark");
      // set theme in localstorage to 'dark'
      localStorage.setItem("theme", "dark");
    }

    setTheme(localStorage.getItem("theme") === "dark");
  };

  const openUserMenu = () => setUserMenu(true);
  const closeUserMenu = () => setUserMenu(false);

  const ref = useOutsideClick(closeUserMenu);

  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setTheme(localStorage.getItem("theme") === "dark");
  }, []);

  return (
    <header className="sticky top-0 left-0 z-[999] shadow-lg w-full flex items-center justify-between px-6 py-4 sm:px-8 md:px-12 lg:px-20 xl:px-24 dark:text-white dark:bg-dark-navy-blue text-arsenic bg-white">
      <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl flex items-center justify-between">
        <div className="w-full flex gap-4 items-center">
          {/* WeBlog Logo */}
          <button
            onClick={handleToggleMenu}
            className="flex items-center justify-center lg:hidden text-3xl"
          >
            <span className="icon-[ci--hamburger-md]"></span>
          </button>
          <Link to={"/"} className="text-2xl md:text-3xl font-bold">
            WeBlog
          </Link>
          <div className="hidden sm:block w-full max-w-[240px] md:max-w-[340px] xl:max-w-[384px]">
            <SearchBar />
          </div>
        </div>
      </div>
      <div
        className={`fixed z-50 top-0 left-0 w-screen h-screen ${
          showMenu ? "" : "translate-x-full"
        } lg:hidden px-6 py-4 dark:text-white dark:bg-dark-navy-blue text-arsenic bg-white transition duration-300 ease-linear`}
      >
        <button
          onClick={handleToggleMenu}
          className="absolute top-0 right-0 p-4 flex items-center justify-center lg:hidden text-3xl"
        >
          <span className="icon-[material-symbols--close]"></span>
        </button>
        {/* WeBlog Menu */}
        <div className="w-full px-4 py-12 ">
          <SearchBar />
          {user ? (
          <>
            <Link
              to={"/dashboard/create_post"}
              className="hidden lg:block px-4 py-2 hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic transition-colors duration-200 ease-in-out font-medium rounded-xl border border-arsenic"
            >
              Create Post
            </Link>
          </>
        ) : (
          <>
            <Link
              to={"/signup"}
              className="hidden lg:block mt-1 px-4 py-2 hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic transition-colors duration-200 ease-in-out font-medium rounded-xl border border-arsenic"
            >
              Signup
            </Link>
            <Link
              to={"/login"}
              className="hidden lg:block mt-1 px-4 py-2 hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic transition-colors duration-200 ease-in-out font-medium rounded-xl border border-arsenic"
            >
              Login
            </Link>
          </>
        )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              to={"/dashboard/create_post"}
              className="hidden lg:block px-4 py-2 hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic transition-colors duration-200 ease-in-out font-medium rounded-xl border border-arsenic"
            >
              Create Post
            </Link>
            <div onClick={openUserMenu} className="">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="user avatar"
                  className="w-10 md:w-12 h-10 md:h-12 rounded-full cursor-pointer"
                />
              ) : (
                <p className="w-10 flex items-center justify-center md:w-12 h-10 md:h-12 p-2 md:p-3 font-semibold bg-arsenic dark:bg-white text-white dark:text-arsenic rounded-full cursor-pointer">
                  {`${user.first_name[0]}${user.last_name[0]}`}
                </p>
              )}
              {/* User Dropdown */}
              {showUserMenu ? (
                <div
                  onClick={closeUserMenu}
                  ref={ref}
                  className="min-w-60 z-50 grid gap-2 absolute top-[80px] md:top-[88px] right-4 p-4 bg-white dark:bg-dark-navy-blue/75 rounded-xl shadow-lg"
                >
                  <div className="w-full">
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div className="w-full h-[2px] bg-arsenic/50 dark:bg-white/50"></div>
                  <div className="w-full">
                    <Link to={"/dashboard"} className="block p-1 ">
                      Dashboard
                    </Link>
                    <Link to={"/dashboard/create_post"} className="block p-1 ">
                      Create Post
                    </Link>
                    <Link to={"/dashboard/my_bookmarks"} className="block p-1 ">
                      Bookmarks
                    </Link>
                  </div>
                  <div className="w-full h-[2px] bg-arsenic/50 dark:bg-white/50"></div>
                  <div
                    onClick={async () => {
                      const data = await logout();
                      const response = await data.json();
                      setMenu(false);
                      toast(response.message);
                      setUser(null);
                      localStorage.removeItem('user');
                      navigate("/");
                    }}
                    className="block p-1 cursor-pointer"
                  >
                    Log Out
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <Link
              to={"/signup"}
              className="hidden lg:block mt-1 px-4 py-2 hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic transition-colors duration-200 ease-in-out font-medium rounded-xl border border-arsenic"
            >
              Signup
            </Link>
            <Link
              to={"/login"}
              className="hidden lg:block mt-1 px-4 py-2 hover:bg-arsenic hover:text-white dark:hover:bg-white dark:hover:text-arsenic transition-colors duration-200 ease-in-out font-medium rounded-xl border border-arsenic"
            >
              Login
            </Link>
          </>
        )}
        <button
          onClick={handleToggleTheme}
          className="flex text-arsenic dark:text-white items-center justify-center text-xl md:text-2xl"
        >
          {darkTheme ? (
            <span className="icon-[bxs--sun]"></span>
          ) : (
            <span className="icon-[solar--moon-bold]"></span>
          )}
        </button>
      </div>
    </header>
  );
}
