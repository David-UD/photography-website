import { type Metadata } from "next";
import Footer from "@/components/footer";
import ProfileCard from "../../../modules/home/ui/components/profile-card";
import CardContainer from "@/components/card-container";
import VectorCombined from "@/components/vector-combined";
import { getSiteProfile } from "@/modules/site/server/site-data";
import { siteImageUrl } from "@/modules/site/lib/site-image-url";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacto",
};

const ContactoPage = async () => {
  const profile = await getSiteProfile();
  const coverUrl = siteImageUrl(profile.coverImage, "/bg.jpg");

  return (
    <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row w-full">
      <div className="w-full h-[70vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3">
        <div
          className="w-full h-full relative bg-top bg-cover rounded-xl"
          style={{ backgroundImage: `url(${coverUrl})` }}
        >
          <div className="absolute right-0 bottom-0">
            <VectorCombined title="Contacto" position="bottom-right" />
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2" />

      <div className="w-full lg:w-1/2 space-y-3 pb-3">
        <ProfileCard />

        <CardContainer>
          <div className="p-6">
            <h1 className="text-lg">Hablemos de tu proyecto</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Si tienes una idea, una sesión o un proyecto en mente, no dudes en
              escribirme.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {profile.socialLinks
                .filter((link) => link.primary)
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    className="text-sm underline underline-offset-2"
                  >
                    {link.title}
                  </a>
                ))}
            </div>
          </div>
        </CardContainer>

        <Footer />
      </div>
    </div>
  );
};

export default ContactoPage;
