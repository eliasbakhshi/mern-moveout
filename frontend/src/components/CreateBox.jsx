import Button from "./Button";
import Input from "./Input";

function CreateBox({inputs, setInputs, createBoxLoading = false, submitHandler}) {
  return  <form
  encType="multipart/form-data"
  onSubmit={submitHandler}
  className="container mb-20 grid w-full grid-cols-1 gap-4 px-4 py-5 md:mb-10 md:grid-cols-12 xl:px-0"
>
  <Input
    required={true}
    minLength={1}
    name="name"
    type="text"
    placeholder="Box name"
    onInput={(e) => setInputs({ ...inputs, name: e.target.value })}
    extraClasses="col-span-1 md:col-span-10 row-span-1"
  />
  <Button
    extraClasses="row-span-1 col-span-1 md:col-span-2 mb-6 md:mb-0"
    disabled={createBoxLoading}
  >
    Create
  </Button>
  <div className="container flex h-full flex-grow flex-col gap-[5%] md:col-span-12 md:row-span-5 md:flex-row lg:gap-x-[10%] xl:px-0">
    <div
      onClick={() => setInputs({ ...inputs, labelNum: 1 })}
      className={`flex min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:h-[10%] md:min-h-36 md:w-[calc(90%/3)] lg:w-[calc(80%/3)] ${inputs.labelNum === 1 ? "border-2 border-blue-500" : ""}`}
    >
      Box
    </div>
    <div
      onClick={() => setInputs({ ...inputs, labelNum: 2 })}
      className={`flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:min-h-36 md:w-[calc(90%/3)] lg:w-[calc(80%/3)] ${inputs.labelNum === 2 ? "border-2 border-blue-500" : ""}`}
    >
      Box
    </div>
    <div
      onClick={() => setInputs({ ...inputs, labelNum: 3 })}
      className={`flex h-[10%] min-h-[55vw] w-full min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner md:min-h-36 md:w-[calc(90%/3)] lg:w-[calc(80%/3)] ${inputs.labelNum === 3 ? "border-2 border-blue-500" : ""}`}
    >
      Box
    </div>
  </div>
</form>;
}

export default CreateBox;

