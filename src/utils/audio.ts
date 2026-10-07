// Web Audio API sound generator for Pomodoro notifications
// Works offline without any external MP3 files

export const playNotificationSound = (type: 'bell' | 'chime' | 'digital' = 'bell', volume = 0.7) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.4, now);
    gainNode.connect(ctx.destination);

    if (type === 'bell') {
      // Pleasant chime bell: fundamental + harmonic
      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 chords
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        oscGain.gain.setValueAtTime(0.3, now + idx * 0.08);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.2);

        osc.connect(oscGain);
        oscGain.connect(gainNode);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.3);
      });
    } else if (type === 'chime') {
      // Soft uplifting sequence
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        noteGain.gain.setValueAtTime(0.25, now + i * 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.8);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.9);
      });
    } else {
      // Digital beep
      [0, 0.18].forEach(offset => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now + offset);

        noteGain.gain.setValueAtTime(0.3, now + offset);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    }
  } catch (err) {
    console.warn('Audio playback not supported or blocked:', err);
  }
};

export const requestDesktopNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon.png',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' });
      }
    });
  }
};
