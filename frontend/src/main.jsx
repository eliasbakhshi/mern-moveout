import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./main.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserRoutes from "./pages/user/UserRoutes";
import Profile from "./pages/user/Profile.jsx";
import Items from "./pages/user/Items.jsx";
import Boxes from "./pages/user/Boxes.jsx";
import Labels from "./pages/user/Labels.jsx";
import AdminRoutes from "./pages/admin/AdminRoutes";
import Users from "./pages/admin/Users.jsx";
import Error404 from "./pages/Error404.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import SendVerificationEmail from "./pages/auth/sendVerificationEmail.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Contact from "./pages/Contact.jsx";
import BoxDetails from "./pages/BoxDetails.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import DeleteAccount from "./pages/user/DeleteAccount.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";


// TODO: Add a loading page then user is navigating between pages
// TODO: Add ResetPassword page
// TODO: use the same template for showing the message in the confirm email and reset password page






const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="" element={<App />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-email/:token" element={<VerifyEmail />} />
      <Route
        path="send-verification-email"
        element={<SendVerificationEmail />}
      />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />
      <Route path="boxes/:boxId" element={<BoxDetails />} />
      <Route path="contact" element={<Contact />} />
      <Route path="delete-account/:token" element={<DeleteAccount />} />

      {/* Registered users */}
      <Route element={<UserRoutes />}>
        <Route path="profile" element={<Profile />} />
        <Route path="boxes" element={<Boxes />} />
        <Route path="boxes/:boxId/items" element={<Items />} />
        <Route path="labels/:labelId" element={<Labels />} />
      </Route>

      <Route path="admin" element={<AdminRoutes />}>
        <Route path="" element={<Users />} />
        <Route path="users" element={<Users />} />
      </Route>

      <Route path="*" element={<Error404 />} />
    </Route>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
