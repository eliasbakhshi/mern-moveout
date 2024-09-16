import { useSelector } from "react-redux";
import Welcome from "./Welcome";
import Boxes from "./user/Boxes";

function Home() {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ?  <Boxes /> : <Welcome />;
}

export default Home;
