import { Outlet } from "react-router-dom";
import Footer from "./footer";
import Header from "./header";

export default function GeneralLayout() {
  return (
    <>
      <Header />
      <main className="w-full min-h-[calc(100vh-128px)] sm:min-h-[calc(100vh-144px)] md:min-h-[calc(100vh-150px)] bg-lightGray dark:bg-eerie-black">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
