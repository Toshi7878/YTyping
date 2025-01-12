import { Kbd, KbdProps } from "@chakra-ui/react";

interface CustomKbdProps {
  isDisabled?: boolean;
  children: React.ReactNode;
}

const CustomKbd = ({ isDisabled, children, onClick, ...rest }: CustomKbdProps & KbdProps) => {
  return (
    <Kbd
      variant="typeArea"
      className="bottom-card-kbd"
      cursor={isDisabled ? "not-allowed" : "pointer"}
      opacity={isDisabled ? 0.5 : 0.8}
      onClick={isDisabled ? undefined : onClick}
      _hover={{
        transform: isDisabled ? "none" : "scale(1.20)",
      }}
      sx={{
        transition: "transform 0.1s ease-in-out",
      }}
      {...rest}
    >
      {children}
    </Kbd>
  );
};

export default CustomKbd;
