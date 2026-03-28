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
    // Extract base payload (before query params like ?phonenum=)
    const basePayload = afterPrefix.split('?')[0];

    if (prefix === 'sfex') {
      if (!basePayload.startsWith('SF')) {
        return "Invalid SFExpress ID: must be 'SF' followed by 13 digits.";
      }
      if (basePayload.length < 15) {
        return 'Invalid SFExpress ID — too short.';
      }
      if (!/^SF\d+$/.test(basePayload)) {
        return 'Invalid SFExpress ID: digits only after \'SF\'.';
      }
      if (!value.includes('?phonenum=') || value.split('?phonenum=')[1] === '') {
        return 'SFExpress ID requires a phone number.';
      }
    } else {
      if (basePayload.length < 10) {
        return 'Invalid FedEx ID — too short.';
      }
      if (!/^\d+$/.test(basePayload)) {
        return 'Invalid FedEx ID — must contain only digits after fdx-.';
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

  // Check URL params for validation error (redirect from [id] middleware)
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');
  const idParam = urlParams.get('id');
  if (errorParam) {
    if (idParam && input) {
      input.value = idParam;
    }
    showError(errorParam);
    // Clean URL without reloading
    window.history.replaceState({}, '', '/');
  }
});
