// ✅ script.js｜完全統合KYCフォーム（最終整理版）
const LS_KEY = 'formData';
let currentStep = 1;
const TOTAL_STEPS = 8;
const AES_KEY = CryptoJS.enc.Utf8.parse("1234567890123456");
const AES_IV = CryptoJS.enc.Utf8.parse("1234567890123456");

function updateStep() {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${currentStep}`).classList.add('active');
  document.getElementById('current-step').textContent = currentStep;
  updateProgress();
  updateNavigation();
  saveData();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  const progress = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  document.querySelector('.progress-bar').style.width = `${progress}%`;
}

function nextStep() {
  if (validateStep(currentStep)) {
    currentStep++;
    updateStep();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStep();
  }
}

function validateStep(step) {
  const inputs = document.querySelectorAll(`#step${step} input, #step${step} select, #step${step} textarea`);
  for (let input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
  }
  return true;
}

function updateNavigation() {
  document.querySelectorAll('.step-nav-item').forEach((item, index) => {
    const stepIndex = index + 1;
    item.classList.toggle('active', stepIndex === currentStep);
    const inputs = document.querySelectorAll(`#step${stepIndex} input, #step${stepIndex} select, #step${stepIndex} textarea`);
    const isComplete = Array.from(inputs).every(input => !input.required || (input.value && input.checkValidity()));
    item.innerHTML = isComplete ? `✅ STEP ${stepIndex}` : `STEP ${stepIndex}`;
  });
}

function createStepNavigation() {
  const nav = document.getElementById('stepHeaderNav');
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const item = document.createElement('button');
    item.className = `step-nav-item ${i === 1 ? 'active' : ''}`;
    item.textContent = `STEP ${i}`;
    item.onclick = () => { currentStep = i; updateStep(); };
    nav.appendChild(item);
  }
}

function saveData() {
  const formData = {};
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.type !== 'file') formData[el.name] = el.value;
  });
  localStorage.setItem(LS_KEY, JSON.stringify(formData));
}

function loadData() {
  const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  Object.entries(saved).forEach(([key, val]) => {
    const el = document.querySelector(`[name="${key}"]`);
    if (el) el.value = val;
  });
}

function checkResumeOption() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) document.getElementById('exitGuard').style.display = 'block';
}

function continueForm() {
  document.getElementById('exitGuard').style.display = 'none';
  updateStep();
}

async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('mainForm');
  const data = {};
  const fileFields = ['id_front', 'id_back', 'residence_proof_front', 'residence_proof_back'];

  for (const [key, val] of new FormData(form).entries()) {
    if (fileFields.includes(key)) {
      const file = form.querySelector(`[name="${key}"]`).files[0];
      if (file) {
        const base64 = await toBase64(file);
        data[key] = CryptoJS.AES.encrypt(base64, AES_KEY, { iv: AES_IV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
      }
    } else {
      data[key] = CryptoJS.AES.encrypt(val, AES_KEY, { iv: AES_IV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
    }
  }

  const token = await grecaptcha.execute('6Ldt9BwrAAAAAFcxv593i86WyBKetcwrGdWecK09', { action: 'submit' });
  data['g-recaptcha-response'] = token;

  const res = await fetch('https://script.google.com/macros/s/AKfycbwxsWBjAGt6yvPBbEhoJwKeCrwk9ERKfIYZ-8nmjFxfc64OQ1L2DwTprQhDt2AfP9d5/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert('送信が完了しました。ありがとうございました。');
    localStorage.removeItem(LS_KEY);
    form.reset();
    location.reload();
  } else {
    alert('送信に失敗しました。時間をおいて再度お試しください。');
  }
}

// ✅ タッチデバイス対応など
function initTouchEvents() {
  let startY;
  document.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    const currentY = e.touches[0].clientY;
    if (Math.abs(currentY - startY) < 10) {
      e.preventDefault();
    }
  }, { passive: false });

  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('focus', () => {
      setTimeout(() => {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 300);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkResumeOption();
  createStepNavigation();
  loadData();
  updateStep();
  document.getElementById('mainForm').addEventListener('submit', handleSubmit);
  document.querySelectorAll('input, select, textarea').forEach(el => el.addEventListener('input', saveData));
  initTouchEvents();

  // 📱 モバイル最適化（visualViewport安全に利用）
  const viewport = document.querySelector('meta[name="viewport"]');
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      viewport.content = (window.visualViewport.height < window.innerHeight * 0.7)
        ? 'width=device-width, initial-scale=1.0, shrink-to-fit=yes'
        : 'width=device-width, initial-scale=1.0';
    });
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err));
  });
}