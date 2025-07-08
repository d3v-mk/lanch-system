// src/utils/stringUtils.ts

export function normalizeStringForSearch(str: string): string {
  // 1. Remove acentos
  let normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // 2. Converte para minúsculas
  normalized = normalized.toLowerCase();
  // 3. Remove caracteres não alfanuméricos E também espaços.
  //    A regex [^a-z0-9] significa "qualquer coisa que NÃO seja uma letra de a-z ou um número de 0-9".
  normalized = normalized.replace(/[^a-z0-9]/g, '').trim(); // <-- MUDANÇA AQUI
  return normalized;
}