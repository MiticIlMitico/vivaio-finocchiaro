import React, { useEffect, useRef, useState } from 'react';

/**
 * SectionReveal: wrapper per transizioni fluide allo scorrimento (reveal-on-scroll).
 * Rispetta rigorosamente prefers-reduced-motion e garantisce performance a 60fps con will-change-transform.
 */
export default function SectionReveal({ children, className = '', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.05,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
