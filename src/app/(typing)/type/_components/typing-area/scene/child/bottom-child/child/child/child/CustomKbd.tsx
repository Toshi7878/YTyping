interface CustomKbdProps {
  isDisabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  hidden?: boolean;
  [key: string]: any;
}

const CustomKbd = ({ isDisabled, children, onClick, hidden, ...rest }: CustomKbdProps) => {
  return (
    <kbd
      className={`bottom-card-kbd text-3xl md:text-xl text-white bg-[#1f2427] border border-white border-b-[1px] px-1.5 py-0.5 rounded transition-transform duration-100 ease-in-out hover:scale-120 ${
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer opacity-80"
      } ${hidden ? "hidden" : ""}`}
      onClick={isDisabled ? undefined : onClick}
      {...rest}
    >
      {children}
    </kbd>
  );
};

export default CustomKbd;
