document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('tracking-form');
  const input = document.getElementById('tracking-input');
  const error = document.getElementById('validation-error');

  function showError(msg) {
    if (!error) return;
    error.textContent = msg;
    error.classList.remove('hidden');
  }

  function clearError() {
    if (!error) return;
    error.textContent = '';
    error.classList.add('hidden');
  }

  function validate(value) {
    if (!value) {
      return 'Tracking ID is required.';
    }

    const prefix = value.split('-')[0];
    if (prefix !== 'fdx' && prefix !== 'sfex') {
      return 'Tracking ID must start with fdx- (FedEx) or sfex- (SFExpress).';
    }

    const afterPrefix = value.slice(prefix.length + 1);

    if (afterPrefix.length < 12) {
      return 'Invalid Tracking ID — too short.';
    }

    if (prefix === 'sfex') {
      if (!afterPrefix.startsWith('SF')) {
        return 'Invalid SFExpress ID.';
      }
      if (!value.includes('?phonenum=') || value.split('?phonenum=')[1] === '') {
        return 'SFExpress ID requires a phone number.';
      }
    }


    return null;
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const value = input.value.trim();
      const msg = validate(value);
      if (msg) {
        showError(msg);
        return;
      }
      clearError();
      window.location.href = '/' + value;
    });
  }
  
  if (input) {
    input.addEventListener('input', function(e) {
      e.target.value = e.target.value
        .split('-')
        .map((part, i) => i === 0 ? part.toLowerCase() : part)
        .join('-');
      clearError();
    });
  }
});
