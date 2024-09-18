import { useEffect } from "react";

function ModalDelete({ openModal, setOpenModal, deleteHandler }) {
  useEffect(() => {
    const overlay = document.getElementById("overlay");

    const handleOverlayClick = (e) => {
      if (e.target.id === "overlay") {
        overlay.style.display = "none";
        setOpenModal(false);
      }
    };

    if (overlay) {
      overlay.addEventListener("click", handleOverlayClick);
    }

    // Clean up the event listener
    return () => {
      if (overlay) {
        overlay.removeEventListener("click", handleOverlayClick);
      }
    };
  }, [setOpenModal]);

  const hideModal = () => {
    setOpenModal(false);
    overlay.style.display = "none";
  };
  return (
    <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold">Delete Confirmation</h2>
      <p className="mb-6">Are you sure you want to delete this box?</p>
      <div className="flex justify-end gap-4">
        <button
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          onClick={deleteHandler}
        >
          Yes, I'm sure
        </button>
        <button
          className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
          onClick={hideModal}
        >
          No, cancel
        </button>
      </div>
    </div>
  );
}

export default ModalDelete;
