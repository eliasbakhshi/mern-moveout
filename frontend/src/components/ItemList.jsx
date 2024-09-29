import { LuTrash } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";
import AudioPlayer from "react-h5-audio-player";

function ItemList({ items, showModal }) {
  return (
    <div className="container flex w-full flex-row flex-wrap gap-x-[10%] gap-y-5 px-4 py-5 md:gap-y-10 xl:px-0">
      {Array.isArray(items) &&
        items.map((e) =>
          e.mediaType && e.mediaType === "image" ? (
            <div
              key={e._id}
              className="relative flex h-60 min-h-28 w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg md:w-[calc(80%/3)]"
            >
              {showModal && (
                <>
                  <CiEdit
                    size="2rem"
                    onClick={() => showModal(e._id, "edit")}
                    className="absolute left-1 top-1 rounded-md bg-gray-50/50 p-2 text-black transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                  />
                  <LuTrash
                    size="2rem"
                    id={e._id}
                    className="absolute right-1 top-1 rounded-md bg-gray-50/50 p-2 text-red-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                    onClick={() => showModal(e._id, "delete")}
                  />
                </>
              )}
              <div
                className="h-full w-full overflow-hidden rounded-md bg-cover bg-center bg-no-repeat text-white"
                style={{ backgroundImage: `url('/api/${e.mediaPath}')` }}
              ></div>
              {e.description && (
                <p className="p-4 font-light leading-normal text-slate-600">
                  {e.description}
                </p>
              )}
            </div>
          ) : e.mediaType && e.mediaType === "audio" ? (
            <div
              key={e._id}
              className="relative flex h-60 min-h-28 w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg md:w-[calc(80%/3)]"
            >
              {showModal && (
                <>
                  <CiEdit
                    size="2rem"
                    onClick={() => showModal(e._id, "edit")}
                    className="absolute left-1 top-1 z-20 rounded-md bg-gray-50/50 p-2 text-black transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                  />
                  <LuTrash
                    size="2rem"
                    id={e._id}
                    className="absolute right-1 top-1 z-20 rounded-md bg-gray-50/50 p-2 text-red-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                    onClick={() => showModal(e._id, "delete")}
                  />
                </>
              )}
              <div
                className="relative h-full w-full overflow-hidden rounded-md bg-cover bg-center bg-no-repeat text-white"
                style={{ backgroundImage: `url('/img/audio_box.png')` }}
              >
                <AudioPlayer
                  src={`/api/${e.mediaPath}`}
                  customAdditionalControls={[]}
                  className="absolute bottom-0 h-full w-full"
                  customVolumeControls={[]}
                  autoPlayAfterSrcChange={false}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    paddingTop: "2.5rem",
                  }}
                />
              </div>
              {e.description && (
                <p className="p-4 font-light leading-normal text-slate-600">
                  {e.description}
                </p>
              )}
            </div>
          ) : (
            <div
              key={e._id}
              className="relative flex h-60 min-h-28 w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg md:w-[calc(80%/3)]"
            >
              {showModal && (
                <>
                  <CiEdit
                    size="2rem"
                    onClick={() => showModal(e._id, "edit")}
                    className="absolute left-1 top-1 z-20 rounded-md bg-gray-50/50 p-2 text-black transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                  />
                  <LuTrash
                    size="2rem"
                    id={e._id}
                    className="absolute right-1 top-1 z-20 rounded-md bg-gray-50/50 p-2 text-red-700 transition-all ease-in-out hover:bg-red-50 hover:shadow-lg active:shadow-inner"
                    onClick={() => showModal(e._id, "delete")}
                  />
                </>
              )}
              <div
                className="h-full w-full overflow-hidden rounded-md bg-cover bg-center bg-no-repeat text-white"
                style={{ backgroundImage: `url('/img/text_box.png')` }}
              ></div>
              {e.description && (
                <p className="p-4 font-light leading-normal text-slate-600">
                  {e.description}
                </p>
              )}
            </div>
          ),
        )}
    </div>
  );
}

export default ItemList;
