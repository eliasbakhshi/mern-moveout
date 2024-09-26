import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";

import { FaDownload, FaTrash } from "react-icons/fa";
import Input from "../../components/Input";
import Button from "../../components/Button";
import LinkButton from "../../components/LinkButton";
import { useRef, useState } from "react";
import {
  useEditCurrentUserMutation,
  useGetCurrentUserQuery,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";

// TODO: Check the expirationTime in the Profile component. If the expirationTime is less than the current time, dispatch the removeCredentials action to remove the user credentials from the state and local storage. This will log out the user automatically when the token expires.
// TODO: Get the current expirationTime and set it again

function Profile() {
  const { userInfo, expirationTime } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [user, setUser] = useState({
    name: userInfo.name,
    email: userInfo.email,
    password: "",
    confirmPassword: "",
    role: userInfo.role,
    mediaPath: userInfo.mediaPath,
    media: null,
  });
  const [image, setImage] = useState(
    userInfo.mediaPath ? `/api/${userInfo.mediaPath}` : "/img/avatar.png",
  );

  const [edit, { isLoading: editLoading, error, isSuccess }] =
    useEditCurrentUserMutation();

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

  const changeHandler = (e) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
  };

  const editUser = async (e) => {
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

      const editedUser = await edit(productData).unwrap();
      dispatch(setCredentials({ user: editedUser, remember: true }));
      isSuccess && toast.success("User updated successfully");

      setImage(`/api/${editedUser.mediaPath}`);

      setUser({ ...editedUser, password: "", confirmPassword: "" });

      if (error) {
        toast.error(error.data.message);
      } else {
        toast.success(data.message);
      }
    } catch (err) {}
  };

  const deletePreview = () => {
    setImage("/img/avatar.png");
    setUser({ ...user, media: "", mediaPath: "" });
  };

  console.log("user", user);

  return (
    <div className="flex h-full flex-grow items-center justify-center w-full md:w-auto">
      <form
        type="multipart/form-data"
        onSubmit={editUser}
        className="flex flex-grow flex-col md:flex-row md:items-start justify-center rounded-lg bg-white p-6 shadow-lg"
      >
        <div className="flex w-full md:w-[50%] flex-col justify-center items-center md:items-start mb-4">
          <div
            className={`group relative mb-4 h-32 w-32 overflow-hidden rounded-full bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner`}
            style={{ backgroundImage: `url(${image})` }}
          >
            <label
              htmlFor="media"
              className="z-30 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50/30 duration-200 ease-in hover:bg-gray-100/70 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800"
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <FaDownload size="2rem" className="mb-3 opacity-10" />
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
            <Button extraClasses="bg-green-500 w-full">
              {editLoading && <Spinner />}Save
            </Button>
            <LinkButton extraClasses="bg-red-500 w-full">Delete</LinkButton>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Profile;
