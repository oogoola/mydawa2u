import { db } from "./firebase";
import { collection, getDocs, addDoc, getDoc, doc } from "firebase/firestore";

export interface Drug {
  id?: string;
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

// Default initial catalogue to seed if database is empty
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

// Fetch all drugs from Firestore
export async function getStoredDrugs(): Promise<Drug[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "drugs"));
    if (querySnapshot.empty) {
      // Optional: seed default drugs if collection is completely empty
      return defaultDrugs;
    }
    const drugs: Drug[] = [];
    querySnapshot.forEach((docSnap) => {
      drugs.push({ id: docSnap.id, ...docSnap.data() } as Drug);
    });
    return drugs;
  } catch (error) {
    console.error("Error fetching drugs from Firestore:", error);
    return defaultDrugs;
  }
}

// Save a new drug directly to Cloud Firestore
export async function saveNewDrug(newDrug: Drug): Promise<void> {
  try {
    await addDoc(collection(db, "drugs"), {
      ...newDrug,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving drug to Firestore:", error);
    throw error;
  }
}