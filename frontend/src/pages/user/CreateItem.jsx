import Button from "../../components/Button";
import { useState } from "react";
import { FaDownload, FaTrash, FaPen } from "react-icons/fa";
import {
  useCreateItemMutation,
  useGetItemsQuery,
  useDeleteItemMutation,
  useGetBoxQuery,
} from "../../redux/api/boxApiSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";

import "dotenv/config";





function CreateItem() {
  const [image, setImage] = useState("");
  const { id } = useParams();
  const [inputs, setInputs] = useState({
    boxId: id,
    description: "",
    media: "",
  });

  const c1 = new Client(process.env.API_KEY);

  c1.report(new Error('documented example'))


  console.log(process.env.REACT_APP_API_BASE_URL);

  // TODO: check backend validation for the inputs
  // TODO: check inputs before sending them to the backend
  // TODO: check the responsiveness of the page

  const [createItem, { isLoading: createItemLoading }] =
    useCreateItemMutation();
  const [deleteItem, { isLoading: deleteItemLoading }] =
    useDeleteItemMutation();
  const {
    data: items,
    isLoading: itemsLoading,
    isFetching: itemsFetching,
    refetch: refetchItems,
  } = useGetItemsQuery(id);
  const {
    data: box,
    isLoading: boxLoading,
    isFetching: boxFetching,
  } = useGetBoxQuery(id);

  const fileChangeHandler = async (e) => {
    const media = e.target.files[0];
    // TODO: check the media type before adding it to the box
    console.log(media.type);

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

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const productData = new FormData();
      productData.append("boxId", inputs.boxId);
      productData.append("description", inputs.description);
      productData.append("media", inputs.media);

      // const { data, status } = await createItem(productData);
      const { data, error } = await createItem(productData);
      setInputs({
        boxId: id,
        description: "",
        media: "",
      });
      setImage("");

      refetchItems();
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

  console.log("box", box);
  const deleteItemHandler = async (itemId) => {
    try {
      const { data, error } = await deleteItem(itemId);
      toast.success(data.message);
    } catch (err) {
      toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }
    refetchItems();
  };

  return boxLoading ? (
    <Loading />
  ) : box ? (
    <>
      <form
        encType="multipart/form-data"
        onSubmit={submitHandler}
        className="container mb-10 grid w-full grid-cols-1 grid-rows-6 gap-10 px-4 py-5 md:grid-cols-2 xl:px-0"
      >
        <div
          className={`row-span-6 min-h-20 w-full rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner`}
          style={{ backgroundImage: `url(${image})` }}
        >
          <label
            htmlFor="media"
            className="z-30 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/30 duration-200 ease-in hover:bg-gray-100/70 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800"
          >
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <FaDownload size="2rem" className="mb-3" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
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
              onChange={fileChangeHandler}
            />
          </label>
        </div>
        <textarea
          name="description"
          onChange={changeHandler}
          className="row-span-5 min-h-12 w-full rounded-lg bg-white shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner"
        ></textarea>
        <Button extraClasses="row-span-1" disabled={createItemLoading}>
          Add
        </Button>
      </form>
      <div className="container flex flex-grow flex-row flex-wrap gap-x-[10%] gap-y-24 px-4 py-5 xl:px-0">
        {Array.isArray(items?.items) &&
          items.items.map((e) => (
            <div
              key={e._id}
              className="relative flex h-60 min-h-28 w-[calc(80%/3)] min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg"
            >
              <div className="absolute left-1 top-1 bg-green-50 p-2 text-green-500">
                {e.description}
              </div>
              <img src={e.mediaPath} alt={e.description} />
              <FaTrash
                size="2.5rem"
                id={e._id}
                className="absolute right-1 top-1 rounded-md p-2.5 text-red-500 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                onClick={() => deleteItemHandler(e._id)}
              />
              Box
            </div>
          ))}
      </div>
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

export default CreateItem;
