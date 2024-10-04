import { useGetBoxQuery } from "../../redux/api/mainApiSlice";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import Label from "../../components/Label";

function Labels() {
  const { labelId } = useParams();

  const {
    data: label,
    isLoading: labelLoading,
    isFetching: labelFetching,
    refetch: refetchBox,
  } = useGetBoxQuery(labelId);

  return labelLoading ? (
    <Loading />
  ) : (
    <div className="flex h-full w-full flex-grow items-center justify-center bg-[url('/img/login-bg.jpg')]">
      <Label label={label} />
    </div>
  );
}

export default Labels;
