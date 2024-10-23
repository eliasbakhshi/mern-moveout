import { useRef, useEffect, useState } from "react";
import {
  useRegisterMutation,
  useGetUserFromGoogleQuery,
  useRegisterWithGoogleMutation,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ReCAPTCHA from "react-google-recaptcha";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { skipToken } from "@reduxjs/toolkit/query";
import { FcGoogle } from "react-icons/fc";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { Link } from "react-router-dom";

// TODO: Make a focus for register button when the user press enter
// Add reCaptcha to prevent bots from registering and login and contact form submission
//

function Register() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const reCaptchaRef = useRef(null);
  const [token, setToken] = useState();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();

  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [registerWithGoogle, { isLoading: registerWithGoogleLoading }] =
    useRegisterWithGoogleMutation();
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
  useEffect(() => {
    const registerWithGoogleAsync = async () => {
      if (getUserFromGoogle) {
        try {
          const { data: user, error } =
            await registerWithGoogle(getUserFromGoogle);
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

    registerWithGoogleAsync();
  }, [getUserFromGoogle]);

  const googleRegister = useGoogleLogin({
    onSuccess: (res) => setToken(res),
    onError: (error) => console.log("Login Failed:", error),
  });

  const registerHandler = async (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    const reCaptcha = reCaptchaRef.current.getValue();

    if (!reCaptcha) {
      return toast.error("Please verify you are not a robot");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const registered = await register({
        name,
        email,
        password,
        confirmPassword,
      }).unwrap();
      // Handle successful register
      if (registered) {
        e.target.reset();
        navigate("/login");
        return toast.success(
          "Registration successful. Check your email to verify.",
        );
      }
    } catch (err) {
      return toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  return (
    <section className="flex w-full flex-grow">
      <form
        onSubmit={registerHandler}
        className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
      >
        <h2 className="mb-4 text-2xl font-bold">Register</h2>
        <label htmlFor="name">Name</label>
        <Input
          type="text"
          id="name"
          required
          extraClasses="mb-3"
          ref={nameRef}
        />
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
          extraClasses="mb-3"
          ref={passwordRef}
          minLength="6"
          maxLength="100"
          pattern="[a-zA-Z0-9]*"
          title="Password must be 6 - 100 characters long and contain only alphanumeric characters."
          placeholder="6 - 100 characters and alphanumeric"
        />
        <label htmlFor="confirmPassword">Confirm Password</label>
        <Input
          type="password"
          id="confirmPassword"
          required
          extraClasses="mb-3"
          ref={confirmPasswordRef}
          minLength="6"
          maxLength="100"
          pattern="[a-zA-Z0-9]*"
          title="Password must be 6 - 100 characters long and contain only alphanumeric characters."
          placeholder="6 - 100 alphanumeric"
        />
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          className="mt-3"
          ref={reCaptchaRef}
        />

        <Button disabled={registerLoading} extraClasses={"mt-auto"}>
          {registerLoading ? <Spinner /> : ""}Register
        </Button>
        <Button
          onClick={googleRegister}
          disabled={getUserFromGoogleLoading || registerWithGoogleLoading}
          extraClasses="mt-3 flex justify-center items-center"
        >
          {getUserFromGoogleLoading ||
            (registerWithGoogleLoading && <Spinner />)}
          <FcGoogle className="mr-3" />
          Register with Google
        </Button>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </form>
      <div className="right-0 top-0 hidden w-[60%] items-center justify-center bg-[url('/img/login-bg.jpg')] bg-cover bg-center bg-no-repeat md:block"></div>
    </section>
  );
}

export default Register;
