import { useSession } from "next-auth/react";
import SignInMenu from "./SignInMenu";
import { SignOutButton } from "./SignOutButton";
import UserMenu from "./UserMenu";

interface LoginProps {
  className?: string;
}

export default function Login({ className }: LoginProps) {
  const { data: session } = useSession();

  return (
    <div className={className}>
      {!session?.user && <SignInMenu />}
      {session?.user && (session?.user?.name ? <UserMenu /> : <SignOutButton />)}
    </div>
  );
}
