import { AxiosError } from "axios";
import configApi from "./api";

interface Matiere {
  id: number;
  nom: string;
  description : string | undefined;
  nombre_heures: number;
  heures_utilisees: number;
  periode: string;
  niveau_id: number;
}

export const getMatieres = async () => {
  try {
    const response = await configApi.get("/matieres");
    return response.data as Matiere[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des matières");
  }
};

export const addMatiere = async (matiere: Omit<Matiere, "id">) => {
  try {
    const response = await configApi.post("/matieres", {
      nom: matiere.nom,
      nombre_heures: matiere.nombre_heures,
      periode: matiere.periode,
      niveau_id: matiere.niveau_id,
      heures_utilisees : 0,
      description : matiere.description
    });
    return response.data as Matiere;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de l'ajout de la matière");
  }
};

export const deleteMatiere = async (matiereId: number) => {
    try {
      const response = await configApi.delete(`/matieres/${matiereId}`);
      return ;
    } catch (error: unknown) {
      const err = error as AxiosError;
      throw err.response?.data || new Error("Erreur lors de la suppression de la matière");
    }
};

export const updateMatiere = async (matiereId: number, matiere: Partial<Omit<Matiere, "id">>) => {
    try {
      const response = await configApi.put(`/matieres/${matiereId}`, matiere);
      return response.data as Matiere;
    } catch (error: unknown) {
      const err = error as AxiosError;
      throw err.response?.data || new Error("Erreur lors de la modification de la matière");
    }
};
  