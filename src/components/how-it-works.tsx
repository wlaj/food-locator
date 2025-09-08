import {
  IconCircle1,
  IconCircle2,
  IconCircle3,
  IconNumber1,
  IconNumber2,
  IconNumber3,
} from "@tabler/icons-react";
import React from "react";

type HowItWorks = {
  heading: string;
  demoUrl?: string;
  demoTitle?: string;
};

const HowItWorks = ({ heading, demoUrl, demoTitle }: HowItWorks) => {
  return (
    <section className="py-12">
      <div className="mb-8 flex flex-col gap-8 justify-between md:mb-14 lg:mb-16">
        <div>
          <h2 className="mb-3 text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
            {heading}
          </h2>
          <a
            href={demoUrl}
            className="group flex items-center gap-1 text-sm font-medium md:text-base lg:text-lg"
          >
            {demoTitle}
          </a>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2 rounded-xl p-6 border w-1/3">
            <IconCircle1 className="size-8" />
            <h3 className="text-xl font-medium">
              Zoek op locatie of voeg je locatie toe
            </h3>
            <p className="text-neutral-600">
              Vul je postcode in om restaurants in jouw buurt te vinden.
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 border w-1/3">
            <IconCircle2 className="size-8" />
            <h3 className="text-xl font-medium">Ontdek lokale restaurants</h3>
            <p className="text-neutral-600">
              Bekijk een overzicht van alle restaurants bij jou in de buurt.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 rounded-xl border w-1/3">
            <IconCircle3 className="size-8" />
            <h3 className="text-xl font-medium">Bestel en geniet</h3>
            <p className="text-neutral-600">
              Kies je favoriete gerecht en plaats eenvoudig je bestelling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
