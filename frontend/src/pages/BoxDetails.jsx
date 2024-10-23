import ItemList from "../components/ItemList";
// import Loading from "../components/Loading";
import { useGetItemsQuery } from "../redux/api/mainApiSlice";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MessageBox from "../components/MessageBox";
import Loading from "../components/Loading";
import { toast } from "react-toastify";
import Input from "../components/Input";
import ItemListInsurance from "../components/ItemListInsurance";

// TODO: Show the list of the items with a 6 digit number if the label is private and the item is not in the box
function BoxDetails() {
  const { boxId } = useParams();
  const [privateCode, setPrivateCode] = useState("");
  const [isCodeComplete, setIsCodeComplete] = useState(false);

  const {
    data: items,
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useGetItemsQuery({ boxId, privateCode });

  useEffect(() => {
    if (isCodeComplete) {
      refetchItems();
    }
  }, [isCodeComplete, refetchItems]);

  useEffect(() => {
    if (
      itemsError &&
      itemsError?.data &&
      itemsError?.data?.message?.includes("right")
    ) {
      return toast.error(itemsError.data.message);
    }
  }, [itemsError]);

  const handleCodeChange = (e) => {
    const code = e.target.value;
    if (code.length === 6) {
      setPrivateCode(code);
      setIsCodeComplete(true);
    } else {
      setIsCodeComplete(false);
    }
  };


  return itemsLoading ? (
    <Loading />
  ) : items ? (
    items.type === "standard" ? (
      <ItemList items={items.items} />
    ) : (
      <ItemListInsurance items={items.items} currency={items.currency} />
    )
  ) : itemsError?.data?.message?.includes("private") ? (
    <>
      <div className="flex w-full flex-grow items-center justify-center">
        <MessageBox title="Private Box">
          <div className="container flex flex-col items-center justify-center py-2">
            <p className="text-grey-500 mb-4 text-lg font-semibold">
              Please enter the private code to see the items.
            </p>
            <Input
              type="number"
              className="m-4 appearance-none rounded border border-gray-300 p-2"
              placeholder="Enter private code"
              onChange={handleCodeChange}
              pattern="\d*"
              inputMode="numeric"
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E") {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </MessageBox>
      </div>
    </>
  ) : (
    <div className="container flex flex-col items-center justify-center py-10">
      <p className="text-lg font-semibold text-red-500">
        {items?.error?.data?.message && items?.error?.data?.message}
        {itemsError?.data?.message && itemsError?.data?.message}
      </p>
    </div>
  );
}

export default BoxDetails;
