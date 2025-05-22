let fileContent = "";
const output = document.getElementById("output");
const themeToggle = document.getElementById("themeToggle");

// Theme switch
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("light-mode");
});

// File Reader
document.getElementById("fileInput").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    fileContent = reader.result;
    output.value = fileContent;
  };
  if (file) reader.readAsText(file);
});

// Caesar Cipher - Shift letters
function caesarEncrypt(text, key) {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    return String.fromCharCode(code + key);
  }).join('');
}

function caesarDecrypt(text, key) {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    return String.fromCharCode(code - key);
  }).join('');
}

// AES with Web Crypto API
async function aesEncrypt(text, password) {
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );
  const data = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...data));
}

async function aesDecrypt(base64, password) {
  const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  const key = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}

// Encrypt function
async function encryptFile() {
  const password = document.getElementById("password").value;
  if (!fileContent || !password) {
    alert("Upload a file and enter a key/password.");
    return;
  }

  const isNumber = /^\d+$/.test(password);
  if (isNumber) {
    output.value = caesarEncrypt(fileContent, parseInt(password));
  } else {
    try {
      const encrypted = await aesEncrypt(fileContent, password);
      output.value = encrypted;
    } catch {
      alert("Encryption failed.");
    }
  }
}

// Decrypt function
async function decryptFile() {
  const password = document.getElementById("password").value;
  if (!output.value || !password) {
    alert("Enter password and load encrypted content.");
    return;
  }

  const isNumber = /^\d+$/.test(password);
  if (isNumber) {
    output.value = caesarDecrypt(output.value, parseInt(password));
  } else {
    try {
      const decrypted = await aesDecrypt(output.value, password);
      output.value = decrypted;
    } catch {
      alert("Decryption failed. Incorrect password?");
    }
  }
}

// Download Result
function downloadFile() {
  const blob = new Blob([output.value], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "result.txt";
  link.click();
}

