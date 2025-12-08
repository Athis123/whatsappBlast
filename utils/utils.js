// utils.js

function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, ""); // Hapus non-digit
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1); // Ganti 0 ke 62
  }
  return cleaned + "@c.us";
}

module.exports = {
  formatPhoneNumber,
};
