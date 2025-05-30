import { AxiosError } from "axios"; // Si tu utilises axios
import configApi from "./api";

interface Cours {
  id: number;
  heure_debut: string;
  heure_fin: string;
  date: string;
  type: string;
  salle: { nom: string; id: number };
  matiere?: { nom: string; id: number; niveau_id: number };
  filiere?: { nom: string; id: number };
  niveau?: { nom: string; id: number; filiere_id: number };
}

interface FormData {
  start: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  filiere: string;
  niveau: string;
  salle: string;
  matiere: string;
}

interface ProvisionalEDT {
  semestre: string;
  filiere: string;
  niveau: string;
  salle: string;
  matiere: string[];
}

interface edtData {
  id : number;
  date_creation: string;
  niveau_id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  statut: string;
  activite: string;
  type: string;
  salle_id: number;
  filiere_id: number;
  matiere_id: number;
  count: number;
}

// Récupérer tous les cours
export const getCourses = async (startDate: string | null = null, isToday: boolean | null = null): Promise<Cours[]> => {
  try {
    const response = await configApi.get("/courses", {
      params: {
        start_date: startDate,
        isToday: isToday,
      },
    });
    return response.data as Cours[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des cours");
  }
};

// Récupérer tous les cours de la semaine
export const getCoursesWeek = async (startDate: string, endDate: string): Promise<Cours[]> => {
  try {
    const response = await configApi.get("/week/courses", {
      params: {
        startDate: startDate,
        endDate: endDate,
      },
    });
    return response.data as Cours[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des cours de la semaine");
  }
};

// Récupérer tous les cours en attente de validation
export const getPendingValidationCourses = async (): Promise<Cours[]> => {
  try {
    const response = await configApi.get("/pending-validation/courses");
    return response.data as Cours[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des cours en attente de validation");
  }
};

// Annuler un cours spécifique
export const cancelCourse = async (id: number): Promise<string> => {
  if (!id) throw new Error("L'ID du cours est requis");
  try {
    const response = await configApi.put(`/cancel/courses/${id}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error(`Erreur lors de l'annulation du cours ${id}`);
  }
};

// Accepter un cours spécifique
export const acceptCourse = async (id: number): Promise<string> => {
  if (!id) throw new Error("L'ID du cours est requis");
  try {
    const response = await configApi.put(`/accept/courses/${id}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error(`Erreur lors de l'acceptation du cours ${id}`);
  }
};

// Récupérer un cours spécifique
export const getCourse = async (id: string): Promise<Cours> => {
  if (!id) throw new Error("L'ID du cours est requis");
  try {
    const response = await configApi.get(`/courses/${id}`);
    return response.data as Cours;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error(`Erreur lors de la récupération du cours ${id}`);
  }
};

// Ajouter un cours
export const addCourse = async (cours: FormData): Promise<Cours> => {
  try {
    const response = await configApi.post("/courses", cours);
    return response.data as Cours;
  } catch (error: unknown) {
    const err = error as AxiosError;
    console.log(err.response);
    
    throw err.response?.data || new Error("Erreur lors de l'ajout du cours");
  }
};


// Mettre à jour un cours
export const updateCourse = async (id: string , cours: FormData): Promise<Cours> => {
  if (!id) throw new Error("L'ID du cours est requis");
  try {
    const response = await configApi.put(`/courses/${id}`, cours);
    return response.data as Cours;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la mise à jour du cours");
  }
};


// Supprimer un cours
export const deleteCourse = async (id: string): Promise<void> => {
  if (!id) throw new Error("L'ID du cours est requis");
  try {
    await configApi.delete(`/courses/${id}`);
    // Pas de return si l'API renvoie 204 No Content
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la suppression du cours");
   }
};


export const getProvisionalEDT = async () => {
  try {
    const response = await configApi.get("/emploi-du-temps/provisoire"
    );
    return response.data as edtData[];
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la récupération des cours");
  }
};


// Creation d'un EDT provisoire
export const provisionalEDT = async (data: ProvisionalEDT) => {
  try {
    const response = await configApi.post('emploi-du-temps/provisoire',data)
    console.log(response.data);
    
    return;
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la creation de l'emploi du temps provisoire");
  }
}

export const deleteEDT = async (date_creation: string , niveau_id : number): Promise<void> => {
  try {
    await configApi.delete(`emploi-du-temps/provisoire/${date_creation}/${niveau_id}`);
    // Pas de return si l'API renvoie 204 No Content
  } catch (error: unknown) {
    const err = error as AxiosError;
    throw err.response?.data || new Error("Erreur lors de la suppression de l'EDT");
   }
};