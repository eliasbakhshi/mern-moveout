import { useRef, useEffect } from "react";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../Loading";

function ResetPassword() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const loginHandler = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    try {
      const user = await login({ email, password }).unwrap();
      // Handle successful login
      dispatch(setCredentials(user));
      navigate("/");
    } catch (err) {
      return toast.error(err?.data?.message || "An error occurred");
    }
  };

  loginLoading && <Loading />;

  return (
    <section className="flex flex-grow">
      <form
        onSubmit={loginHandler}
        className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
      >
        <h2 className="mb-4 text-2xl font-bold">Reset Password</h2>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          required
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2"
          ref={emailRef}
        />
        <button
          type="submit"
          disabled={loginLoading}
          className="mt-5 w-full rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          {loginLoading && <Spinner />}
          Login
        </button>
      </form>
      <div className="right-0 top-0 hidden w-[60%] items-center justify-center bg-green-100 md:block">
        <img
          src="/img/login-bg.jpg"
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}

export default ResetPassword;
