'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface FlipWordObject {
  text: string;
  className?: string;
}

export type FlipWord = string | FlipWordObject;

interface FlipWordsProps {
  words: FlipWord[];
  duration?: number;
  className?: string;
}

export function FlipWords({
  words,
  duration = 2500,
  className,
}: FlipWordsProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const startAnimation = useCallback(() => {
    setCurrentWordIndex((prev) => (prev + 1) % words.length);
    setIsAnimating(true);
  }, [words.length]);

  useEffect(() => {
    if (!isAnimating && words.length > 1) {
      const timer = setTimeout(() => {
        startAnimation();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, duration, startAnimation, words.length]);

  const currentItem = words[currentWordIndex];
  const currentWord = typeof currentItem === 'string' ? currentItem : currentItem.text;
  const currentClassName = typeof currentItem === 'string' ? '' : currentItem.className;

  return (
    <span className="inline-flex relative items-center justify-center min-w-[280px] sm:min-w-[360px] md:min-w-[420px] text-center">
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          setIsAnimating(false);
        }}
      >
        <motion.span
          key={currentWord + '-' + currentWordIndex}
          initial={{
            opacity: 0,
            y: 20,
            rotateX: 90,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -25,
            rotateX: -90,
            filter: 'blur(4px)',
            scale: 0.95,
            position: 'absolute',
          }}
          transition={{
            type: 'spring',
            stiffness: 140,
            damping: 14,
            mass: 0.75,
          }}
          className={cn(
            'inline-block origin-center select-none transform-gpu whitespace-nowrap',
            currentClassName,
            className
          )}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            backfaceVisibility: 'hidden',
          }}
        >
          {currentWord.split(' ').map((word, wordIndex, wordsArr) => (
            <span key={word + wordIndex} className="inline-block whitespace-nowrap">
              {word.split('').map((letter, letterIndex) => (
                <motion.span
                  key={letter + '-' + letterIndex}
                  initial={{
                    opacity: 0,
                    y: 12,
                    rotateX: 90,
                    filter: 'blur(3px)',
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    filter: 'blur(0px)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 180,
                    damping: 12,
                    delay: wordIndex * 0.08 + letterIndex * 0.025,
                  }}
                  className="inline-block"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
              {wordIndex < wordsArr.length - 1 && (
                <span className="inline-block">&nbsp;</span>
              )}
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
