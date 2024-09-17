import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function LinkButton({ link, extraClasses, children, ...rest }) {
  return (
    <Link
      href={link}
      className={`rounded-md bg-blue-500 px-4 py-2 capitalize text-white transition-all ease-in-out hover:shadow-lg active:shadow-inner ${extraClasses} hover:shadow-md hover:translate-y-[-1px] active:translate-y-0 active:shadow-inner`}
      {...rest}
    >
      {children}
    </Link>
  );
}

LinkButton.propTypes = {
  extraClasses: PropTypes.string,
  link: PropTypes.string,
  children: PropTypes.node,
};

export default LinkButton;
