import { useRef } from "react";
import { useSendVerificationEmailMutation } from "../../redux/api/usersApiSlice";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import Button from "../../components/Button";

function SendVerificationEmail() {
  const [sendVerificationEmail, { isLoading: sendVerificationEmailLoading }] =
    useSendVerificationEmailMutation();

  const emailRef = useRef(null);

  const sendVerificationEmailHandler = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    try {
      const isVerificationSent = await sendVerificationEmail({
        email,
      }).unwrap();
      if (isVerificationSent) {
        toast.success(
          isVerificationSent?.data?.message ||
            "Verification email sent successfully. Please check your email.",
        );
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  return (
    <section className="flex flex-grow">
      <form
        onSubmit={sendVerificationEmailHandler}
        className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
      >
        <h2 className="mb-4 text-2xl font-bold">Send verification email</h2>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          required
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2"
          ref={emailRef}
        />
        <Button disabled={sendVerificationEmailLoading}>
          {sendVerificationEmailLoading && <Spinner />}
          Send verification email
        </Button>
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

export default SendVerificationEmail;