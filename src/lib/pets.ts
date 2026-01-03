
import { FC } from 'react';
import Pet1 from '@/components/icons/pet1';
import Pet2 from '@/components/icons/pet2';
import Pet3 from '@/components/icons/pet3';
import Pet4 from '@/components/icons/pet4';
import Pet5 from '@/components/icons/pet5';

export type PetInfo = {
  id: string;
  name: string;
  unlockLevel: number;
  component: FC<{}>;
};

// This is the Single Source of Truth for all pet-related data.
export const PetInfos: PetInfo[] = [
  { id: 'pet1', name: 'Blobby', unlockLevel: 1, component: Pet1 },
  { id: 'pet2', name: 'Spiky', unlockLevel: 2, component: Pet2 },
  { id: 'pet3', name: 'Cacto', unlockLevel: 5, component: Pet3 },
  { id: 'pet4', name: 'Boxy', unlockLevel: 10, component: Pet4 },
  { id: 'pet5', name: 'Cloudy', unlockLevel: 15, component: Pet5 },
];

// Derived map from PetInfos for easy component lookup.
export const Pets: Record<string, FC<{}>> = PetInfos.reduce((acc, pet) => {
  acc[pet.id] = pet.component;
  return acc;
}, {} as Record<string, FC<{}>>);

// Derived array of IDs from PetInfos.
export const PetIds = PetInfos.map(p => p.id);
