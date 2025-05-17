// Mobile nav toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// Newsletter form handling
document.getElementById('newsletter-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const input = this.querySelector('input');
  const email = input.value.trim();

  if (!email || !validateEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  alert('Thank you for subscribing!');
  input.value = '';
});

// Email validation function
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(email);
}

// Gallery functionality
const images = document.querySelectorAll('.gallery-img');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentIndex = 0;

function showImage(index) {
  images.forEach(img => img.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  currentIndex = index;
  if (currentIndex >= images.length) currentIndex = 0;
  if (currentIndex < 0) currentIndex = images.length - 1;
  
  images[currentIndex].classList.add('active');
  dots[currentIndex].classList.add('active');
}

prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => showImage(index));
});

// Auto-advance gallery every 5 seconds
setInterval(() => showImage(currentIndex + 1), 5000);

