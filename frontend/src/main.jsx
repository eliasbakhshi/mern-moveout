import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./main.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserRoutes from "./pages/user/UserRoutes";
import AdminRoutes from "./pages/admin/AdminRoutes";
import Dashboard from "./pages/user/Dashboard.jsx";
import UserList from "./pages/admin/UserList.jsx";
import Error404 from "./pages/Error404.jsx";
import Profile from "./pages/user/Profile.jsx";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/user/Orders.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-email/:token" element={<VerifyEmail />} />
      <Route path="cart" element={<Cart />} />
      <Route path="orders" element={<Orders />} />

      {/* Registered users */}
      <Route element={<UserRoutes />}>
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/admin" element={<AdminRoutes />}>
        <Route path="" element={<Dashboard />} />
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
