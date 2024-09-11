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
import { useNavigate } from "react-router";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

  const { userInfo } = useSelector((state) => state.auth);

  logoutLoading && <Loading />;

  const logoutHandler = async () => {
    try {
      await logout().unwrap();
      dispatch(removeCredentials());
      // Handle successful login
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  // const test = process.env.SITE_NAME;

  return (
    <Navbar fluid className="fixed left-0 top-0 w-full">
      <Navbar.Brand href="/">
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
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="User"
                rounded
                size="sm"
                color="red"
                status=""
              />
            }
          >
            <Dropdown.Item href="/profile">
              <Avatar
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="User"
                rounded
                color="red"
                size="xs"
                className="mr-2"
              />
              Bonnie Green
            </Dropdown.Item>
            <Dropdown.Divider />
            {userInfo.role == "admin" && (
              <Dropdown.Item href="admin">
                <MdDashboard className="mr-2" />
                Dashboard
              </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={logoutHandler}>
              {" "}
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
            <Dropdown.Item href="/login">
              <PiSignIn className="mr-2" />
              Login
            </Dropdown.Item>
            <Dropdown.Item href="/register">
              <BsPersonPlus className="mr-2" />
              Register
            </Dropdown.Item>
          </Dropdown>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="/" active>
          Home
        </Navbar.Link>
        <Navbar.Link href="#">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Login;
