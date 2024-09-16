function Welcome() {
  return (
    <div
      className="flex w-full flex-grow items-center justify-center"
      style={{ backgroundImage: "url(/img/login-bg.jpg)" }}
    >
      <div className="mx-3 flex min-w-96 flex-col items-center justify-center rounded p-5 shadow">
        <a
          href="/login"
          className="m-5 rounded bg-blue-500 px-4 py-2 font-bold capitalize text-white hover:bg-blue-700"
        >
          Login
        </a>
        <a
          href="/register"
          className="m-5 rounded bg-blue-500 px-4 py-2 font-bold capitalize text-white hover:bg-blue-700"
        >
          Registration
        </a>
      </div>
    </div>
  );
}

export default Welcome;
