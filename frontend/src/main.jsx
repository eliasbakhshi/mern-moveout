import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./main.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserRoutes from "./pages/user/UserRoutes";
import AdminRoutes from "./pages/admin/AdminRoutes";
import Dashboard from "./pages/user/Dashboard.jsx";
import UserList from "./pages/admin/UserList.jsx";
import Error404 from "./pages/Error404.jsx";
import Profile from "./pages/user/Profile.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import SendVerificationEmail from "./pages/auth/sendVerificationEmail.jsx";

// TODO: Add a loading page then user is navigating between pages


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-email/:token" element={<VerifyEmail />} />
      <Route path="send-verification-email" element={<SendVerificationEmail />} />

      {/* Registered users */}
      <Route element={<UserRoutes />}>
        <Route path="profile" element={<Profile />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      <Route path="/admin" element={<AdminRoutes />}>
        <Route path="user-list" element={<UserList />} />
      </Route>

      <Route path="*" element={<Error404 />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
