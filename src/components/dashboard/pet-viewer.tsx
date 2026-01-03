'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/use-sound';
import { Pets } from '@/lib/pets';

interface PetViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  petStyle: string;
  progress: number;
  fullSize?: boolean;
}

type AnimationType = 'jump' | 'wiggle' | 'spin' | 'bounce';

const animations = {
  jump: { scale: [1, 1.1, 1], y: [0, -20, 0], transition: { duration: 0.4, ease: "easeInOut" } },
  wiggle: { rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5, ease: "easeInOut" } },
  spin: { rotate: [0, 360], scale: [1, 0.8, 1], transition: { duration: 0.5, ease: "circOut" } },
  bounce: { y: [0, -15, 0, -8, 0], transition: { duration: 0.6, ease: "easeOut" } },
};

const PetViewer: React.FC<PetViewerProps> = ({ petStyle, progress, className, fullSize = false }) => {
  const [bodyAnimation, setBodyAnimation] = useState<AnimationType | null>(null);
  const playSound = useSound();

  const petScale = ((0.6 + (progress / 100) * 0.3) * 1.5) * 0.4096;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    playSound('click');
    const bodyAnims: AnimationType[] = ['jump', 'wiggle', 'spin', 'bounce'];
    const randomAnimation = bodyAnims[Math.floor(Math.random() * bodyAnims.length)];
    setBodyAnimation(randomAnimation);
  };

  const PetComponent = Pets[petStyle] || Pets['pet1'];

  return (
    <div className={cn("relative z-10 flex flex-col w-full h-full", className)}>
      <div className="flex flex-col items-center justify-center w-full h-full relative overflow-visible flex-grow">
        <div
          className="w-full h-full flex items-center justify-center rounded-lg cursor-pointer"
          onClick={handleClick}
        >
          <motion.div
            style={{ scale: petScale, transition: 'transform 0.5s ease' }}
            animate={bodyAnimation ? animations[bodyAnimation] : {}}
            onAnimationComplete={() => setBodyAnimation(null)}
            className={cn(
              "aspect-square flex items-center justify-center",
              fullSize ? "w-full max-h-full" : "w-[60%] max-h-[80%]"
            )}
          >
            <PetComponent />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PetViewer;
