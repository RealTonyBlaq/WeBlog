export default function Avatar({ author }) {
  return (
    <div className="">
      {author.avatar_url ? (
        <img
          src={`/${author.avatar_url}`}
          alt="user avatar"
          className="w-10 md:w-12 h-10 md:h-12 rounded-full cursor-pointer"
        />
      ) : (
        <p className="w-10 md:w-12 h-10 md:h-12 flex items-center justify-center p-2 md:p-3 font-semibold bg-arsenic dark:bg-white text-white dark:text-arsenic rounded-full cursor-pointer">
          {`${author.first_name[0]}${author.last_name[0]}`}
        </p>
      )}
    </div>
  );
}
