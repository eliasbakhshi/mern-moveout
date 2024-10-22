import { LuTrash } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";
import { Fragment } from "react";

function ItemListInsurance({ items, showModal }) {
  return (
    <div className="container flex w-full flex-row flex-wrap gap-x-[10%] gap-y-5 px-4 py-5 md:gap-y-10 xl:px-0">
      {Array.isArray(items) && items.length > 0 && (
        <>
          <div className="flex w-full flex-col">
            <div className="hidden rounded-t-md bg-blue-100 md:flex">
              <div className="flex w-[50%] flex-grow items-center p-3">
                Item
              </div>
              <div className={`flex ${showModal ? "w-[30%]" : "w-[50%]" }  flex-grow items-center p-3`}>
                Value
              </div>
              {showModal && (
                <div className="flex w-[20%] flex-grow items-center justify-center p-3">
                  Actions
                </div>
              )}
            </div>
            <div className="flex flex-col">
              {items.map((item, index) => (
                item.mediaType === undefined && (
                <Fragment key={index}>
                  <div
                    className="my-2 flex flex-col rounded-md border-2 border-gray-100 shadow-md hover:bg-blue-50/30 md:my-0 md:flex-row md:rounded-none md:border-0 md:border-b-2 md:shadow-none"
                    key={index}
                  >
                    <div className="flex items-center truncate p-4 md:w-[50%] md:p-3">
                      <span className="w-28 truncate md:hidden">Item</span>
                      <span className="w-[calc(100%-7rem)] truncate md:w-full">
                        {item.description}
                      </span>
                    </div>
                    <div className="flex items-center p-4 md:w-[30%] md:p-3">
                      <span className="w-28 truncate md:hidden">Value</span>

                      <span className="w-[calc(100%-7rem)] truncate md:w-full">
                        {item.value}
                      </span>
                    </div>
                    {showModal && (
                      <>
                        <div className="flex items-center justify-evenly p-4 md:w-[20%] md:p-3">
                          <button
                            onClick={() => showModal(item._id, "edit")}
                            className="rounded-lg p-3 text-blue-600 hover:cursor-pointer hover:bg-blue-200 hover:text-blue-900"
                          >
                            <CiEdit />
                          </button>
                          <button
                            onClick={() => showModal(item._id, "delete")}
                            className="rounded-lg p-3 text-red-600 hover:cursor-pointer hover:bg-red-200 hover:text-red-900"
                          >
                            <LuTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </Fragment>)
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <p className="mx-3 inline-block font-bold">Total:</p>
            {items.reduce(
              (total, item) =>
                total + (isNaN(Number(item.value)) ? 0 : Number(item.value)),
              0,
            )}{" "}
            SEK
          </div>
        </>
      )}

      {/* items.map((e) => {         })} */}
    </div>
  );
}

export default ItemListInsurance;
