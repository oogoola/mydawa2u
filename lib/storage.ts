export interface Drug {
  id: string;
  name: string;
  activeIngredient: string;
  strength?: string;
  category: string;
  prescriptionRequired: boolean;
  priceKsh: number;
  form: string;
  packSize?: string;
  inStock: boolean;
  warningText?: string;
  image?: string;
}

// Default initial catalogue if nothing is stored yet
const defaultDrugs: Drug[] = [
  {
    id: 'MED-001',
    name: 'Panadol Extra',
    activeIngredient: 'Paracetamol & Caffeine',
    strength: '500mg/65mg',
    category: 'Pain & Fever',
    prescriptionRequired: false,
    priceKsh: 120,
    form: 'Tablets',
    packSize: '20 Tablets',
    inStock: true,
  },
  {
    id: 'MED-002',
    name: 'Amoxicillin Trihydrate',
    activeIngredient: 'Amoxicillin',
    strength: '500mg',
    category: 'Antimalarials & Antibiotics',
    prescriptionRequired: true,
    priceKsh: 450,
    form: 'Capsules',
    packSize: '16 Capsules',
    inStock: true,
    warningText: 'Prescription required. Complete full dosage.'
  }
];

export function getStoredDrugs(): Drug[] {
  if (typeof window === 'undefined') return defaultDrugs;
  const stored = localStorage.getItem('dawa2u_catalogue');
  if (!stored) {
    localStorage.setItem('dawa2u_catalogue', JSON.stringify(defaultDrugs));
    return defaultDrugs;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultDrugs;
  }
}

export function saveNewDrug(newDrug: Drug) {
  if (typeof window === 'undefined') return;
  const current = getStoredDrugs();
  const updated = [newDrug, ...current];
  localStorage.setItem('dawa2u_catalogue', JSON.stringify(updated));
}