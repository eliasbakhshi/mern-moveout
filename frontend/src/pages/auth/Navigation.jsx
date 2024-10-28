"use client";

import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
// import Loader from "../../components/Loader";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { removeCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { MdDashboard } from "react-icons/md";
import { PiSignOut, PiSignIn } from "react-icons/pi";
import { BsPersonPlus } from "react-icons/bs";
import Loading from "../../components/Loading";
import { Link, useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

  let { userInfo } = useSelector((state) => state.auth);

  const logoutHandler = async () => {
    try {
      await logout().unwrap();
      dispatch(removeCredentials());
      navigate("/login");
    } catch (err) {
      return toast.error(err?.data?.message || err.message);
    }
  };

  if (!userInfo?.mediaPath?.includes("googleusercontent")) {
    if (userInfo?.mediaPath) {
      userInfo = {
        ...userInfo,
        mediaPath: userInfo.mediaPath.includes("googleusercontent")
          ? userInfo.mediaPath
          : `/api${userInfo.mediaPath}`,
      };
    } else {
      userInfo = { ...userInfo, mediaPath: "/img/avatar.png" };
    }
  }

  logoutLoading && <Loading />;

  return (
    <Navbar fluid className="fixed left-0 top-0 z-50 w-full">
      <Navbar.Brand
        onClick={() => navigate("/")}
        className="hover:cursor-pointer"
      >
        <img src="/logo.png" className="mr-3 h-6 sm:h-9" alt="Moveout" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Moveout
        </span>
      </Navbar.Brand>
      <div className="flex gap-3 md:order-2">
        {userInfo && userInfo.role ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                img={userInfo.mediaPath ? `${userInfo.mediaPath}` : ""}
                alt="User"
                rounded
                size="sm"
                color="red"
                status=""
              />
            }
          >
            <Dropdown.Item onClick={() => navigate("/profile")}>
              <Avatar
                img={userInfo.mediaPath ? `${userInfo.mediaPath}` : ""}
                alt="User"
                rounded
                color="red"
                size="xs"
                className="mr-2"
              />
              {userInfo.name}
            </Dropdown.Item>
            <Dropdown.Divider />
            {userInfo.role == "admin" && (
              <Dropdown.Item href="admin" onClick={() => navigate("/admin")}>
                <MdDashboard className="mr-2" />
                Dashboard
              </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={logoutHandler}>
              <PiSignOut className="mr-2" />
              Sign out
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                className="ml-2"
                alt="User"
                rounded
                size="sm"
                color="red"
                status=""
              />
            }
          >
            <Dropdown.Item onClick={() => navigate("/login")}>
              <PiSignIn className="mr-2" />
              Login
            </Dropdown.Item>

            <Dropdown.Item onClick={() => navigate("/register")}>
              <BsPersonPlus className="mr-2" />
              Register
            </Dropdown.Item>
          </Dropdown>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Link to="/" className="flex items-center py-2 px-3 hover:bg-blue-100 rounded-md transition-all ease-in-out duration-300">
          <IoMdHome className="mr-2"/>
          Home
        </Link>
        <Link to="/contact" className="flex items-center py-2 px-3 hover:bg-blue-100 rounded-md transition-all ease-in-out duration-300">Contact</Link>
        {userInfo.role == "admin" && <Link to="/admin" className="flex items-center py-2 px-3 hover:bg-blue-100 rounded-md transition-all ease-in-out duration-300">Dashboard</Link>}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Login;
