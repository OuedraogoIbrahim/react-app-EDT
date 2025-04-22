import configApi from "./api";

interface ProfileData {
  date_naissance: string;
  nom: string;
  prenom: string;
  email: string;
  sexe: string;
  tel: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
}

export const modifyProfile = async (data: ProfileData) => {

  try {
    const response = await configApi.post('profile/modify', data);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data.user; 
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Erreur lors de la mise à jour du profil");
    } else if (error.request) {
      throw new Error("Aucune réponse du serveur. Vérifiez votre connexion.");
    } else {
      throw new Error("Une erreur s'est produite : " + error.message);
    }
  }
};

export const modifyPassword = async (data: PasswordData) => {
  try {
    const response = await configApi.post('password/change', data);
    return response.data; 
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Erreur lors de la modification du mot de passe");
    } else if (error.request) {
      throw new Error("Aucune réponse du serveur. Vérifiez votre connexion.");
    } else {
      throw new Error("Une erreur s'est produite : " + error.message);
    }
  }
};