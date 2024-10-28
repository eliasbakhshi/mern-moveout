import { useSelector } from "react-redux";
import Welcome from "./Welcome";
import CreateBox from "./user/Boxes";

function Home() {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.role ? <CreateBox /> : <Welcome />;
}

export default Home;
