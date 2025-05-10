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

