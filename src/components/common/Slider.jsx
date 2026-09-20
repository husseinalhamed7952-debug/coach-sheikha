import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function Slider({
  items = [],
  renderItem,
  desktopItems = 3,
  tabletItems = 2,
  mobileItems = 1,
  gap = 20,
  className = ''
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(desktopItems);
  const [cardWidth, setCardWidth] = useState(0);
  const viewportRef = useRef(null);
  const touchStartX = useRef(0);

  // Calculate visible items based on width
  const updateDimensions = useCallback(() => {
    if (!viewportRef.current) return;
    const width = viewportRef.current.clientWidth;

    let count = desktopItems;
    if (width < 640) {
      count = mobileItems;
    } else if (width < 1024) {
      count = tabletItems;
    }
    setVisibleCount(count);

    const calculatedCardWidth = (width - (count - 1) * gap) / count;
    setCardWidth(Math.max(calculatedCardWidth, 0));
  }, [desktopItems, tabletItems, mobileItems, gap]);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const maxIndex = Math.max(0, items.length - visibleCount);

  // Keep index within bounds on resize/items change
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const goPrev = () => {
    // In RTL, prev moves towards right (index 0)
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goNext = () => {
    // In RTL, next moves towards left (higher index)
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // In RTL: swiping left (diff > 40) means seeing next items
    if (diff > 40) {
      goNext();
    } else if (diff < -40) {
      // swiping right (diff < -40) means seeing previous items
      goPrev();
    }
  };

  if (!items || items.length === 0) return null;

  // In RTL flex-row: items flow from right to left.
  // Translating positively moves the track to the right, bringing hidden items on the left into view.
  const translateX = currentIndex * (cardWidth + gap);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <div className={`custom-slider-container ${className}`}>
      <div className="slider-controls-wrapper">
        <button
          type="button"
          className="slider-arrow-btn prev-btn"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="السابق"
          title="السابق"
        >
          <ChevronRight size={22} />
        </button>

        <div
          className="slider-viewport"
          ref={viewportRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="slider-track"
            style={{
              display: 'flex',
              gap: `${gap}px`,
              transform: `translateX(${translateX}px)`,
              transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="slider-slide"
                style={{
                  width: cardWidth > 0 ? `${cardWidth}px` : '100%',
                  flexShrink: 0,
                  boxSizing: 'border-box'
                }}
              >
                {renderItem(item, idx)}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="slider-arrow-btn next-btn"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="التالي"
          title="التالي"
        >
          <ChevronLeft size={22} />
        </button>
      </div>
    </div>
  );
}
