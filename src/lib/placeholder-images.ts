import { lazy, LazyExoticComponent, FC } from 'react';

export type AvatarInfo = {
  id: string;
  name: string;
  component: LazyExoticComponent<FC<{}>>;
};

export const Avatars: Record<string, LazyExoticComponent<FC<{}>>> = {
  avatar1: lazy(() => import('@/components/icons/avatar1')),
  avatar2: lazy(() => import('@/components/icons/avatar2')),
  avatar3: lazy(() => import('@/components/icons/avatar3')),
  avatar4: lazy(() => import('@/components/icons/avatar4')),
  avatar5: lazy(() => import('@/components/icons/avatar5')),
  avatar6: lazy(() => import('@/components/icons/avatar6')),
  avatar7: lazy(() => import('@/components/icons/avatar7')),
  avatar8: lazy(() => import('@/components/icons/avatar8')),
  avatar9: lazy(() => import('@/components/icons/avatar9')),
  avatar10: lazy(() => import('@/components/icons/avatar10')),
  avatar11: lazy(() => import('@/components/icons/avatar11')),
  avatar12: lazy(() => import('@/components/icons/avatar12')),
  avatar13: lazy(() => import('@/components/icons/avatar13')),
  avatar14: lazy(() => import('@/components/icons/avatar14')),
  avatar15: lazy(() => import('@/components/icons/avatar15')),
};

export const AvatarIds = Object.keys(Avatars);
