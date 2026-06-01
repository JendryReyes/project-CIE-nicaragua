export type ItemChecklist = {
  id: string;
  nombre: string;
  obligatorio: boolean;
  completo: boolean;
};

export function checklistPorNino(ninoId: string): ItemChecklist[] {
  // Demo: niños con id terminado en par tienen checklist completa
  const completo = parseInt(ninoId, 10) % 2 === 0;
  return [
    { id: "consent", nombre: "Consentimiento informado firmado", obligatorio: true, completo: true },
    { id: "inss-colilla", nombre: "Colilla INSS vigente del tutor", obligatorio: true, completo },
    { id: "carnet", nombre: "Copia de carnet del niño/a", obligatorio: true, completo: true },
    { id: "dx", nombre: "Diagnóstico médico o pre-diagnóstico", obligatorio: true, completo },
    { id: "contrato", nombre: "Contrato de prestación de servicios", obligatorio: true, completo },
    { id: "imagen", nombre: "Autorización de uso de imagen", obligatorio: false, completo: true },
  ];
}

export function puedeActivar(items: ItemChecklist[]): boolean {
  return items.filter((i) => i.obligatorio).every((i) => i.completo);
}
