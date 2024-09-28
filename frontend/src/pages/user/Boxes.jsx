import Button from "../../components/Button";
import { useState } from "react";
import {
  useCreateBoxMutation,
  useDeleteBoxMutation,
  useUpdateBoxMutation,
  useGetBoxesQuery,
} from "../../redux/api/mainApiSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaPen, FaTrash } from "react-icons/fa";
import Input from "../../components/Input";
import { createPortal } from "react-dom";
import Overlay from "../../components/Overlay";
import { QRCodeSVG } from "qrcode.react";
import { LuTrash } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";

// TODO: Check the create and edit button in the popup is default selected when the user press enter

function Boxes() {
  const navigate = useNavigate();
  const [createBox] = useCreateBoxMutation();
  const [deleteBox] = useDeleteBoxMutation();
  const [updateBox] = useUpdateBoxMutation();
  const {
    data: boxes,
    isLoading: boxesLoading,
    isFetching: boxesFetching,
    refetch: refetchBoxes,
  } = useGetBoxesQuery();

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
      <div className="container my-2 flex items-center px-4 xl:px-0">
        <Button extraClasses="mb-4" onClick={() => showModal("", "create")}>
          Create New Box
        </Button>
      </div>
      <div className="container flex flex-row flex-wrap gap-[5%] gap-y-6 px-4 py-5 lg:gap-x-[10%] xl:px-0">
        {Array.isArray(boxes?.boxes) &&
          boxes.boxes.map((e) => (
            <div
              key={e._id}
              className={`relative flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:cursor-pointer hover:shadow-lg md:min-h-32 md:w-[calc(90%/3)] lg:min-h-40 lg:w-[calc(80%/3)] xl:min-h-56`}
              onClick={(event) => navigateToAddItems(e._id, event)}
              style={{ backgroundImage: `url('/img/label_${e.labelNum}.png')` }}
            >
              <CiEdit
                size="2rem"
                onClick={() => showModal(e._id, "edit")}
                className="absolute left-1 top-1 rounded-md bg-gray-50/50 p-2 text-gray-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner md:h-[2rem] md:w-[2rem] md:p-2"
              />
              <LuTrash
                size="2rem"
                className="absolute right-1 top-1 rounded-md bg-gray-50/50 p-2 text-red-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner md:h-[2rem] md:w-[2rem] md:p-2"
                onClick={() => showModal(e._id, "delete")}
              />
              <p
                className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-3 md:top-7 md:w-[85px] xl:left-9 xl:top-6"
                onClick={(event) => navigateToAddItems(e._id, event)}
              >
                {e.name}
              </p>
              <QRCodeSVG
                value={`/api//boxes/${e._id}/items`}
                className="absolute bottom-8 left-10 h-28 w-28 md:bottom-5 md:left-6 md:h-14 md:w-14 lg:h-20 lg:w-20 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
                title={e.name}
                onClick={(event) => navigateToAddItems(e._id, event)}
              />
            </div>
          ))}
      </div>
      {/* Show the popup for creating */}
      {isOpenModal && inputs.mode === "create" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          extraClasses={"w-full md:mx-4"}
          title="Create Box"
          submitText="Create"
          submitColor="blue"
          cancelText="Cancel"
          onSubmit={createBoxHandler}
        >
          <div className="container flex w-full flex-col py-5 xl:px-0">
            <div className="row-span-row-1 container col-span-1 mb-5 flex h-full flex-grow flex-col gap-x-[5%] gap-y-5 md:col-span-12 md:row-span-5 md:flex-row lg:gap-x-[10%] xl:px-0">
              <div
                onClick={() => setInputs({ ...inputs, labelNum: 1 })}
                className={`relative flex min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:h-[10%] md:min-h-32 md:w-[calc(90%/3)] lg:min-h-40 lg:w-[calc(80%/3)] xl:min-h-56 ${inputs.labelNum === 1 ? "border-2 border-blue-500" : ""}`}
                style={{
                  backgroundImage: `url('/img/label_1.png')`,
                }}
              >
                <p className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-3 md:top-6 md:w-[85px] xl:left-9 xl:top-6">
                  Box 1
                </p>
                <QRCodeSVG
                  value={`/api//boxes`}
                  className="absolute bottom-8 left-10 h-28 w-28 md:bottom-5 md:left-6 md:h-14 md:w-14 lg:h-20 lg:w-20 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
                  title={"Label 1"}
                />
              </div>
              <div
                onClick={() => setInputs({ ...inputs, labelNum: 2 })}
                className={`relative flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:min-h-32 md:w-[calc(90%/3)] lg:min-h-40 lg:w-[calc(80%/3)] xl:min-h-56 ${inputs.labelNum === 2 ? "border-2 border-blue-500" : ""}`}
                style={{
                  backgroundImage: `url('/img/label_2.png')`,
                }}
              >
                <p className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-3 md:top-6 md:w-[85px] xl:left-9 xl:top-6">
                  Box 2
                </p>
                <QRCodeSVG
                  value={`/api//boxes`}
                  className="absolute bottom-8 left-10 h-28 w-28 md:bottom-5 md:left-6 md:h-14 md:w-14 lg:h-20 lg:w-20 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
                  title={"Label 2"}
                />
              </div>
              <div
                onClick={() => setInputs({ ...inputs, labelNum: 3 })}
                className={`relative flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:min-h-32 md:w-[calc(90%/3)] lg:min-h-40 lg:w-[calc(80%/3)] xl:min-h-56 ${inputs.labelNum === 3 ? "border-2 border-blue-500" : ""}`}
                style={{
                  backgroundImage: `url('/img/label_3.png')`,
                }}
              >
                <p className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-3 md:top-6 md:w-[85px] xl:left-9 xl:top-6">
                  Box 3
                </p>
                <QRCodeSVG
                  value={`/api//boxes`}
                  className="absolute bottom-8 left-10 h-28 w-28 md:bottom-5 md:left-6 md:h-14 md:w-14 lg:h-20 lg:w-20 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
                  title={"Label 3"}
                />
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
          extraClasses={"w-full md:mx-4"}
          title="Edit Box"
          submitText="Edit"
          cancelText="Cancel"
          onSubmit={editBoxHandler}
        >
          <div className="container flex w-full flex-col py-5 xl:px-0">
            <div className="row-span-row-1 container col-span-1 mb-5 flex h-full flex-grow flex-col gap-x-[5%] gap-y-5 md:col-span-12 md:row-span-5 md:flex-row lg:gap-x-[10%] xl:px-0">
              <div
                onClick={() => setInputs({ ...inputs, labelNum: 1 })}
                className={`relative flex min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:h-[10%] md:min-h-32 md:w-[calc(90%/3)] lg:min-h-40 lg:w-[calc(80%/3)] xl:min-h-56 ${inputs.labelNum === 1 ? "border-2 border-blue-500" : ""}`}
                style={{
                  backgroundImage: `url('/img/label_1.png')`,
                }}
              >
                <p className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-3 md:top-6 md:w-[85px] xl:left-9 xl:top-6">
                  {inputs.name}
                </p>
                <QRCodeSVG
                  value={`/api//boxes/${inputs._id}/items`}
                  className="absolute bottom-8 left-10 h-28 w-28 md:bottom-5 md:left-6 md:h-14 md:w-14 lg:h-20 lg:w-20 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
                  title={inputs.name}
                />
              </div>
              <div
                onClick={() => setInputs({ ...inputs, labelNum: 2 })}
                className={`relative flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:min-h-32 md:w-[calc(90%/3)] lg:min-h-40 lg:w-[calc(80%/3)] xl:min-h-56 ${inputs.labelNum === 2 ? "border-2 border-blue-500" : ""}`}
                style={{
                  backgroundImage: `url('/img/label_2.png')`,
                }}
              >
                <p className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-3 md:top-6 md:w-[85px] xl:left-9 xl:top-6">
                  {inputs.name}
                </p>
                <QRCodeSVG
                  value={`/api//boxes/${inputs._id}/items`}
                  className="absolute bottom-8 left-10 h-28 w-28 md:bottom-5 md:left-6 md:h-14 md:w-14 lg:h-20 lg:w-20 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
                  title={inputs.name}
                />
              </div>
              <div
                onClick={() => setInputs({ ...inputs, labelNum: 3 })}
                className={`relative flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:min-h-32 md:w-[calc(90%/3)] lg:min-h-40 lg:w-[calc(80%/3)] xl:min-h-56 ${inputs.labelNum === 3 ? "border-2 border-blue-500" : ""}`}
                style={{
                  backgroundImage: `url('/img/label_3.png')`,
                }}
              >
                <p className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-3 md:top-6 md:w-[85px] xl:left-9 xl:top-6">
                  {inputs.name}
                </p>
                <QRCodeSVG
                  value={`/api//boxes/${inputs._id}/items`}
                  className="absolute bottom-8 left-10 h-28 w-28 md:bottom-5 md:left-6 md:h-14 md:w-14 lg:h-20 lg:w-20 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
                  title={inputs.name}
                />
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
          extraClasses={"w-96 md:mx-4 h-auto"}
        >
          <p className="py-4">Are you sure you want to delete this box?</p>
        </Overlay>
      )}
    </>
  );
}

export default Boxes;
