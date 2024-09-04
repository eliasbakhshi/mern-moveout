import { Outlet } from "react-router-dom";
import Navigation from "./pages/auth/Navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";

function App() {
    return (
        <>
            <ToastContainer />
            <Navigation />
            <main className='flex flex-col m-0 p-0 mt-[3.75rem] md:mt-[3.5rem] min-h-[calc(100vh-3.75rem)] md:min-h-[calc(100vh-3.5rem)]'>
                <Outlet />
                <Footer />
            </main>

        </>
    );
}

export default App;
