import { CiEdit } from "react-icons/ci";
import { LuTrash } from "react-icons/lu";

function UserList({ users, showModal, changeStatusHandler }) {
  return (
    <div className="container flex w-full flex-row flex-wrap gap-x-[10%] gap-y-5 px-4 py-5 md:gap-y-10 xl:px-0">
      {Array.isArray(users) && users.length > 0 && (
        <>
          <div className="flex w-full flex-col">
            <div className="hidden rounded-t-md bg-blue-100 md:flex">
              <div className="flex w-[30%] flex-grow items-center p-3">
                Name
              </div>
              <div className="flex w-[30%] flex-grow items-center p-3">
                Email
              </div>
              <div className="flex w-[20%] flex-grow items-center justify-center p-3">
                Status
              </div>
              <div className="flex w-[20%] flex-grow items-center justify-center p-3">
                Actions
              </div>
            </div>
            <div className="flex flex-col">
              {users.map((user, index) => {
                // Check if the mediaPath is from Google
                const updatedUser = { ...user };
                if (updatedUser.mediaPath) {
                  if (!updatedUser.mediaPath.includes("googleusercontent")) {
                    updatedUser.mediaPath = `/api/${updatedUser.mediaPath}`;
                  }
                } else {
                  updatedUser.mediaPath = "/img/avatar.png";
                }

                return (
                  <div
                    className="my-2 flex flex-col rounded-md border-2 border-gray-100 shadow-md hover:bg-blue-50/30 md:my-0 md:flex-row md:rounded-none md:border-0 md:border-b-2 md:shadow-none"
                    key={index}
                  >
                    <div className="flex items-center truncate p-4 md:w-[30%] md:p-3">
                      <span className="w-28 truncate md:hidden">Name</span>
                      <img
                        src={
                          updatedUser.mediaPath
                            ? `${updatedUser.mediaPath}`
                            : `/img/avatar.png`
                        }
                        alt="User"
                        className="mr-3 h-10 w-10 rounded-full"
                      />
                      <span className="w-[calc(100%-7rem)] truncate md:w-full">
                        {updatedUser.name}
                      </span>
                    </div>
                    <div className="flex items-center p-4 md:w-[30%] md:p-3">
                      <span className="w-28 truncate md:hidden">Email</span>
                      <span className="w-[calc(100%-7rem)] truncate md:w-full">
                        {updatedUser.email}
                      </span>
                    </div>
                    <div className="flex items-center p-4 md:w-[20%] md:p-3">
                      <span className="w-28 truncate md:hidden">Status</span>
                      <span
                        className={`w-[calc(100%-7rem)] truncate md:w-full text-center ${changeStatusHandler ? "rounded-md bg-blue-100 hover:bg-blue-200  p-1  hover:cursor-pointer transition-transform duration-100 ease-in-out transform hover:-translate-y-0.5 hover:shadow-sm active:-translate-y-0 active:shadow-inner" : ""} `}
                        onClick={
                          changeStatusHandler
                            ? () =>
                                changeStatusHandler(
                                  updatedUser._id,
                                  !updatedUser.isActive,
                                )
                            : undefined
                        }
                      >
                        {updatedUser.deletedAt
                          ? "Deleted"
                          : updatedUser.isActive
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center justify-evenly p-4 md:w-[20%] md:p-3">
                      <button
                        onClick={() => showModal(updatedUser._id, "edit")}
                        className="rounded-lg p-3 text-blue-600 hover:cursor-pointer hover:bg-blue-200 hover:text-blue-900 transition-transform duration-100 ease-in-out transform hover:-translate-y-0.5 hover:shadow-sm active:-translate-y-0 active:shadow-inner"
                      >
                        <CiEdit />
                      </button>
                      <button
                        onClick={() => showModal(updatedUser._id, "delete")}
                        className="rounded-lg p-3 text-red-600 hover:cursor-pointer hover:bg-red-200 hover:text-red-900 transition-transform duration-100 ease-in-out transform hover:-translate-y-0.5 hover:shadow-sm active:-translate-y-0 active:shadow-inner"
                      >
                        <LuTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserList;
