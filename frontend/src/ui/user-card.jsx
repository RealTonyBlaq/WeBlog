import { Link } from "react-router-dom";
import Avatar from "./avatar";

export default function UserCard({ user }) {
    
  return (
    <Link to={`/admin/users/${user.id}`} className="w-full grid md:grid-cols-[1fr_4fr_6fr_1fr_1.5fr] items-center gap-2 md:gap-3 bg-white hover:bg-slate-100 dark:bg-dark-navy-blue dark:hover:bg-black px-3 py-2 md:px-4 md:py-3 rounded-md shadow">
      <div className="hidden md:block"><Avatar author={user} /></div>
      <p className="font-medium hidden md:block">{user.first_name + " " + user.last_name}</p>
      <p>{user.email}</p>
      <p className="hidden md:block">{user.is_admin ? 'True': 'False'}</p>
      <p className="hidden md:block">{user.is_email_verified ? 'True': 'False'}</p>
    </Link>
  );
}
