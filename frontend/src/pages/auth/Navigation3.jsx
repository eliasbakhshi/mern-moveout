import { useState, useEffect } from "react";
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


  const submitHandler = async (e) => {
    e.preventDefault();
    let credentials = { email, password };
    try {
      await login(credentials).unwrap();
      // Handle successful login
      dispatch(setCredentials(credentials));
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

  const logoutHandler = async (e) => {
    e.preventDefault();
    try {
      await logout().unwrap();
      dispatch(removeCredentials());
      // Handle successful login
    } catch (err) {
      toast.error(err?.data?.error || err.message);
    }
  };

  return (
    <div>
      <section className="flex flex-wrap pl-[10rem]">
        <div className="mr-[4rem] mt-[5rem]">
          <h1 className="mb-4 text-2xl font-semibold">Sign In</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-[20rem] border-b-2 border-[#1877f2]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-[20rem] border-b-2 border-[#1877f2]"
          />
          <button
            onClick={submitHandler}
            className="mb-4 rounded-lg bg-[#1877f2] px-4 py-2 text-white"
          >
            Sign in
          </button>
          <p>
            {userInfo ? (
              <Link to="/profile">Go to profile</Link>
            ) : (
              <Link to="/register">Sign up</Link>
            )}
          </p>
        </div>

        <div className="mt-[5rem]">
          <h1 className="mb-4 text-2xl font-semibold">Sign up</h1>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-[20rem] border-b-2 border-[#1877f2]"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-[20rem] border-b-2 border-[#1877f2]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-[20rem] border-b-2 border-[#1877f2]"
          />

          <button
            className="mb-4 rounded-lg bg-[#1877f2] px-4 py-2 text-white"
            onClick={registerHandler}
          >
            Sign up
          </button>
          <button
            className="mb-4 rounded-lg bg-[#1877f2] px-4 py-2 text-white"
            onClick={logoutHandler}
          >
            Logout
          </button>
        </div>

        {/* <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80"
          alt=""
          className="h-[65rem] w-[59%] xl:block md:hidden sm:hidden rounded-lg"
        /> */}
      </section>
    </div>
  );
};

export default Login;
