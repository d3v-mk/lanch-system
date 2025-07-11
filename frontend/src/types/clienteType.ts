// frontend/src/types/clienteType.ts

export type Cliente = {
  id: string;
  nome: string;
  telefone?: string; // Telefone pode ser opcional
  endereco: string; // Endereço é obrigatório
  referencia?: string;
  criadoEm?: string; // ISO Date string, opcional
};