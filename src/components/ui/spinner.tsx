import React from "react";

const Spinner = ({ ...rest }: React.ComponentPropsWithRef<"div">) => {
  return (
    <div className="flex justify-center py-8" {...rest}>
      <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-3" />
    </div>
  );
};

export default Spinner;
