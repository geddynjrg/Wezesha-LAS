import type { FC, ReactNode } from 'react';

import { Container } from '@workspace/ui/components/container';

export interface HeroSectionProps {
  title: ReactNode;
  backgroundAlt: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export const HeroSection: FC<HeroSectionProps> = ({
  title,
  backgroundAlt,
  actions,
  children,
}) => {
  return (
    <section
      className="relative isolate min-h-[32rem] overflow-hidden md:min-h-[28rem]"
      aria-label={backgroundAlt}
    >
      <img
        src="/hero-banners/banner-mobile.jpg"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        width={768}
        height={512}
        className="absolute inset-0 z-0 h-full w-full object-cover object-top md:hidden"
      />
      <img
        src="/hero-banners/banner.jpg"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        width={1920}
        height={448}
        className="absolute inset-0 z-0 hidden h-full w-full object-cover object-top md:block"
      />

      <Container className="text-background relative z-10 pb-12.5 items-center gap-12 pt-36 lg:flex">
        <div className="basis-2/3">
          <h1 className="border-background mb-7 border-b-2 pb-7">{title}</h1>
          <div className="mb-10.5 mt-4">{children}</div>
        </div>

        {actions && (
          <div className="flex basis-1/3 justify-center [&>*]:flex-1">
            {actions}
          </div>
        )}
      </Container>
    </section>
  );
};
