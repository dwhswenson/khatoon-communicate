// src/auth/utils/__mocks__/expo-secure-store.ts
const memory: Record<string,string> = {};
export const setItemAsync    = async (k:string,v:string) => { memory[k]=v; };
export const getItemAsync    = async (k:string)     => memory[k] ?? null;
export const deleteItemAsync = async (k:string)     => { delete memory[k]; };
export const ALWAYS_THIS_DEVICE_ONLY = 'ALWAYS_THIS_DEVICE_ONLY';
