import axios, { AxiosError } from "axios";
import configApi from "./api";

interface Filiere {
  id: number;
  nom: string;
  description: string;
  niveaux: {
    id: number;
    nom: string;
    filiere_id: number;
  }[];
}

export const getFilieres = async (): Promise<Filiere[]> => {
  try {
    const response = await configApi.get("/filieres");
    return response.data as Filiere[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des filières");
  }
};

export const addFiliere = async (filiere: {
  nom: string;
  description: string;
}): Promise<Filiere> => {
  try {
    const response = await configApi.post("/filieres", filiere);
    return response.data as Filiere;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de l'ajout de la filière");
  }
};

export const updateFiliere = async (
  id: number,
  filiere: { nom: string; description: string }
): Promise<Filiere> => {
  try {
    const response = await configApi.put(`/filieres/${id}`, filiere);
    return response.data as Filiere;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la modification de la filière");
  }
};

export const deleteFiliere = async (id: number): Promise<void> => {
  try {
    await configApi.delete(`/filieres/${id}`);
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la suppression de la filière");
  }
};