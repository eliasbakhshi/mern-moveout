import { useRef, useEffect } from "react";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useSelector } from "react-redux";
import Button from "../../components/Button";

function Register() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const navigate = useNavigate();
  const { search } = useLocation();

  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo?.role) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const registerHandler = async (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    }

    try {
      const registered = await register({ name, email, password }).unwrap();
      // Handle successful register
      if (registered) {
        toast.success("Registration successful. Check your email to verify.");
        e.target.reset();
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  return (
    <section className="flex flex-grow w-full">
      <form
        onSubmit={registerHandler}
        className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
      >
        <h2 className="mb-4 text-2xl font-bold">Register</h2>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          required
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2"
          ref={nameRef}
        />
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
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          required
          minLength={6}
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2"
          ref={confirmPasswordRef}
        />
        <Button disabled={registerLoading}>
          {registerLoading && <Spinner />}
          Register
        </Button>
      </form>
      <div className="right-0 top-0 hidden w-[60%] items-center justify-center bg-[url('/img/login-bg.jpg')] bg-cover bg-center bg-no-repeat md:block"></div>
    </section>
  );
}

export default Register;
