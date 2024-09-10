import { useRef, useState } from "react";
import { fetchUsers } from "../../api/users";
import UserCard from "../../ui/user-card";
import { useOutsideClick } from "../../lib/useOutsideClick";
import UserCardSkeleton from "../../ui/skeletons/user-card-skeleton";
import { useLoaderData } from "react-router-dom";

export default function AdminUsersPage() {
  const {
    data: { users, page, total_pages },
  } = useLoaderData();
  const [usersData, setusersData] = useState({
    data: users,
    page: Number(page),
    totalPages: Number(total_pages),
  });
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("id");
  const [isLoading, setLoading] = useState(false);
  const [showSearchByList, setShowSearchByList] = useState(false);

  const searchByList = ["id", "name", "email"];

  const hasSearched = useRef(false);

  const handleChange = async (e) => {
    setSearch(e.target.value);
    // if search is true but the input element is empty,
    // trigger a fetch if the user had made a search
    if (search && e.target.value === "" && hasSearched.current) {
      hasSearched.current = false;
      const response = await fetchUsers(1, "", searchBy);
      if (response) {
        setusersData((prev) => ({
          ...prev,
          data: response.data.users,
          page: Number(response.data.page),
          totalPages: Number(response.data.total_pages),
        }));
      }
    }
  };

  const handleSearchByChange = (value) => setSearchBy(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchUsers(1, search, searchBy);
      if (response) {
        hasSearched.current = true;
        setusersData((prev) => ({
          ...prev,
          data: response.data.users,
          page: Number(response.data.page),
          totalPages: Number(response.data.total_pages),
        }));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleShowSearchByList = () => setShowSearchByList(true);
  const handleHideSearchByList = () => setShowSearchByList(false);

  const ref = useOutsideClick(handleHideSearchByList);

  const handlePage = async (number) => {
    if (number < 0) {
      if (usersData.page + number >= 1) {
        setLoading(true);
        try {
          const response = await fetchUsers(usersData.page + number, search);
          if (response) {
            setusersData((prev) => ({
              ...prev,
              data: response.data.users,
              page: Number(response.data.page),
              totalPages: Number(response.data.total_pages),
            }));
          }
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
      }
    } else {
      if (usersData.page < usersData.totalPages) {
        setLoading(true);
        try {
          const response = await fetchUsers(usersData.page + number, search);
          if (response) {
            setusersData((prev) => ({
              ...prev,
              data: response.data.users,
              page: Number(response.data.page),
              totalPages: Number(response.data.total_pages),
            }));
          }
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
      }
    }
  };

  if (!usersData.data.length && !search && !isLoading)
    return (
      <div className="w-full h-full md:py-4 md:px-6 dark:text-white">
        <h1 className="font-medium text-xl md:text-2xl xl:text-3xl">Users</h1>
        <div className="w-full h-56 flex items-center justify-center">
          <p>There are currently no users.</p>
        </div>
      </div>
    );

  return (
    <div className="w-full md:py-4 md:px-6 dark:text-white">
      <h1 className="font-medium text-xl md:text-2xl xl:text-3xl">Users</h1>
      <div className="w-full flex items-center justify-between gap-1">
        <form className="relative w-full max-w-md">
          <input
            id="search_users"
            name="search_users"
            type="text"
            value={search}
            onChange={handleChange}
            placeholder="Search for users..."
            className="w-full px-2 py-1 md:px-4 md:py-2 text-sm outline-none rounded md:rounded-xl dark:bg-dark-navy-blue/50 dark:text-white shadow"
          />
          <button
            onClick={handleSubmit}
            aria-label="search button"
            type="submit"
            className="absolute top-1 sm:top-0 right-0 md:py-2 pr-1 md:pr-4 text-lg text-arsenic hover:text-blue-500 dark:text-white"
          >
            <span className="icon-[material-symbols--search]"></span>
          </button>
        </form>
        <div className="relative flex items-center gap-2 md:gap-4">
          <p
            onClick={handleShowSearchByList}
            className="w-20 md:w-40 text-sm bg-white dark:bg-dark-navy-blue px-2 py-1 md:px-4 md:py-2 shadow cursor-pointer font-semibold flex items-center justify-between rounded md:rounded-xl capitalize"
          >
            By {searchBy}
            <span className="icon-[fluent--arrow-bidirectional-up-down-12-filled]"></span>
          </p>
          <ul
            ref={ref}
            className={`w-20 md:w-40 ${
              showSearchByList
                ? "absolute -bottom-[128px] left-0 z-10"
                : "hidden"
            } p-2 md:p-3 bg-slate-50 dark:bg-dark-navy-blue shadow rounded md:rounded-lg`}
          >
            {searchByList.map((option) => (
              <li
                key={option}
                onClick={() => {
                  handleSearchByChange(option);
                  handleHideSearchByList();
                }}
                className="flex items-center justify-between cursor-pointer font-medium py-1 px-2 hover:bg-arsenic hover:text-white rounded capitalize"
              >
                {option}{" "}
                {option === searchBy ? (
                  <span className="icon-[charm--tick-double]"></span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full py-2 md:p-3">
        {isLoading ? (
          <div className="w-full flex items-center flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {!usersData.data.length && search ? (
              <div className="w-full h-56 flex items-center justify-center">
                <p>There are currently no users matching your search.</p>
              </div>
            ) : (
              <div className="w-full flex items-center flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="w-full uppercase grid md:grid-cols-[1fr_4fr_6fr_1fr_1.5fr] items-center gap-2 md:gap-3 bg-white dark:bg-dark-navy-blue px-3 py-2 md:px-4 md:py-3 rounded-md shadow">
                  <div className="hidden md:block w-10 md:w-12"></div>
                  <p className="hidden md:block font-semibold">Name</p>
                  <p className="font-semibold">Email</p>
                  <p className="hidden md:block font-semibold">Admin</p>
                  <p className="hidden md:block font-semibold">Verified</p>
                </div>
                {usersData.data.map((user) => (
                  <UserCard key={user.id} user={user} />
                  // <UserCardSkeleton key={user.id} />
                ))}
              </div>
            )}
          </>
        )}
        <div className="w-full flex items-center justify-center gap-2 md:gap-4">
          {usersData.page - 2 > 0 && (
            <button
              onClick={() => handlePage(-2)}
              className="flex items-center py-2 px-3 rounded font-medium bg-white dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {usersData.page - 2}
            </button>
          )}
          {usersData.page - 1 > 0 && (
            <button
              onClick={() => handlePage(-1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-white dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {usersData.page - 1}
            </button>
          )}
          <p className="font-bold py-2 px-3 rounded bg-arsenic text-white dark:bg-white dark:text-black">
            {usersData.page}
          </p>
          {usersData.page + 1 <= usersData.totalPages && (
            <button
              onClick={() => handlePage(1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-white dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {usersData.page + 1}
            </button>
          )}
          {usersData.page + 2 <= usersData.totalPages && (
            <button
              onClick={() => handlePage(1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-white dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {usersData.page + 2}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
