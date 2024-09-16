import PropTypes from "prop-types";

function LinkButton({ link, extraClasses, children, ...rest }) {
  return (
    <a
      href={link}
      className={`rounded-md bg-blue-500 px-4 py-2 capitalize text-white transition-all ease-in-out hover:shadow-lg active:shadow-inner ${extraClasses}`}
      {...rest}
    >
      {children}
    </a>
  );
}

LinkButton.propTypes = {
  extraClasses: PropTypes.string,
  link: PropTypes.string,
  children: PropTypes.node,
};

export default LinkButton;
