/**
 * KitoMascot SDK v3.1 - Production Embeddable Mascot Engine with Drag & Drop
 * Zero External Dependencies, Shadow DOM Isolated, Inertia Physics (60 FPS), Interactive Drag & Drop
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KitoMascot = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    playPop() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = this.ctx.currentTime + i * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    }
  }

  const widgetStyles = `
    :host {
      --mascot-color: #6366f1;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .kito-root {
      position: fixed;
      z-index: 999999;
      width: 110px;
      height: 110px;
      cursor: grab;
      pointer-events: auto;
      user-select: none;
      top: 0;
      left: 0;
      will-change: transform;
      filter: drop-shadow(0 8px 20px rgba(0,0,0,0.25));
      touch-action: none;
    }
    .kito-root:active, .kito-root.is-dragging {
      cursor: grabbing !important;
      filter: drop-shadow(0 14px 28px rgba(99,102,241,0.45));
    }
    .kito-root.mode-float {
      bottom: 24px;
      right: 24px;
      top: auto;
      left: auto;
      position: fixed;
    }
    .kito-bubble {
      position: absolute;
      bottom: 115px;
      left: 50%;
      transform: translateX(-50%) scale(0.8);
      transform-origin: bottom center;
      width: 220px;
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 14px;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.45;
      box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-align: center;
    }
    .kito-bubble.active {
      opacity: 1;
      transform: translateX(-50%) scale(1);
      pointer-events: auto;
    }
    .kito-bubble::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 8px 8px 0;
      border-style: solid;
      border-color: #0f172a transparent;
    }
    .kito-svg {
      width: 100%;
      height: 100%;
      display: block;
      transition: transform 0.2s ease;
    }

    .studio-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 380px;
      max-height: 90vh;
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid #6366f1;
      border-radius: 16px;
      padding: 20px;
      z-index: 1000000;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
      overflow-y: auto;
      font-size: 13px;
      display: none;
    }
    .studio-panel.open { display: block; }
    .studio-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
    .studio-header h3 { margin: 0; font-size: 16px; color: #818cf8; }
    .studio-close { background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; }
    .studio-field { margin-bottom: 14px; }
    .studio-field label { display: block; font-weight: 600; margin-bottom: 6px; color: #cbd5e1; }
    .studio-field input, .studio-field select { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: #1e293b; color: #fff; font-family: inherit; }
    .btn-studio { background: #6366f1; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 8px; }
    .btn-studio:hover { background: #4f46e5; }
    .code-export { background: #020617; border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: #a5b4fc; font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all; margin-top: 10px; }
  `;

  class MascotInstance {
    constructor(options = {}) {
      this.config = Object.assign({
        name: 'Kito',
        color: '#6366f1',
        accessory: 'glasses',
        mode: 'roam',
        idleInterval: 14000,
        sounds: true,
        hints: []
      }, options);

      this.state = 'idle';
      
      this.posX = window.innerWidth - 180;
      this.posY = 160;
      this.targetX = this.posX;
      this.targetY = this.posY;
      this.vx = 0;
      this.vy = 0;
      this.facingDirection = 1;

      this.isDragging = false;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;

      this.isHoverLocked = false;
      this.hoverCooldownTimer = null;
      this.roamInterval = null;
      this.blinkTimer = null;
      this.idleTimer = null;
      this.speechTimeout = null;

      this.sound = new SoundSynth();
      this.sound.enabled = this.config.sounds;

      this.createHostElement();
      this.render();

      this.initPhysicsLoop();
      this.bindMouseTracking();
      this.bindClick();
      this.bindDragAndDrop();
      this.bindDataAttributeScanner();

      this.setMode(this.config.mode);
      this.startBlinking();
      this.startIdleTips();
    }

    createHostElement() {
      this.host = document.createElement('div');
      this.host.id = 'kito-mascot-widget-host';
      document.body.appendChild(this.host);

      this.shadow = this.host.attachShadow({ mode: 'open' });

      const styleEl = document.createElement('style');
      styleEl.textContent = widgetStyles;
      this.shadow.appendChild(styleEl);

      this.container = document.createElement('div');
      this.container.className = 'kito-root';
      this.shadow.appendChild(this.container);
    }

    render() {
      const color = this.config.color;
      this.container.innerHTML = `
        <div class="kito-bubble" id="bubble">
          <span id="bubble-text">Xin chào! Mình là ${this.config.name} 🐱</span>
        </div>

        <svg id="svg-el" class="kito-svg" viewBox="0 0 160 160">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="${color}" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </radialGradient>

            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${color}"/>
              <stop offset="100%" stop-color="#3730a3"/>
            </linearGradient>

            <linearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f472b6"/>
              <stop offset="100%" stop-color="#db2777"/>
            </linearGradient>
          </defs>

          <circle cx="80" cy="80" r="70" fill="url(#glow)" />

          <path id="tail" d="M 120 110 C 145 100, 150 70, 135 60 C 130 55, 120 65, 125 75 C 130 85, 115 100, 105 105" 
                fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 105 105; 15 105 105; 0 105 105" dur="1.8s" repeatCount="indefinite"/>
          </path>

          <g id="arms">
            <path id="arm-l" d="M 45 85 Q 25 65 35 45" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
            <path id="arm-r" d="M 115 85 Q 135 75 125 95" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
          </g>

          <ellipse cx="80" cy="95" rx="38" ry="34" fill="url(#bodyGrad)" />
          <ellipse cx="80" cy="98" rx="24" ry="20" fill="rgba(255,255,255,0.22)" />

          <polygon points="35,65 20,20 60,45" fill="${color}" />
          <polygon points="38,60 27,28 55,46" fill="url(#earGrad)" />
          <polygon points="125,65 140,20 100,45" fill="${color}" />
          <polygon points="122,60 133,28 105,46" fill="url(#earGrad)" />

          <ellipse cx="80" cy="65" rx="42" ry="36" fill="url(#bodyGrad)" />

          <ellipse cx="50" cy="74" rx="8" ry="5" fill="#f472b6" opacity="0.65"/>
          <ellipse cx="110" cy="74" rx="8" ry="5" fill="#f472b6" opacity="0.65"/>

          <g id="eyes">
            <ellipse cx="58" cy="62" rx="11" ry="13" fill="#ffffff" />
            <ellipse cx="102" cy="62" rx="11" ry="13" fill="#ffffff" />

            <circle id="pupil-l" cx="58" cy="62" r="6" fill="#0f172a" />
            <circle cx="56" cy="59" r="2.5" fill="#ffffff" />

            <circle id="pupil-r" cx="102" cy="62" r="6" fill="#0f172a" />
            <circle cx="100" cy="59" r="2.5" fill="#ffffff" />

            <path id="eyelid-l" d="M 46 62 Q 58 62 70 62" fill="none" stroke="url(#bodyGrad)" stroke-width="0" stroke-linecap="round"/>
            <path id="eyelid-r" d="M 90 62 Q 102 62 114 62" fill="none" stroke="url(#bodyGrad)" stroke-width="0" stroke-linecap="round"/>
          </g>

          <path id="mouth" d="M 72 75 Q 80 83 88 75" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
          <polygon points="77,70 83,70 80,73" fill="#f472b6" />

          <g id="accessories">
            <g id="acc-glasses" style="display: ${this.config.accessory === 'glasses' ? 'block' : 'none'}">
              <circle cx="58" cy="62" r="14" fill="none" stroke="#f59e0b" stroke-width="3"/>
              <circle cx="102" cy="62" r="14" fill="none" stroke="#f59e0b" stroke-width="3"/>
              <line x1="72" y1="62" x2="88" y2="62" stroke="#f59e0b" stroke-width="3"/>
            </g>
            <g id="acc-hat" style="display: ${this.config.accessory === 'hat' ? 'block' : 'none'}">
              <polygon points="80,10 65,38 95,38" fill="#ec4899"/>
              <circle cx="80" cy="10" r="5" fill="#f59e0b"/>
            </g>
            <g id="acc-bowtie" style="display: ${this.config.accessory === 'bowtie' ? 'block' : 'none'}">
              <polygon points="68,96 80,100 68,104" fill="#ec4899"/>
              <polygon points="92,96 80,100 92,104" fill="#ec4899"/>
              <circle cx="80" cy="100" r="3" fill="#ffffff"/>
            </g>
          </g>
        </svg>
      `;

      this.bubble = this.shadow.querySelector('#bubble');
      this.bubbleText = this.shadow.querySelector('#bubble-text');
      this.svgEl = this.shadow.querySelector('#svg-el');
      this.pupilL = this.shadow.querySelector('#pupil-l');
      this.pupilR = this.shadow.querySelector('#pupil-r');
      this.mouth = this.shadow.querySelector('#mouth');
      this.armR = this.shadow.querySelector('#arm-r');
      this.eyelidL = this.shadow.querySelector('#eyelid-l');
      this.eyelidR = this.shadow.querySelector('#eyelid-r');
    }

    bindDragAndDrop() {
      const onPointerDown = (e) => {
        this.isDragging = true;
        this.container.classList.add('is-dragging');
        this.stopFreeRoaming();

        const pageX = e.touches ? e.touches[0].clientX : e.clientX;
        const pageY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = this.container.getBoundingClientRect();
        this.dragOffsetX = pageX - rect.left;
        this.dragOffsetY = pageY - rect.top;

        this.sound.playPop();
        this.setExpression('surprised');
        this.say("Woa! Nắm kéo Kito đi đâu thế này! 🎈", 2500);

        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend', onPointerUp);
      };

      const onPointerMove = (e) => {
        if (!this.isDragging) return;
        if (e.cancelable) e.preventDefault();

        const pageX = e.touches ? e.touches[0].clientX : e.clientX;
        const pageY = e.touches ? e.touches[0].clientY : e.clientY;

        const clampedX = Math.max(10, Math.min(window.innerWidth - 120, pageX - this.dragOffsetX));
        const clampedY = Math.max(10, Math.min(window.innerHeight - 120, pageY - this.dragOffsetY));

        this.targetX = clampedX;
        this.targetY = clampedY;
      };

      const onPointerUp = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.container.classList.remove('is-dragging');

        this.sound.playChime();
        this.setExpression('happy');
        this.say("Hì hì! Đặt Kito đứng ở đây nha! 📍", 3000);

        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);

        setTimeout(() => {
          if (!this.isDragging && !this.isHoverLocked && this.config.mode === 'roam') {
            this.setExpression('idle');
            this.startFreeRoaming();
          }
        }, 3000);
      };

      this.container.addEventListener('mousedown', onPointerDown);
      this.container.addEventListener('touchstart', onPointerDown, { passive: false });
    }

    initPhysicsLoop() {
      const loop = () => {
        if (this.config.mode === 'roam' || this.isDragging) {
          const currentDamping = this.isDragging ? 0.25 : 0.08;
          const dx = this.targetX - this.posX;
          const dy = this.targetY - this.posY;

          this.vx = dx * currentDamping;
          this.vy = dy * currentDamping;

          this.posX += this.vx;
          this.posY += this.vy;

          const tiltAngle = Math.max(-18, Math.min(18, this.vx * 1.8));

          if (this.vx < -0.3) {
            this.facingDirection = -1;
          } else if (this.vx > 0.3) {
            this.facingDirection = 1;
          }

          if (this.svgEl) {
            this.svgEl.style.transform = `scaleX(${this.facingDirection})`;
          }

          this.container.style.transform = `translate3d(${this.posX}px, ${this.posY}px, 0) rotate(${tiltAngle}deg)`;
        }
        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }

    bindMouseTracking() {
      window.addEventListener('mousemove', (e) => {
        if (!this.pupilL || !this.pupilR) return;
        const rect = this.container.getBoundingClientRect();
        const mascotX = rect.left + rect.width / 2;
        const mascotY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - mascotY, e.clientX - mascotX);
        const dist = Math.min(6, Math.hypot(e.clientX - mascotX, e.clientY - mascotY) / 35);

        this.pupilL.setAttribute('cx', 58 + Math.cos(angle) * dist);
        this.pupilL.setAttribute('cy', 62 + Math.sin(angle) * dist);
        this.pupilR.setAttribute('cx', 102 + Math.cos(angle) * dist);
        this.pupilR.setAttribute('cy', 62 + Math.sin(angle) * dist);
      });
    }

    startBlinking() {
      const triggerBlink = () => {
        if (this.eyelidL && this.eyelidR) {
          this.eyelidL.setAttribute('stroke-width', '24');
          this.eyelidR.setAttribute('stroke-width', '24');
          setTimeout(() => {
            this.eyelidL.setAttribute('stroke-width', '0');
            this.eyelidR.setAttribute('stroke-width', '0');
          }, 160);
        }
        this.blinkTimer = setTimeout(triggerBlink, 2200 + Math.random() * 4000);
      };
      triggerBlink();
    }

    bindDataAttributeScanner() {
      const scanElements = () => {
        const elements = document.querySelectorAll('[data-mascot-hint], [data-mascot-trigger]');
        elements.forEach(el => {
          if (el._hasMascotListener) return;
          el._hasMascotListener = true;

          el.addEventListener('mouseenter', () => {
            if (this.isDragging) return;
            this.isHoverLocked = true;
            clearTimeout(this.hoverCooldownTimer);
            this.stopFreeRoaming();

            const hint = el.getAttribute('data-mascot-hint');
            if (hint) {
              this.sound.playPop();
              this.say(`👉 ${hint}`, 4000);
              
              const rect = el.getBoundingClientRect();
              const targetX = Math.max(20, Math.min(window.innerWidth - 140, rect.left + rect.width + 15));
              const targetY = Math.max(20, Math.min(window.innerHeight - 140, rect.top - 20));

              this.targetX = targetX;
              this.targetY = targetY;
              this.setExpression('pointing');
            }
          });

          el.addEventListener('mouseleave', () => {
            if (this.isDragging) return;
            this.isHoverLocked = false;
            
            this.hoverCooldownTimer = setTimeout(() => {
              if (!this.isHoverLocked && !this.isDragging && this.config.mode === 'roam') {
                this.setExpression('idle');
                this.startFreeRoaming();
              }
            }, 2500);
          });
        });
      };

      scanElements();
      const observer = new MutationObserver(scanElements);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    bindClick() {
      this.container.addEventListener('click', (e) => {
        if (this.isDragging) return;
        e.stopPropagation();
        this.sound.playPop();
        this.setExpression('happy');

        const quotes = [
          `Hi hi! ${this.config.name} đang sẵn sàng trợ giúp bạn đây! 😸`,
          `Bạn có thể nắm kéo thả Kito đến bất kỳ đâu trên màn hình nha! 🎈`,
          `Rê chuột vào các nút bấm để xem ${this.config.name} hướng dẫn nhé! ✨`
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        this.say(randomQuote, 3500);

        setTimeout(() => this.setExpression('idle'), 3000);
      });
    }

    startFreeRoaming() {
      if (this.isHoverLocked || this.isDragging) return;
      this.stopFreeRoaming();

      const roamStep = () => {
        if (this.config.mode !== 'roam' || this.isHoverLocked || this.isDragging) return;

        const padding = 70;
        const w = window.innerWidth;
        const h = window.innerHeight;

        const zones = [
          { x: padding + Math.random() * (w - padding * 2 - 120), y: padding + Math.random() * 120 },
          { x: w - 160 - Math.random() * 80, y: padding + Math.random() * (h - padding * 2 - 120) },
          { x: padding + Math.random() * (w - padding * 2 - 120), y: h - 160 - Math.random() * 80 }
        ];
        const target = zones[Math.floor(Math.random() * zones.length)];

        this.targetX = target.x;
        this.targetY = target.y;
      };

      roamStep();
      this.roamInterval = setInterval(roamStep, 4500);
    }

    stopFreeRoaming() {
      if (this.roamInterval) {
        clearInterval(this.roamInterval);
        this.roamInterval = null;
      }
    }

    pointToElement(el) {
      if (!el || this.isDragging) return;
      const rect = el.getBoundingClientRect();
      const targetX = Math.max(20, Math.min(window.innerWidth - 140, rect.left + rect.width + 15));
      const targetY = Math.max(20, Math.min(window.innerHeight - 140, rect.top - 20));
      
      this.setExpression('pointing');
      this.targetX = targetX;
      this.targetY = targetY;

      setTimeout(() => this.setExpression('idle'), 3500);
    }

    setMode(mode) {
      this.config.mode = mode;
      this.container.classList.remove('mode-float');

      if (mode === 'roam') {
        this.targetX = window.innerWidth - 180;
        this.targetY = 160;
        this.startFreeRoaming();
      } else {
        this.stopFreeRoaming();
        this.container.classList.add('mode-float');
      }
    }

    setExpression(expr) {
      this.state = expr;
      if (!this.mouth) return;

      if (expr === 'happy') {
        this.mouth.setAttribute('d', 'M 68 75 Q 80 88 92 75');
      } else if (expr === 'surprised') {
        this.mouth.setAttribute('d', 'M 75 75 A 5 7 0 1 0 85 75 A 5 7 0 1 0 75 75');
      } else if (expr === 'pointing') {
        this.mouth.setAttribute('d', 'M 72 74 Q 80 82 88 74');
        if (this.armR) this.armR.setAttribute('d', 'M 115 80 Q 155 45 150 45');
      } else {
        this.mouth.setAttribute('d', 'M 72 75 Q 80 83 88 75');
        if (this.armR) this.armR.setAttribute('d', 'M 115 85 Q 135 75 125 95');
      }
    }

    say(text, duration = 4000) {
      if (!this.bubble || !this.bubbleText) return;
      this.bubbleText.innerText = text;
      this.bubble.classList.add('active');

      clearTimeout(this.speechTimeout);
      if (duration > 0) {
        this.speechTimeout = setTimeout(() => {
          this.bubble.classList.remove('active');
        }, duration);
      }
    }

    startIdleTips() {
      if (this.config.idleInterval <= 0) return;
      clearInterval(this.idleTimer);
      this.idleTimer = setInterval(() => {
        if (this.isHoverLocked || this.isDragging) return;
        if (this.config.hints.length > 0) {
          const randomHint = this.config.hints[Math.floor(Math.random() * this.config.hints.length)];
          this.sound.playChime();
          this.say(randomHint.text, 4500);
          if (randomHint.target) {
            const targetEl = document.querySelector(randomHint.target);
            if (targetEl) this.pointToElement(targetEl);
          }
        }
      }, this.config.idleInterval);
    }

    openStudio() {
      let panel = this.shadow.querySelector('#studio-panel');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'studio-panel';
        panel.className = 'studio-panel';
        panel.innerHTML = `
          <div class="studio-header">
            <h3>🛠️ Visual Mascot Studio</h3>
            <button class="studio-close" id="close-studio">&times;</button>
          </div>
          <div class="studio-field">
            <label>Tên Linh Vật (Name):</label>
            <input type="text" id="studio-name" value="${this.config.name}">
          </div>
          <div class="studio-field">
            <label>Màu Chủ Đạo (Color):</label>
            <input type="color" id="studio-color" value="${this.config.color}">
          </div>
          <div class="studio-field">
            <label>Phụ Kiện (Accessory):</label>
            <select id="studio-acc">
              <option value="glasses" ${this.config.accessory === 'glasses' ? 'selected' : ''}>👓 Kính Ngầu</option>
              <option value="hat" ${this.config.accessory === 'hat' ? 'selected' : ''}>🎩 Nón Kỳ Lân</option>
              <option value="bowtie" ${this.config.accessory === 'bowtie' ? 'selected' : ''}>🎀 Nơ Cổ</option>
              <option value="none" ${this.config.accessory === 'none' ? 'selected' : ''}>Không</option>
            </select>
          </div>
          <div class="studio-field">
            <label>Chế Độ Hoạt Động:</label>
            <select id="studio-mode">
              <option value="roam" ${this.config.mode === 'roam' ? 'selected' : ''}>🕊️ Tự Do Di Chuyển</option>
              <option value="float" ${this.config.mode === 'float' ? 'selected' : ''}>📍 Góc Màn Hình</option>
            </select>
          </div>
          <button class="btn-studio" id="studio-apply">✨ Áp Dụng Thay Đổi</button>
          <div class="code-export" id="studio-code"></div>
        `;
        this.shadow.appendChild(panel);

        panel.querySelector('#close-studio').addEventListener('click', () => panel.classList.remove('open'));
        panel.querySelector('#studio-apply').addEventListener('click', () => {
          this.config.name = panel.querySelector('#studio-name').value;
          this.config.color = panel.querySelector('#studio-color').value;
          this.config.accessory = panel.querySelector('#studio-acc').value;
          const newMode = panel.querySelector('#studio-mode').value;

          this.render();
          this.setMode(newMode);

          const snippet = `<script src="mascot-widget.js"></script>\n<script>\n  KitoMascot.init({\n    name: '${this.config.name}',\n    color: '${this.config.color}',\n    accessory: '${this.config.accessory}',\n    mode: '${this.config.mode}'\n  });\n</script>`;
          panel.querySelector('#studio-code').textContent = snippet;
          this.say("Đã cập nhật cấu hình Custom Studio!", 3000);
        });
      }

      panel.classList.add('open');
      const snippet = `<script src="mascot-widget.js"></script>\n<script>\n  KitoMascot.init({\n    name: '${this.config.name}',\n    color: '${this.config.color}',\n    accessory: '${this.config.accessory}',\n    mode: '${this.config.mode}'\n  });\n</script>`;
      panel.querySelector('#studio-code').textContent = snippet;
    }

    destroy() {
      this.stopFreeRoaming();
      clearTimeout(this.blinkTimer);
      clearTimeout(this.hoverCooldownTimer);
      clearInterval(this.idleTimer);
      if (this.host) this.host.remove();
    }
  }

  return {
    init: function (options) {
      return new MascotInstance(options);
    }
  };

}));
