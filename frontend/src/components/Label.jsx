import { QRCodeSVG } from "qrcode.react";

function Label({ label: l }) {
  // const { _id: id, name, labelNum, privateCode } = label;

  return (
    <div className="mx-3 flex w-full flex-col items-center md:mx-0">
      <div
        key={l._id}
        className={`relative flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg md:w-[calc(90%)] lg:min-h-60 lg:w-96 xl:min-h-56`}
        style={{ backgroundImage: `url('/img/label_${l.labelNum}.png')` }}
      >
        <p className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-16 md:top-24 md:w-[200px] md:text-xl lg:left-10 lg:top-14 lg:w-[100px] lg:text-base xl:left-9 xl:top-6">
          {l.name}
        </p>
        <QRCodeSVG
          value={`${import.meta.env.VITE_BASE_URL}/boxes/${l._id}`}
          className="absolute bottom-8 left-10 h-28 w-28 md:bottom-16 md:left-16 md:h-48 md:w-48 lg:bottom-10 lg:left-10 lg:h-24 lg:w-24 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
          title={l.name}
        />
      </div>
      {l.privateCode && l.privateCode && (
        <div className="mt-5 flex items-center">
          <p className="text-lg font-semibold text-gray-700">Private Code: </p>
          <p className="ml-3 text-base text-gray-500">
            {l.privateCode && l.privateCode}
          </p>
        </div>
      )}
    </div>
  );
}

export default Label;
