import confetti from 'canvas-confetti';
import { mascotAudio } from './audio.js';

export class TourEngine {
  constructor(mascotEngine) {
    this.mascot = mascotEngine;
    this.currentStep = 0;
    this.isTourRunning = false;

    this.steps = [
      {
        target: '#btn-hero-explore',
        text: '1️⃣ Đầu tiên: Nút Khám Phá giúp bạn cuộn xem thông số dự án nè!'
      },
      {
        target: '#btn-theme-toggle',
        text: '2️⃣ Tiếp theo: Bạn có thể bật Dark/Light Mode bất cứ lúc nào ở đây!'
      },
      {
        target: '#btn-open-customizer',
        text: '3️⃣ Thú vị nhất: Bấm vào đây để thay đổi trang phục và màu lông cho Kito!'
      },
      {
        target: '#btn-surprise',
        text: '4️⃣ Cuối cùng: Đừng quên bấm Nút Bí Mật để xem điều kỳ diệu nhé! 🎉'
      }
    ];
  }

  startTour() {
    this.isTourRunning = true;
    this.currentStep = 0;
    this.executeStep();
  }

  nextStep() {
    this.currentStep++;
    if (this.currentStep < this.steps.length) {
      this.executeStep();
    } else {
      this.finishTour();
    }
  }

  executeStep() {
    const step = this.steps[this.currentStep];
    const el = document.querySelector(step.target);

    if (el) {
      this.mascot.pointToButton(el, step.text);
      
      // Auto advance to next step after 4.5 seconds
      setTimeout(() => {
        if (this.isTourRunning) {
          this.nextStep();
        }
      }, 4500);
    } else {
      this.nextStep();
    }
  }

  finishTour() {
    this.isTourRunning = false;
    this.mascot.setExpression('happy');
    this.mascot.showSpeechBubble("Hoàn thành Tour rồi! Bạn trải nghiệm ứng dụng vui vẻ nhé 💖", 5000);
    mascotAudio.playCheer();
    this.fireConfetti();
  }

  fireConfetti() {
    const canvas = document.querySelector('#confetti-canvas');
    if (canvas) {
      const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
      myConfetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }
}
