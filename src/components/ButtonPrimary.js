const ButtonPrimary = ({ children, onClick, type = "button", disabled = false, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white hover:bg-gray-700 cursor-pointer transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

export default ButtonPrimary;
