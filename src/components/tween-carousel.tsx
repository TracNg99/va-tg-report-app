'use client';

import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/utils/class';

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

type TweenCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  classNames?: {
    controls?: string;
  };
  className?: string;
  slideSize?: {
    base?: number;
    sm?: number;
    md?: number;
  };
  slideGap?: number;
  options?: EmblaOptionsType;
  tweenFactorBase?: number;
  showControls?: boolean;
};

export default function TweenCarousel<T>({
  items,
  renderItem,
  classNames,
  options,
  slideSize,
  slideGap,
  showControls = true,
  tweenFactorBase = 0.22,
  className,
}: TweenCarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState(0);

  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('div') as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback(
    (emblaApi: EmblaCarouselType) => {
      tweenFactor.current = tweenFactorBase * emblaApi.scrollSnapList().length;
    },
    [tweenFactorBase],
  );

  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === 'scroll';

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          tweenNode.style.transform = `scale(${scale})`;
          tweenNode.style.filter = `brightness(${scale})`;
        });
      });
    },
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const setTotal = (emblaApi: EmblaCarouselType) => {
      setScrollSnaps(emblaApi.scrollSnapList().length);
    };

    const setIndex = (emblaApi: EmblaCarouselType) => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on('init', setTotal)
      .on('init', setIndex)
      .on('reInit', setTotal)
      .on('reInit', setIndex)
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('select', setIndex)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale);
  }, [emblaApi, setTweenFactor, setTweenNodes, tweenScale]);

  const variables = useMemo(() => {
    let size = slideSize?.base || 100;
    if (isSm && slideSize?.sm) {
      size = slideSize.sm;
    }
    if (isMd && slideSize?.md) {
      size = slideSize.md;
    }

    return {
      '--slide-size': `${size}%`,
      '--slide-spacing': `${slideGap}px`,
    } as React.CSSProperties;
  }, [isSm, isMd, slideSize, slideGap]);

  return (
    <>
      <div style={variables} className={cn(className)}>
        <div ref={emblaRef}>
          <div className="flex touch-pan-y touch-pinch-zoom ml-[calc(var(--slide-spacing)*-1)]">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex-[0_0_var(--slide-size)] pl-[var(--slide-spacing)] min-w-0"
              >
                <div>{renderItem(item, index)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!!emblaApi && showControls && (
        <div
          className={cn(
            'mt-12 flex items-center justify-end gap-4 text-md text-base-black',
            classNames?.controls,
          )}
        >
          <button
            className="rounded-full size-[60px] border border-base-black/25 flex items-center justify-center hover:bg-base-black/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => emblaApi.scrollPrev()}
            disabled={!emblaApi.canScrollPrev()}
          >
            <IconChevronLeft className="size-7 text-base-black" />
          </button>
          <span className="font-semibold">{currentSlide + 1}</span>
          <span>/</span>
          <span>{scrollSnaps}</span>
          <button
            className="rounded-full size-[60px] border border-base-black/25 flex items-center justify-center hover:bg-base-black/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => emblaApi.scrollNext()}
            disabled={!emblaApi.canScrollNext()}
          >
            <IconChevronRight className="size-7 text-base-black" />
          </button>
        </div>
      )}
    </>
  );
}
