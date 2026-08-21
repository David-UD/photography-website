import {
  IconLayoutDashboard,
  IconPhoto,
  IconUser,
  IconPhotoFilled,
  IconSettings,
  IconLink,
  IconListDetails,
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
    case "settings":
      return <IconSettings />;
    case "links":
      return <IconLink />;
    case "services":
      return <IconListDetails />;
    default:
      return <IconLayoutDashboard />;
  }
};

export default IconMap;
