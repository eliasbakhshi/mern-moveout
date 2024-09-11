function Error404() {
  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-center flex-grow">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600">Oops! Page not found.</p>
        <a
          href="/"
          className="mt-8 rounded bg-blue-500 px-4 py-2 capitalize text-white hover:bg-blue-600"
        >
          Go back to Home
        </a>
      </div>
    </>
  );
}

export default Error404;
