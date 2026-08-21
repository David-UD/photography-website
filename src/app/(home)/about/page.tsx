// External dependencies
import { type Metadata } from "next";

// Internal dependencies - UI Components
import Footer from "@/components/footer";
import AboutCard from "../../../modules/home/ui/components/about-card";
import TechMarquee from "@/components/tech-marquee";
import CameraCard from "../../../modules/home/ui/components/camera-card";
import ProfileCard from "../../../modules/home/ui/components/profile-card";
import CardContainer from "@/components/card-container";
import VectorCombined from "@/components/vector-combined";
import { getSiteProfile, getSiteServices } from "@/modules/site/server/site-data";
import { siteImageUrl } from "@/modules/site/lib/site-image-url";

export const metadata: Metadata = {
  title: "About",
  description: "About page",
};

const AboutPage = async () => {
  const [profile, serviceItems] = await Promise.all([
    getSiteProfile(),
    getSiteServices(),
  ]);
  const coverUrl = siteImageUrl(profile.coverImage, "/bg.jpg");

  return (
    <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row w-full">
      {/* LEFT CONTENT - Fixed */}
      <div className="w-full h-[70vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3">
        <div
          className="w-full h-full relative bg-top bg-cover rounded-xl"
          style={{ backgroundImage: `url(${coverUrl})` }}
        >
          <div className="absolute right-0 bottom-0">
            <VectorCombined title="About" position="bottom-right" />
          </div>
        </div>
      </div>

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <div className="w-full lg:w-1/2 space-y-3 pb-3">
        {/* PROFILE CARD  */}
        <ProfileCard />

        {/* ABOUT CARD  */}
        <AboutCard />

        {/* TECH CARD  */}
        <TechMarquee />

        {/* CAMERA CARD  */}
        <CameraCard />

        {serviceItems.map((service) => (
          <CardContainer key={service.id}>
            <div className="p-6">
              <h1 className="text-lg">{service.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>
          </CardContainer>
        ))}

        <Footer />
      </div>
    </div>
  );
};

export default AboutPage;
