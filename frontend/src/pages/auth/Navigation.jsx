"use client";

import { useState, useEffect } from "react";
import { Avatar, Button, Dropdown, Navbar, NavbarLink } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import Loader from "../../components/Loader";
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} from "../../redux/api/usersApiSlice";
import {
  setCredentials,
  removeCredentials,
} from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { FaRegHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { PiSignOut,PiSignIn } from "react-icons/pi";
import { BsCartCheckFill, BsPersonPlus  } from "react-icons/bs";

const Login = () => {
  const [name, setName] = useState("222222");
  const [email, setEmail] = useState("222222@gmail.com");
  const [password, setPassword] = useState("222222");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  if (loginLoading || registerLoading || logoutLoading) {
    return <div>Loading...</div>;
  }

  const loginHandler = async () => {
    let credentials = { email, password };
    try {
      const res = await login(credentials).unwrap();
      // Handle successful login
      dispatch(setCredentials(res));
    } catch (err) {
      toast.error(err.data.error);
    }
  };

  const registerHandler = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password }).unwrap();
      // Handle successful login
    } catch (err) {
      toast.error(err.data.error);
    }
  };

  const logoutHandler = async () => {
    try {
      await logout().unwrap();
      dispatch(removeCredentials());
      // Handle successful login
    } catch (err) {
      toast.error(err?.data?.error || err.message);
    }
  };

  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="https://flowbite-react.com">
        <img
          src="/logo.png"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite React Logo"
        />
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
        {userInfo ? (
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
              <Dropdown.Item>
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
              <Dropdown.Item>
                <MdDashboard className="mr-2" />
                Dashboard
              </Dropdown.Item>
            )}
            <Dropdown.Item>
              <IoCartOutline className="mr-2" />
              Cart
            </Dropdown.Item>
            <Dropdown.Item>
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
            <Dropdown.Item onClick={loginHandler}><PiSignIn className="mr-2" />Login</Dropdown.Item>
            <Dropdown.Item onClick={loginHandler}><BsPersonPlus className="mr-2" />Register</Dropdown.Item>
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
