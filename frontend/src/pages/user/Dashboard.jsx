import LinkButton from "../../components/LinkButton";

function Dashboard() {
  return (
    <>
      <div className="container flex py-5">
        <LinkButton
          href="/boxes/create"
          className="rounded-md bg-blue-500 px-4 py-2 capitalize text-white"
        >
          Create Box
        </LinkButton>
      </div>
      <div className="container flex flex-grow flex-row flex-wrap gap-x-[10%] gap-y-24 py-5">
        <div className="flex h-60 min-h-28 w-[calc(80%/3)] min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner">
          Box
        </div>
        <div className="flex h-60 min-h-28 w-[calc(80%/3)] min-w-28 flex-col items-center justify-center rounded-lg bg-white shadow-md transition-all ease-in-out hover:shadow-lg active:shadow-inner">
          Box
        </div>
      </div>
    </>
  );
}

export default Dashboard;
