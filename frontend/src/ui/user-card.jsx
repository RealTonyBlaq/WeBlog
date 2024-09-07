import { Link } from "react-router-dom";
import Avatar from "./avatar";

export default function UserCard({ user }) {
    console.log(user);
    
  return (
    <Link to={""} className="w-full grid grid-cols-[1fr_4fr_6fr_1fr_1.5fr] items-center gap-2 md:gap-3 bg-white hover:bg-slate-100 dark:bg-dark-navy-blue dark:hover:bg-black p-2 md:p-4 rounded-md shadow">
      <Avatar author={user} />
      <p className="font-medium">{user.first_name + " " + user.last_name}</p>
      <p>{user.email}</p>
      <p>{user.is_admin ? 'True': 'False'}</p>
      <p>{user.is_email_verified ? 'True': 'False'}</p>
    </Link>
  );
}
