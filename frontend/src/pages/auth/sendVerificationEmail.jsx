import { useRef } from "react";
import { useSendVerificationEmailMutation } from "../../redux/api/usersApiSlice";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import Input from "../../components/Input";

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
        e.target.reset();
        return toast.success(
          isVerificationSent?.data?.message ||
            "Verification email sent successfully. Please check your email.",
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
    <section className="flex flex-grow">
      <form
        onSubmit={sendVerificationEmailHandler}
        className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
      >
        <h2 className="mb-4 text-2xl font-bold">Send verification email</h2>
        <label htmlFor="email">Email</label>
        <Input type="email" id="email" required ref={emailRef} />
        <Button disabled={sendVerificationEmailLoading} extraClasses="mt-5">
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
