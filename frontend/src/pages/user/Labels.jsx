import { useState } from "react";
import { useGetBoxQuery } from "../../redux/api/boxApiSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import LinkButton from "../../components/LinkButton";
import { QRCodeSVG } from "qrcode.react";
import MessageBox from "../../components/MessageBox";
import Label from "../../components/Label";
import { PDFViewer } from "@react-pdf/renderer";
import PDFLabel from "../../components/PDFLabel";

function Labels() {
  const { labelId } = useParams();

  const {
    data: label,
    isLoading: labelLoading,
    isFetching: labelFetching,
    refetch: refetchBox,
  } = useGetBoxQuery(labelId);

  const [isOpenModal, setIsOpenModal] = useState(false);

  const downloadLabelHandler = async (e) => {};
  console.log(label);
  console.log(labelId);

  return (
    <div className="flex h-full w-full flex-grow items-center justify-center bg-[url('/img/login-bg.jpg')]">
      <Label id={label._id} name={label.name} labelNum={label.labelNum}/>
      {/* <PDFViewer> */}
        {/* {label &&<PDFLabel id={label._id} name={label.name} labelNum={label.labelNum} />} */}
      {/* </PDFViewer> */}
    </div>
  );
}

export default Labels;
