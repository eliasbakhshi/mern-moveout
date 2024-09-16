import { useRef, useEffect, useState } from "react";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../components/Loading";
import Button from "../../components/Button";

function Login() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const rememberRef = useRef(null);
  const [verify, setVerify] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo?.role) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const loginHandler = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const remember = rememberRef.current.checked;
    try {
      const user = await login({ email, password, remember }).unwrap();
      // Handle successful login
      dispatch(setCredentials(user));
      navigate("/");
    } catch (err) {
      if (err?.data?.message.includes("verify")) {
        setVerify(true);
        toast.error("Verify your email first to login");
      } else {
        toast.error(
          err?.data?.message ||
            "An error occurred. Please contact the administration.",
        );
      }
    }
  };

  loginLoading && <Loading />;

  return (
    <section className="flex flex-grow">
      <form
        onSubmit={loginHandler}
        className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
      >
        <h2 className="mb-4 text-2xl font-bold">Login</h2>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          required
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2"
          ref={emailRef}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          required
          minLength={6}
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2"
          ref={passwordRef}
        />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <input
              type="checkbox"
              id="remember"
              className="mr-2 rounded"
              ref={rememberRef}
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          <a href="/reset-password" className="text-blue-500">
            Reset password
          </a>
        </div>
        <Button disabled={loginLoading} extraClasses="mt-5">
          {loginLoading && <Spinner />}
          Login
        </Button>

        {verify && (
          <a
            href="/verify-email"
            className="mt-5 w-full rounded-md bg-blue-500 px-4 py-2 text-center text-white"
          >
            Verify email
          </a>
        )}
      </form>
      <div className="right-0 top-0 hidden w-[60%] items-center justify-center md:block">
        <img
          src="/img/login-bg.jpg"
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}

export default Login;
