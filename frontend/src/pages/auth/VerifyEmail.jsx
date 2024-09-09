import { useParams } from "react-router-dom";
import { useVerifyEmailQuery } from "../../redux/api/usersApiSlice";
import Spinner from "../../components/Spinner";

function VerifyEmail() {
  const { token } = useParams();
  const { error, isLoading } = useVerifyEmailQuery(token);

  isLoading && <Spinner />;
  return error ? (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <div className="rounded bg-white p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Error Verifying Email</h2>
        <p className="mb-6 text-gray-600">
          Sorry, an error occurred while verifying your email address. Please
          try again later.
        </p>
        <a
          href="/login"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        >
          Go to Login
        </a>
      </div>
    </div>
  ) : (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <div className="rounded bg-white p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Email Verified Successfully</h2>
        <p className="mb-6 text-gray-600">
          Thank you for verifying your email address. You can now proceed to
          login and access your account.
        </p>
        <a
          href="/login"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

export default VerifyEmail;
