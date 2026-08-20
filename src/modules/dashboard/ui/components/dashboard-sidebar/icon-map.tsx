import {
  IconLayoutDashboard,
  IconPhoto,
  IconUser,
  IconPhotoFilled,
} from "@tabler/icons-react";

interface IconMapProps {
  icon: string;
}

const IconMap = ({ icon }: IconMapProps) => {
  switch (icon) {
    case "dashboard":
      return <IconLayoutDashboard />;
    case "gallery":
      return <IconPhotoFilled />;
    case "photo":
      return <IconPhoto />;
    case "user":
      return <IconUser />;
    default:
      return <IconLayoutDashboard />;
  }
};

export default IconMap;