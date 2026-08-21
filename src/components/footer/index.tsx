import FooterNav from "./footer-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { siteConfig } from "@/site.config";
import { getSiteProfile } from "@/modules/site/server/site-data";
import { siteImageUrl } from "@/modules/site/lib/site-image-url";

const Footer = async () => {
  const profile = await getSiteProfile();
  const avatarUrl = siteImageUrl(profile.avatar, "/avatar.jpg");

  return (
    <div className="flex flex-col items-center lg:items-start p-16 pb-12 gap-8 lg:gap-16 rounded-xl font-light relative flex-1 bg-primary text-white dark:text-black">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* AVATAR  */}
        <Avatar className="size-[60px]">
          <AvatarImage src={avatarUrl} alt="avatar" sizes="60px" />
          <AvatarFallback>{profile.initials}</AvatarFallback>
        </Avatar>

        {/* NAME  */}
        <div className="flex flex-col items-center lg:items-start gap-[2px]">
          <h1 className="text-2xl">{profile.name}</h1>
          <p className="text-sm opacity-60">{profile.role}</p>
        </div>
      </div>
      <div className="grid lg:w-full grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-14">
        <FooterNav
          title="Pages"
          links={[
            { title: "Home", href: "/" },
            { title: "Galerías", href: "/galerias" },
            { title: "Sobre mí", href: "/about" },
            { title: "Contacto", href: "/contacto" },
          ]}
        />
        <FooterNav
          title="CMS"
          links={[{ title: "Dashboard", href: "/dashboard" }]}
        />
        <FooterNav
          title="Utility"
          links={[{ title: "Screensaver", href: "/screensaver" }]}
        />
      </div>

      {/* Attribution */}
      <div className="text-xs md:text-sm text-center md:text-left">
        <p>
          <span className="opacity-60">© Design by </span>
          <a
            href={siteConfig.footer.designCredit.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {siteConfig.footer.designCredit.name}
          </a>
          <span className="opacity-60">. Powered by </span>
          <a
            href={siteConfig.footer.poweredBy.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {siteConfig.footer.poweredBy.name}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Footer;
