export default function CommentCardSkeleton() {
  return (
    <div className="relative w-full p-4 md:p-6 dark:text-white bg-slate-100 dark:bg-gunmetal rounded-xl shadow">
      <div className="w-full animate-pulse flex items-center gap-1 md:gap-2">
        <div className="w-10 bg-slate-200 dark:bg-eerie-black md:w-12 h-10 md:h-12 rounded-full"></div>
        <div className="w-40 h-10 md:h-12 bg-slate-200 dark:bg-eerie-black"></div>
      </div>
      <p className="w-full h-12 bg-slate-200 dark:bg-eerie-black text-sm mt-4"></p>
    </div>
  );
}
