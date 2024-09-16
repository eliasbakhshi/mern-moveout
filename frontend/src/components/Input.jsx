import PropTypes from "prop-types";

function Input({ extraClasses, ...rest }) {
  return (
    <input
      {...rest}
      className={`w-full rounded-lg bg-white p-3 shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner ${extraClasses}`}
    />
  );
}

Input.propTypes = {
  extraClasses: PropTypes.string,
};

export default Input;
