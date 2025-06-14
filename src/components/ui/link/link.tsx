
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { LinkIndicator } from "./indicator";

interface LinkProps extends NextLinkProps {
	children: React.ReactNode;
	className?: string;
  }
  export function Link({ children, ...props }: LinkProps) {
	return (
	  <NextLink {...props}>
		{children}
		<LinkIndicator href={props.href.toString()} />
	  </NextLink>
	);
  }




