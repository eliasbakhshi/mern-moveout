import { useSelector, useDispatch } from "react-redux";
import {
  removeCredentials,
  setCredentials,
} from "../../redux/features/auth/authSlice";
import { FaDownload, FaTrash } from "react-icons/fa";
import Input from "../../components/Input";
import Button from "../../components/Button";
import LinkButton from "../../components/LinkButton";
import { useRef, useState, useEffect } from "react";
import {
  useEditCurrentUserMutation,
  // useDeleteCurrentUserMutation,
  useDeactivateCurrentUserMutation,
  useReactivateCurrentUserMutation,
  useSendDeleteEmailMutation,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import Overlay from "../../components/Overlay";
import { useNavigate } from "react-router-dom";

// TODO: Check the expirationTime in the Profile component. If the expirationTime is less than the current time, dispatch the removeCredentials action to remove the user credentials from the state and local storage. This will log out the user automatically when the token expires.
// TODO: Get the current expirationTime and set it again
// TODO: Send a notification when the user change the email
// TODO: Changes saves but no toast shown in the first click on the save button.

function Profile() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // const nameRef = useRef(null);
  // const emailRef = useRef(null);
  // const passwordRef = useRef(null);
  // const confirmPasswordRef = useRef(null);
  const [user, setUser] = useState({
    name: userInfo.name,
    email: userInfo.email,
    password: "",
    confirmPassword: "",
    role: userInfo.role,
    mediaPath: userInfo.mediaPath,
    media: null,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [emailSend, setEmailSent] = useState(false);

  const [image, setImage] = useState(() => {
    if (userInfo?.mediaPath) {
      return userInfo.mediaPath.includes("googleusercontent")
        ? userInfo.mediaPath
        : `/api${userInfo.mediaPath}`;
    }
    return "/img/avatar.png";
  });

  const [
    editCurrentUser,
    {
      isLoading: editCurrentUserLoading,
      error: editCurrentUserError,
      isSuccess: editCurrentUserSuccess,
    },
  ] = useEditCurrentUserMutation();
  // const [
  //   deleteCurrentUser,
  //   { isLoading: deleteLoading, error: deleteError, isSuccess: deleteSuccess },
  // ] = useDeleteCurrentUserMutation();
  const [
    deactivateCurrentUser,
    {
      isLoading: deactivateCurrentUserLoading,
      error: deactivateCurrentUserError,
      isSuccess: deactivateCurrentUserSuccess,
    },
  ] = useDeactivateCurrentUserMutation();
  const [
    reactivateCurrentUser,
    {
      isLoading: reactivateCurrentUserLoading,
      error: reactivateCurrentUserError,
      isSuccess: reactivateCurrentUserSuccess,
    },
  ] = useReactivateCurrentUserMutation();
  const [
    sendDeleteEmail,
    {
      isLoading: sendDeleteEmailLoading,
      error: sendDeleteEmailError,
      isSuccess: sendDeleteEmailSuccess,
    },
  ] = useSendDeleteEmailMutation();

  const fileChangeHandler = async (e) => {
    const media = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (allowedTypes.indexOf(media.type) === -1) {
      toast.error("The media type is not supported.");
      return;
    }

    setImage(URL.createObjectURL(media));
    setUser({ ...user, media });
  };

  // Check if the user is logged in before showing the profile page
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo]);

  const changeHandler = (e) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
  };

  const editUserHandler = async (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      const productData = new FormData();
      productData.append("name", user.name);
      productData.append("email", user.email);
      productData.append("password", user.password);
      productData.append("confirmPassword", user.confirmPassword);
      productData.append("media", user.media);
      productData.append("mediaPath", user.mediaPath);

      const editedUser = await editCurrentUser(productData).unwrap();
      if (editCurrentUserError) {
        toast.error(editCurrentUserError);
      }
      dispatch(setCredentials({ user: editedUser, remember: true }));
      editCurrentUserSuccess && toast.success("User updated successfully");

      if (userInfo?.mediaPath) {
        setImage(
          userInfo.mediaPath.includes("googleusercontent")
            ? userInfo.mediaPath
            : `/api${userInfo.mediaPath}`,
        );
      } else {
        setImage("/img/avatar.png");
      }

      setUser({ ...editedUser, password: "", confirmPassword: "" });

      if (editCurrentUserError) {
        toast.error(editCurrentUserError?.data?.message || err.message);
      } else {
        toast.success(editedUser.message);
      }
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  const deactivateCurrentUserHandler = async (e) => {
    e.preventDefault();
    try {
      const { user, message } = await deactivateCurrentUser().unwrap();
      if (deactivateCurrentUserError) {
        toast.error(deactivateCurrentUserError);
      } else {
        toast.success(message);
        dispatch(setCredentials({ user, remember: true }));
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const reactivateCurrentUserHandler = async (e) => {
    e.preventDefault();
    try {
      const { user, message } = await reactivateCurrentUser().unwrap();
      if (reactivateCurrentUserError) {
        toast.error(reactivateCurrentUserError);
      } else {
        toast.success(message);
        dispatch(setCredentials({ user, remember: true }));
      }
    } catch (err) {
      console.log("err", err);
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };
  // const deleteCurrentUserHandler = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const deleteUser = await deleteCurrentUser().unwrap();
  //     dispatch(removeCredentials());
  //     deleteSuccess && toast.success(deleteUser.message);

  //     setUser({
  //       name: userInfo.name,
  //       email: userInfo.email,
  //       password: "",
  //       confirmPassword: "",
  //       role: userInfo.role,
  //       mediaPath: userInfo.mediaPath,
  //       media: null,
  //     });

  //     if (deleteError) {
  //       toast.error(deleteError);
  //     } else {
  //       toast.success(deleteUser.message);
  //       navigate("/");
  //     }
  //   } catch (err) {
  //     toast.error(err?.data?.message || err.message);
  //   }
  // };

  const sendDeleteEmailHandler = async (e) => {
    e.preventDefault();
    setIsDeleting(false);
    try {
      const { message } = await sendDeleteEmail().unwrap();
      if (sendDeleteEmailError) {
        toast.error(sendDeleteEmailError);
      } else {
        toast.success(message);
        setEmailSent(true);
      }
    } catch (err) {
      console.log("err", err);
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const deletePreview = () => {
    setImage("/img/avatar.png");
    setUser({ ...user, media: "", mediaPath: "" });
  };

  useEffect(() => {
    if (userInfo?.mediaPath) {
      setImage(
        userInfo.mediaPath.includes("googleusercontent")
          ? userInfo.mediaPath
          : `/api${userInfo.mediaPath}`,
      );
    } else {
      setImage("/img/avatar.png");
    }
  }, [userInfo]);

  // console.log(userInfo);

  return (
    <div className="flex h-full w-full flex-grow items-center justify-center md:w-auto">
      <form
        type="multipart/form-data"
        onSubmit={editUserHandler}
        className="flex flex-grow flex-col justify-center rounded-lg bg-white p-6 shadow-lg md:flex-row md:items-start"
      >
        <div className="mb-4 flex w-full flex-col items-center justify-center md:w-[50%] md:items-start">
          <div
            className={`group relative mb-4 h-32 w-32 overflow-hidden rounded-full bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner`}
            style={{ backgroundImage: `url(${image})` }}
          >
            <label
              htmlFor="media"
              className="z-30 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50/30 duration-200 ease-in hover:bg-gray-100/70 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800"
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <FaDownload
                  size="2rem"
                  color="white"
                  className="mb-3 opacity-30"
                />
              </div>
              <input
                id="media"
                name="media"
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={fileChangeHandler}
                onClick={(e) => {
                  e.value = null;
                  return false;
                }}
                value=""
              />
            </label>
            <div
              className="absolute flex w-full justify-center border-2 border-t-0 border-dashed border-gray-300 bg-gray-200 p-3 transition hover:cursor-pointer group-hover:-translate-y-full"
              onClick={deletePreview}
            >
              <FaTrash size="" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{userInfo.name}</h1>
          <p className="text-gray-700">
            <span className="font-semibold">Role: </span>
            {userInfo.role}
          </p>
        </div>
        <div className="flex w-full flex-col md:w-[50%]">
          <label htmlFor="name">Name</label>
          <Input
            type="text"
            name="name"
            required
            extraClasses="mb-3"
            onInput={changeHandler}
            value={user.name}
          />
          <label htmlFor="email">Email</label>
          <Input
            type="email"
            name="email"
            required
            extraClasses="mb-3"
            onInput={changeHandler}
            value={user.email}
          />
          <label htmlFor="password">Password</label>
          <Input
            type="password"
            name="password"
            minLength={6}
            extraClasses="mb-3"
            placeholder="At least 6 characters"
            onInput={changeHandler}
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <Input
            type="password"
            name="confirmPassword"
            minLength={6}
            extraClasses="mb-3"
            placeholder="At least 6 characters"
            onInput={changeHandler}
          />
          <div className="mt-5 flex w-full flex-col space-y-3">
            <Button extraClasses=" w-full">
              {editCurrentUserLoading && <Spinner />}Save
            </Button>
            {userInfo.isActive ? (
              <LinkButton
                extraClasses="bg-gray-700 w-full"
                onClick={deactivateCurrentUserHandler}
              >
                Deactivate
              </LinkButton>
            ) : (
              <LinkButton
                extraClasses="bg-gray-400 w-full"
                onClick={reactivateCurrentUserHandler}
              >
                Reactivate
              </LinkButton>
            )}
            <LinkButton
              disabled={!userInfo.isActive}
              extraClasses={`${userInfo.isActive ? "bg-red-300" : "bg-red-500"} w-full`}
              onClick={() => {
                if (!userInfo.isActive) {
                  setIsDeleting(true);
                }
              }}
            >
              Delete
            </LinkButton>
          </div>
        </div>
      </form>
      {/* Show the popup for deleting */}
      {isDeleting && (
        <Overlay
          isOpen={isDeleting}
          onClose={() => setIsDeleting(!isDeleting)}
          title="Delete User"
          submitText="Yes"
          submitColor="red"
          cancelText="No"
          onSubmit={sendDeleteEmailHandler}
          extraClasses={"w-96 md:mx-4 h-auto"}
        >
          <p className="py-4">Are you sure you want to delete your profile?</p>
        </Overlay>
      )}
      {/* Show the popup after the confirmation email has been sent. */}
      {emailSend && (
        <Overlay
          isOpen={emailSend}
          onClose={() => setEmailSent(!emailSend)}
          title="Confirmation Email Sent"
          submitText="Ok"
          onSubmit={() => setEmailSent(!emailSend)}
          extraClasses={"w-96 md:mx-4 h-auto"}
        >
          <p className="py-4">Please check your email for confirmation.</p>
        </Overlay>
      )}
    </div>
  );
}

export default Profile;
