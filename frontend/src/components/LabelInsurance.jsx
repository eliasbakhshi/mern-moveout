import { QRCodeCanvas } from "qrcode.react";
import { forwardRef } from "react";

const LabelInsurance = forwardRef(({ label: l, extraClasses }, ref) => {
  return (
    <div
      className={`mx-3 flex h-full flex-col items-center md:mx-0 ${extraClasses}`}
    >
      <div
        key={l._id}
        ref={ref}
        className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg shadow-md transition-all ease-in-out hover:cursor-pointer hover:shadow-lg`}
      >
        <img
          src={`/img/label_${l.labelNum}.png`}
          alt={`label_${l.labelNum}`}
          className="h-full w-full"
        />
        <div className="absolute top-0 flex h-[40%] w-full flex-col items-center justify-center">
          <p className="flex flex-wrap text-sm text-black text-center">{l.name}</p>
        </div>
        <div className="bg-red-0 absolute bottom-0 flex h-[60%] w-full justify-evenly">
          <img
            src={`/img/insurance_logo.png`}
            alt={`label_${l.labelNum}`}
            className="h-24 w-24 md:h-24 md:w-24 lg:h-24 lg:w-24 xl:h-24 xl:w-24"
          />
          <QRCodeCanvas
            value={`${import.meta.env.VITE_BASE_URL}/boxes/${l._id}`}
            size={95}
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

export default LabelInsurance;
