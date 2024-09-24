import PropTypes from "prop-types";
import {forwardRef} from 'react';

const Input = forwardRef(({ extraClasses, ...rest }, ref) => {
  return (
    <input
      {...rest}
      ref={ref}
      className={`w-full rounded-lg bg-white p-2 shadow-md transition-shadow ease-in-out hover:shadow-lg active:shadow-inner ${extraClasses}`}
    />
  );
});

Input.propTypes = {
  extraClasses: PropTypes.string,
};

export default Input;
