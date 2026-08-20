// Sound helper for BibleNote web portal
export const playSound = (soundName: 'tap' | 'success' | 'fanfare' | 'boing') => {
  try {
    let file = '/assets/cute_pop_tap.wav';
    if (soundName === 'success') file = '/assets/star_chime_success.wav';
    if (soundName === 'fanfare') file = '/assets/joyful_level_fanfare.wav';
    if (soundName === 'boing') file = '/assets/cute_boing_wrong.wav';

    const audio = new Audio(file);
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Autoplay or browser user interaction restriction
    });
  } catch {
    // ignore
  }
};
