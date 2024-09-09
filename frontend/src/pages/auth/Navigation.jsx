"use client";

import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
// import Loader from "../../components/Loader";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { removeCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { FaRegHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { PiSignOut, PiSignIn } from "react-icons/pi";
import { BsCartCheckFill, BsPersonPlus } from "react-icons/bs";
import Loading from "../Loading";

const Login = () => {
  const dispatch = useDispatch();

  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

  const { userInfo } = useSelector((state) => state.auth);

  logoutLoading && <Loading />;

  const logoutHandler = async () => {
    try {
      await logout().unwrap();
      dispatch(removeCredentials());
      // Handle successful login
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  return (
    <Navbar fluid className="fixed left-0 top-0 w-full">
      <Navbar.Brand href="/">
        <img src="/logo.png" className="mr-3 h-6 sm:h-9" alt="Store" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Store
        </span>
      </Navbar.Brand>
      <div className="flex gap-3 md:order-2">
        <Avatar
          className="ml-2"
          alt="User"
          rounded
          size="sm"
          color="red"
          status=""
          img={() => <IoCartOutline size="1.5rem" />}
        />
        <Avatar
          className="ml-2"
          alt="User"
          rounded
          size="sm"
          color="red"
          status=""
          img={() => <FaRegHeart size="1.5rem" />}
        />
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
            <Dropdown.Item href="cart">
              <IoCartOutline className="mr-2" />
              Cart
            </Dropdown.Item>
            <Dropdown.Item href="orders">
              <BsCartCheckFill className="mr-2" />
              Orders
            </Dropdown.Item>
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
        <Navbar.Link href="#">Men</Navbar.Link>
        <Navbar.Link href="#">Women</Navbar.Link>
        <Navbar.Link href="#">Kids</Navbar.Link>
        <Navbar.Link href="#">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Login;
