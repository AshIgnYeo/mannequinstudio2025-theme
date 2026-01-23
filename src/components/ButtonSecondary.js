const ButtonSecondary = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-400 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
    >
      {children}
    </button>
  );
};

export default ButtonSecondary;
