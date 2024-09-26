import { useState } from "react";
import { useGetLabelQuery } from "../../redux/api/boxApiSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import LinkButton from "../../components/LinkButton";
import { QRCodeSVG } from "qrcode.react";
import MessageBox from "../../components/MessageBox";

function Labels() {
  const { labelId } = useParams();

  const {
    data: label,
    isLoading: labelLoading,
    isFetching: labelFetching,
    refetch: refetchBox,
  } = useGetLabelQuery(labelId);

  const [isOpenModal, setIsOpenModal] = useState(false);

  const downloadLabelHandler = async (e) => {};

  return (
    <div className="flex h-full w-full flex-grow items-center justify-center bg-[url('/img/login-bg.jpg')]">
      <QRCodeSVG value={window.location.href} />
    </div>
  );
}

export default Labels;
