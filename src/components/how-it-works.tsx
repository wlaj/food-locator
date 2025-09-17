import {
  IconCircle1,
  IconCircle2,
  IconCircle3,
} from "@tabler/icons-react";
import React from "react";
import { getTranslations } from "next-intl/server";

type HowItWorks = {
  heading: string;
  demoUrl?: string;
  demoTitle?: string;
};

const HowItWorks = async ({ heading, demoUrl, demoTitle }: HowItWorks) => {
  const t = await getTranslations();

  return (
    <section className="py-8 md:py-12">
      <div className="mb-6 md:mb-8 flex flex-col gap-6 md:gap-8 justify-between lg:mb-16">
        <div>
          <h2 className="mb-3 text-2xl sm:text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
            {heading}
          </h2>
          <a
            href={demoUrl}
            className="group flex items-center gap-1 text-sm font-medium md:text-base lg:text-lg"
          >
            {demoTitle}
          </a>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-4 items-stretch">
          <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border w-full md:w-1/3">
            <IconCircle1 className="size-6 sm:size-8" />
            <h3 className="text-lg sm:text-xl font-medium">
              {t("howItWorks.step1.title")}
            </h3>
            <p className="text-neutral-600 text-sm sm:text-base">
              {t("howItWorks.step1.description")}
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border w-full md:w-1/3">
            <IconCircle2 className="size-6 sm:size-8" />
            <h3 className="text-lg sm:text-xl font-medium">
              {t("howItWorks.step2.title")}
            </h3>
            <p className="text-neutral-600 text-sm sm:text-base">
              {t("howItWorks.step2.description")}
            </p>
          </div>
          <div className="flex flex-col gap-2 p-4 sm:p-6 rounded-xl border w-full md:w-1/3">
            <IconCircle3 className="size-6 sm:size-8" />
            <h3 className="text-lg sm:text-xl font-medium">
              {t("howItWorks.step3.title")}
            </h3>
            <p className="text-neutral-600 text-sm sm:text-base">
              {t("howItWorks.step3.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
