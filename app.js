const form = document.getElementById('kycForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => data[key] = value);

  const res = await fetch('https://script.google.com/macros/s/AKfycbxJozzB4z0HqHRmF5shaLzUeA6Ok2wbeRStRfCpOYnF1TFJs2fvOKqTEvsnSJC1E1c3/exec', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (result.status === "ok") {
    alert("送信完了しました！");
    form.reset();
  } else {
    alert("送信に失敗しました");
  }
});
