import { type Metadata } from "next";
import Footer from "@/components/footer";
import ProfileCard from "../../../modules/home/ui/components/profile-card";
import CardContainer from "@/components/card-container";
import VectorCombined from "@/components/vector-combined";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Servicios de fotografía",
};

const services = [
  {
    title: "Fotografía de bodas",
    description:
      "Cobertura completa de bodas y celebraciones con un enfoque natural y emotivo.",
  },
  {
    title: "Sesiones de retrato",
    description:
      "Retratos individuales, familiares y profesionales con dirección artística.",
  },
  {
    title: "Fotografía de producto",
    description:
      "Imágenes de alta calidad para marcas, catálogos y comercio electrónico.",
  },
];

const ServiciosPage = () => {
  return (
    <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row w-full">
      <div className="w-full h-[70vh] lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3">
        <div className="w-full h-full relative bg-[url(/bg.jpg)] bg-top bg-cover rounded-xl">
          <div className="absolute right-0 bottom-0">
            <VectorCombined title="Servicios" position="bottom-right" />
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2" />

      <div className="w-full lg:w-1/2 space-y-3 pb-3">
        <ProfileCard />

        {services.map((service) => (
          <CardContainer key={service.title}>
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

export default ServiciosPage;