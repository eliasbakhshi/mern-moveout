import PropTypes from "prop-types";

function Button({ extraClasses, children, ...rest }) {
  return (
    <button
      className={`rounded-md bg-blue-500 px-4 py-2 capitalize text-white transition-all ease-in-out hover:shadow-lg active:shadow-inner ${extraClasses}`}
      {...rest}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  extraClasses: PropTypes.string,
  children: PropTypes.node,
};

export default Button;
