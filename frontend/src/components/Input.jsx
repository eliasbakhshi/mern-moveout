import PropTypes from "prop-types";
import { forwardRef } from "react";

const Input = forwardRef(({ extraClasses, ...rest }, ref) => {
  return (
    <input
      {...rest}
      ref={ref}
      className={`border-1 w-full rounded-lg border-gray-200 bg-white p-2 shadow-md transition-shadow ease-in-out hover:shadow-lg h-12 active:shadow-inner ${extraClasses}`}
    />
  );
});

Input.propTypes = {
  extraClasses: PropTypes.string,
};

export default Input;
