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
} from "../../redux/api/usersApiSlice";

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

  const { data: users } = useGetUsersQuery(!showingDeletedUsers || skipToken);
  const { data: deletedUsers } = useGetDeletedUsersQuery(
    showingDeletedUsers || skipToken,
  );
  const [createUser] = useCreateUserMutation();
  const [editUser] = useEditUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [changeUserStatus] = useChangeUserStatusMutation();

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
      // Find the box information for editing
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
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }

    setIsOpenModal(false);
  };

  const changeStatusHandler = async (userId, isActive) => {
    console.log(userId, isActive);
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

  useEffect(() => {
    // Redirect to profile page if the user is inactivated.
    if (userInfo?.isActive === false || userInfo?.isActive === undefined) {
      navigate("/profile");
    }
  }, [navigate, userInfo]);

  console.log(inputs);

  return (
    <>
      <div className="container my-4 flex flex-col items-start px-4 md:flex-row md:items-center xl:px-0">
        <Button
          onClick={() => showModal("", "create")}
          extraClasses={"mr-2 mb-3 md:mb-0"}
        >
          Create User
        </Button>
        <Button onClick={() => setShowingDeletedUsers(!showingDeletedUsers)}>
          {showingDeletedUsers ? "Show Active Users" : "Show Deleted Users"}
        </Button>
      </div>
      {showingDeletedUsers ? (
        <UserList users={deletedUsers} showModal={showModal} />
      ) : (
        <UserList
          users={users}
          showModal={showModal}
          changeStatusHandler={changeStatusHandler}
        />
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
                placeholder="Password (optional)"
                onInput={changeHandler}
                value={inputs.password}
                type="password"
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
                placeholder="Password (optional)"
                onInput={changeHandler}
                value={inputs.password}
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
          title="Delete Box"
          submitText="Yes"
          submitColor="red"
          cancelText="No"
          onSubmit={deleteUserHandler}
          extraClasses={"w-96 md:mx-4 h-auto"}
        >
          <p className="py-4">Are you sure you want to delete this user?</p>
        </Overlay>
      )}

      {/* Show the popup for editing */}
      {/* {isOpenModal && inputs.mode === "edit" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={onCloseOverlay}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-full h-[95vh] h-auto"}
          title="Edit Item"
          submitText="Edit"
          cancelText="Cancel"
          onSubmit={editItemHandler}
        >
          <div className="container flex w-full flex-col gap-10 py-3 md:flex-row xl:px-0">
            {box.type === "standard" && (
              <>
                <div
                  className={`group relative h-96 w-full overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner`}
                  style={{ backgroundImage: `url(${image})` }}
                >
                  <label
                    htmlFor="media"
                    className="z-30 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/30 duration-200 ease-in hover:bg-gray-100/70 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800"
                  >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <FaDownload size="2rem" className="mb-3" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, JPEG, WEBP, MP3 (MAX. 2 MB)
                      </p>
                    </div>
                    <input
                      id="media"
                      name="media"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.mp3"
                      className="hidden"
                      onInput={fileChangeHandler}
                      onClick={(e) => {
                        e.value = null;
                        return false;
                      }}
                      value=""
                    />
                  </label>
                  <div
                    className="absolute bottom-0 flex w-full justify-center border-2 border-t-0 border-dashed border-gray-300 bg-gray-200 p-3 transition hover:cursor-pointer lg:bottom-auto lg:group-hover:-translate-y-full"
                    onClick={deletePreview}
                  >
                    <FaTrash size="2rem" />
                  </div>
                </div>
                <textarea
                  name="description"
                  onInput={changeHandler}
                  className="h-full min-h-12 w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner"
                  value={inputs.description}
                ></textarea>
              </>
            )}
            {box.type === "insurance" && (
              <>
                <textarea
                  name="description"
                  onInput={changeHandler}
                  className="h-full w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner"
                  value={inputs.description}
                ></textarea>
                <textarea
                  name="value"
                  onInput={changeHandler}
                  className="h-full w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner"
                  value={inputs.value}
                ></textarea>
              </>
            )}
          </div>
        </Overlay>
      )} */}
    </>
  );
}

export default Users;
