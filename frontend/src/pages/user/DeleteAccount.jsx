import { useParams } from "react-router-dom";
import { useDeleteUserQuery } from "../../redux/api/usersApiSlice";
import Loading from "../../components/Loading";
import MessageBox from "../../components/MessageBox";
import { useDispatch } from "react-redux";
import { removeCredentials } from "../../redux/features/auth/authSlice";

// TODO: Check if the user is already logged in and redirect to the home page

function DeleteAccount() {
  const { token } = useParams();
  const dispatch = useDispatch();

  const { data, error, isLoading } = useDeleteUserQuery(token);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex w-full flex-grow items-center justify-center bg-[url('/img/login-bg.jpg')]">
      {error ? (
        <MessageBox
          title="Error Deleting Account"
          message={
            error?.data?.message ||
            "An error occurred while deleting you account. Please try again later."
          }
          buttonText="Go To Home"
          buttonLink="/"
        />
      ) : (
        <>
          {/* Delete the information from the browser */}
          {localStorage.removeItem("userInfo")}
          {localStorage.removeItem("expirationTime")}
          <MessageBox
            title="Account Deleted"
            message={data.message}
            buttonText="Go To Home"
            buttonLink="/"
          />
        </>
      )}
    </div>
  );
}

export default DeleteAccount;