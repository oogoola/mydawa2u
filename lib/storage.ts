import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query } from "firebase/firestore";

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

// Default initial catalogue fallback
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

/**
 * Fetch all products from Cloud Firestore (with fallback if offline)
 */
export async function getStoredDrugs(): Promise<Drug[]> {
  try {
    const q = query(collection(db, "products"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return defaultDrugs;
    }

    const drugs: Drug[] = [];
    querySnapshot.forEach((doc) => {
      drugs.push({ id: doc.id, ...doc.data() } as Drug);
    });
    return drugs;
  } catch (error) {
    console.error("Error fetching from Firestore, falling back:", error);
    return defaultDrugs;
  }
}

/**
 * Save a new drug directly to Cloud Firestore 'products' collection
 */
export async function saveNewDrug(newDrug: Drug): Promise<void> {
  try {
    // This automatically creates the "products" collection in Firestore if it doesn't exist
    await addDoc(collection(db, "products"), {
      ...newDrug,
      createdAt: new Date().toISOString()
    });
    console.log("Product successfully saved to Firestore!");
  } catch (error) {
    console.error("Error writing product to Firestore:", error);
    throw error;
  }
}