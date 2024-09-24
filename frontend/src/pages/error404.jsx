import LinkButton from "../components/LinkButton";

function Error404() {
  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-center flex-grow">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600">Oops! Page not found.</p>
        <LinkButton
          href="/"
          extraClasses="mt-5"
        >
          Go back to Home
        </LinkButton>
      </div>
    </>
  );
}

export default Error404;
