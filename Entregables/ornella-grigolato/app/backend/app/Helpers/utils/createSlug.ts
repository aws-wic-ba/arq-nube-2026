export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim() // Elimina espacios al principio y al final
    .normalize("NFD") // Separa las letras de sus acentos (ej: "ó" -> "o" + "´")
    .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos sueltos
    .replace(/[^a-z0-9 -]/g, "") // Elimina cualquier carácter que no sea letra, número, espacio o guion
    .replace(/\s+/g, "-") // Reemplaza uno o más espacios por un solo guion
    .replace(/-+/g, "-"); // Evita que queden guiones duplicados (ej: "mi--refugio")
};
