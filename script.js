/* ============================================
   PHYSIS JURIS — SCRIPT.JS
   ============================================ */

(function () {
  'use strict';

  // ---- NAVBAR SCROLL-AWARE ----
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- MOBILE MENU ----
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ---- SCROLL REVEAL (IntersectionObserver) ----
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---- MAGNETIC BUTTONS ----
  function setupMagneticButton(selector) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.15s ease';
      });
    });
  }

  setupMagneticButton('.btn-primary');
  setupMagneticButton('.btn-outline');
  setupMagneticButton('.btn-cta');
  setupMagneticButton('.btn-submit');

  // ---- CANVAS PARTICLES (Global) ----
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx    = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const PARTICLE_COUNT = 30; /* Quantidade reduzida para otimizar a performance */
    const particles = [];

    function randomBetween(min, max) {
      return Math.random() * (max - min) + min;
    }

    class Particle {
      constructor() {
        this.reset();
        // Spawna partículas inicialmente pela tela toda para não começar vazio
        this.y = randomBetween(0, canvas.height); 
      }
      reset() {
        this.x     = randomBetween(0, canvas.width);
        this.y     = canvas.height + 20; // Nascem do fundo da tela
        this.size  = randomBetween(0.8, 2.8);
        this.alpha = randomBetween(0.08, 0.45);
        this.vx    = randomBetween(-0.15, 0.15);
        this.vy    = randomBetween(-0.9, -0.3); // Flutuando claramente para cima
        this.life  = 0;
        this.maxLife = randomBetween(300, 600);
      }
      update() {
        this.x    += this.vx;
        this.y    += this.vy;
        this.life += 1;

        // fade in / fade out
        const half = this.maxLife / 2;
        if (this.life < half) {
          this.currentAlpha = (this.life / half) * this.alpha;
        } else {
          this.currentAlpha = ((this.maxLife - this.life) / half) * this.alpha;
        }

        if (this.life >= this.maxLife || this.y < -10) this.reset();
      }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentAlpha;
      ctx.fillStyle   = '#C9A84C';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Particle();
    p.life = Math.floor(Math.random() * p.maxLife); // stagger
    particles.push(p);
  }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ---- SMOOTH ANCHOR SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---- ACTIVE NAV LINKS on SCROLL ----
  const sections  = document.querySelectorAll('section[id]');
  const navItems  = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = 'var(--gold-light)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  // ---- CONTACT FORM ----
  const form        = document.getElementById('ct-form');
  const btnSubmit   = document.getElementById('btn-submit');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome     = form.querySelector('#nome').value.trim();
      const email    = form.querySelector('#email').value.trim();
      const mensagem = form.querySelector('#mensagem').value.trim();

      if (!nome || !email || !mensagem) {
        // Simple shake animation on empty fields
        [form.querySelector('#nome'), form.querySelector('#email'), form.querySelector('#mensagem')]
          .forEach(field => {
            if (!field.value.trim()) {
              field.style.borderColor = 'rgba(201,68,68,0.6)';
              field.style.animation = 'none';
              setTimeout(() => {
                field.style.borderColor = '';
              }, 2000);
            }
          });
        return;
      }

      // Use Fetch to send to Formspree
      btnSubmit.disabled = true;
      btnSubmit.querySelector('span').textContent = 'Enviando...';

      const data = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          form.querySelectorAll('input, textarea').forEach(f => { f.value = ''; f.style.display = 'none'; });
          form.querySelector('.form-row').style.display = 'none';
          form.querySelectorAll('.form-group').forEach(g => { g.style.display = 'none'; });
          btnSubmit.style.display = 'none';
          formSuccess.style.display = 'block';
        } else {
          response.json().then(data => {
            if (Object.hasOwn(data, 'errors')) {
              alert(data["errors"].map(error => error["message"]).join(", "));
            } else {
              alert("Oops! Ocorreu um erro no envio. Tente novamente.");
            }
          });
          btnSubmit.disabled = false;
          btnSubmit.querySelector('span').textContent = 'Enviar Mensagem';
        }
      }).catch(error => {
        alert("Oops! Houve um problema ao conectar com o servidor.");
        btnSubmit.disabled = false;
        btnSubmit.querySelector('span').textContent = 'Enviar Mensagem';
      });
    });
  }

  // ---- CARD STAGGER ANIMATION on SCROLL ----
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.solucao-card').forEach((card, i) => {
    card.dataset.delay = i * 150;
    cardObserver.observe(card);
  });

  // (cursor trail removido)

  // ---- PARALLAX HERO (subtle) ----
  const heroContent = document.querySelector('.hero-content');
  window.addEventListener('scroll', () => {
    if (!heroContent) return;
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.08}px)`;
    }
  }, { passive: true });

  // ---- 3D TILT EFFECT ON CARDS ----
  document.querySelectorAll('.sol-card, .book-frame').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6; // Inclinação Y (invertida)
      const rotateY = ((x - centerX) / centerX) * 6;  // Inclinação X
      
      card.style.transition = 'none'; // Sem atraso no movimento
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s, border-color 0.5s';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
    
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  });

})();
