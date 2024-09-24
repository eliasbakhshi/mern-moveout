import PropTypes from "prop-types";
import LinkButton from "./LinkButton";

function MessageBox({ title, message, buttonText, buttonLink }) {
  return (
    <div className="m-3 flex w-full min-w-96 flex-col justify-center shadow-md md:w-auto">
      <div className="rounded bg-blue-200 p-3">
        <h2 className="my-2 font-bold">{title}</h2>
      </div>
      <div className="my-6 bg-white px-3 py-2">{message}</div>
      <div className="flex justify-end bg-blue-50/50 p-3">
        <LinkButton
          href={buttonLink}
          extraClasses="mt-5"
        >
          {buttonText}
        </LinkButton>
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
