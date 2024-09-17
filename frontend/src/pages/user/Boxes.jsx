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
import ModalDelete from "../../components/ModalDelete";


function Boxes() {
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
    id: "",
    mode: "create",
    name: "",
    labelNum: 1,
  });
  const [openModal, setOpenModal] = useState(false);

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

  const deleteBoxHandler = async () => {
    const boxId = inputs.id || "";
    try {
      const { data, error } = await deleteBox(boxId);

      toast.success(data.message);
    } catch (err) {
      toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }

    refetchBoxes();
    setOpenModal(false);
  };

  const navigateToAddItems = (boxId, e) => {
    if (e.target === e.currentTarget) {
      navigate(`/boxes/${boxId}/items/add`);
    }
  };

  const showModal = (boxId) => {
    setInputs({ ...inputs, id: boxId });
    setOpenModal(true);
  };

  console.log("inputs", inputs);

  return (
    <>
      <form
        encType="multipart/form-data"
        onSubmit={submitHandler}
        className="container mb-20 grid w-full grid-cols-1 gap-4 px-4 py-5 md:mb-10 md:grid-cols-12 xl:px-0"
      >
        <Input
          required={true}
          minLength={1}
          name="name"
          type="text"
          placeholder="Box name"
          onInput={(e) => setInputs({ ...inputs, name: e.target.value })}
          extraClasses="col-span-1 md:col-span-10 row-span-1"
        />
        <Button
          extraClasses="row-span-1 col-span-1 md:col-span-2 mb-6 md:mb-0"
          disabled={createBoxLoading}
        >
          Create
        </Button>
        <div className="container flex h-full flex-grow flex-col gap-[5%] md:col-span-12 md:row-span-5 md:flex-row lg:gap-x-[10%] xl:px-0">
          <div
            onClick={() => setInputs({ ...inputs, labelNum: 1 })}
            className={`flex min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:h-[10%] md:min-h-36 md:w-[calc(90%/3)] lg:w-[calc(80%/3)] ${inputs.labelNum === 1 ? "border-2 border-blue-500" : ""}`}
          >
            Box
          </div>
          <div
            onClick={() => setInputs({ ...inputs, labelNum: 2 })}
            className={`flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:min-h-36 md:w-[calc(90%/3)] lg:w-[calc(80%/3)] ${inputs.labelNum === 2 ? "border-2 border-blue-500" : ""}`}
          >
            Box
          </div>
          <div
            onClick={() => setInputs({ ...inputs, labelNum: 3 })}
            className={`flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:min-h-36 md:w-[calc(90%/3)] lg:w-[calc(80%/3)] ${inputs.labelNum === 3 ? "border-2 border-blue-500" : ""}`}
          >
            Box
          </div>
        </div>
      </form>
      <div className="container flex flex-row flex-wrap gap-[5%] gap-y-6 px-4 py-5 lg:gap-x-[10%] xl:px-0">
        {Array.isArray(boxes?.boxes) &&
          boxes.boxes.map((e) => (
            <div
              key={e._id}
              className="relative flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:cursor-pointer hover:shadow-lg md:min-h-36 md:w-[calc(90%/3)] lg:w-[calc(80%/3)]"
              onClick={(event) => navigateToAddItems(e._id, event)}
            >
              <FaPen
                size="2.5rem"
                onClick={() => console.log("edit")}
                id={e._id}
                className="absolute left-1 top-1 rounded-md p-2.5 text-red-500 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
              />
              <FaTrash
                size="2.5rem"
                className="absolute right-1 top-1 rounded-md p-2.5 text-red-500 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                // onClick={() => deleteBoxHandler(e._id)}
                onClick={() => showModal(e._id)}
              />
              {e.name}
            </div>
          ))}
      </div>
      <ModalDelete
        openModal={openModal}
        setOpenModal={setOpenModal}
        deleteBoxHandler={deleteBoxHandler}
      ></ModalDelete>
    </>
  );
}

export default Boxes;
