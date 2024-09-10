import { useState } from "react";
import { Link } from "react-router-dom";
import { handleImageUpload } from "../../api/upload";
import { useAuth } from "../../lib/useAuth";
import { Oval, TailSpin } from "react-loader-spinner";
import { updateProfile } from "../../api/auth";
import toast from "react-hot-toast";

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function MyProfilePage() {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [isLoading, setLoading] = useState(false);

  if (!user)
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <TailSpin
          visible={true}
          height="150"
          width="150"
          color="#4fa94d"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );

    const dateJoined = new Date(user.created_at)

  const handleAvatarChange = async (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <p className="text-lg md:text-xl xl:text-2xl font-semibold pb-2 dark:text-white">
        My Profile
      </p>
      <div className="w-full p-4 lg:p-6 bg-white dark:bg-gunmetal dark:text-white rounded-lg">
        <div className="w-full lg:px-8">
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <div className="relative group w-16 md:w-24 lg:w-28 xl:w-32 h-16 md:h-24 lg:h-28 xl:h-32 mx-auto flex items-center justify-center text-white dark:text-arsenic text-xl md:text-2xl lg:text-3xl xl:text-4xl">
              {/* {`${user.first_name[0]}${user.last_name[0]}`} */}
              {user && user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="user avatar"
                  className="w-full h-full rounded-full"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center p-2 md:p-3 font-semibold bg-arsenic dark:bg-white rounded-full cursor-pointer">
                  UA
                </span>
              )}
              <div className="absolute top-0 left-0 z-10 hidden w-full h-full backdrop-blur-sm dark:text-white rounded-full group-hover:block">
                <label
                  className="w-full h-full flex items-center justify-center cursor-pointer"
                  htmlFor="avatar"
                >
                  <span className="icon-[mdi--photo-camera]"></span>
                  <input
                    name="avatar"
                    id="avatar"
                    type="file"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
          </div>
          {file && file.size < 1048576 ? (
            <section className="w-full mt-1 md:mt-2 flex flex-col items-center justify-center gap-1">
              File details:
              <ul className="flex items-center justify-center gap-2">
                <li className="">
                  Name: <span className="font-medium">{file.name}</span>
                </li>
                <li className="">
                  Type: <span className="font-medium">{file.type}</span>
                </li>
                <li className="">
                  Size: <span className="font-medium">{file.size}</span> bytes
                </li>
              </ul>
              <button
                onClick={async () => {
                  setLoading(true)
                  const data = await handleImageUpload("avatars", file);
                  if (data) {
                    const response = await updateProfile({avatar_url: data.url})
                    if (response) {
                      toast.success(response.message)
                      setUser(response.user)
                      setFile(null)
                    }
                  }
                  setLoading(false)
                }}
                type="button"
                disabled={isLoading}
                className={`w-32 py-2 flex items-center justify-center font-medium bg-blue-700 text-white border border-blue-700 dark:border-0 rounded-lg ${
                  !isLoading && "hover:bg-white hover:text-blue-700"
                }`}
              >
                {isLoading ? (
                  <Oval
                  visible={true}
                  height="16"
                  width="16"
                  color="#ffffff"
                  ariaLabel="oval-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  />
                ) : (
                  "Update Avatar"
                )}
              </button>
            </section>
          ) : file && file.size > 1048576 ? (
            <div className="w-full">
              <p className="w-full text-sm text-center font-medium text-red-500">{`File size is too large ( > 1MB)`}</p>
              <p className="w-full text-sm text-center font-medium text-red-500">
                Please select another file
              </p>
            </div>
          ) : null}
          <div className="w-full grid md:grid-cols-2 gap-2 lg:gap-4 mt-4 md:mt-6">
            <div className="">
              <p className="">First Name</p>
              <p className="font-medium">{user.first_name}</p>
            </div>
            <div className="">
              <p className="">Last Name</p>
              <p className="font-medium">{user.last_name}</p>
            </div>
            <div className="">
              <p className="">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="">
              <p className="">Joined</p>
              <p className="font-medium">{months[dateJoined.getMonth()]} {dateJoined.getFullYear()}</p>
            </div>
            <div className="">
              <p className="">Bio</p>
              <p className="font-medium min-h-10">{user.bio || 'N/A'}</p>
            </div>
          </div>
          <div className="w-full mt-4 md:mt-6 xl:mt-8 flex items-center justify-end gap-1 md:gap-2">
            <Link
              to={"change_password"}
              className={`w-16 md:w-48 py-1 flex items-center justify-center gap-2 font-medium bg-blue-700 text-white border border-blue-700 dark:border-0 rounded-lg hover:bg-white hover:text-blue-700`}
            >
              <span className="icon-[mdi--password-outline]"></span>
              <span className="hidden md:block">Change Password</span>
            </Link>
            <Link
              to={"edit_profile"}
              className={`w-16 md:w-32 py-1 flex items-center justify-center gap-2 font-medium bg-blue-700 text-white border border-blue-700 dark:border-0 rounded-lg hover:bg-white hover:text-blue-700`}
            >
              <span className="icon-[lucide--edit] block"></span>
              <span className="hidden md:block">Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
