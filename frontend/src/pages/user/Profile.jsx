

function Profile() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Profile</h1>
        <div>
          <label className="text-gray-700">Profile Picture:</label>
          <img
            src="profile.jpg"
            alt="Profile Picture"
            className="h-32 w-32 rounded-full"
          />
        </div>
        <div className="flex flex-col space-y-4">
          <div>
            <label className="text-gray-700">Name:</label>
            <p className="text-gray-900">John Doe</p>
          </div>
          <div>
            <label className="text-gray-700">Email:</label>
            <p className="text-gray-900">johndoe@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
