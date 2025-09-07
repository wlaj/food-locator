import { IconInnerShadowBottomRightFilled } from "@tabler/icons-react";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer = ({
  logo = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg",
    alt: "Software for B2B",
    title: "digics.net",
    url: "https://www.digics.net",
  },
  tagline = "Food locator",
  menuItems = [
    {
      title: "Locations",
      links: [
        { text: "Amsterdam Centrum", url: "#" },
        { text: "Amsterdam Nieuw-West", url: "#" },
        { text: "Amsterdam Noord", url: "#" },
        { text: "Amsterdam Oost", url: "#" },
        { text: "Amsterdam Zuid", url: "#" },
        { text: "Rotterdam Centrum", url: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "Contact", url: "#" },
        { text: "Terms & Conditions", url: "#" },
        { text: "Privacy", url: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Help", url: "#" },
        { text: "Sales", url: "#" },
        { text: "Advertise", url: "#" },
      ],
    },
    {
      title: "Social",
      links: [
        { text: "Twitter", url: "#" },
        { text: "Instagram", url: "#" },
        { text: "LinkedIn", url: "#" },
      ],
    },
  ],
  copyright = "© 2025 Digics.net. All rights reserved.",
  bottomLinks = [
    { text: "Terms and Conditions", url: "#" },
    { text: "Privacy Policy", url: "#" },
  ],
}: FooterProps) => {
  return (
    <section className="py-32 w-full bg-black">
        <footer className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2 lg:justify-start">
                <IconInnerShadowBottomRightFilled className="text-neutral-100" />
                <p className="font-bold text-neutral-100">{tagline}</p>
              </div>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-semibold text-neutral-200">{section.title}</h3>
                <ul className="text-muted-foreground space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="hover:opacity-80 font-medium"
                    >
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-24 flex flex-col justify-between gap-4 border-t border-muted-foreground pt-8 text-sm font-medium md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="hover:text-primary underline">
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
    </section>
  );
};

export { Footer };
