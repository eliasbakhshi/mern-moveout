import { useGetBoxQuery } from "../../redux/api/mainApiSlice";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import Label from "../../components/Label";
import Button from "../../components/Button";
import Overlay from "../../components/Overlay";
import { useState } from "react";
import {
  useGetUsersEmailAndNameQuery,
  useShareLabelMutation,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";

function Labels() {
  const { labelId } = useParams();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isShowingUsers, setIsShowingUsers] = useState(false);

  const [shareLabel] = useShareLabelMutation();

  const {
    data: label,
    isLoading: labelLoading,
    isFetching: labelFetching,
    refetch: refetchBox,
  } = useGetBoxQuery(labelId);
  const { data: emailsAndNames } = useGetUsersEmailAndNameQuery();

  const showUsers = () => {
    setIsOpenModal(true);
    setIsShowingUsers(true);
  };

  const onCloseOverlay = () => {
    setIsOpenModal(false);
    setIsShowingUsers(false);
  };

  const shareLabelHandler = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    if (email === "") {
      return toast.error("Please select an email.");
    }

    try {
      const { data, error } = await shareLabel({ labelId, email });
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.success(data.message);
        setIsOpenModal(false);
        setIsShowingUsers(false);
      }
    } catch (err) {
      console.log(err)
      toast.error(
        err?.data?.message ||
          "An error occurred. Please contact the administration.",
      );
    }
  };
  return labelLoading ? (
    <Loading />
  ) : (
    <>
      <div className="flex h-full w-full flex-grow flex-col items-center justify-center bg-[url('/img/login-bg.jpg')]">
        <div className="my-5 flex w-full flex-col items-start gap-y-4 px-2 md:flex-row md:items-center md:px-4 xl:px-0">
          <Button extraClasses="mr-5" onClick={showUsers}>
            Share Label
          </Button>
        </div>
        <div className="flex w-full flex-grow items-center justify-center">
          <Label label={label} />
        </div>
      </div>
      {/* Show the popup for sharing the label with users. */}
      {isShowingUsers && (
        <Overlay
          isOpen={isOpenModal}
          onClose={onCloseOverlay}
          setIsOpen={setIsOpenModal}
          extraClasses={"w-96"}
          title={`Share ${label.name}`}
          submitText="Share"
          cancelText="Cancel"
          onSubmit={shareLabelHandler}
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
    </>
  );
}

export default Labels;
