import ItemList from "../components/ItemList";
import Loading from "../components/Loading";
import { useGetItemsQuery } from "../redux/api/mainApiSlice";
import { useParams } from "react-router-dom";

function BoxDetails() {
  const { boxId } = useParams();
  const {
    data: items,
    isLoading: itemsLoading,
    refetch: refetchItems,
    error: itemsError,
  } = useGetItemsQuery(boxId);

  return itemsLoading ? (
    <Loading />
  ) : items ? <ItemList items={items} /> :
  (
      <div className="container flex flex-col items-center justify-center py-10">
        <p className="text-lg font-semibold text-red-500">
          {itemsError.data.message}
        </p>
      </div>
  )
}

export default BoxDetails;
