// src/utils/normalizeText.js

function normalizeStringForSearch(str) {
  if (!str) {
    return '';
  }

  let normalized = str
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N');

  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  normalized = normalized.toLowerCase();
  normalized = normalized.replace(/[^a-z0-9]/g, '');
  normalized = normalized.trim();

  return normalized;
}

module.exports = { normalizeStringForSearch };