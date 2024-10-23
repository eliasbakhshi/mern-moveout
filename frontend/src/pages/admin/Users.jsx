import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import {
  useGetUsersQuery,
  useGetDeletedUsersQuery,
} from "../../redux/api/usersApiSlice";
import { useState } from "react";
import UserList from "../../components/UserList";
import { skipToken } from "@reduxjs/toolkit/query";
import Button from "../../components/Button";
import Overlay from "../../components/Overlay";
import { toast } from "react-toastify";
import Input from "../../components/Input";
import {
  useCreateUserMutation,
  useEditUserMutation,
  useDeleteUserMutation,
  useChangeUserStatusMutation,
  useRecoverUserMutation,
  useDeleteUserPermanentlyMutation,
  useSendMarketingEmailMutation,
} from "../../redux/api/usersApiSlice";
import Loading from "../../components/Loading";

// TODO: Add a loading page then user is navigating between pages
// TODO: Add changeStatus function to change the status of the user
// TODO: Continue on the edit and removed users

function Users() {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    isActive: false,
  });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showingDeletedUsers, setShowingDeletedUsers] = useState(false);
  const [marketingUsers, setMarketingUsers] = useState([]);

  const { data: users, isLoading: usersLoading } = useGetUsersQuery(!showingDeletedUsers || skipToken);
  const { data: deletedUsers, isLoading: deletedUsersLoading  } = useGetDeletedUsersQuery(
    showingDeletedUsers || skipToken,
  );
  const [createUser] = useCreateUserMutation();
  const [editUser] = useEditUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [changeUserStatus] = useChangeUserStatusMutation();
  const [recoverUser] = useRecoverUserMutation();
  const [deleteUserPermanently] = useDeleteUserPermanentlyMutation();
  const [sendMarketingEmail] = useSendMarketingEmailMutation();

  const showModal = (userId = "", mode = "create") => {
    if (mode === "create") {
      setInputs({
        userId: "",
        name: "",
        email: "",
        password: "",
        isActive: false,
        mode,
      });
    } else if (mode === "edit") {
      // Find the user information for editing
      let user;
      if (showingDeletedUsers) {
        user = deletedUsers.find((theUser) => theUser._id === userId);
      } else {
        user = users.find((theUser) => theUser._id === userId);
      }
      setInputs({
        ...inputs,
        userId,
        name: user.name,
        email: user.email,
        password: "",
        isActive: user.isActive,
        mode,
      });
    } else if (mode === "delete") {
      setInputs({ ...inputs, userId, mode });
    } else if (mode === "delete-permanently") {
      setInputs({ ...inputs, userId, mode });
    } else if (mode === "marketing-email") {
      setInputs({ ...inputs, userId, mode });
    }
    setIsOpenModal(true);
  };

  const onCloseOverlay = () => {
    setIsOpenModal(false);

    setInputs({ ...inputs, mode: "" });
  };

  const changeHandler = (e) => {
    const { value, name } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const createUserHandler = async (e) => {
    e.preventDefault();
    if (inputs.name === "" && inputs.email === "") {
      return toast.error("Please give a name or a email.");
    }

    try {
      const { data, error } = await createUser({
        name: inputs.name,
        email: inputs.email,
        password: inputs.password,
      });

      if (error) {
        return toast.error(error.data.message);
      } else {
        setInputs({
          userId: "",
          name: "",
          email: "",
          password: "",
          isActive: false,
          mode: "",
        });
        setIsOpenModal(false);
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const editUserHandler = async (e) => {
    e.preventDefault();
    if (inputs.name === "" && inputs.email === "") {
      return toast.error("Please give a name or a email.");
    }

    try {
      const { data, error } = await editUser({
        userId: inputs.userId,
        name: inputs.name,
        email: inputs.email,
        password: inputs.password,
        isActive: inputs.isActive,
      });

      if (error) {
        return toast.error(error.data.message);
      } else {
        setInputs({
          userId: "",
          name: "",
          email: "",
          password: "",
          isActive: false,
          mode: "",
        });
        setIsOpenModal(false);
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const deleteUserHandler = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await deleteUser({ userId: inputs.userId });

      if (error) {
        return toast.error(error.data.message);
      } else {
        setInputs({
          userId: "",
          name: "",
          email: "",
          password: "",
          isActive: false,
          mode: "",
        });
        setIsOpenModal(false);
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }
  };

  const deleteUserPermanentlyHandler = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await deleteUserPermanently({
        userId: inputs.userId,
      });

      if (error) {
        return toast.error(error.data.message);
      } else {
        setInputs({
          userId: "",
          name: "",
          email: "",
          password: "",
          isActive: false,
          mode: "",
        });
        setIsOpenModal(false);
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }

    setIsOpenModal(false);
  };

  const sendMarketingEmailHandler = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const message = e.target.message.value;
    const format = e.target.format.value;

    try {
      const { data, error } = await sendMarketingEmail({
        userId: inputs.userId,
        title,
        message,
        format,
      });

      if (error) {
        return toast.error(error.data.message);
      } else {
        setInputs({
          userId: "",
          name: "",
          email: "",
          password: "",
          isActive: false,
          mode: "",
        });
        setIsOpenModal(false);
        e.target.reset();
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }
  };

  const changeStatusHandler = async (userId, isActive) => {
    try {
      const { data, error } = await changeUserStatus({
        userId,
        isActive,
      });

      if (error) {
        return toast.error(error.data.message);
      } else {
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }
  };

  const recoverUserHandler = async (userId) => {
    try {
      const { data, error } = await recoverUser({
        userId,
      });

      if (error) {
        return toast.error(error.data.message);
      } else {
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }
  };

  useEffect(() => {
    // Redirect to profile page if the user is inactivated.
    if (userInfo?.isActive === false || userInfo?.isActive === undefined) {
      navigate("/profile");
    }
  }, [navigate, userInfo]);

  console.log(inputs);
  console.log("users", users);

  return (
    <>
      <div className="container my-4 flex flex-col items-start px-4 md:flex-row md:items-center xl:px-0">
        <Button
          onClick={() => showModal("", "create")}
          extraClasses={"mr-2 mb-3 md:mb-0"}
        >
          Create User
        </Button>
        <Button
          extraClasses={"mr-2 mb-3 md:mb-0"}
          onClick={() => setShowingDeletedUsers(!showingDeletedUsers)}
        >
          {showingDeletedUsers ? "Show Active Users" : "Show Deleted Users"}
        </Button>
        <Button
          onClick={() => showModal("", "marketing-email")}
          extraClasses={"mr-2 mb-3 md:mb-0"}
        >
          Send Email
        </Button>
      </div>
      {showingDeletedUsers ? (
        deletedUsersLoading ? (<Loading />) :(deletedUsers?.length ? (
          // For showing the deleted users
          <UserList
            users={deletedUsers}
            showModal={showModal}
            showingDeletedUsers={showingDeletedUsers}
            recoverUserHandler={recoverUserHandler}
          />
        ) : (
          <div
            className="container relative mx-2 mt-4 rounded border border-blue-400 bg-blue-100 py-3 text-center text-blue-700 xl:mx-0"
            role="alert"
          >
            <span className="block sm:inline">
              There is no deleted user to show.
            </span>
          </div>
        )))
       : (

        usersLoading ? (<Loading />) :(users?.length ? (
          // For showing the active users
          <UserList
          users={users}
          showModal={showModal}
          showingDeletedUsers={showingDeletedUsers}
          changeStatusHandler={changeStatusHandler}
        />
        ) : (
          <div
            className="container relative mx-2 mt-4 rounded border border-blue-400 bg-blue-100 py-3 text-center text-blue-700 xl:mx-0"
            role="alert"
          >
            <span className="block sm:inline">
              There is no user to show.
            </span>
          </div>
        ))
        // For showing the active users

      )}

      {/* Show the popup for creating */}
      {isOpenModal && inputs.mode === "create" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={onCloseOverlay}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-full h-[95vh] h-auto"}
          title="Create User"
          submitText="Create"
          cancelText="Cancel"
          onSubmit={createUserHandler}
        >
          <div className="container flex w-full flex-col gap-10 py-3 md:flex-row xl:px-0">
            <>
              <Input
                name="name"
                placeholder="Name"
                onInput={changeHandler}
                value={inputs.name}
                extraClasses="mt-4 md:mt-0"
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                onInput={changeHandler}
                value={inputs.email}
                required
              />
              <Input
                name="password"
                placeholder="password (optional)"
                onInput={changeHandler}
                value={inputs.password}
                type="password"
                minLength="6"
                maxLength="100"
                pattern="[a-zA-Z0-9]*"
                title="Password must be 6 - 100 characters long and contain only alphanumeric characters."
              />
            </>
          </div>
        </Overlay>
      )}

      {/* Show the popup for creating */}
      {isOpenModal && inputs.mode === "edit" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={onCloseOverlay}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-full h-[95vh] h-auto"}
          title="Edit User"
          submitText="Edit"
          cancelText="Cancel"
          onSubmit={editUserHandler}
        >
          <div className="container flex w-full flex-col gap-10 py-3 md:flex-row xl:px-0">
            <>
              <Input
                name="name"
                placeholder="Name"
                onInput={changeHandler}
                value={inputs.name}
                extraClasses="mt-4 md:mt-0"
              />
              <Input
                name="email"
                placeholder="Email"
                onInput={changeHandler}
                value={inputs.email}
              />
              <Input
                name="password"
                type="password"
                placeholder="Password (optional)"
                onInput={changeHandler}
                value={inputs.password}
                minLength="6"
                maxLength="100"
                pattern="[a-zA-Z0-9]*"
                title="Password must be 6 - 100 characters long and contain only alphanumeric characters."
              />
              <div className="my-4 flex items-center md:pl-4">
                <span className="mr-2 text-sm text-gray-700">Active</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={inputs.isActive}
                    onChange={(e) =>
                      setInputs({ ...inputs, isActive: e.target.checked })
                    }
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                </label>
              </div>
            </>
          </div>
        </Overlay>
      )}

      {/* Show the popup for deleting */}
      {isOpenModal && inputs.mode === "delete" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          title="Delete User"
          submitText="Yes"
          submitColor="red"
          cancelText="No"
          onSubmit={deleteUserHandler}
          extraClasses={"w-96 md:mx-4 h-auto"}
        >
          <p className="py-4">Are you sure you want to delete this user?</p>
        </Overlay>
      )}

      {/* Show the popup for deleting permanently */}
      {isOpenModal && inputs.mode === "delete-permanently" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          title="Delete User"
          submitText="Yes"
          submitColor="red"
          cancelText="No"
          onSubmit={deleteUserPermanentlyHandler}
          extraClasses={"w-96 md:mx-4 h-auto"}
        >
          <p className="py-4">
            All media and labels will be deleted. Are you sure you want to
            delete this user permanently?
          </p>
        </Overlay>
      )}

      {/* Show the popup for email marketing */}
      {isOpenModal && inputs.mode === "marketing-email" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          title="Send Email"
          submitText="Send"
          submitColor="blue"
          cancelText="Cancel"
          onSubmit={sendMarketingEmailHandler}
          extraClasses={" md:mx-4 h-auto"}
        >
          <div className="w-full p-4">
            <div className="mb-4">
              <Input
                name="title"
                placeholder="Title"
                required
                extraClasses={`mb-5`}
              />
              <textarea
                name="message"
                className="h-32 w-full rounded border border-gray-300 p-2"
                placeholder="Enter information here..."
              />
            </div>
            <div>
              <select
                name="format"
                className="w-full rounded border border-gray-300 p-2"
              >
                <option value="text">Text</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

export default Users;
