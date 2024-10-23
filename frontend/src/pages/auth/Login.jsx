import { useRef, useEffect, useState } from "react";
import {
  useLoginMutation,
  useGetUserFromGoogleQuery,
  useLoginWithGoogleMutation,
} from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../components/Loading";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LinkButton from "../../components/LinkButton";
import ReCAPTCHA from "react-google-recaptcha";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { skipToken } from "@reduxjs/toolkit/query";
import { FcGoogle } from "react-icons/fc";

// TODO: Make a focus for login button when the user press enter

function Login() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const rememberRef = useRef(null);
  const reCaptchaRef = useRef(null);

  const [verify, setVerify] = useState(false);
  const [token, setToken] = useState();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [loginWithGoogle, { isLoading: loginWithGoogleLoading }] =
    useLoginWithGoogleMutation();
  const { data: getUserFromGoogle, isLoading: getUserFromGoogleLoading } =
    useGetUserFromGoogleQuery(token || skipToken);

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
    const reCaptcha = reCaptchaRef.current.getValue();

    if (!reCaptcha) {
      return toast.error("Please verify you are not a robot");
    }

    try {
      const user = await login({ email, password, remember }).unwrap();
      // Handle successful login
      dispatch(setCredentials({ user, remember }));
      navigate("/");
    } catch (err) {
      if (err?.data?.message.includes("verify")) {
        setVerify(true);
        return toast.error("Verify your email first to login");
      } else {
        return toast.error(
          err?.data?.message ||
            "An error occurred. Please contact the administration.",
        );
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (res) => setToken(res),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    const loginWithGoogleAsync = async () => {
      if (getUserFromGoogle) {
        try {
          const { data: user, error } =
            await loginWithGoogle(getUserFromGoogle);
          if (error) {
            return toast.error(error?.data?.message);
          }
          dispatch(setCredentials({ user }));
          navigate("/");
        } catch (err) {
          return toast.error(
            err?.data?.message || "Failed to login with Google.",
          );
        }
      }
    };

    loginWithGoogleAsync();
  }, [getUserFromGoogle]);

  loginLoading && <Loading />;

  return (
    <section className="flex w-full flex-grow">
      <form
        onSubmit={loginHandler}
        className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
      >
        <h2 className="mb-4 text-2xl font-bold">Login</h2>
        <label htmlFor="email">Email</label>
        <Input
          type="email"
          id="email"
          required
          extraClasses="mb-3"
          ref={emailRef}
        />
        <label htmlFor="password">Password</label>
        <Input
          type="password"
          id="password"
          required
          minLength="6"
          maxLength="100"
          pattern="[a-zA-Z0-9]*"
          title="Password must be 6 - 100 characters long and contain only alphanumeric characters."
          placeholder="6 - 100 alphanumeric"
          extraClasses="mb-3"
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
          <Link to="/reset-password" className="text-blue-500">
            Reset password
          </Link>
        </div>

        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          className="mt-3"
          ref={reCaptchaRef}
        />
        <Button disabled={loginLoading} extraClasses="mt-auto">
          {loginLoading && <Spinner />}
          Login
        </Button>
        {verify && (
          <LinkButton href="/send-verification-email" extraClasses="mt-5">
            Verify email
          </LinkButton>
        )}
        <Button
          onClick={googleLogin}
          disabled={getUserFromGoogleLoading || loginWithGoogleLoading}
          extraClasses="mt-3 flex justify-center items-center"
        >
          {getUserFromGoogleLoading || (loginWithGoogleLoading && <Spinner />)}
          <FcGoogle className="mr-3" />
          Login with google
        </Button>
        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Register{" "}
          </Link>
        </p>
      </form>
      <div className="right-0 top-0 hidden w-[60%] items-center justify-center bg-[url('/img/login-bg.jpg')] bg-cover bg-center bg-no-repeat md:block"></div>
    </section>
  );
}

export default Login;
