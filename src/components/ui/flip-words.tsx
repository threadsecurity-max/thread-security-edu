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
    <span className="inline-block relative text-center">
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
            y: 16,
            rotateX: 60,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -16,
            rotateX: -60,
            filter: 'blur(4px)',
            scale: 0.98,
          }}
          transition={{
            duration: 0.35,
            ease: 'easeInOut',
          }}
          className={cn(
            'inline-block origin-center select-none transform-gpu',
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
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: wordIndex * 0.05 + letterIndex * 0.02,
                  }}
                  className="inline-block"
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
