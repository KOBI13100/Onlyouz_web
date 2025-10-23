import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoPng from "@/onlyouz3.png";

const Logo: React.FC = () => {
  return (
    <Link href="/newhome" className="inline-flex h-8 items-center mt-1">
      <Image
        src={logoPng}
        alt="OnlyYouzzz"
        width={140}
        height={34}
        priority
        className="block h-7 w-auto"
      />
    </Link>
  );
};

export default Logo;


