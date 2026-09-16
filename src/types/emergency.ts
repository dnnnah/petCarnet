export type LostAlert = {
  active: true;
  zonaPerdida?: string;
  fechaPerdida?: string;
  recompensa?: number | null;
  mensaje?: string;
};

export type LostAlertDraft = Omit<LostAlert, "active">;