import { IconPentagonNumber1 } from "@tabler/icons-react";
import React from "react";

type HowItWorks = {
  heading: string;
  demoUrl: string;
  demoTitle: string;
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
          <div className="flex flex-col gap-2 p-6 border w-1/3">
            <IconPentagonNumber1 className="size-4" />
            <h3 className="text-xl font-medium">Twitter</h3>
            <p className="text-neutral-600">
              Connect with others, share experiences, and stay in the loop.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 border w-1/3">
            <IconPentagonNumber1 className="size-4" />
            <h3 className="text-xl font-medium">Twitter</h3>
            <p className="text-neutral-600">
              Connect with others, share experiences, and stay in the loop.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 border w-1/3">
            <IconPentagonNumber1 className="size-4" />
            <h3 className="text-xl font-medium">Twitter</h3>
            <p className="text-neutral-600">
              Connect with others, share experiences, and stay in the loop.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
