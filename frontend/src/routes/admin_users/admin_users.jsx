import { useEffect, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import { fetchUsers } from "../../api/users";
import UserCard from "../../ui/user-card";
import { useOutsideClick } from "../../lib/useOutsideClick";

export default function AdminUsersPage() {
  const [usersData, setusersData] = useState({
    data: [],
    page: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("id");
  const [isLoading, setLoading] = useState(false);
  const [showSearchByList, setShowSearchByList] = useState(false);

  const searchByList = ["id", "name", "email"];

  const handleChange = (e) => setSearch(e.target.value);

  const handleSearchByChange = (value) => setSearchBy(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchUsers(1, search, searchBy);
      if (response) {
        setusersData((prev) => ({
          ...prev,
          data: response.data.users,
          totalPages: response.data.total_pages,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShowSearchByList = () => setShowSearchByList(true);
  const handleHideSearchByList = () => setShowSearchByList(false);

  const ref = useOutsideClick(handleHideSearchByList);

  const handlePage = (number) => {
    if (number < 0) {
      if (usersData.page + number >= 1) {
        setusersData((prev) => ({ ...prev, page: prev.page + number }));
      }
    } else {
      if (usersData.page < usersData.totalPages) {
        setusersData((prev) => ({ ...prev, page: prev.page + number }));
      }
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await fetchUsers(usersData.page, search);
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
    })();
  }, [usersData.page]);

  console.log(usersData.data.length);
  

  if (!usersData.data.length && !search)
    return (
      <div className="w-full h-full p-4 md:px-6 dark:text-white rounded-md shadow">
        <h1 className="font-medium text-xl md:text-2xl xl:text-3xl">Users</h1>
        <div className="w-full h-56 flex items-center justify-center">
          <p>There are currently no users.</p>
        </div>
      </div>
    );

  return (
    <div className="w-full p-4 md:px-6 dark:text-white">
      <h1 className="font-medium text-xl md:text-2xl xl:text-3xl">Users</h1>
      <div className="w-full flex items-center justify-between">
        <form className="relative w-full max-w-md">
          <input
            id="search_users"
            name="search_users"
            type="text"
            value={search}
            onChange={handleChange}
            placeholder="Search for users..."
            className="w-full px-4 py-2 text-sm outline-none rounded-lg md:rounded-xl dark:bg-dark-navy-blue/50 dark:text-white shadow"
          />
          <button
            onClick={handleSubmit}
            aria-label="search button"
            type="submit"
            className="absolute top-1 sm:top-0 right-0 py-2 pr-4 text-lg text-arsenic hover:text-blue-500 dark:text-white"
          >
            <span className="icon-[material-symbols--search]"></span>
          </button>
        </form>
        <div className="relative flex items-center gap-2 md:gap-4">
          <p
            onClick={handleShowSearchByList}
            className="w-40 bg-white dark:bg-dark-navy-blue px-4 py-2 shadow cursor-pointer font-semibold flex items-center justify-between rounded-xl capitalize"
          >
            By {searchBy}
            <span className="icon-[fluent--arrow-bidirectional-up-down-12-filled]"></span>
          </p>
          <ul
            ref={ref}
            className={`w-40 ${
              showSearchByList ? "absolute -bottom-[128px] left-0 z-10" : "hidden"
            } p-2 md:p-3 bg-slate-50 dark:bg-dark-navy-blue shadow rounded-lg`}
          >
            {searchByList.map((option) => (
              <li
                key={option}
                onClick={() => {
                  handleSearchByChange(option);
                  handleHideSearchByList()
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
      <div className="w-full p-2 md:p-3">
        {isLoading ? (
          <div className="w-full h-56 md:h-72 flex items-center justify-center">
            <ThreeCircles
              visible={true}
              height="100"
              width="100"
              color="#3b82f6"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        ) : (
          <>
            {!usersData.data.length && search ? (
              <div className="w-full h-56 flex items-center justify-center">
                <p>There are currently no users matching your search.</p>
              </div>
            ) : (
              <div className="w-full flex items-center flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="w-full uppercase grid grid-cols-[1fr_4fr_6fr_1fr_1.5fr] items-center gap-2 md:gap-3 bg-white dark:bg-dark-navy-blue p-2 md:p-4 rounded-md shadow">
                  <div className="w-10 md:w-12"></div>
                  <p className="font-semibold">Name</p>
                  <p className="font-semibold">Email</p>
                  <p className="font-semibold">Admin</p>
                  <p className="font-semibold">Verified</p>
                </div>
                {usersData.data.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </>
        )}
        <div className="w-full flex items-center justify-center gap-2 md:gap-4">
          {usersData.page - 2 > 0 && (
            <button
              onClick={() => handlePage(-2)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {usersData.page - 2}
            </button>
          )}
          {usersData.page - 1 > 0 && (
            <button
              onClick={() => handlePage(-1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {usersData.page - 1}
            </button>
          )}
          <p className="font-bold">{usersData.page}</p>
          {usersData.page + 1 <= usersData.totalPages && (
            <button
              onClick={() => handlePage(1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {usersData.page + 1}
            </button>
          )}
          {usersData.page + 2 <= usersData.totalPages && (
            <button
              onClick={() => handlePage(1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {usersData.page + 2}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
