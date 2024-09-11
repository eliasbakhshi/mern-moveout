function Home() {
  return (
    <div
      className="flex w-full items-center justify-center flex-grow "
      style={{ backgroundImage: "url(/img/login-bg.jpg)" }}
    >
      <div className="flex flex-col min-w-96 items-center justify-center  rounded p-5 shadow mx-3">
        <a href="/login" className="capitalize rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 m-5">
          Login
        </a>
        <a href="/register" className="capitalize rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 m-5">
          Registration
        </a>
      </div>
    </div>
  );
}

export default Home;
