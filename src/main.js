import { MascotEngine } from './mascot.js';
import { TourEngine } from './tour.js';
import { mascotAudio } from './audio.js';
import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Mascot Engine
  const mascot = new MascotEngine('#mascot-rail-wrapper');
  const tour = new TourEngine(mascot);

  // Set Default Mode to 'free' (Tự Do Di Chuyển) so user immediately sees mascot roaming!
  mascot.setMode('free');

  // Quick Mode Pill Selector Handler
  const updatePillButtons = (activeMode) => {
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    if (activeMode === 'free') document.querySelector('#btn-quick-free')?.classList.add('active');
    if (activeMode === 'rail') document.querySelector('#btn-quick-rail')?.classList.add('active');
    if (activeMode === 'float') document.querySelector('#btn-quick-float')?.classList.add('active');
  };

  document.querySelector('#btn-quick-free')?.addEventListener('click', () => {
    mascot.setMode('free');
    updatePillButtons('free');
    mascot.showSpeechBubble("🕊️ Chế độ Tự Do Di Chuyển! Kito sẽ tự dạo quanh màn hình nè 🐾", 3500);
  });

  document.querySelector('#btn-quick-rail')?.addEventListener('click', () => {
    mascot.setMode('rail');
    updatePillButtons('rail');
    mascot.showSpeechBubble("🎢 Chế độ Bám Thanh Trượt! Cuộn chuột để xem Kito đu dây nhé 🚀", 3500);
  });

  document.querySelector('#btn-quick-float')?.addEventListener('click', () => {
    mascot.setMode('float');
    updatePillButtons('float');
    mascot.showSpeechBubble("📍 Chế độ Góc Màn Hình! Kito đứng gọn ở đây nha ✨", 3500);
  });

  // Sound Toggle Button
  const soundBtn = document.querySelector('#btn-sound-toggle');
  soundBtn?.addEventListener('click', () => {
    const muted = mascotAudio.toggleMute();
    soundBtn.querySelector('.sound-icon').textContent = muted ? '🔇' : '🔊';
    mascot.showSpeechBubble(muted ? "Đã tắt âm thanh 🔇" : "Đã bật âm thanh 🔊", 2000);
  });

  // Theme Toggle Button (Dark / Light)
  const themeBtn = document.querySelector('#btn-theme-toggle');
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    const isLight = document.body.classList.contains('theme-light');
    themeBtn.querySelector('.theme-icon').textContent = isLight ? '☀️' : '🌙';

    mascotAudio.playPop();
    mascot.setExpression('happy');
    mascot.showSpeechBubble(isLight ? "Giao diện Sáng rực rỡ! ☀️" : "Giao diện Tối sang trọng! 🌙", 3000);

    document.querySelector('#quest-3')?.classList.add('completed');
  });

  // Hero Section Action Buttons
  document.querySelector('#btn-hero-explore')?.addEventListener('click', () => {
    document.querySelector('#rail-demo')?.scrollIntoView({ behavior: 'smooth' });
    mascot.showSpeechBubble("Xem hiệu ứng đu dây mượt chưa kìa! 🎢", 3000);
  });

  // Mascot Mode Toggle (Hero Section button)
  document.querySelector('#btn-mode-toggle')?.addEventListener('click', () => {
    let nextMode = 'free';
    if (mascot.mode === 'rail') nextMode = 'free';
    else if (mascot.mode === 'free') nextMode = 'float';
    else nextMode = 'rail';

    mascot.setMode(nextMode);
    updatePillButtons(nextMode);

    const labels = {
      free: "Chế độ: 🕊️ Tự Do Di Chuyển (Kito tự dạo quanh màn hình)",
      float: "Chế độ: 📍 Nổi Góc Màn Hình (Kito đứng góc dưới)",
      rail: "Chế độ: 🎢 Bám Thanh Trượt (Kito trượt theo scroll)"
    };
    mascot.showSpeechBubble(labels[nextMode], 4000);
  });

  // Tour Buttons
  document.querySelector('#btn-start-tour')?.addEventListener('click', () => tour.startTour());
  document.querySelector('#btn-tour-step')?.addEventListener('click', () => tour.startTour());

  // Random Hint Generator Button
  document.querySelector('#btn-trigger-hint')?.addEventListener('click', () => {
    const hintTargets = document.querySelectorAll('.hint-target');
    if (hintTargets.length > 0) {
      const randomBtn = hintTargets[Math.floor(Math.random() * hintTargets.length)];
      mascot.pointToButton(randomBtn);
    }
  });

  // Action Buttons in Playground
  document.querySelector('#btn-action-happy')?.addEventListener('click', () => {
    mascotAudio.playPop();
    mascot.setExpression('happy');
    mascot.showSpeechBubble("Hôm nay Kito vui quá nè! (^.^)", 3000);
  });

  document.querySelector('#btn-action-surprised')?.addEventListener('click', () => {
    mascotAudio.playPop();
    mascot.setExpression('surprised');
    mascot.showSpeechBubble("Ôi chao! Bất ngờ chưa! (O_O)", 3000);
  });

  document.querySelector('#btn-action-pointing')?.addEventListener('click', () => {
    mascot.pointToButton(document.querySelector('#btn-surprise'));
  });

  document.querySelector('#btn-action-sleepy')?.addEventListener('click', () => {
    mascot.setExpression('sleeping');
    mascot.showSpeechBubble("Zzz... Kito ngủ gật đây... 😴", 3500);
  });

  // Secret Surprise Button
  document.querySelector('#btn-surprise')?.addEventListener('click', () => {
    mascotAudio.playCheer();
    mascot.setExpression('happy');
    mascot.showSpeechBubble("BÙM! Pháo hoa chúc mừng bạn nè! 🎉✨", 4000);

    const canvas = document.querySelector('#confetti-canvas');
    if (canvas) {
      const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
      myConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });
    }

    document.querySelector('#quest-4')?.classList.add('completed');
    checkAllQuestsCompleted();
  });

  // Back to Top Button
  document.querySelector('#btn-back-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mascot.showSpeechBubble("Vèo một cái lên đến đỉnh trang luôn! 🚀", 3000);
  });

  // Customizer Modal Logic
  const modal = document.querySelector('#customizer-modal');
  const openModalBtn = document.querySelector('#btn-open-customizer');
  const closeModalBtn = document.querySelector('#btn-close-modal');

  openModalBtn?.addEventListener('click', () => {
    modal?.classList.add('open');
    mascot.showSpeechBubble("Hãy chọn phong cách bạn thích nhất cho Kito nhé! 🎨", 4000);
  });

  closeModalBtn?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Mascot Color Selection
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const color = btn.getAttribute('data-color');
      if (color) mascot.setColor(color);
    });
  });

  // Mascot Accessory Selection
  document.querySelectorAll('.acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.acc-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const acc = btn.getAttribute('data-acc');
      if (acc) mascot.setAccessory(acc);
    });
  });

  // Mascot Mode Selection inside Modal
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      if (mode) {
        mascot.setMode(mode);
        updatePillButtons(mode);
      }
    });
  });

  function checkAllQuestsCompleted() {
    const allCompleted = document.querySelectorAll('.quest-item.completed').length === 4;
    if (allCompleted) {
      setTimeout(() => {
        mascot.showSpeechBubble("🏆 XUẤT SẮC! Bạn đã hoàn thành tất cả nhiệm vụ Mascot!", 6000);
        mascotAudio.playCheer();
      }, 1000);
    }
  }

  // Initial welcome message from mascot
  setTimeout(() => {
    mascot.showSpeechBubble("Xin chào! Kito đang bay dạo tự do trên màn hình nè! 🕊️🐾", 5000);
  }, 1000);
});
