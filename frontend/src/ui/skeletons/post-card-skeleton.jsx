export default function PostCardSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-gunmetal animate-pulse rounded-md shadow">
      <div className="w-full h-20 md:h-32 bg-slate-200 dark:bg-eerie-black rounded-t-md" />
      <div className="w-full p-4 md:p-6">
        <div className="w-full flex items-center gap-3 mb-1 md:mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 dark:bg-eerie-black rounded-full" />
          <p className="w-full h-6 text-sm md:text-base font-medium bg-slate-200 dark:bg-eerie-black" />
        </div>
        <div className="w-full">
          <div className="h-8 md:h-12 bg-slate-200 dark:bg-eerie-black" />
        </div>
      </div>
    </div>
  );
}
