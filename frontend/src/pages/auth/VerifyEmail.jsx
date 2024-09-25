import { useParams } from "react-router-dom";
import { useVerifyEmailQuery } from "../../redux/api/usersApiSlice";
import Loading from "../../components/Loading";
import MessageBox from "../../components/MessageBox";

// TODO: Check if the user is already logged in and redirect to the home page


function VerifyEmail() {
  const { token } = useParams();
  const { error, isLoading } = useVerifyEmailQuery(token);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex flex-grow items-center justify-center bg-[url('/img/login-bg.jpg')] w-full">
      {error ? (
        <MessageBox
          title="Error Verifying Email"
          message={
            error?.data?.message ||
            "An error occurred while verifying your email address. Please try again later."
          }
          buttonText="send a new verification email"
          buttonLink="/send-verification-email"
        />
      ) : (
        <MessageBox
          title="Email Verified Successfully 🎉"
          message={
            error?.data?.message ||
            "Thank you for verifying your email address. You can now proceed to login and access your account."
          }
          buttonText="Go To Login"
          buttonLink="/login"
        />
      )}
    </div>
  );
}

export default VerifyEmail;
