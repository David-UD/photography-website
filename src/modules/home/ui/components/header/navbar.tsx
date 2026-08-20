import Logo from "./logo";
import FlipLink from "@/components/flip-link";
import { ThemeSwitch } from "@/components/theme-toggle";

const Navbar = () => {
  return (
    <nav>
      <div className="flex items-center gap-5 pb-3 px-4 relative">
        <Logo />
        <div className="hidden lg:flex gap-4">
          <FlipLink href="/galerias">Galerías</FlipLink>
          <FlipLink href="/about">Sobre mí</FlipLink>
          <FlipLink href="/servicios">Servicios</FlipLink>
          <FlipLink href="/contacto">Contacto</FlipLink>
        </div>
        <ThemeSwitch />
      </div>
    </nav>
  );
};

export default Navbar;
