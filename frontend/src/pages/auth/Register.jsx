import { useRef, useEffect } from "react";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useSelector } from "react-redux";
import Button from "../../components/Button";
import Input from "../../components/Input";

// TODO: Make a focus for register button when the user press enter
// Add reCaptcha to prevent bots from registering and login and contact form submission

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
      console.log(err);

      toast.error(
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
          minLength={6}
          extraClasses="mb-3"
          ref={passwordRef}
          placeholder="At least 6 characters"
        />
        <label htmlFor="confirmPassword">Confirm Password</label>
        <Input
          type="password"
          id="confirmPassword"
          required
          minLength={6}
          extraClasses="mb-3"
          ref={confirmPasswordRef}
          placeholder="At least 6 characters"
        />
        <Button disabled={registerLoading} extraClasses={"mt-5"}>
          {registerLoading && <Spinner />}
          Register
        </Button>
      </form>
      <div className="right-0 top-0 hidden w-[60%] items-center justify-center bg-[url('/img/login-bg.jpg')] bg-cover bg-center bg-no-repeat md:block"></div>
    </section>
  );
}

export default Register;
