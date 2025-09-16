import { IconInnerShadowBottomRightFilled } from "@tabler/icons-react";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface FooterProps {
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer = ({
  tagline = "Food locator",
  menuItems = [
    {
      title: "Locations",
      links: [
        { text: "Amsterdam Centrum", url: "/search?q=*&location=Amsterdam Centrum" },
        { text: "Amsterdam Nieuw-West", url: "/search?q=*&location=Amsterdam Nieuw-West" },
        { text: "Amsterdam Noord", url: "/search?q=*&location=Amsterdam Noord" },
        { text: "Amsterdam Oost", url: "/search?q=*&location=Amsterdam Oost" },
        { text: "Amsterdam Zuid", url: "/search?q=*&location=Amsterdam Zuid" },
        { text: "Rotterdam Centrum", url: "/search?q=*&location=Rotterdam Centrum" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "Terms & Conditions", url: "/terms" },
        { text: "Privacy", url: "/privacy" },
      ],
    },
    // {
    //   title: "Resources",
    //   links: [
    //     { text: "Help", url: "#" },
    //     { text: "Sales", url: "#" },
    //     { text: "Advertise", url: "#" },
    //   ],
    // },
    {
      title: "Social",
      links: [
        { text: "TikTok", url: "#" },
        { text: "Instagram", url: "#" },
      ],
    },
  ],
  copyright = "© 2025 Digics.net. All rights reserved.",
  bottomLinks = [
    { text: "Terms and Conditions", url: "/terms" },
    { text: "Privacy Policy", url: "/privacy" },
  ],
}: FooterProps) => {
  return (
    <section className="py-16 md:py-24 lg:py-32 w-full bg-black">
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 lg:grid-cols-6">
            <div className="col-span-1 sm:col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2 justify-center sm:justify-start lg:justify-start">
                <IconInnerShadowBottomRightFilled className="text-neutral-100" />
                <p className="font-bold text-neutral-100">{tagline}</p>
              </div>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx} className="text-center sm:text-left">
                <h3 className="mb-4 font-semibold text-neutral-200">{section.title}</h3>
                <ul className="text-muted-foreground space-y-3 md:space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="hover:opacity-80 font-medium text-sm md:text-base"
                    >
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-16 md:mt-20 lg:mt-24 flex flex-col justify-between gap-4 border-t border-muted-foreground pt-6 md:pt-8 text-sm font-medium md:flex-row md:items-center">
            <p className="text-center md:text-left">{copyright}</p>
            <ul className="flex gap-4 justify-center md:justify-end">
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
