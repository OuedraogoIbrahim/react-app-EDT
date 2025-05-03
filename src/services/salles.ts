import axios, { AxiosError } from "axios";
import configApi from "./api";

interface Salle {
  id: number;
  nom: string;
  description: string | null;
  capacite: number;
}

export const getSalles = async (): Promise<Salle[]> => {
  try {
    const response = await configApi.get("/salles");
    return response.data as Salle[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des salles");
  }
};

export const addSalle = async (salle: {
  nom: string;
  description: string | undefined;
  capacite: number;
}): Promise<Salle> => {
  try {
    const response = await configApi.post("/salles", salle);
    return response.data as Salle;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de l'ajout de la salle");
  }
};

export const updateSalle = async (
  id: number,
  salle: { nom: string; description: string | undefined; capacite: number }
): Promise<Salle> => {
  try {
    const response = await configApi.put(`/salles/${id}`, salle);
    return response.data as Salle;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la modification de la salle");
  }
};

export const deleteSalle = async (id: number): Promise<void> => {
  try {
    await configApi.delete(`/salles/${id}`);
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la suppression de la salle");
  }
};
