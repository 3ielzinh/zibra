'use client';

import { useEffect, useRef } from 'react';

const gestureEvents = ['touchstart', 'pointerdown', 'keydown'] as const;

/**
 * Filme da hero. O iOS bloqueia autoplay em alguns cenários (Modo de Baixo Consumo, Safari com
 * restrições, aba em segundo plano). Aqui garantimos o estado mudo, tentamos tocar assim que o
 * vídeo estiver pronto e voltamos a tentar no primeiro toque do usuário e ao retornar à aba.
 */
export default function HeroFilm() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');

    let disposed = false;
    let retries = 0;
    let retryTimer: number | undefined;
    const tryPlay = () => {
      if (disposed || document.hidden || !video.paused) return;
      const attempt = video.play();
      if (attempt) attempt.catch(() => {});
    };
    const onVisibility = () => { if (!document.hidden) tryPlay(); };
    // Alguns navegadores interrompem o autoplay logo após iniciar; tentamos retomar poucas vezes.
    const onPause = () => {
      if (disposed || document.hidden || video.ended || retries >= 3) return;
      retries += 1;
      retryTimer = window.setTimeout(tryPlay, 400);
    };

    video.addEventListener('canplay', tryPlay);
    video.addEventListener('ended', tryPlay);
    video.addEventListener('pause', onPause);
    document.addEventListener('visibilitychange', onVisibility);
    gestureEvents.forEach((event) => window.addEventListener(event, tryPlay, { passive: true }));
    tryPlay();

    return () => {
      disposed = true;
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('ended', tryPlay);
      video.removeEventListener('pause', onPause);
      window.clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      gestureEvents.forEach((event) => window.removeEventListener(event, tryPlay));
    };
  }, []);

  return (
    <video ref={ref} className="hero-film" autoPlay muted loop playsInline preload="auto" poster="/zibra-hero-poster.webp" disablePictureInPicture disableRemotePlayback aria-hidden="true" tabIndex={-1}>
      <source src="/zibra-hero-film.mp4" type="video/mp4" media="(min-width: 801px)" />
      <source src="/zibra-hero-film-mobile.mp4" type="video/mp4" />
    </video>
  );
}
