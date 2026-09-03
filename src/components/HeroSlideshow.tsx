"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/images/hero/hostel.jpg",
    alt: "Комната общежития: двухъярусная металлическая кровать и корпусная мебель из ЛДСП",
    label: "Общежития и хостелы",
  },
  {
    src: "/images/hero/barracks.jpg",
    alt: "Казарма: двухъярусные кровати с панелями ЛДСП и шкафы",
    label: "Ведомственные объекты",
  },
  {
    src: "/images/hero/hotel.jpg",
    alt: "Гостиничный номер с кроватью, шкафом и письменным столом из ЛДСП",
    label: "Гостиницы",
  },
  {
    src: "/images/hero/classroom.jpg",
    alt: "Аудитория: ученические столы и стулья на металлокаркасе",
    label: "Образование",
  },
  {
    src: "/images/hero/dining.jpg",
    alt: "Столовая: столы на металлокаркасе со столешницами из ЛДСП",
    label: "Столовые и залы",
  },
  {
    src: "/images/hero/office.jpg",
    alt: "Кабинет: офисные столы и тумбы из ЛДСП на металлокаркасе",
    label: "Кабинеты",
  },
] as const;

const INTERVAL_MS = 5500;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    const n = SLIDES.length;
    setIndex(((next % n) + n) % n);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || paused) return;
    const id = window.setInterval(() => go(index + 1), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [go, index, paused]);

  useEffect(() => {
    if (!paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, paused]);

  return (
    <div
      className="hero-media"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div className={`hero-slide${i === index ? " is-on" : ""}`} key={slide.src}>
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      <div className="hero-slide-nav" role="group" aria-label="Интерьеры объектов">
        <p className="mono hero-slide-label">{SLIDES[index].label}</p>
        <div className="hero-slide-controls">
          <button
            type="button"
            className="hero-slide-btn"
            aria-label="Предыдущий интерьер"
            onClick={() => go(index - 1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5 8 12l7 7" />
            </svg>
          </button>
          <div className="hero-dots">
            {SLIDES.map((slide, i) => (
              <button
                type="button"
                key={slide.src}
                className={`hero-dot${i === index ? " is-on" : ""}`}
                aria-label={slide.label}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-slide-btn"
            aria-label="Следующий интерьер"
            onClick={() => go(index + 1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
