import { Outlet } from "react-router-dom";
import Navigation from "./pages/auth/Navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function App() {
  return (
    <>
      <ToastContainer />
      <Navigation />
      <main className="mt-[3.75rem] flex h-full flex-grow flex-col items-center md:mt-[3.5rem]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
export default App;
