import axios, { AxiosError } from "axios";
import configApi from "./api";


interface Salle {
    id: number; 
    nom : string , 
    description : string,
}
export const getSalles = async () => {
try {
    const response = await configApi.get("/salles");
    return response.data as Salle[];
} catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des cours");
}
}