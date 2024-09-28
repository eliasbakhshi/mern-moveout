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
import LinkButton from "../../components/LinkButton";
import { LuTrash } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";
import AudioPlayer from "react-h5-audio-player";

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
    mediaPath: "",
  });

  // TODO: check the responsiveness of the page

  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  const [deleteItem] = useDeleteItemMutation();
  const {
    data: box,
    isLoading: boxLoading,
    refetch: refetchBox,
  } = useGetBoxQuery(boxId);

  const [isOpenModal, setIsOpenModal] = useState(false);

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
    setInputs({ ...inputs, media: "", mediaPath: "" });
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
        mode: "create",
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
      const item = box.items.find((box) => box._id === itemId);
      setInputs({
        ...inputs,
        description: item.description,
        mode,
        itemId,
        boxId,
        mediaPath: item.mediaPath,
      });
      item.mediaPath && setImage(`/api/${item.mediaPath}`);
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
    } else {
      setInputs({ ...inputs, itemId, mode });
    }
    setIsOpenModal(true);
  };

  const editItemHandler = async (e) => {
    e.preventDefault();

    if (inputs.description === "" && (inputs.media === undefined || inputs.media === "")&& (inputs.mediaPath === undefined || inputs.mediaPath === "")) {
      return toast.error("Please give a description or upload a file.");
    }

    console.log("inputs.description", inputs.description)
    console.log("inputs.mediaPath", inputs.mediaPath)
    console.log("inputs.media", inputs.media)

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
        mode: "create",
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

  return boxLoading ? (
    <Loading />
  ) : box ? (
    <>
      <div className="container my-2 flex w-full items-center px-4 xl:px-0">
        <Button extraClasses="mr-5" onClick={() => showModal("", "create")}>
          Add New Item
        </Button>
        <LinkButton extraClasses="" href={`/labels/${boxId}`}>
          Show label
        </LinkButton>
      </div>

      <div className="container flex w-full flex-row flex-wrap gap-x-[10%] gap-y-5 px-4 py-5 md:gap-y-10 xl:px-0">
        {Array.isArray(box?.items) &&
          box.items.map((e) =>
            e.mediaType && e.mediaType === "image" ? (
              <div
                key={e._id}
                className="relative flex h-60 min-h-28 w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg md:w-[calc(80%/3)]"
              >
                <CiEdit
                  size="2rem"
                  onClick={() => showModal(e._id, "edit")}
                  className="absolute left-1 top-1 rounded-md bg-gray-50/50 p-2 text-black transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                />
                <LuTrash
                  size="2rem"
                  id={e._id}
                  className="absolute right-1 top-1 rounded-md bg-gray-50/50 p-2 text-red-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                  onClick={() => showModal(e._id, "delete")}
                />
                <div
                  className="h-full w-full overflow-hidden rounded-md bg-cover bg-center bg-no-repeat text-white"
                  style={{ backgroundImage: `url('/api/${e.mediaPath}')` }}
                ></div>
                {e.description && (
                  <p className="p-4 font-light leading-normal text-slate-600">
                    {e.description}
                  </p>
                )}
              </div>
            ) : e.mediaType && e.mediaType === "audio" ? (
              <div
                key={e._id}
                className="relative flex h-60 min-h-28 w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg md:w-[calc(80%/3)]"
              >
                <CiEdit
                  size="2rem"
                  onClick={() => showModal(e._id, "edit")}
                  className="absolute left-1 top-1 rounded-md bg-gray-50/50 p-2 text-black transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner z-20"
                />
                <LuTrash
                  size="2rem"
                  id={e._id}
                  className="absolute right-1 top-1 rounded-md bg-gray-50/50 p-2 text-red-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner z-20"
                  onClick={() => showModal(e._id, "delete")}
                />
                <div
                  className="relative h-full w-full overflow-hidden rounded-md bg-cover bg-center bg-no-repeat text-white"
                  style={{ backgroundImage: `url('/img/audio_box.png')` }}
                >
                  <AudioPlayer
                    src={`/api/${e.mediaPath}`}
                    onPlay={(e) => console.log("onPlay")}
                    customAdditionalControls={[]}
                    className="absolute bottom-0 h-full w-full"
                    customVolumeControls={[]}
                    autoPlayAfterSrcChange={false}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      paddingTop: "2.5rem",
                    }}
                  />
                </div>
                {e.description && (
                  <p className="p-4 font-light leading-normal text-slate-600">
                    {e.description}
                  </p>
                )}
              </div>
            ) : (
              <div
                key={e._id}
                className="relative flex h-60 min-h-28 w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg md:w-[calc(80%/3)]"
              >
                <CiEdit
                  size="2rem"
                  onClick={() => showModal(e._id, "edit")}
                  className="absolute left-1 top-1 rounded-md bg-gray-50/50 p-2 text-black transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner z-20"
                />
                <LuTrash
                  size="2rem"
                  id={e._id}
                  className="absolute right-1 top-1 rounded-md bg-gray-50/50 p-2 text-red-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner z-20"
                  onClick={() => showModal(e._id, "delete")}
                />
                <div
                  className="h-full w-full overflow-hidden rounded-md bg-cover bg-center bg-no-repeat text-white"
                  style={{ backgroundImage: `url('/img/text_box.png')` }}
                ></div>
                {e.description && (
                  <p className="p-4 font-light leading-normal text-slate-600">
                    {e.description}
                  </p>
                )}
              </div>
            ),
          )}
      </div>

      {/* Show the popup for creating */}
      {isOpenModal && inputs.mode === "create" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
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
                className="absolute flex w-full justify-center border-2 border-t-0 border-dashed border-gray-300 bg-gray-200 p-3 transition hover:cursor-pointer lg:group-hover:-translate-y-full bottom-0 lg:bottom-auto"
                onClick={deletePreview}
              >
                <FaTrash size="2rem" />
              </div>
            </div>
            <textarea
              name="description"
              onInput={changeHandler}
              className="w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner h-full"
              value={inputs.description}
            ></textarea>
          </div>
        </Overlay>
      )}
      {/* Show the popup for editing */}
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
                className="absolute flex w-full justify-center border-2 border-t-0 border-dashed border-gray-300 bg-gray-200 p-3 transition hover:cursor-pointer lg:group-hover:-translate-y-full bottom-0 lg:bottom-auto"
                onClick={deletePreview}
              >
                <FaTrash size="2rem" />
              </div>
            </div>
            <textarea
              name="description"
              onInput={changeHandler}
              className="min-h-12 w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner h-full"
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
          The box does not exist.
        </p>
      </div>
    </>
  );
}

export default Items;
