import Button from "../../components/Button";
import { useState } from "react";
import {
  useCreateBoxMutation,
  useDeleteBoxMutation,
  useGetBoxesQuery,
} from "../../redux/api/boxApiSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaPen, FaTrash } from "react-icons/fa";
import Input from "../../components/Input";

function CreateBox() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [createBox, { isLoading: createBoxLoading, isError }] =
    useCreateBoxMutation();
  const [deleteBox, { isLoading: deleteBoxLoading }] = useDeleteBoxMutation();
  const {
    data: boxes,
    isLoading: boxesLoading,
    isFetching: boxesFetching,
    refetch: refetchBoxes,
  } = useGetBoxesQuery(id);

  const [inputs, setInputs] = useState({
    name: "",
    labelNum: 1,
  });

  const setInputHandler = (e) => {
    const { name } = e.target;
    if (value === "") {
      setInputs({ ...inputs, [name]: id });
    } else {
      setInputs({ ...inputs, [name]: value });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const productData = new FormData();
      productData.append("name", inputs.name);
      productData.append("labelNum", inputs.labelNum);

      const { data, error } = await createBox(productData);
      setInputs({
        name: "",
        labelNum: 1,
      });
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.success(data.message);
      }

      e.target.reset();
      refetchBoxes();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const deleteBoxHandler = async (boxId) => {
    try {
      const { data, error } = await deleteBox(boxId);

      toast.success(data.message);
    } catch (err) {
      toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }
    refetchBoxes();
  };

  return (
    <>
      <form
        encType="multipart/form-data"
        onSubmit={submitHandler}
        className="container mb-10 grid w-full grid-cols-1 grid-rows-2 gap-10 px-4 py-5 md:grid-cols-12 xl:px-0"
      >
        <div className="container col-span-12 row-span-5 flex flex-grow flex-row flex-wrap gap-x-[10%] gap-y-24 px-4 py-5 xl:px-0">
          <div
            onClick={() => setInputs({ ...inputs, labelNum: 1 })}
            className={`flex h-60 min-h-28 w-[calc(80%/3)] min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner ${inputs.labelNum === 1 ? "border-2 border-blue-500" : ""}`}
          >
            Box
          </div>
          <div
            onClick={() => setInputs({ ...inputs, labelNum: 2 })}
            className={`flex h-60 min-h-28 w-[calc(80%/3)] min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner ${inputs.labelNum === 2 ? "border-2 border-blue-500" : ""}`}
          >
            Box
          </div>
          <div
            onClick={() => setInputs({ ...inputs, labelNum: 3 })}
            className={`flex h-60 min-h-28 w-[calc(80%/3)] min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner ${inputs.labelNum === 3 ? "border-2 border-blue-500" : ""}`}
          >
            Box
          </div>
        </div>
        <Input
          required={true}
          minLength={1}
          name="name"
          placeholder="Box name"
          onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
          extraClasses="col-span-10 row-span-1"
         />
        <Button
          extraClasses="row-span-1 col-span-2"
          disabled={createBoxLoading}
        >
          Create
        </Button>
      </form>
      <div className="container flex flex-grow flex-row flex-wrap gap-x-[10%] gap-y-24 px-4 py-5 xl:px-0">
        {Array.isArray(boxes?.boxes) &&
          boxes.boxes.map((e) => (
            <div
              key={e._id}
              className="relative flex h-60 min-h-28 w-[calc(80%/3)] min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg"
            >
              <Link to={`/boxes/add/${e._id}`}>
                <FaPen
                  size="2.5rem"
                  id={e._id}
                  className="absolute left-1 top-1 rounded-md p-2.5 text-red-500 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                />
              </Link>
              <FaTrash
                size="2.5rem"
                id={e._id}
                className="absolute right-1 top-1 rounded-md p-2.5 text-red-500 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                onClick={() => deleteBoxHandler(e._id)}
              />
              {e.name}
            </div>
          ))}
      </div>
    </>
  );
}

export default CreateBox;
