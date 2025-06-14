"use client";

import LeftNav from "./child/left-child/LeftNav";
import RightNav from "./child/RightNav";

//TODO: remove !bg-header-background
const Header = () => {
  return (
    <header id="header" className="fixed z-30 w-full bg-header-background text-header-foreground">
      <nav className="mx-auto flex h-10 w-[90%] items-center justify-between xl:w-[80%]">
        <LeftNav />
        <RightNav />
      </nav>
    </header>
  );
};

export default Header;
