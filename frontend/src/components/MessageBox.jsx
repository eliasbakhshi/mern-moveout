import PropTypes from "prop-types";

function MessageBox({ title, message, buttonText, buttonLink }) {
  return (
    <div className="m-3 flex w-full min-w-96 flex-col justify-center shadow-md md:w-auto">
      <div className="rounded bg-blue-200 p-3">
        <h2 className="my-2 font-bold">{title}</h2>
      </div>
      <div className="my-6 bg-white px-3 py-2">{message}</div>
      <div className="flex justify-end bg-blue-50/50 p-3">
        <a
          href={buttonLink}
          className="rounded bg-blue-500 px-4 py-2 font-bold capitalize text-white hover:bg-blue-600"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

MessageBox.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  buttonText: PropTypes.string,
  buttonLink: PropTypes.string,
};

export default MessageBox;
