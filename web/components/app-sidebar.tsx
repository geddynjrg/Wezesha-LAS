'use client';

import type { Locale } from '@/i18n/config';
import { IconHelp } from '@tabler/icons-react';
import { NavLink } from '@workspace/ui/components/nav-link';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSubmenu,
} from '@workspace/ui/components/sidebar';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';

export interface AppSidebarProps {
  locale: Locale;
}

export const AppSidebar: FC<AppSidebarProps> = () => {
  const t = useTranslations('Common');

  return (
    <Sidebar title={t('menu')} closeTitle={t('closeMenu')}>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem asChild>
            <NavLink href="/">{t('home')}</NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem asChild>
            <NavLink href="/dashboard">{t('dashboard')}</NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem asChild>
            <NavLink href="/apply">{t('apply')}</NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem asChild>
            <NavLink href="/apply/create">{t('startApplication')}</NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem asChild>
            <NavLink href="/apply/individual">{t('individualApplication')}</NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem asChild>
            <NavLink href="/status">{t('trackStatus')}</NavLink>
          </SidebarMenuItem>
          <SidebarSubmenu title={t('helpAndSupport')} icon={<IconHelp />}>
            <SidebarMenuItem asChild>
              <NavLink href="/#criteria">{t('eligibilityCriteria')}</NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem asChild>
              <NavLink href="/apply">{t('howToApply')}</NavLink>
            </SidebarMenuItem>
          </SidebarSubmenu>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
