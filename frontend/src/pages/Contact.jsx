import { useRef } from "react";
import { useSendContactMessageMutation } from "./../redux/api/mainApiSlice";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "./../components/Spinner";
import { useSelector } from "react-redux";
import Button from "./../components/Button";
import Input from "./../components/Input";
import ReCAPTCHA from "react-google-recaptcha";

function Contact() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);
  const reCaptchaRef = useRef(null);

  const navigate = useNavigate();

  const [sendContactMessage, { isLoading: sendContactMessageLoading }] =
    useSendContactMessageMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const sendContactMessageHandler = async (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const message = messageRef.current.value;
    const reCaptcha = reCaptchaRef.current.getValue();

    if (!reCaptcha) {
      return toast.error("Please verify you are not a robot");
    }

    try {
      const res = await sendContactMessage({ name, email, message }).unwrap();
      // Handle successful register
      if (res) {
        toast.success(res.message);
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
    <section className="flex w-full flex-grow">
      <form
        onSubmit={sendContactMessageHandler}
        className="left-0 top-0 flex w-full flex-col justify-center bg-[#ffdf27] p-5 align-middle md:w-[40%] md:p-10"
      >
        <h2 className="mb-4 text-2xl font-bold">Register</h2>
        <label htmlFor="name">Name</label>
        <Input
          type="text"
          id="name"
          required
          extraClasses="mb-3"
          defaultValue={userInfo?.name}
          ref={nameRef}
        />
        <label htmlFor="email">Email</label>
        <Input
          type="email"
          id="email"
          required
          extraClasses="mb-3"
          defaultValue={userInfo?.email}
          ref={emailRef}
        />
        <label htmlFor="message">Message</label>

        <textarea
          id="message"
          name="message"
          className="h-32 w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner"
          ref={messageRef}
          required
        ></textarea>
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          className="mt-5"
          ref={reCaptchaRef}
        />
        <Button disabled={sendContactMessageLoading} extraClasses={"mt-auto"}>
          {sendContactMessageLoading && <Spinner />}
          Send
        </Button>
      </form>
      <div className="right-0 top-0 hidden w-[60%] items-center justify-center bg-[url('/img/login-bg.jpg')] bg-cover bg-center bg-no-repeat md:block"></div>
    </section>
  );
}

export default Contact;
