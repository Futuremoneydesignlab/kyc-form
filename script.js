// AES暗号化（CryptoJS使用）
function encryptAES(text) {
  const key = CryptoJS.enc.Utf8.parse("1234567890123456");
  const iv = CryptoJS.enc.Utf8.parse("1234567890123456");
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

// ファイルをBase64に変換
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // base64のみ抽出
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 送信処理
async function handleSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("kycForm");

  // 同意チェック
  const consent = document.querySelector('input[name="finalConsent"]');
  if (!consent || !consent.checked) {
    alert("プライバシーポリシーと宣誓内容に同意してください。");
    return false;
  }

  // HTML5バリデーション
  if (!form.checkValidity()) {
    alert("未入力または不正な入力があります。ご確認ください。");
    form.reportValidity();
    return false;
  }

  const formData = new FormData(form);
  const encryptedData = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      const base64 = await toBase64(value);
      encryptedData[key] = encryptAES(base64);
    } else {
      encryptedData[key] = encryptAES(value);
    }
  }

  // Google Apps ScriptのURL
  const endpoint = "YOUR_GAS_WEBAPP_URL"; // ←ここにGASのWeb App URLを記載

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(encryptedData),
    });

    if (response.ok) {
      alert("申込が正常に送信されました。ありがとうございました！");
      form.reset();
      window.scrollTo(0, 0);
    } else {
      alert("送信に失敗しました。もう一度お試しください。");
    }
  } catch (error) {
    console.error("送信エラー:", error);
    alert("ネットワークエラーが発生しました。");
  }

  return false;
}

// 支払方法切り替え（クレカ or 銀行）
function togglePaymentFields(value) {
  document.getElementById("cardFields").style.display = value === "クレジットカード" ? "block" : "none";
  document.getElementById("bankFields").style.display = value === "銀行振込" ? "block" : "none";
}
