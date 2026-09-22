import { mascotAudio } from './audio.js';

export class MascotEngine {
  constructor(wrapperSelector = '#mascot-rail-wrapper') {
    this.wrapper = document.querySelector(wrapperSelector);
    this.state = 'idle'; // idle, happy, pointing, swinging-down, swinging-up, surprised, sleeping
    this.primaryColor = '#6366f1';
    this.accessory = 'none'; // none, glasses, hat, bowtie
    this.mode = 'rail'; // 'rail', 'float', or 'free'

    this.currentX = window.innerWidth - 180;
    this.currentY = 150;
    this.facingDirection = 1; // 1 for right, -1 for left

    this.lastScrollY = window.scrollY;
    this.scrollTimeout = null;
    this.speechTimeout = null;
    this.roamInterval = null;
    this.idleTimer = null;
    this.isHoveringButton = false;

    this.init();
  }

  init() {
    if (!this.wrapper) return;

    // Render SVG HTML and Speech Bubble
    this.render();

    // Attach event listeners
    this.bindMouseTracking();
    this.bindScrollPhysics();
    this.bindClickInteraction();
    this.bindButtonHoverInteraction();

    // Start Periodic Idle Suggestions
    this.startIdleSuggestions();
  }

  // Generate scalable Vector Mascot SVG
  render() {
    this.wrapper.innerHTML = `
      <div class="mascot-speech-bubble" id="mascot-bubble">
        <span id="mascot-speech-text">Chào bạn! Mình là Kito 🐱</span>
      </div>

      <svg id="mascot-svg-el" class="mascot-svg" viewBox="0 0 160 160" width="100%" height="100%">
        <defs>
          <radialGradient id="mascot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${this.primaryColor}" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="${this.primaryColor}" stop-opacity="0"/>
          </radialGradient>

          <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${this.primaryColor}"/>
            <stop offset="100%" stop-color="#4338ca"/>
          </linearGradient>

          <linearGradient id="ear-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f472b6"/>
            <stop offset="100%" stop-color="#db2777"/>
          </linearGradient>
        </defs>

        <!-- Glow ring behind mascot -->
        <circle cx="80" cy="80" r="70" fill="url(#mascot-glow)" />

        <!-- Tail -->
        <path id="mascot-tail" d="M 120 110 C 145 100, 150 70, 135 60 C 130 55, 120 65, 125 75 C 130 85, 115 100, 105 105" 
              fill="none" stroke="${this.primaryColor}" stroke-width="12" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" values="0 105 105; 15 105 105; 0 105 105" dur="1.5s" repeatCount="indefinite"/>
        </path>

        <!-- Arms (Rail Grippers / Body Arms) -->
        <g id="mascot-arms">
          <!-- Left Arm -->
          <path id="arm-left" d="M 45 85 Q 25 55 35 30" fill="none" stroke="${this.primaryColor}" stroke-width="10" stroke-linecap="round"/>
          <!-- Right Arm -->
          <path id="arm-right" d="M 115 85 Q 135 75 125 95" fill="none" stroke="${this.primaryColor}" stroke-width="10" stroke-linecap="round"/>
        </g>

        <!-- Main Body -->
        <ellipse cx="80" cy="95" rx="38" ry="34" fill="url(#body-grad)" />
        <ellipse cx="80" cy="98" rx="24" ry="20" fill="rgba(255,255,255,0.2)" />

        <!-- Ears -->
        <g id="mascot-ears">
          <!-- Left Ear -->
          <polygon points="35,65 20,20 60,45" fill="${this.primaryColor}" />
          <polygon points="38,60 27,28 55,46" fill="url(#ear-grad)" />

          <!-- Right Ear -->
          <polygon points="125,65 140,20 100,45" fill="${this.primaryColor}" />
          <polygon points="122,60 133,28 105,46" fill="url(#ear-grad)" />
        </g>

        <!-- Head -->
        <ellipse cx="80" cy="65" rx="42" ry="36" fill="url(#body-grad)" />

        <!-- Cheeks Blush -->
        <ellipse cx="50" cy="74" rx="8" ry="5" fill="#f472b6" opacity="0.6"/>
        <ellipse cx="110" cy="74" rx="8" ry="5" fill="#f472b6" opacity="0.6"/>

        <!-- Eyes Sockets -->
        <g id="mascot-eyes">
          <ellipse cx="58" cy="62" rx="11" ry="13" fill="#ffffff" />
          <ellipse cx="102" cy="62" rx="11" ry="13" fill="#ffffff" />

          <!-- Left Pupil (Tracked) -->
          <g id="pupil-left-group">
            <circle id="pupil-left" cx="58" cy="62" r="6" fill="#0f172a" />
            <circle cx="56" cy="59" r="2.5" fill="#ffffff" />
          </g>

          <!-- Right Pupil (Tracked) -->
          <g id="pupil-right-group">
            <circle id="pupil-right" cx="102" cy="62" r="6" fill="#0f172a" />
            <circle cx="100" cy="59" r="2.5" fill="#ffffff" />
          </g>
        </g>

        <!-- Mouth Path -->
        <path id="mascot-mouth" d="M 72 75 Q 80 83 88 75" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>

        <!-- Nose -->
        <polygon points="77,70 83,70 80,73" fill="#f472b6" />

        <!-- Dynamic Accessories -->
        <g id="mascot-accessories">
          <g id="acc-glasses" style="display: ${this.accessory === 'glasses' ? 'block' : 'none'}">
            <circle cx="58" cy="62" r="14" fill="none" stroke="#f59e0b" stroke-width="3"/>
            <circle cx="102" cy="62" r="14" fill="none" stroke="#f59e0b" stroke-width="3"/>
            <line x1="72" y1="62" x2="88" y2="62" stroke="#f59e0b" stroke-width="3"/>
          </g>

          <g id="acc-hat" style="display: ${this.accessory === 'hat' ? 'block' : 'none'}">
            <polygon points="80,10 65,38 95,38" fill="#ec4899"/>
            <circle cx="80" cy="10" r="5" fill="#f59e0b"/>
          </g>

          <g id="acc-bowtie" style="display: ${this.accessory === 'bowtie' ? 'block' : 'none'}">
            <polygon points="68,96 80,100 68,104" fill="#ec4899"/>
            <polygon points="92,96 80,100 92,104" fill="#ec4899"/>
            <circle cx="80" cy="100" r="3" fill="#ffffff"/>
          </g>
        </g>
      </svg>
    `;

    this.speechBubble = document.querySelector('#mascot-bubble');
    this.speechText = document.querySelector('#mascot-speech-text');
    this.mouth = this.wrapper.querySelector('#mascot-mouth');
    this.armRight = this.wrapper.querySelector('#arm-right');
    this.armLeft = this.wrapper.querySelector('#arm-left');
    this.svgEl = this.wrapper.querySelector('#mascot-svg-el');
  }

