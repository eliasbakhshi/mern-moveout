import Button from "../../components/Button";
import { useState } from "react";
import {
  useCreateBoxMutation,
  useDeleteBoxMutation,
  useUpdateBoxMutation,
  useGetBoxesQuery,
} from "../../redux/api/boxApiSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaPen, FaTrash } from "react-icons/fa";
import Input from "../../components/Input";
import { createPortal } from "react-dom";
import Overlay from "../../components/Overlay";

function Boxes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [createBox] = useCreateBoxMutation();
  const [deleteBox] = useDeleteBoxMutation();
  const [updateBox] = useUpdateBoxMutation();
  const {
    data: boxes,
    isLoading: boxesLoading,
    isFetching: boxesFetching,
    refetch: refetchBoxes,
  } = useGetBoxesQuery(id);

  const [inputs, setInputs] = useState({
    boxId: "",
    mode: "create",
    name: "",
    labelNum: 1,
  });
  const [isOpenModal, setIsOpenModal] = useState(false);

  const createBoxHandler = async (e) => {
    e.preventDefault();
    try {
      const productData = new FormData();
      productData.append("name", inputs.name);
      productData.append("labelNum", inputs.labelNum);

      const { data, error } = await createBox(productData);
      setInputs({
        boxId: "",
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
      refetchBoxes();
      setIsOpenModal(false);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  const deleteBoxHandler = async (e) => {
    e.preventDefault();
    const boxId = inputs.boxId || "";
    try {
      const { data, error } = await deleteBox(boxId);

      if (error) {
        toast.error(error.data.message);
      } else {
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }

    refetchBoxes();
    setIsOpenModal(false);
  };

  const navigateToAddItems = (boxId, e) => {
    if (e.target === e.currentTarget) {
      navigate(`/boxes/${boxId}/items`);
    }
  };

  const showModal = (boxId = "", mode = "create") => {
    if (mode === "edit") {
      // Find the box information for editing
      const box = boxes.boxes.find((box) => box._id === boxId);
      setInputs({
        ...box,
        mode,
        boxId,
      });
    } else if (mode === "create") {
      setInputs({
        boxId: "",
        mode: "create",
        name: "",
        labelNum: 1,
      });
    } else {
      setInputs({ ...inputs, boxId, mode });
    }
    setIsOpenModal(true);
  };

  const editBoxHandler = async (e) => {
    e.preventDefault();

    try {
      const productData = new FormData();
      productData.append("boxId", inputs.boxId);
      productData.append("name", inputs.name);
      productData.append("labelNum", inputs.labelNum);

      const { data, error } = await updateBox(productData);
      setInputs({
        boxId: "",
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
      refetchBoxes();
      setIsOpenModal(false);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };

  return (
    <>
      <div className="container my-2 flex items-center">
        <Button extraClasses="mb-4" onClick={() => showModal("", "create")}>
          Create New Box
        </Button>
      </div>
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
                onClick={() => showModal(e._id, "edit")}
                className="absolute left-1 top-1 rounded-md p-2.5 text-gray-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
              />
              <FaTrash
                size="2.5rem"
                className="absolute right-1 top-1 rounded-md p-2.5 text-red-500 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                onClick={() => showModal(e._id, "delete")}
              />
              {e.name}
              {inputs.mode === "edit" &&
                isOpenModal &&
                createPortal(
                  <div>test is here</div>,
                  document.getElementById("overlay"),
                )}
            </div>
          ))}
      </div>
      {/* Show the popup for creating */}
      {isOpenModal && inputs.mode === "create" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          extraClasses={"w-full"}
          title="Create Box"
          submitText="Create"
          cancelText="Cancel"
          onSubmit={createBoxHandler}
        >
          <div className="container grid w-full grid-cols-1 gap-4 px-4 py-5 md:grid-cols-12 xl:px-0">
            <div className="container mb-5 flex h-full flex-grow flex-col gap-[5%] md:col-span-12 md:row-span-5 md:flex-row lg:gap-x-[10%] xl:px-0">
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
            <Input
              required={true}
              minLength={1}
              name="name"
              type="text"
              placeholder="Box Name"
              onInput={(e) => setInputs({ ...inputs, name: e.target.value })}
              extraClasses="col-span-1 md:col-span-12 row-span-1"
            />
          </div>
        </Overlay>
      )}
      {/* Show the popup for editing */}
      {isOpenModal && inputs.mode === "edit" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          extraClasses={"w-full"}
          title="Edit Box"
          submitText="Edit"
          cancelText="Cancel"
          onSubmit={editBoxHandler}
        >
          <div className="container grid w-full grid-cols-1 gap-4 px-4 py-5 md:grid-cols-12 xl:px-0">
            <div className="container mb-5 flex h-full flex-grow flex-col gap-[5%] md:col-span-12 md:row-span-5 md:flex-row lg:gap-x-[10%] xl:px-0">
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
            <Input
              required={true}
              minLength={1}
              name="name"
              type="text"
              value={inputs.name}
              placeholder="Box Name"
              onInput={(e) => setInputs({ ...inputs, name: e.target.value })}
              extraClasses="col-span-1 md:col-span-12 row-span-1"
            />
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
          onSubmit={deleteBoxHandler}
        >
          <p>Are you sure you want to delete this box?</p>
        </Overlay>
      )}
    </>
  );
}

export default Boxes;
