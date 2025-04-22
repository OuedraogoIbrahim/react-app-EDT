import axios, { AxiosError } from "axios";
import configApi from "./api";

interface Filiere {
  id: number;
  nom: string;
  description: string;
}

interface Niveau {
  id: number;
  nom: string;
  description: string | null;
  filiere_id: number;
  filiere: Filiere;
}

export const getNiveaux = async (): Promise<Niveau[]> => {
  try {
    const response = await configApi.get("/niveaux");
    return response.data as Niveau[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des niveaux");
  }
};

export const addNiveau = async (niveau: {
  nom: string;
  description: string | undefined;
  filiere_id: number;
}): Promise<Niveau> => {
  try {
    const response = await configApi.post("/niveaux", niveau);
    return response.data as Niveau;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de l'ajout du niveau");
  }
};

export const updateNiveau = async (
  id: number,
  niveau: { nom: string; description: string | undefined; filiere_id: number }
): Promise<Niveau> => {
  try {
    const response = await configApi.put(`/niveaux/${id}`, niveau);
    return response.data as Niveau;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la modification du niveau");
  }
};

export const deleteNiveau = async (id: number): Promise<void> => {
  try {
    await configApi.delete(`/niveaux/${id}`);
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la suppression du niveau");
  }
};