  // Eye tracking based on cursor position
  bindMouseTracking() {
    window.addEventListener('mousemove', (e) => {
      const pupilLeft = this.wrapper.querySelector('#pupil-left');
      const pupilRight = this.wrapper.querySelector('#pupil-right');
      if (!pupilLeft || !pupilRight) return;

      const rect = this.wrapper.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - mascotCenterY, e.clientX - mascotCenterX);
      const distance = Math.min(6, Math.hypot(e.clientX - mascotCenterX, e.clientY - mascotCenterY) / 30);

      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      pupilLeft.setAttribute('cx', 58 + offsetX);
      pupilLeft.setAttribute('cy', 62 + offsetY);

      pupilRight.setAttribute('cx', 102 + offsetX);
      pupilRight.setAttribute('cy', 62 + offsetY);
    });
  }

  // Scroll Rail Physics & Swinging Motion Engine
  bindScrollPhysics() {
    const railCar = document.querySelector('#rail-car');
    
    window.addEventListener('scroll', () => {
      if (this.mode !== 'rail') return;

      const currentScrollY = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = totalScroll > 0 ? currentScrollY / totalScroll : 0;

      if (railCar) {
        const railHeight = document.querySelector('.scroll-rail-track')?.clientHeight || 500;
        const carMaxTop = railHeight - 120;
        railCar.style.top = `${scrollPercent * carMaxTop}px`;
      }

      const deltaY = currentScrollY - this.lastScrollY;
      this.lastScrollY = currentScrollY;

      if (Math.abs(deltaY) > 2) {
        mascotAudio.playSwing();

        if (deltaY > 0) {
          this.wrapper.classList.remove('swing-up', 'swing-settle');
          this.wrapper.classList.add('swing-down');
          this.setExpression('swinging-down');
        } else {
          this.wrapper.classList.remove('swing-down', 'swing-settle');
          this.wrapper.classList.add('swing-up');
          this.setExpression('swinging-up');
        }

        document.querySelector('#quest-1')?.classList.add('completed');
      }

      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.wrapper.classList.remove('swing-down', 'swing-up');
        this.wrapper.classList.add('swing-settle');
        this.setExpression('idle');
      }, 150);
    });
  }

  // Button Hover Interaction: Mascot moves near button & displays tooltip
  bindButtonHoverInteraction() {
    const interactiveElements = document.querySelectorAll('button, .hint-target, .feature-box, .stat-card');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.isHoveringButton = true;
        const hintText = el.getAttribute('data-hint') || el.innerText || "Tính năng thú vị nè!";
        
        mascotAudio.playPop();
        this.setExpression('pointing');
        this.showSpeechBubble(`👉 ${hintText}`, 3500);

        if (this.mode === 'free') {
          const rect = el.getBoundingClientRect();
          const targetX = Math.max(30, Math.min(window.innerWidth - 150, rect.left + rect.width + 15));
          const targetY = Math.max(30, Math.min(window.innerHeight - 150, rect.top - 20));
          this.moveFreeTo(targetX, targetY);
        }
      });

      el.addEventListener('mouseleave', () => {
        this.isHoveringButton = false;
        setTimeout(() => {
          if (!this.isHoveringButton && this.state === 'pointing') {
            this.setExpression('idle');
          }
        }, 1200);
      });
    });
  }

  // Periodic Idle Suggestions
  startIdleSuggestions() {
    clearInterval(this.idleTimer);
    this.idleTimer = setInterval(() => {
      if (this.isHoveringButton) return;

      const tips = [
        "💡 Thử rê chuột vào bất kỳ nút bấm nào trên trang để Kito giải thích nha!",
        "🎨 Muốn đổi màu sắc hay nơ đeo cổ? Mở ngay Bảng Tùy Chỉnh Mascot!",
        "🎢 Cuộn chuột lên xuống để trải nghiệm Kito đu dây trượt mượt mà!",
        "🎁 Bạn đã bấm Nút Bí Mật để ngắm pháo hoa rực rỡ chưa?",
        "🕊️ Kito đang tự do di chuyển dạo quanh màn hình nè! 🐾"
      ];

      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      mascotAudio.playPop();
      this.setExpression('happy');
      this.showSpeechBubble(randomTip, 4500);

      setTimeout(() => {
        if (this.state === 'happy') this.setExpression('idle');
      }, 4500);
    }, 14000);
  }

  // Autonomous Screen Roaming Loop (Di chuyển tự do ngẫu nhiên)
  startFreeRoaming() {
    this.stopFreeRoaming();

    const roamStep = () => {
      if (this.mode !== 'free' || this.isHoveringButton) return;

      // Calculate new random position inside viewport boundaries
      const paddingX = 80;
      const paddingY = 90;
      const randomX = paddingX + Math.random() * (window.innerWidth - paddingX * 2 - 120);
      const randomY = paddingY + Math.random() * (window.innerHeight - paddingY * 2 - 120);

      this.moveFreeTo(randomX, randomY);
      this.setExpression('happy');

      setTimeout(() => {
        if (this.mode === 'free' && !this.isHoveringButton) {
          this.setExpression('idle');
        }
      }, 1500);
    };

    // Immediate first move
    roamStep();

    // Move randomly every 3.5 seconds!
    this.roamInterval = setInterval(roamStep, 3800);
  }

  stopFreeRoaming() {
    if (this.roamInterval) {
      clearInterval(this.roamInterval);
      this.roamInterval = null;
    }
  }

  moveFreeTo(x, y) {
    if (this.mode !== 'free') return;

    // Flip SVG based on horizontal movement direction
    if (x < this.currentX && this.svgEl) {
      this.svgEl.style.transform = 'scaleX(-1)';
      this.facingDirection = -1;
    } else if (x > this.currentX && this.svgEl) {
      this.svgEl.style.transform = 'scaleX(1)';
      this.facingDirection = 1;
    }

    this.currentX = x;
    this.currentY = y;

    this.wrapper.style.left = `${x}px`;
    this.wrapper.style.top = `${y}px`;
  }

  // Pet / Click Mascot Event
  bindClickInteraction() {
    this.wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      mascotAudio.playPop();
      this.setExpression('happy');

      const messages = [
        "Hi hi! Kito đang bay dạo quanh màn hình nè! 🕊️",
        "Nhột quá bạn ơi! 😸",
        "Rê chuột vào các nút bấm để Kito đọc thông tin giúp bạn nha! ✨",
        "Thử đổi màu trang phục cho Kito trong phần Tùy Chỉnh đi nào! 🎨"
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      this.showSpeechBubble(randomMsg, 3500);

      document.querySelector('#quest-2')?.classList.add('completed');

      setTimeout(() => {
        if (this.state === 'happy') this.setExpression('idle');
      }, 2500);
    });
  }

  // Facial Expression State Machine
  setExpression(expr) {
    this.state = expr;
    if (!this.mouth) return;

    if (expr === 'happy' || expr === 'swinging-down') {
      this.mouth.setAttribute('d', 'M 68 75 Q 80 88 92 75');
    } else if (expr === 'surprised') {
      this.mouth.setAttribute('d', 'M 75 75 A 5 7 0 1 0 85 75 A 5 7 0 1 0 75 75');
    } else if (expr === 'pointing') {
      this.mouth.setAttribute('d', 'M 72 74 Q 80 82 88 74');
      if (this.armRight) this.armRight.setAttribute('d', 'M 115 80 Q 155 45 150 45');
    } else if (expr === 'swinging-up') {
      this.mouth.setAttribute('d', 'M 70 73 Q 80 86 90 73');
    } else if (expr === 'sleeping') {
      this.mouth.setAttribute('d', 'M 74 76 Q 80 72 86 76');
    } else {
      this.mouth.setAttribute('d', 'M 72 75 Q 80 83 88 75');
      if (this.armRight) this.armRight.setAttribute('d', 'M 115 85 Q 135 75 125 95');
    }
  }

  // Speech Bubble Display
  showSpeechBubble(text, duration = 4000) {
    if (!this.speechBubble || !this.speechText) return;

    this.speechText.innerText = text;
    this.speechBubble.classList.add('active');

    clearTimeout(this.speechTimeout);
    if (duration > 0) {
      this.speechTimeout = setTimeout(() => {
        this.speechBubble.classList.remove('active');
      }, duration);
    }
  }

  // Point to a target button and give a recommendation hint
  pointToButton(buttonElement, customHintText) {
    if (!buttonElement) return;

    buttonElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    document.querySelectorAll('.spotlight-ring').forEach(el => el.classList.remove('spotlight-ring'));
    buttonElement.classList.add('spotlight-ring');

    mascotAudio.playCheer();
    this.setExpression('pointing');

    const text = customHintText || buttonElement.getAttribute('data-hint') || "Thử click vào button này nhé!";
    this.showSpeechBubble(text, 5000);

    if (this.mode === 'free') {
      const rect = buttonElement.getBoundingClientRect();
      this.moveFreeTo(rect.left + rect.width + 15, rect.top - 20);
    }

    setTimeout(() => {
      buttonElement.classList.remove('spotlight-ring');
      this.setExpression('idle');
    }, 5000);
  }

  // Change mascot color theme
  setColor(colorHex) {
    this.primaryColor = colorHex;
    document.documentElement.style.setProperty('--mascot-color', colorHex);
    this.render();
    this.bindButtonHoverInteraction();
  }

  // Change accessory
  setAccessory(accName) {
    this.accessory = accName;
    this.render();
    this.bindButtonHoverInteraction();
  }

  // Toggle Mode: Side Rail ('rail'), Corner Buddy ('float'), Free Roaming ('free')
  setMode(modeName) {
    this.mode = modeName;
    const railContainer = document.querySelector('.scroll-rail-container');
    const wrapper = this.wrapper;

    if (!wrapper) return;

    wrapper.style.left = '';
    wrapper.style.top = '';
    wrapper.classList.remove('rail-mode', 'float-mode', 'free-mode');

    if (modeName === 'free') {
      if (railContainer) railContainer.style.opacity = '0';
      document.body.appendChild(wrapper);
      wrapper.classList.add('free-mode');
      this.moveFreeTo(window.innerWidth - 200, 160);
      this.startFreeRoaming();
    } else if (modeName === 'float') {
      this.stopFreeRoaming();
      if (railContainer) railContainer.style.opacity = '0';
      document.body.appendChild(wrapper);
      wrapper.classList.add('float-mode');
    } else { // 'rail'
      this.stopFreeRoaming();
      if (railContainer) railContainer.style.opacity = '1';
      const railCar = document.querySelector('#rail-car');
      if (railCar) railCar.appendChild(wrapper);
      wrapper.classList.add('rail-mode');
    }
  }
}
