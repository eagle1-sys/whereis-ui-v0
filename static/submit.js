document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('tracking-form');
  const input = document.getElementById('tracking-input');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const value = input.value.trim();
      if (value) {
        window.location.href = '/whereis?id=' + encodeURIComponent(value);
      }
    });
  }
  
  if (input) {
    input.addEventListener('input', function(e) {
      e.target.value = e.target.value
        .split('-')
        .map((part, i) => i === 0 ? part.toLowerCase() : part)
        .join('-');
    });
  }
});
