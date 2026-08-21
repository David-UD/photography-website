import CardContainer from "@/components/card-container";
import { getSiteProfile } from "@/modules/site/server/site-data";

const AboutCard = async () => {
  const profile = await getSiteProfile();
  const paragraphs = (profile.about || "").split("\n\n");

  return (
    <CardContainer>
      <div className="flex flex-col p-12 gap-[128px]">
        <h1 className="text-3xl">About</h1>
        <div className="flex flex-col gap-4 font-light">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </CardContainer>
  );
};

export default AboutCard;
