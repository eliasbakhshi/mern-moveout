import PropTypes from "prop-types";
import LinkButton from "./LinkButton";
import Button from "./Button";

function MessageBox({ title, message, buttonText, buttonLink }) {
  return (
      <div
        className={`container flex w-auto flex-col overflow-y-auto rounded-lg bg-white shadow-lg`}
      >
        <div
          id="header"
          className="container left-0 top-0 flex w-full justify-between bg-gray-100 p-2"
        >
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div id="body" className="p-4">
          <p> {message}</p>
        </div>
        <div
          id="footer"
          className="bottom-0 left-0 flex w-full justify-end gap-4 p-4"
        >
          <LinkButton
            href={buttonLink}
            className={`rounded bg-blue-500 px-4 py-2 capitalize text-white hover:bg-blue-600`}
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
