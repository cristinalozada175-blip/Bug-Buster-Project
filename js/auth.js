/* Login, registration, email approval/verification, and forgot-password OTP workflows. */
(function () {
  'use strict';
  const PG = window.PG;

  /* ---------- Login & Register Form Handler ---------- */
  const form = document.getElementById('auth-form');
  const errBox = document.getElementById('form-error');
  const mode = form ? form.dataset.mode : null; // "login" or "register"
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errBox) errBox.textContent = '';
      const body = {};
      new FormData(form).forEach((v, k) => { body[k] = String(v).trim(); });

      if (mode === 'register') {
        if (body.password !== body.confirm) {
          if (errBox) errBox.textContent = 'The two passwords do not match.';
          return;
        }
        delete body.confirm;
      }

      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'One moment...';

      try {
        const res = await PG.api('/api/' + mode + '.php', { body, noRedirect: true });

        if (mode === 'register' && res.needs_verification) {
          // Show email verification notice
          form.classList.add('is-hidden');
          const notice = document.getElementById('verify-notice-container');
          if (notice) {
            notice.classList.remove('is-hidden');
            const msgEl = document.getElementById('verify-msg');
            if (msgEl) {
              msgEl.innerHTML = 'A verification email was sent to <strong>' + (body.email || 'your email') + '</strong>.<br>Please approve your account before logging in.';
            }
            // Wire up OTP verification button in notice
            const verifyBtn = document.getElementById('btn-submit-verify');
            const verifyInput = document.getElementById('verify-input-code');
            const verifyErr = document.getElementById('verify-feedback');
            if (verifyBtn && verifyInput) {
              verifyBtn.addEventListener('click', async () => {
                const code = verifyInput.value.trim();
                if (!code) { if (verifyErr) verifyErr.textContent = 'Please enter your code.'; return; }
                verifyBtn.disabled = true;
                verifyBtn.textContent = 'Verifying...';
                try {
                  const vr = await PG.api('/api/verify.php', {
                    body: { action: 'verify_signup', email: body.email, code },
                    noRedirect: true
                  });
                  PG.toast('Account verified successfully! Starting your adventure...');
                  setTimeout(() => {
                    location.href = vr.role === 'admin' ? '/admin/dashboard.html' : '/adventure.html';
                  }, 800);
                } catch (ve) {
                  if (verifyErr) verifyErr.textContent = ve.message || 'Invalid code.';
                  verifyBtn.disabled = false;
                  verifyBtn.textContent = 'Approve ›';
                }
              });
            }
          }
          return;
        }

        // Login success redirect
        location.href = res.role === 'admin' ? '/admin/dashboard.html' : '/adventure.html';
      } catch (err) {
        if (errBox) errBox.textContent = err.message || 'Something went wrong. Please check your credentials.';
        
        // If login failed because email is not verified yet, show helper
        const unverifiedBox = document.getElementById('login-unverified-box');
        if (unverifiedBox && (err.status === 403 || (err.message && err.message.toLowerCase().includes('verif')))) {
          unverifiedBox.classList.remove('is-hidden');
          const emailVal = (document.getElementById('email') || {}).value || '';
          
          // Wire up inline OTP verify
          const inlineVerifyBtn = document.getElementById('btn-login-verify');
          const inlineVerifyInput = document.getElementById('login-verify-code');
          if (inlineVerifyBtn && inlineVerifyInput) {
            inlineVerifyBtn.onclick = async () => {
              const code = inlineVerifyInput.value.trim();
              if (!code) return;
              inlineVerifyBtn.disabled = true;
              try {
                const vr = await PG.api('/api/verify.php', {
                  body: { action: 'verify_signup', email: emailVal, code },
                  noRedirect: true
                });
                PG.toast('Account approved! Logging in...');
                unverifiedBox.classList.add('is-hidden');
                setTimeout(() => {
                  location.href = vr.role === 'admin' ? '/admin/dashboard.html' : '/adventure.html';
                }, 800);
              } catch (e) {
                PG.toast(e.message || 'Verification failed', true);
              } finally {
                inlineVerifyBtn.disabled = false;
              }
            };
          }

          // Wire up resend email button
          const resendBtn = document.getElementById('btn-resend-email');
          if (resendBtn) {
            resendBtn.onclick = async () => {
              if (!emailVal) { PG.toast('Enter your email address first', true); return; }
              resendBtn.disabled = true;
              resendBtn.textContent = 'Sending...';
              try {
                await PG.api('/api/verify.php', {
                  body: { action: 'resend_signup', email: emailVal },
                  noRedirect: true
                });
                PG.toast('Verification email resent! Check your inbox.');
              } catch (e) {
                PG.toast(e.message || 'Could not resend email', true);
              } finally {
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend verification email';
              }
            };
          }
        }

        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  /* ---------- Forgot Password & Reset Password Sections ---------- */
  const loginSec = document.getElementById('login-section');
  const forgotSec = document.getElementById('forgot-section');
  const resetSec = document.getElementById('reset-section');

  const btnShowForgot = document.getElementById('btn-show-forgot');
  const btnBackLogin1 = document.getElementById('btn-back-login-1');
  const btnBackLogin2 = document.getElementById('btn-back-login-2');

  function showSection(sec) {
    if (loginSec) loginSec.classList.add('is-hidden');
    if (forgotSec) forgotSec.classList.add('is-hidden');
    if (resetSec) resetSec.classList.add('is-hidden');
    if (sec) sec.classList.remove('is-hidden');
  }

  if (btnShowForgot) {
    btnShowForgot.addEventListener('click', (e) => {
      e.preventDefault();
      const loginEmail = document.getElementById('email');
      const forgotEmail = document.getElementById('forgot-email');
      if (loginEmail && forgotEmail && loginEmail.value) {
        forgotEmail.value = loginEmail.value.trim();
      }
      showSection(forgotSec);
    });
  }

  if (btnBackLogin1) {
    btnBackLogin1.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(loginSec);
    });
  }
  if (btnBackLogin2) {
    btnBackLogin2.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(loginSec);
    });
  }

  // Handle Step 1: Request OTP
  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('forgot-email');
      const errEl = document.getElementById('forgot-error');
      const email = (emailInput ? emailInput.value : '').trim();
      if (errEl) errEl.textContent = '';

      if (!email) {
        if (errEl) errEl.textContent = 'Please enter your email address.';
        return;
      }

      const btn = forgotForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending OTP...';

      try {
        await PG.api('/api/forgot-password.php', {
          body: { action: 'request_otp', email },
          noRedirect: true
        });

        PG.toast('Reset code sent! Check your email.');
        // Transition to Step 2
        const resetEmail = document.getElementById('reset-email');
        if (resetEmail) resetEmail.value = email;
        showSection(resetSec);
      } catch (err) {
        if (errEl) errEl.textContent = err.message || 'Could not send reset code. Please check the email.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Reset Code ›';
      }
    });
  }

  // Handle Step 2: Reset Password with OTP
  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('reset-email') || {}).value || '';
      const code = (document.getElementById('reset-otp') || {}).value.trim();
      const newPassword = (document.getElementById('reset-new-password') || {}).value || '';
      const confirmPassword = (document.getElementById('reset-confirm-password') || {}).value || '';
      const errEl = document.getElementById('reset-error');
      if (errEl) errEl.textContent = '';

      if (!code) { if (errEl) errEl.textContent = 'Enter the 6-digit code from your email.'; return; }
      if (newPassword.length < 8) { if (errEl) errEl.textContent = 'New password must be at least 8 characters.'; return; }
      if (newPassword !== confirmPassword) { if (errEl) errEl.textContent = 'The passwords do not match.'; return; }

      const btn = resetForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Resetting password...';

      try {
        await PG.api('/api/forgot-password.php', {
          body: { action: 'reset_password', email, code, new_password: newPassword },
          noRedirect: true
        });

        PG.toast('Password changed! You can now log in.');
        showSection(loginSec);
        const loginPass = document.getElementById('password');
        if (loginPass) loginPass.value = '';
        const loginEmail = document.getElementById('email');
        if (loginEmail) loginEmail.value = email;
      } catch (err) {
        if (errEl) errEl.textContent = err.message || 'Could not reset password. Please check your code.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Change Password ›';
      }
    });
  }

  // Auto-detect recovery token in URL if user clicked link in email
  if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
    showSection(resetSec);
  }
})();
