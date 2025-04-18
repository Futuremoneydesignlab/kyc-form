const form = document.getElementById('kycForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => data[key] = value);

  const res = await fetch('https://script.google.com/macros/s/AKfycbx8TUGDtD_731KcutDz4a86yFPf9anyLHLaxdZ1KJdhOyqEkLeYRJkONLxP5BpgRVx4/exec', {
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
