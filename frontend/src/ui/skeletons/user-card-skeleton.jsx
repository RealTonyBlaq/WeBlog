export default function UserCardSkeleton() {
    return (<div  className="w-full grid grid-cols-[1fr_4fr] md:grid-cols-[1fr_4fr_6fr_1fr_1.5fr] items-center gap-2 md:gap-3 bg-white animate-pulse dark:bg-gunmetal p-2 md:p-4 rounded-md shadow">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 dark:bg-eerie-black" />
        <p className="hidden md:block bg-slate-200 dark:bg-eerie-black h-6"></p>
        <p className="bg-slate-200 dark:bg-eerie-black h-6"></p>
        <p className="hidden md:block bg-slate-200 dark:bg-eerie-black h-6"></p>
        <p className="hidden md:block bg-slate-200 dark:bg-eerie-black h-6"></p>
      </div>)
}