import { siteConfig } from '@/lib/site-config';
import {
  IconDeviceMobile,
  IconHomeFilled,
  IconMail,
} from '@tabler/icons-react';
import { Container } from '@workspace/ui/components/container';
import { cn } from '@workspace/ui/lib/utils';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Children, type FC, type ReactNode } from 'react';

const PlayStoreIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    width={18}
    height={18}
    fill="currentColor"
    aria-hidden="true"
    className="shrink-0 text-primary-foreground"
  >
    <path d="M3.18 2.5c-.12.2-.18.44-.18.7v17.6c0 .26.06.5.18.7l.06.1 9.64-9.65v-.2L3.24 2.4l-.06.1zm12.07 7.04-2.2 2.2 2.2 2.2 2.7-1.55c.9-.52.9-1.78 0-2.3l-2.7-1.55zM13.6 12.2 4.4 21.4c.3.12.64.1.96-.08l9.4-5.4-1.16-3.72zm0-.4 1.16-3.72-9.4-5.4c-.32-.18-.66-.2-.96-.08l9.2 9.2z" />
  </svg>
);

export const MajuuFooter: FC = async () => {
  const t = await getTranslations('Footer');
  const { name, contact, usefulLinks } = siteConfig;

  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="flex basis-1/3 flex-col pt-8 md:flex-row md:justify-center md:gap-8">
        <FooterNavGroup title={t('usefulLinks')}>
          {usefulLinks.map((link, index) => (
            <FooterNavItem
              key={link.id}
              href={link.url}
              hasBorder={index < usefulLinks.length - 1}
              isExternal={link.external}
            >
              {link.icon === 'playstore' ? <PlayStoreIcon /> : null}
              {link.title}
            </FooterNavItem>
          ))}
        </FooterNavGroup>
        <FooterNavGroup title={t('quickContacts')}>
          <FooterNavItem>
            <IconHomeFilled size={20} />
            {name}
          </FooterNavItem>
          <FooterNavItem>
            <IconHomeFilled size={20} />
            {contact.address}
          </FooterNavItem>
          <FooterNavItem>
            <IconDeviceMobile size={20} />
            {contact.poBox}
          </FooterNavItem>
          <FooterNavItem>
            <IconDeviceMobile size={20} />
            Tel. {contact.phone}
          </FooterNavItem>
          <FooterNavItem href={`mailto:${contact.email}`} hasBorder={false}>
            <IconMail size={20} />
            {contact.email}
          </FooterNavItem>
        </FooterNavGroup>
      </Container>
      <SubFooter siteName={name} />
    </footer>
  );
};

interface FooterNavGroupProps {
  title: string;
  children?: ReactNode;
}

const FooterNavGroup: FC<FooterNavGroupProps> = ({ children, title }) => {
  const arrayChildren = Children.toArray(children);

  return (
    <div className="flex flex-1 flex-col pb-11 md:pb-1">
      <p className="typo-h5 border-primary-foreground w-full max-w-[250px] border-b-2 pb-3.5 font-bold">
        {title}
      </p>
      <ul className="text-primary-foreground mt-2 flex list-none flex-col gap-2">
        {arrayChildren.map((child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </div>
  );
};

interface FooterNavItemProps {
  href?: string;
  children?: ReactNode;
  hasBorder?: boolean;
  isExternal?: boolean;
}

const FooterNavItem: FC<FooterNavItemProps> = ({
  href,
  children,
  hasBorder = true,
  isExternal = false,
}) => {
  const Comp = href ? Link : 'div';
  const linkProps = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Comp
      href={href as string}
      className={cn(
        'border-primary-foreground/10 text-primary-foreground typo-body-small flex max-w-[380px] flex-row gap-2.5 pb-1',
        hasBorder && 'border-b',
      )}
      {...(href ? linkProps : {})}
    >
      {children}
    </Comp>
  );
};

const SubFooter: FC<{ siteName: string }> = ({ siteName }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-primary-hover">
      <Container className="text-primary-foreground typo-body-small flex justify-between gap-4 pb-2.5 pt-5">
        <p>
          &copy; Copyright {currentYear} | {siteName}. | All Rights Reserved.
        </p>
      </Container>
    </div>
  );
};
