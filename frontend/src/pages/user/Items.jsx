import Button from "../../components/Button";
import { useState } from "react";
import { FaDownload, FaTrash } from "react-icons/fa";
import {
  useCreateItemMutation,
  useDeleteItemMutation,
  useUpdateItemMutation,
  useGetBoxQuery,
} from "../../redux/api/mainApiSlice";
import {
  useGetUsersEmailAndNameQuery,
  useShareBoxMutation,
} from "../../redux/api/usersApiSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import Overlay from "../../components/Overlay";
import LinkButton from "../../components/LinkButton";
import { useSelector } from "react-redux";
import ItemList from "../../components/ItemList";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


// TODO: Add sort by type or name or date
// TODO: Make a filter for the media type
// TODO: Reset all the inputs after the submission or close or cancel
// TODO: Add a loading spinner when the user submit the form
// TODO: Check tha several toasts are not shown on the top of each other
// TODO: Add xss protection for the inputs
// TODO: Add pagination
// TODO: Add comments to all functions
// TODO: Check if the user is logged in before showing the page
// TODO: Check if user is the owner of the box before showing the buttons for the edit and delete and add and show label
// TODO: Add a search bar for the items
// TODO: Add a filter for the items
// TODO: Add a button for the user to go back to the boxes page
// TODO: Add sharing the label with other users
// TODO: Change the popup titles with the name of the box or items

