import Link from "next/link";
import WordRotate from "../word-rotate";
import { RiCameraLensFill } from "react-icons/ri";
import { getSiteProfile } from "@/modules/site/server/site-data";

const Logo = async () => {
  const profile = await getSiteProfile();

  return (
    <Link href="/" className="flex gap-2 items-center">
      <RiCameraLensFill size={18} />
      <WordRotate
        label={profile.name}
        label2={profile.tagline}
        style="font-medium uppercase"
      />
    </Link>
  );
};

export default Logo;
