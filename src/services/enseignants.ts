import axios, { AxiosError } from "axios";
import configApi from "./api";

interface Matiere {
  id: number;
  nom: string;
  niveau_id: number;
  niveau: Niveau;
}

interface Niveau {
  id: number;
  nom: string;
  description: string | null;
  filiere_id: number;
}

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  tel: string;
  user: { email: string };
  //   matieres: Matiere[];

  enseignant :{ matieres : Matiere[]}
}

// Récupérer tous les enseignants avec leurs matières et niveaux
export const getEnseignants = async (): Promise<Enseignant[]> => {
  try {
    const response = await configApi.get("/enseignants");
    return response.data as Enseignant[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des enseignants");
  }
};

// Ajouter un nouvel enseignant
export const addEnseignant = async (enseignant: {
  email : string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  tel: string;
  matiere_ids : number[];
}): Promise<Enseignant> => {
  try {
    const response = await configApi.post("/enseignants", { ...enseignant, role: "enseignant" });
    return response.data as Enseignant;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de l'ajout de l'enseignant");
  }
};

// Mettre à jour un enseignant existant
export const updateEnseignant = async (
  id: number,
  enseignant: {
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
    tel: string;
    email : string;
    matiere_ids : number[]
  }
): Promise<Enseignant> => {
  try {
    const response = await configApi.put(`/enseignants/${id}`, { ...enseignant });
    return response.data as Enseignant;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la modification de l'enseignant");
  }
};

// Supprimer un enseignant
export const deleteEnseignant = async (id: number): Promise<void> => {
  try {
    await configApi.delete(`/enseignants/${id}`);
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la suppression de l'enseignant");
  }
};