function Items() {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [image, setImage] = useState("");
  const { boxId } = useParams();
  const [inputs, setInputs] = useState({
    itemId: "",
    description: "",
    media: "",
    boxId,
    mode: "",
    mediaPath: "",
  });

  // TODO: check the responsiveness of the page

  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  const [deleteItem] = useDeleteItemMutation();
  const [shareBox] = useShareBoxMutation();
  const {
    data: box,
    isLoading: boxLoading,
    refetch: refetchBox,
    error: boxError,
  } = useGetBoxQuery(boxId);
  const { data: emailsAndNames } = useGetUsersEmailAndNameQuery();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isShowingUsers, setIsShowingUsers] = useState(false);

  useEffect(() => {
    // Redirect to profile page if the user is inactivated.
    if (userInfo?.isActive === false || userInfo?.isActive === undefined) {
      navigate("/profile");
    }
  }, [navigate, userInfo]);

  const fileChangeHandler = async (e) => {
    const media = e.target.files[0];
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "audio/mpeg",
      "audio/wav",
    ];

    if (allowedTypes.indexOf(media.type) === -1) {
      toast.error("The media type is not supported.");
      return;
    }

    setImage(URL.createObjectURL(media));
    setInputs({ ...inputs, media });
  };

  const changeHandler = (e) => {
    const { value, name, id } = e.target;
    setInputs({ ...inputs, [name]: value });
  };
  const deletePreview = () => {
    setImage("");
    setInputs({ ...inputs, media: "", mediaPath: "", mode: "delete" });
  };

  const createItemHandler = async (e) => {
    e.preventDefault();

    if (inputs.description === "" && inputs.media === "") {
      return toast.error("Please give a description or upload a file.");
    }

    try {
      const productData = new FormData();
      productData.append("boxId", inputs.boxId);
      productData.append("description", inputs.description);
      productData.append("media", inputs.media);

      const { data, error } = await createItem(productData);

      setImage("");
      refetchBox();
      setInputs({
        itemId: "",
        description: "",
        media: "",
        boxId,
        mode: "",
        mediaPath: "",
      });
      setIsOpenModal(false);
      e.target.reset();
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const deleteItemHandler = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await deleteItem(inputs.itemId);
      toast.success(data.message);
    } catch (err) {
      toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }
    refetchBox();
    setIsOpenModal(false);
  };

  const showModal = (itemId = "", mode = "create") => {
    if (mode === "edit") {
      // Find the box information for editing
      const item = box?.items.find((item) => item._id === itemId);
      setInputs({
        ...inputs,
        description: item.description,
        mode,
        itemId,
        boxId,
        mediaPath: item.mediaPath,
      });
      item.mediaPath ? setImage(`/api/${item.mediaPath}`) : setImage("");
    } else if (mode === "create") {
      setInputs({
        itemId: "",
        description: "",
        media: "",
        boxId,
        mode,
        mediaPath: "",
      });
      setImage("");
    } else if (mode === "delete") {
      setInputs({ ...inputs, itemId, mode });
    }
    setIsOpenModal(true);
  };

  const editItemHandler = async (e) => {
    e.preventDefault();

    if (
      inputs.description === "" &&
      (inputs.media === undefined || inputs.media === "") &&
      (inputs.mediaPath === undefined || inputs.mediaPath === "")
    ) {
      return toast.error("Please give a description or upload a file.");
    }

    const productData = new FormData();
    productData.append("boxId", inputs.boxId);
    productData.append("itemId", inputs.itemId);
    productData.append("description", inputs.description);
    productData.append("media", inputs.media);
    productData.append("mediaPath", inputs.mediaPath);

    try {
      const { data, error } = await updateItem(productData);
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.success(data.message);
      }

      setInputs({
        itemId: "",
        mode: "",
        name: "",
        labelNum: 1,
        mediaPath: "",
      });
      e.target.reset();
      refetchBox();
      setIsOpenModal(false);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const showUsers = () => {
    setIsOpenModal(true);
    setIsShowingUsers(true);
  };

  const onCloseOverlay = () => {
    setIsOpenModal(false);
    setIsShowingUsers(false);

    setInputs({ ...inputs, mode: "" });
  };

  const shareBoxHandler = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    if (email === "") {
      return toast.error("Please select an email.");
    }

    try {
      const { data, error } = await shareBox({ boxId, email });
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.success(data.message);
        setIsOpenModal(false);
        setIsShowingUsers(false);
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  return boxLoading ? (
    <Loading />
  ) : box?.items ? (
    <>
      {userInfo && userInfo.role !== "" && (
        <div className="container my-2 flex w-full flex-col items-start gap-y-4 px-4 md:flex-row md:items-center xl:px-0">
          <Button extraClasses="mr-5" onClick={() => showModal("", "create")}>
            Add New Item
          </Button>
          <LinkButton extraClasses="mr-5" href={`/labels/${boxId}`}>
            Show label
          </LinkButton>
          <Button extraClasses="mr-5" onClick={showUsers}>
            Share Box
          </Button>
        </div>
      )}
      {/* Show the list of the items */}
      <ItemList items={box.items} showModal={showModal} />

      {/* Show the popup for sharing the label with users. */}
      {isShowingUsers && (
        <Overlay
          isOpen={isOpenModal}
          onClose={onCloseOverlay}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-96"}
          title={`Share ${box.name}`}
          submitText="Share"
          cancelText="Cancel"
          onSubmit={shareBoxHandler}
        >
          <div className="container flex flex-col gap-5 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share the box with other users.
            </p>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-gray-500">
                Email
              </label>
              <select
                name="email"
                id="email"
                className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="">Select an email</option>
                {emailsAndNames?.map((email, index) => (
                  <option key={index} value={email.email}>
                    {email.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Overlay>
      )}

      {/* Show the popup for creating */}
      {isOpenModal && inputs.mode === "create" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={onCloseOverlay}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-full"}
          title="Add Item"
          submitText="Create"
          cancelText="Cancel"
          onSubmit={createItemHandler}
        >
          <div className="container flex w-full flex-col gap-10 py-3 md:flex-row xl:px-0">
            <div
              className={`group relative h-96 w-full overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner`}
              style={{ backgroundImage: `url(${image})` }}
            >
              <label
                htmlFor="media"
                className="z-30 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/30 duration-200 ease-in hover:bg-gray-100/70 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800"
              >
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <div className="flex flex-row items-center justify-center gap-5">
                    <FaDownload size="2rem" className="mb-3" />
                  </div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop 2
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
              className="h-full w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner"
              value={inputs.description}
            ></textarea>
          </div>
        </Overlay>
      )}
      {/* Show the popup for editing */}
      {isOpenModal && inputs.mode === "edit" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={onCloseOverlay}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-full"}
          title="Edit Item"
          submitText="Edit"
          cancelText="Cancel"
          onSubmit={editItemHandler}
        >
          <div className="container flex w-full flex-col gap-10 py-3 md:flex-row xl:px-0">
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
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
          </div>
        </Overlay>
      )}
      {/* Show the popup for deleting */}
      {isOpenModal && inputs.mode === "delete" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={onCloseOverlay}
          title="Delete Item"
          submitText="Yes"
          submitColor="red"
          cancelText="No"
          onSubmit={deleteItemHandler}
          extraClasses={"w-96 md:mx-4 h-auto"}
        >
          <p className="py-4">Are you sure you want to delete this item?</p>
        </Overlay>
      )}
    </>
  ) : (
    <>
      <div className="container flex flex-col items-center justify-center py-10">
        <p className="text-lg font-semibold text-red-500">
          {boxError?.data?.message}
        </p>
      </div>
    </>
  );
}

export default Items;
