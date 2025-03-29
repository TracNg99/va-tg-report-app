'use client';

import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/utils/class';

type FeatureCarouselProps<T> = {
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
  showControls?: boolean;
};

export default function FeatureCarousel<T>({
  items,
  renderItem,
  classNames,
  options,
  slideSize,
  slideGap,
  showControls = true,
  className,
}: FeatureCarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState(0);

  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (!emblaApi) return;

    const setTotal = (emblaApi: EmblaCarouselType) => {
      setScrollSnaps(emblaApi.scrollSnapList().length);
    };

    const setIndex = (emblaApi: EmblaCarouselType) => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };

    emblaApi
      .on('init', setTotal)
      .on('init', setIndex)
      .on('reInit', setTotal)
      .on('reInit', setIndex)
      .on('select', setIndex);
  }, [emblaApi]);

  const variables = useMemo(() => {
    let size = 100;
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
                className="flex-[0_0_var(--slide-size)] pl-[var(--slide-spacing)]"
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
