import Button from "../../components/Button";
import { useState } from "react";
import { FaDownload, FaTrash, FaPen } from "react-icons/fa";
import {
  useCreateItemMutation,
  useDeleteItemMutation,
  useUpdateItemMutation,
  useGetBoxQuery,
} from "../../redux/api/boxApiSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import Overlay from "../../components/Overlay";

// TODO: Add sort by type or name or date
// TODO: Make a filter for the media type
// TODO: Reset all the inputs after the submission or close or cancel
function Items() {
  const [image, setImage] = useState("");
  const { boxId } = useParams();
  const [inputs, setInputs] = useState({
    itemId: "",
    description: "",
    media: "",
    boxId,
    mode: "create",
  });

  // TODO: check the responsiveness of the page

  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  const [deleteItem] = useDeleteItemMutation();
  const {
    data: box,
    isLoading: boxLoading,
    isFetching: boxFetching,
    refetch: refetchBox,
  } = useGetBoxQuery(boxId);

  const [isOpenModal, setIsOpenModal] = useState(false);

  const fileChangeHandler = async (e) => {
    const media = e.target.files[0];
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "audio/mpeg",
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

  const createItemHandler = async (e) => {
    e.preventDefault();

    if (inputs.description === "" && inputs.media === "") {
      toast.error("Please give a description or upload a file.");
      return;
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
        mode: "create",
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
      const item = box.box.items.find((box) => box._id === itemId);
      setInputs({
        ...inputs,
        description: item.description,
        mode,
        itemId,
        boxId,
      });
      setImage(`/api/${item.mediaPath}`);
    } else if (mode === "create") {
      setInputs({
        itemId: "",
        description: "",
        media: "",
        boxId,
        mode,
      });
      setImage("");
    } else {
      setInputs({ ...inputs, itemId, mode });
    }
    setIsOpenModal(true);
  };

  const editItemHandler = async (e) => {
    e.preventDefault();

    try {
      const productData = new FormData();
      productData.append("boxId", inputs.boxId);
      productData.append("itemId", inputs.itemId);
      productData.append("description", inputs.description);
      productData.append("media", inputs.media);

      const { data, error } = await updateItem(productData);
      setInputs({
        itemId: "",
        mode: "create",
        name: "",
        labelNum: 1,
      });
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.success(data.message);
      }

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

  return boxLoading ? (
    <Loading />
  ) : box ? (
    <>
      <div className="container flex justify-start">
        <Button extraClasses="mb-5" onClick={() => showModal("", "create")}>
          Create Item
        </Button>
      </div>

      <div className="container flex flex-grow flex-row flex-wrap gap-x-[10%] gap-y-24 px-4 py-5 xl:px-0">
        {Array.isArray(box?.box?.items) &&
          box.box.items.map((e) => (
            <div
              key={e._id}
              className="relative flex h-60 min-h-28 w-[calc(80%/3)] min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg"
            >
              <FaPen
                size="2.5rem"
                onClick={() => showModal(e._id, "edit")}
                className="absolute left-1 top-1 rounded-md p-2.5 text-gray-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
              />
              <FaTrash
                size="2.5rem"
                id={e._id}
                className="absolute right-1 top-1 rounded-md p-2.5 text-red-500 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                onClick={() => showModal(e._id, "delete")}
              />
              {e.description}
            </div>
          ))}
      </div>

      {/* Show the delete message for creating */}
      {isOpenModal && inputs.mode === "create" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-full"}
          title="Create Item"
          submitText="Create"
          cancelText="Cancel"
          onSubmit={createItemHandler}
        >
          <div className="container flex w-full gap-10 py-3 xl:px-0">
            <div
              className={`h-96 w-full rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner`}
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
                />
              </label>
            </div>
            <textarea
              name="description"
              onInput={changeHandler}
              className="min-h-12 w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner"
              value={inputs.description}
            ></textarea>
          </div>
        </Overlay>
      )}
      {/* Show the delete message for creating */}
      {isOpenModal && inputs.mode === "edit" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-full"}
          title="Edit Item"
          submitText="Edit"
          cancelText="Cancel"
          onSubmit={editItemHandler}
        >
          <div className="container flex w-full gap-10 py-3 xl:px-0">
            <div
              className={`h-96 w-full rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner`}
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
                />
              </label>
            </div>
            <textarea
              name="description"
              onInput={changeHandler}
              className="min-h-12 w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner"
              value={inputs.description}
            ></textarea>
          </div>
        </Overlay>
      )}
      {/* Show the popup for deleting */}
      {isOpenModal && inputs.mode === "delete" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          title="Delete Item"
          submitText="Yes"
          submitColor="red"
          cancelText="No"
          onSubmit={deleteItemHandler}
        >
          <p>Are you sure you want to delete this item?</p>
        </Overlay>
      )}
    </>
  ) : (
    <>
      <div className="container flex flex-col items-center justify-center py-10">
        <p className="text-lg font-semibold text-red-500">
          The box does not exist.
        </p>
      </div>
    </>
  );
}

export default Items;
