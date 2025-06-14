
interface StatusLabelProps {
  label: string;
}

const StatusLabel = ({ label }: StatusLabelProps) => {
  return (
    <span
      className="status-label relative -right-2 text-[3.5rem] md:text-[80%] capitalize"
      style={{
        letterSpacing: label === "kpm" ? "0.2em" : "",
      }}
    >
      {label}
    </span>
  );
};

export default StatusLabel;
