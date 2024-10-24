import { QRCodeCanvas } from "qrcode.react";
import { forwardRef } from "react";

const Label = forwardRef(({ label: l, extraClasses }, ref) => {
  return (
    <div
      className={`mx-3 flex h-full flex-col items-center md:mx-0 ${extraClasses}`}
    >
      <div
        key={l._id}
        ref={ref}
        className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg shadow-md transition-all ease-in-out hover:shadow-lg`}
      >
        <img
          src={`/img/label_${l.labelNum}.png`}
          alt={`label_${l.labelNum}`}
          className="h-full w-full"
        />
        <div className="absolute left-0 flex w-[50%] flex-col items-center justify-center">
          <p className="mb-3 flex flex-wrap items-center text-center justify-center text-sm text-black md:text-xl lg:text-base">
            {l.name}
          </p>
          <QRCodeCanvas
            value={`${import.meta.env.VITE_BASE_URL}/boxes/${l._id}`}
            title={l.name}
          />
        </div>
      </div>
      {l.isPrivate && l.privateCode && (
        <div className="mt-5 flex items-center">
          <p className="text-lg font-semibold text-gray-700">Private Code: </p>
          <p className="ml-3 text-base text-gray-500">
            {l.privateCode && l.privateCode}
          </p>
        </div>
      )}
    </div>
  );
});

export default Label;
