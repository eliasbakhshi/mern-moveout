import { IoClose } from "react-icons/io5";

function Overlay({
  isOpen,
  onClose,
  onSubmit,
  title = "",
  submitText = "Yes",
  submitColor = "blue",
  cancelText = "Cancel",
  extraClasses,
  children,
}) {
  if (!isOpen) return null;

  const hideOverlay = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50"
      onClick={hideOverlay}
    >
      <form
        encType="multipart/form-data"
        onSubmit={onSubmit}
        className={`container flex w-auto flex-col rounded-lg bg-white shadow-lg ${extraClasses} overflow-y-auto`}
      >
        <div
          id="header"
          className="container left-0 top-0 flex w-full justify-between bg-gray-100 p-2"
        >
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="right-2 top-2 rounded bg-white px-1 py-1 text-gray-700 hover:bg-gray-400"
            onClick={onClose}
          >
            <IoClose />
          </button>
        </div>
        <div id="body" className="p-4">
          {children}
        </div>
        <div
          id="footer"
          className="bottom-0 left-0 flex w-full justify-end gap-4 p-4"
        >
          <button
            className={`rounded capitalize bg-${submitColor}-500 px-4 py-2 text-white hover:bg-red-600`}
          >
            {submitText}
          </button>
          <button
            className="rounded bg-gray-100 px-4 py-2 capitalize text-gray-700 hover:bg-gray-400"
            onClick={hideOverlay}
          >
            {cancelText}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Overlay;
