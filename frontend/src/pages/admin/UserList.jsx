import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

function UserList() {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to profile page if the user is inactivated.
    if (userInfo?.isActive === false || userInfo?.isActive === undefined) {
      navigate("/profile");
    }
  }, [navigate, userInfo]);

  return <div>UserList</div>;
}

export default UserList;
