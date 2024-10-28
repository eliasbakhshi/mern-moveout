import Button from "../components/LinkButton";

function Welcome() {
  return (
    <div
      className="flex w-full flex-grow items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url(/img/login-bg.jpg)" }}
    >
      <div className="mx-3 flex min-w-96 flex-col items-center justify-center rounded-md bg-white bg-opacity-10 p-10 shadow-md backdrop-blur-lg backdrop-filter">
        <Button
          href="/login"
          extraClasses="font-bold mb-4"
        >
          Login
        </Button>
        <Button
          href="/register"
          extraClasses="font-bold mb-4"
        >
          Registration
        </Button>
      </div>
    </div>
  );
}

export default Welcome;
