const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-gray-800 py-4 text-white">
      <div className="container mx-auto flex justify-center">
        <p>&copy; {year} Move out. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
