import { useSession } from "next-auth/react";
import SignInMenu from "./SignInMenu";
import { SignOutButton } from "./SignOutButton";
import UserMenu from "./UserMenu";

export default function Login() {
  const { data: session } = useSession();

  if (!session?.user) {
    return <SignInMenu />;
  } else {
    return <>{!session?.user?.name ? <SignOutButton /> : <UserMenu />}</>;
  }
}
