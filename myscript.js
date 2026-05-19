// Theme toggle
const toggle = document.getElementById('themeToggle');
const label = document.getElementById('toggleLabel');
const html = document.documentElement;

const saved = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', saved);
label.textContent = saved === 'dark' ? 'light' : 'dark';

toggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  label.textContent = next === 'dark' ? 'light' : 'dark';
});

// Nav shadow on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));