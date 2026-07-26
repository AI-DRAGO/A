// js/main.js

(function () {
  'use strict';

  // ============================================
  // 1. GSAP Setup
  // ============================================
  gsap.registerPlugin(ScrollTrigger);

  // ============================================
  // 2. Reduced Motion Check
  // ============================================
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // ============================================
  // 3. Overlay & Audio Controller
  // ============================================
  const overlay = document.getElementById('intro-overlay');
  const beginBtn = document.getElementById('begin-btn');
  const audio = document.getElementById('bg-audio');
  const audioControls = document.getElementById('audio-controls');
  const audioToggle = document.getElementById('audio-toggle');
  const audioIcon = audioToggle.querySelector('.audio-icon');
  const audioToast = document.getElementById('audio-toast');
  let isPlaying = false;

  function showToast() {
    audioToast.classList.remove('hidden');
    setTimeout(() => audioToast.classList.add('hidden'), 3500);
  }

  beginBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    audioControls.classList.add('visible');

    audio.volume = 0.5;
    audio.play()
      .then(() => {
        isPlaying = true;
        audioIcon.textContent = '🔊';
      })
      .catch(() => {
        isPlaying = false;
        audioIcon.textContent = '🔇';
        showToast();
      });

    // Refresh ScrollTrigger once layout settles after overlay dismiss
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();

      // Safety net: guarantee Scene 1's text is visible the moment the
      // story begins, regardless of whether ScrollTrigger has finished
      // recalculating trigger positions yet.
      const firstText = document.querySelector('#scene-1 .scene-text');
      if (firstText) {
        gsap.to(firstText, { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out' });
      }
    });
  });

  audioToggle.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      audioIcon.textContent = '🔇';
    } else {
      audio.play()
        .then(() => {
          isPlaying = true;
          audioIcon.textContent = '🔊';
        })
        .catch(() => {
          audioIcon.textContent = '🔇';
          showToast();
        });
    }
  });

  const replayBtn = document.getElementById('replay-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      overlay.classList.remove('hidden');
      audioControls.classList.remove('visible');
      audio.pause();
      audio.currentTime = 0;
      isPlaying = false;
      audioIcon.textContent = '🔇';
      ScrollTrigger.refresh();
    });
  }

  // ============================================
  // 4. Scene Animations (skip if reduced motion)
  // ============================================
  if (!prefersReducedMotion) {
    initParallaxAnimations();
    initTextAnimations();
  } else {
    document.querySelectorAll('.scene-text').forEach(el => {
      el.style.opacity = '1';
    });
  }

  function initParallaxAnimations() {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1px)', () => {
      gsap.utils.toArray('.bg-layer').forEach(layer => {
        gsap.to(layer, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: layer.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      gsap.utils.toArray('.mid-layer').forEach(layer => {
        gsap.to(layer, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: layer.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      gsap.utils.toArray('.fg-layer').forEach(layer => {
        gsap.to(layer, {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: layer.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    });
  }

  function initTextAnimations() {
    gsap.utils.toArray('.scene-text').forEach(text => {
      // Climax text is handled by the card wrapper instead
      if (text.classList.contains('scene-text--climax')) return;

      // CSS starts these at opacity:0. gsap.from() would capture that same
      // opacity:0 as its "end" state, so the text would animate 0 -> 0 and
      // never appear. Use fromTo() with an explicit end state instead.
      gsap.fromTo(
        text,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: text,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    const climaxCard = document.querySelector('.climax-card');
    if (climaxCard) {
      gsap.set('.scene-text--climax', { opacity: 1 });
      gsap.from(climaxCard, {
        scale: 0.9,
        opacity: 0,
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: climaxCard,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
    }
  }

  // ============================================
  // 5. Cleanup
  // ============================================
  window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(t => t.kill());
  });

})();
