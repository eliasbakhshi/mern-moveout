import { QRCodeSVG } from "qrcode.react";

function Label({ id, name, labelNum }) {
  return (
    <div
      key={id}
      className={`relative flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat shadow-md transition-all ease-in-out hover:shadow-lg md:w-[calc(90%)] lg:min-h-60 lg:w-96 xl:min-h-56`}
      style={{ backgroundImage: `url('/img/label_${labelNum}.png')` }}
    >
      <p className="absolute left-10 top-8 flex w-[100px] flex-wrap items-center justify-center text-sm text-black md:left-16 md:top-24 md:w-[200px] md:text-xl lg:left-10 lg:top-14 lg:w-[100px] lg:text-base xl:left-9 xl:top-6">
        {name}
      </p>
      <QRCodeSVG
        value={`/api//boxes/${id}/items`}
        className="absolute bottom-8 left-10 h-28 w-28 md:bottom-16 md:left-16 md:h-48 md:w-48 lg:bottom-10 lg:left-10 lg:h-24 lg:w-24 xl:bottom-8 xl:left-8 xl:h-28 xl:w-28"
        title={name}
      />
    </div>
  );
}

export default Label;
