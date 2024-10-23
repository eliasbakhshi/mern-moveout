import { useRef, useEffect } from "react";
import {
  useResetPasswordMutation,
  useCheckTokenResetPasswordQuery,
  useSendEmailResetPasswordMutation,
} from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../components/Loading";
import Button from "../../components/Button";
import Input from "../../components/Input";
import MessageBox from "../../components/MessageBox";



function ResetPassword() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useParams();

  const [resetPassword, { isLoading: resetPasswordLoading }] =
    useResetPasswordMutation();
  const [sendEmailResetPassword, { isLoading: sendEmailResetPasswordLoading }] =
    useSendEmailResetPasswordMutation();
  const {
    data: user,
    error,
    isLoading: checkTokenResetPasswordLoading,
  } = useCheckTokenResetPasswordQuery(token);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const sendResetPasswordEmailHandler = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    try {
      const res = await sendEmailResetPassword({ email }).unwrap();
      return toast.success(res.message);
    } catch (err) {
      return toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const ResetPasswordHandler = async (e) => {
    e.preventDefault();
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    try {
      const res = await resetPassword({
        password,
        confirmPassword,
        userId: user.userId,
      }).unwrap();
      navigate("/login");
      return toast.success(res.message);
    } catch (err) {
      return toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  resetPasswordLoading && <Loading />;

  return      token ? (
        checkTokenResetPasswordLoading ? (
          <Loading />
        ) : // if the token is provided in the URL
        error ? (
          // show the error message when the token is invalid
          // TODO: backgroundImage is not covering the whole screen
          <>
            <div className="flex w-full flex-grow items-center justify-center bg-cover bg-center bg-no-repeat bg-[url('/img/login-bg.jpg')]">
              <MessageBox
                title="Error Resetting Password"
                message={
                  error?.data?.message ||
                  "An error occurred while resetting your password. Please try again later."
                }
                buttonText="send a new reset password email"
                buttonLink="/reset-password"
              />
            </div>
          </>
        ) : (
          // show the form to reset the password
          <>
            <section className="flex flex-grow w-full">
              <form
                onSubmit={ResetPasswordHandler}
                className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
              >
                <h2 className="mb-4 text-2xl font-bold">Reset Password</h2>

                <label htmlFor="password">Password</label>
                <Input
                  type="password"
                  id="password"
                  required
                  minlength="6"
                  extraClasses="mb-3"
                  ref={passwordRef}
                />

                <label htmlFor="confirmPassword">Confirm Password</label>
                <Input
                  type="password"
                  id="confirmPassword"
                  required
                  minlength="6"
                  extraClasses="mb-3 "
                  ref={confirmPasswordRef}
                />

                <Button disabled={resetPasswordLoading} extraClasses="mt-5">
                  {resetPasswordLoading && <Spinner />}
                  Reset Password
                </Button>
              </form>
              <div className="right-0 top-0 hidden w-[60%] items-center justify-center bg-green-100 md:block">
                <img
                  src="/img/login-bg.jpg"
                  alt="Login"
                  className="h-full w-full object-cover"
                />
              </div>
            </section>
          </>
        )
      ) : (
        // if the token is not provided in the URL and user want to reset the password by email
        <>
          <section className="flex flex-grow w-full">
            <form
              onSubmit={sendResetPasswordEmailHandler}
              className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
            >
              <h2 className="mb-4 text-2xl font-bold">Reset Password</h2>
              <label htmlFor="email">Email</label>
              <Input
                type="email"
                id="email"
                required
                extraClasses="mb-5 w-full rounded-md border border-gray-300 px-4 py-2"
                ref={emailRef}
              />
              <Button
                disabled={sendEmailResetPasswordLoading}
                extraClasses="mt-5"
              >
                {sendEmailResetPasswordLoading && <Spinner />}
                Send Reset Link
              </Button>
            </form>
            <div className="right-0 top-0 hidden w-[60%] items-center justify-center bg-green-100 md:block">
              <img
                src="/img/login-bg.jpg"
                alt="Login"
                className="h-full w-full object-cover"
              />
            </div>
          </section>
        </>

  );
}

export default ResetPassword;
