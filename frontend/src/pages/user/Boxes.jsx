import Button from "../../components/Button";
import { Fragment, useState } from "react";
import {
  useCreateBoxMutation,
  useDeleteBoxMutation,
  useUpdateBoxMutation,
  useGetBoxesQuery,
  useChangeBoxStatusMutation,
} from "../../redux/api/mainApiSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaPen, FaTrash, FaLock, FaLockOpen, FaEdit } from "react-icons/fa";
import Input from "../../components/Input";
import Overlay from "../../components/Overlay";
import { QRCodeSVG } from "qrcode.react";
import { LuTrash } from "react-icons/lu";
import { CiEdit, CiUnlock } from "react-icons/ci";
import { useSelector } from "react-redux";
import { useEffect } from "react";

// TODO: Check the create and edit button in the popup is default selected when the user press enter
// TODO: Add pagination
// TODO: boxes array is not connected to box array in the database in the user model

function Boxes() {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [createBox] = useCreateBoxMutation();
  const [deleteBox] = useDeleteBoxMutation();
  const [updateBox] = useUpdateBoxMutation();
  const [changeBoxStatus] = useChangeBoxStatusMutation();
  const {
    data: boxes,
    isLoading: boxesLoading,
    isFetching: boxesFetching,
  } = useGetBoxesQuery();

  const [inputs, setInputs] = useState({
    boxId: "",
    mode: "create",
    name: "",
    labelNum: 1,
    isPrivate: false,
    type: "standard",
  });
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    // Redirect to profile page if the user is inactivated.
    if (userInfo?.isActive === false || userInfo?.isActive === undefined) {
      navigate("/profile");
    }
  }, [navigate, userInfo]);

  const createBoxHandler = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await createBox({
        name: inputs.name,
        labelNum: inputs.labelNum,
        isPrivate: inputs.isPrivate,
        type: inputs.type,
      });
      if (error) {
        return toast.error(error.data.message);
      } else {
        setInputs({
          boxId: "",
          mode: "create",
          name: "",
          labelNum: 1,
          isPrivate: false,
          type: "standard",
        });
        e.target.reset();
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

  const editBoxHandler = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await updateBox({
        boxId: inputs.boxId,
        name: inputs.name,
        labelNum: inputs.labelNum,
        isPrivate: inputs.isPrivate,
        type: inputs.type,
      });

      if (error) {
        return toast.error(error.data.message);
      } else {
        setInputs({
          boxId: "",
          mode: "create",
          name: "",
          labelNum: 1,
          isPrivate: false,
          type: "standard",
        });
        e.target.reset();
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

  const deleteBoxHandler = async (e) => {
    e.preventDefault();
    const boxId = inputs.boxId || "";
    try {
      const { data, error } = await deleteBox(boxId);

      if (error) {
        return toast.error(error.data.message);
      } else {
        setIsOpenModal(false);
        return toast.success(data.message);
      }
    } catch (err) {
      return toast.error(
        err?.message || "An error occurred. Please contact the administration.",
      );
    }
  };

  const navigateToAddItems = (boxId, e) => {
    console.log("boxId", boxId);
    if (e.target.tagName === "DIV" || e.target.closest("div")) {
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
        isPrivate: false,
        type: "standard",
      });
    } else {
      setInputs({ ...inputs, boxId, mode });
    }
    setIsOpenModal(true);
  };

  const changeBoxStatusHandler = async (e) => {
    // Check if user clicks inside of the div or not
    if (e.target.tagName === "DIV" || e.target.closest("div")) {
      let boxId, status;
      if (e.target.tagName === "DIV") {
        status = e.target.getAttribute("data-status") === "true";
        boxId = e.target.id;
      } else {
        status = e.target.closest("div").getAttribute("data-status") === "true";
        boxId = e.target.closest("div").id;
      }
      if ((!status, !boxId)) {
        return;
      }
      try {
        const { data, error } = await changeBoxStatus({
          boxId,
          status: !status,
        });
        if (error) {
          return toast.error(error.data.message);
        } else {
          return toast.success(data.message);
        }
      } catch (err) {
        return toast.error(
          err?.data?.message ||
            "An error occurred. Please contact the administration.",
        );
      }
    }
  };

  // Box types
  const boxTypes = [
    { labelNum: 1, type: "standard" },
    { labelNum: 2, type: "standard" },
    { labelNum: 3, type: "standard" },
    { labelNum: 4, type: "insurance" },
  ];

  console.log("inputs", inputs);
  console.log("boxes?.boxes", boxes?.boxes);
  return (
    <>
      <div className="container my-2 flex items-center px-4 xl:px-0">
        <Button extraClasses="mb-4" onClick={() => showModal("", "create")}>
          Create New Box
        </Button>
      </div>
      <div className="container flex flex-row flex-wrap gap-[5%] gap-y-6 px-4 py-5 xl:px-0">
        {Array.isArray(boxes?.boxes) &&
          boxes.boxes.map((e) => {
            return (
              <Fragment key={e._id}>
                {e.type == "standard" && (
                  <article className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:cursor-pointer hover:shadow-lg md:w-[calc(90%/3)]">
                    <div
                      className={`relative flex h-full w-full flex-grow items-center bg-cover bg-center bg-no-repeat`}
                      onClick={(event) => navigateToAddItems(e._id, event)}
                    >
                      <img
                        src={`/img/label_${e.labelNum}.png`}
                        alt={`label_${e.labelNum}`}
                        className="h-full w-full"
                      />
                      <div className="absolute flex w-[45%] flex-col items-center">
                        <p className="mb-10 w-4/5 overflow-hidden text-center text-sm text-black md:mb-4 xl:mb-6">
                          {e.name}
                        </p>
                        <QRCodeSVG
                          value={`${import.meta.env.VITE_BASE_URL}/boxes/${e._id}/items`}
                          className="h-24 w-24 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28"
                          title={e.name}
                        />
                      </div>
                      §
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <div
                        onClick={() => showModal(e._id, "edit")}
                        className="flex h-[3rem] w-[33%] items-center justify-center text-gray-700 transition-all ease-in-out hover:bg-blue-50 hover:shadow-lg active:shadow-inner md:h-[2rem] xl:h-[3rem]"
                      >
                        <FaEdit
                          size="2rem"
                          className="p-1.5 md:p-2.5 xl:p-1.5"
                        />
                      </div>

                      {e.isPrivate ? (
                        <div
                          onClick={changeBoxStatusHandler}
                          id={e._id}
                          data-status={e.isPrivate}
                          className="flex h-[3rem] w-[33%] items-center justify-center text-gray-700 transition-all ease-in-out hover:bg-blue-50 hover:shadow-lg active:shadow-inner md:h-[2rem] xl:h-[3rem]"
                        >
                          <FaLock
                            size="2rem"
                            className="p-1.5 md:p-2.5 xl:p-1.5"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={changeBoxStatusHandler}
                          id={e._id}
                          data-status={e.isPrivate}
                          className="flex h-[3rem] w-[33%] items-center justify-center text-gray-700 transition-all ease-in-out hover:bg-blue-50 hover:shadow-lg active:shadow-inner md:h-[2rem] xl:h-[3rem]"
                        >
                          <FaLockOpen
                            size="2rem"
                            className="p-1.5 md:p-2.5 xl:p-1.5"
                          />
                        </div>
                      )}
                      <div
                        onClick={() => showModal(e._id, "delete")}
                        data-status={e.isPrivate}
                        className="flex h-[3rem] w-[33%] items-center justify-center text-gray-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner md:h-[2rem] xl:h-[3rem]"
                      >
                        <FaTrash
                          size="2rem"
                          className="p-1.5 text-red-700 md:p-2.5 xl:p-1.5"
                        />
                      </div>
                    </div>
                  </article>
                )}
                {e.type === "insurance" && (
                  <article className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg shadow-md transition-all ease-in-out hover:cursor-pointer hover:shadow-lg md:w-[calc(90%/3)]">
                    <div
                      className={`relative flex h-full w-full flex-grow items-center`}
                      onClick={(event) => navigateToAddItems(e._id, event)}
                    >
                      <img
                        src={`/img/label_${e.labelNum}.png`}
                        alt={`label_${e.labelNum}`}
                        className="h-full w-full"
                      />

                      <div className="absolute top-0 flex h-[35%] w-full flex-col items-center justify-center">
                        <p
                          className="w-[80%] overflow-hidden text-center text-sm text-black"
                          onClick={(event) => navigateToAddItems(e._id, event)}
                        >
                          {e.name}
                        </p>
                      </div>
                      <div className="absolute bottom-0 flex h-[65%] w-full justify-around">
                        <img
                          src={`/img/insurance_logo.png`}
                          alt={`label_${e.labelNum}`}
                          className="h-24 w-24 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28"
                        />
                        <QRCodeSVG
                          value={`${import.meta.env.VITE_BASE_URL}/boxes/${e._id}/items`}
                          className="h-24 w-24 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28"
                          title={e.name}
                          onClick={(event) => navigateToAddItems(e._id, event)}
                        />
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <div
                        onClick={() => showModal(e._id, "edit")}
                        className="flex h-[3rem] w-[33%] items-center justify-center text-gray-700 transition-all ease-in-out hover:bg-blue-50 hover:shadow-lg active:shadow-inner md:h-[2rem] xl:h-[3rem]"
                      >
                        <FaEdit
                          size="2rem"
                          className="p-1.5 md:p-2.5 xl:p-1.5"
                        />
                      </div>

                      {e.isPrivate ? (
                        <div
                          onClick={changeBoxStatusHandler}
                          id={e._id}
                          data-status={e.isPrivate}
                          className="flex h-[3rem] w-[33%] items-center justify-center text-gray-700 transition-all ease-in-out hover:bg-blue-50 hover:shadow-lg active:shadow-inner md:h-[2rem] xl:h-[3rem]"
                        >
                          <FaLock
                            size="2rem"
                            className="p-1.5 md:p-2.5 xl:p-1.5"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={changeBoxStatusHandler}
                          id={e._id}
                          data-status={e.isPrivate}
                          className="flex h-[3rem] w-[33%] items-center justify-center text-gray-700 transition-all ease-in-out hover:bg-blue-50 hover:shadow-lg active:shadow-inner md:h-[2rem] xl:h-[3rem]"
                        >
                          <FaLockOpen
                            size="2rem"
                            className="p-1.5 md:p-2.5 xl:p-1.5"
                          />
                        </div>
                      )}
                      <div
                        onClick={() => showModal(e._id, "delete")}
                        data-status={e.isPrivate}
                        className="flex h-[3rem] w-[33%] items-center justify-center text-gray-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner md:h-[2rem] xl:h-[3rem]"
                      >
                        <FaTrash
                          size="2rem"
                          className="p-1.5 text-red-700 md:p-2.5 xl:p-1.5"
                        />
                      </div>
                    </div>
                  </article>
                )}
              </Fragment>
            );
          })}
      </div>
      {/* Show the popup for creating */}
      {isOpenModal && inputs.mode === "create" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          extraClasses={"md:mx-4 max-w-[48rem] max-h-[95vh] md:h-auto"}
          title="Create Box"
          submitText="Create"
          submitColor="blue"
          cancelText="Cancel"
          onSubmit={createBoxHandler}
        >
          <div className="container flex w-full flex-grow flex-col justify-between py-5 xl:px-0">
            <div className="container mb-5 flex flex-grow flex-wrap gap-x-[5%] gap-y-5 md:flex-row xl:px-0">
              {boxTypes.map((e) => {
                return (
                  <Fragment key={e.labelNum}>
                    {e.type === "standard" && (
                      <div
                        onClick={() =>
                          setInputs({
                            ...inputs,
                            labelNum: e.labelNum,
                            type: e.type,
                          })
                        }
                        className={`relative flex max-w-96 flex-col items-center justify-center overflow-hidden rounded-lg shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:w-[calc(95%/2)] ${inputs.labelNum === e.labelNum ? "border-2 border-blue-500" : ""}`}
                      >
                        <img
                          src={`/img/label_${e.labelNum}.png`}
                          alt={`label_${e.labelNum}`}
                          className="h-full w-full"
                        />
                        <div className="absolute left-0 flex w-[50%] flex-col items-center">
                          <p className="mb-8 w-4/5 overflow-hidden text-center text-sm text-black md:mb-6">
                            {inputs.name ? inputs.name : `Box ${e.labelNum}`}
                          </p>
                          <QRCodeSVG
                            value={`${import.meta.env.VITE_BASE_URL}/boxes`}
                            className="h-28 w-28 md:h-28 md:w-28 lg:h-28 lg:w-28 xl:h-28 xl:w-28"
                            title={`Label ${e.labelNum}`}
                          />
                        </div>
                      </div>
                    )}
                    {e.type === "insurance" && (
                      <div
                        onClick={() =>
                          setInputs({
                            ...inputs,
                            labelNum: e.labelNum,
                            type: e.type,
                          })
                        }
                        className={`relative flex w-full max-w-96 flex-col items-center justify-center overflow-hidden rounded-lg shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:w-[calc(95%/2)] ${inputs.labelNum === e.labelNum ? "border-2 border-blue-500" : ""}`}
                      >
                        <img
                          src={`/img/label_${e.labelNum}.png`}
                          alt={`label_${e.labelNum}`}
                          className="h-full w-full"
                        />

                        <div className="absolute top-0 flex h-[30%] w-full flex-col items-center justify-center">
                          <p className="w-[80%] overflow-hidden text-center text-sm text-black">
                            {inputs.name ? inputs.name : `Box ${e.labelNum}`}
                          </p>
                        </div>
                        <div className="absolute bottom-0 flex h-[70%] w-full justify-around">
                          <img
                            src={`/img/insurance_logo.png`}
                            alt={`label_${e.labelNum}`}
                            className="h-28 w-28 md:h-28 md:w-28 lg:h-28 lg:w-28 xl:h-28 xl:w-28"
                          />
                          <QRCodeSVG
                            value={`${import.meta.env.VITE_BASE_URL}/boxes`}
                            className="h-28 w-28 md:h-28 md:w-28 lg:h-28 lg:w-28 xl:h-28 xl:w-28"
                            title={`Label ${e.labelNum}`}
                          />
                        </div>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
            <div className="container mt-3 flex flex-col md:mt-0 md:flex-row">
              <Input
                required={true}
                minLength={1}
                name="name"
                type="text"
                placeholder="Box Name"
                onInput={(e) => setInputs({ ...inputs, name: e.target.value })}
                extraClasses=""
              />
              <div className="my-4 flex items-center md:pl-5">
                <span className="mr-2 text-sm text-gray-700">Private</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={inputs.toggleOption}
                    onChange={(e) =>
                      setInputs({ ...inputs, isPrivate: e.target.checked })
                    }
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                </label>
              </div>
            </div>
          </div>
        </Overlay>
      )}
      {/* Show the popup for editing */}
      {isOpenModal && inputs.mode === "edit" && (
        <Overlay
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(!isOpenModal)}
          extraClasses={"md:mx-4 max-w-[48rem] max-h-[95vh] md:h-auto"}
          title="Edit Box"
          submitText="Edit"
          cancelText="Cancel"
          onSubmit={editBoxHandler}
        >
          <div className="container flex w-full flex-grow flex-col justify-between py-5 xl:px-0">
            <div className="container mb-5 flex flex-grow flex-wrap gap-x-[5%] gap-y-5 md:flex-row xl:px-0">
              {boxTypes.map((e) => {
                return (
                  <Fragment key={e.labelNum}>
                    {e.type === "standard" && (
                      <div
                        onClick={() =>
                          setInputs({
                            ...inputs,
                            labelNum: e.labelNum,
                            type: e.type,
                          })
                        }
                        className={`relative flex max-w-96 flex-col items-center justify-center overflow-hidden rounded-lg shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:w-[calc(95%/2)] ${inputs.labelNum === e.labelNum ? "border-2 border-blue-500" : ""}`}
                      >
                        <img
                          src={`/img/label_${e.labelNum}.png`}
                          alt={`label_${e.labelNum}`}
                          className="h-full w-full"
                        />
                        <div className="absolute left-0 flex w-[50%] flex-col items-center">
                          <p className="mb-8 w-[80%] overflow-hidden text-center text-sm text-black md:mb-6">
                            {inputs.name ? inputs.name : `Box ${e.labelNum}`}
                          </p>
                          <QRCodeSVG
                            value={`${import.meta.env.VITE_BASE_URL}/boxes/${inputs._id}/items`}
                            className="h-28 w-28 md:h-28 md:w-28 lg:h-28 lg:w-28 xl:h-28 xl:w-28"
                            title={`Label ${e.labelNum}`}
                          />
                        </div>
                      </div>
                    )}
                    {e.type === "insurance" && (
                      <div
                        onClick={() =>
                          setInputs({
                            ...inputs,
                            labelNum: e.labelNum,
                            type: e.type,
                          })
                        }
                        className={`relative flex w-full max-w-96 flex-col items-center justify-center overflow-hidden rounded-lg shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:w-[calc(95%/2)] ${inputs.labelNum === e.labelNum ? "border-2 border-blue-500" : ""}`}
                      >
                        <img
                          src={`/img/label_${e.labelNum}.png`}
                          alt={`label_${e.labelNum}`}
                          className="h-full w-full"
                        />

                        <div className="absolute top-0 flex h-[30%] w-full flex-col items-center justify-center">
                          <p className="w-[80%] overflow-hidden text-center text-sm text-black">
                            {inputs.name ? inputs.name : `Box ${e.labelNum}`}
                          </p>
                        </div>
                        <div className="absolute bottom-0 flex h-[70%] w-full justify-around">
                          <img
                            src={`/img/insurance_logo.png`}
                            alt={`label_${e.labelNum}`}
                            className="h-28 w-28 md:h-28 md:w-28 lg:h-28 lg:w-28 xl:h-28 xl:w-28"
                          />
                          <QRCodeSVG
                            value={`${import.meta.env.VITE_BASE_URL}/boxes`}
                            className="h-28 w-28 md:h-28 md:w-28 lg:h-28 lg:w-28 xl:h-28 xl:w-28"
                            title={`Label ${e.labelNum}`}
                          />
                        </div>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
            <div className="container mt-3 flex flex-col md:mt-0 md:flex-row">
              <Input
                required={true}
                minLength={1}
                name="name"
                type="text"
                value={inputs.name}
                placeholder="Box Name"
                onInput={(e) => setInputs({ ...inputs, name: e.target.value })}
                extraClasses=""
              />
              <div className="my-4 flex items-center md:pl-5">
                <span className="mr-2 text-sm text-gray-700">Private</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={inputs.isPrivate}
                    onChange={(e) =>
                      setInputs({ ...inputs, isPrivate: e.target.checked })
                    }
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                </label>
              </div>
            </div>
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
