import Lucide from "@/components/Base/Lucide";
import TomSelect from "@/components/Base/TomSelect";
import { Link, useLocation } from "react-router-dom";
import { FormCheck, FormInput, FormSwitch } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Litepicker from "@/components/Base/Litepicker";
import { useContext, useState, useRef } from "react";
import clsx from "clsx";
import _ from "lodash";
import { AuthContext } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Toastify from "toastify-js";
import LoadingIcon from "@/components/Base/LoadingIcon";
import Notification from "@/components/Base/Notification";
import { modifyProfile, modifyPassword } from "@/services/profile";
import { Dialog } from "@/components/Base/Headless";
import { API_URL } from "@/constants";

// Schéma de validation pour la section "Infos du Profil"
const profileSchema = yup
  .object({
    prenom: yup
      .string()
      .required("Le prénom est requis")
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    nom: yup
      .string()
      .required("Le nom est requis")
      .min(2, "Le nom doit contenir au moins 2 caractères"),
    date_naissance: yup
      .string()
      .required("La date de naissance est requise")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format AAAA-MM-JJ"),
    sexe: yup
      .string()
      .required("Le sexe est requis")
      .oneOf(["M", "F"], "Le sexe doit être Homme ou Femme"),
    email: yup
      .string()
      .required("L'email est requis")
      .email("L'email doit être valide"),
    tel: yup
      .string()
      .required("Le téléphone est requis")
      .matches(
        /^\+?[1-9]\d{1,14}$/,
        "Le numéro de téléphone doit être valide (ex: +1234567890)"
      ),
  })
  .required();

// Schéma de validation pour la section "Sécurité"
const securitySchema = yup
  .object({
    current_password: yup
      .string()
      .required("Le mot de passe actuel est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    new_password: yup
      .string()
      .required("Le nouveau mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirm_password: yup
      .string()
      .required("La confirmation du mot de passe est requise")
      .oneOf(
        [yup.ref("new_password")],
        "Les mots de passe doivent correspondre"
      ),
  })
  .required();

function Main() {
  const { setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const { user: parsedUser } = useContext(AuthContext);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [basicModalPreview, setBasicModalPreview] = useState<boolean>(false);

  // Formulaire pour la section "Infos du Profil"
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(profileSchema),
    defaultValues: {
      prenom: parsedUser.personne.prenom,
      nom: parsedUser.personne.nom,
      date_naissance: parsedUser.personne.date_naissance,
      sexe: parsedUser.personne.sexe,
      email: parsedUser.email,
      tel: parsedUser.personne.tel,
    },
  });

  // Formulaire pour la section "Sécurité"
  const {
    register: registerSecurity,
    handleSubmit: handleSubmitSecurity,
    formState: { errors: securityErrors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(securitySchema),
  });

  // Gestion de la soumission pour "Infos du Profil"
  const onSubmitProfile = async (data: any) => {
    setLoading(true);
    try {
      const profileData = {
        prenom: data.prenom,
        nom: data.nom,
        date_naissance: data.date_naissance,
        sexe: data.sexe,
        email: data.email,
        tel: data.tel,
      };
      const user = await modifyProfile(profileData);
      setUser(user);
      const successEl = document
        .querySelectorAll("#success-notification-profile")[0]
        .cloneNode(true) as HTMLElement;
      successEl.classList.remove("hidden");
      Toastify({
        node: successEl,
        duration: 5000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
      }).showToast();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      const failedEl = document
        .querySelectorAll("#failed-notification")[0]
        .cloneNode(true) as HTMLElement;
      failedEl.classList.remove("hidden");
      // Personnaliser le message d'erreur
      const errorMessageEl = failedEl.querySelector(".text-slate-500");
      if (errorMessageEl) {
        errorMessageEl.textContent =
          error.message || "Une erreur s'est produite. Veuillez réessayer.";
      }
      Toastify({
        node: failedEl,
        duration: 5000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la soumission pour "Sécurité"
  const onSubmitSecurity = async (data: any) => {
    setLoading(true);
    try {
      const passwordData = {
        current_password: data.current_password,
        new_password: data.new_password,
      };
      await modifyPassword(passwordData);
      const successEl = document
        .querySelectorAll("#success-notification-security")[0]
        .cloneNode(true) as HTMLElement;
      successEl.classList.remove("hidden");
      Toastify({
        node: successEl,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
      }).showToast();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      const failedEl = document
        .querySelectorAll("#failed-notification")[0]
        .cloneNode(true) as HTMLElement;
      failedEl.classList.remove("hidden");
      // Personnaliser le message d'erreur
      const errorMessageEl = failedEl.querySelector(".text-slate-500");
      if (errorMessageEl) {
        errorMessageEl.textContent =
          error.message || "Une erreur s'est produite. Veuillez réessayer.";
      }
      Toastify({
        node: failedEl,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const handleProviderAction = (currentProvider: string | null) => {
    if (currentProvider) {
      console.log(`Changer le provider actuel : ${currentProvider}`);
      // TODO : Rediriger vers une page de sélection de provider ou appeler une API
    } else {
      console.log("Connecter un nouveau provider");
      // TODO : Rediriger vers une page de connexion OAuth ou appeler une API
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = API_URL + "/api/auth/google/redirect";
  };

  const handleGithubLogin = () => {
    window.location.href = API_URL + "/api/auth/github/redirect";
  };

  const handleFacebookLogin = () => {
    alert("Pas encore implemeter");
    // window.location.href = API_URL + "/api/auth/facebook/redirect";
  };

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            Paramètres
          </div>
          <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
            <Button
              variant="primary"
              className="group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
            >
              <Lucide
                icon="ExternalLink"
                className="stroke-[1.3] w-4 h-4 mr-3"
              />
              Aller à Mon Profil
            </Button>
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-12 gap-y-10 gap-x-6">
          <div className="relative col-span-12 xl:col-span-3">
            <div className="sticky top-[104px]">
              <div className="flex flex-col px-5 pt-5 pb-6 box box--stacked">
                <Link
                  to="/settings"
                  className={clsx([
                    "flex items-center py-3 first:-mt-3 last:-mb-3 [&.active]:text-primary [&.active]:font-medium hover:text-primary",
                    { active: queryParams.get("page") === null },
                  ])}
                >
                  <Lucide
                    icon="AppWindow"
                    className="stroke-[1.3] w-4 h-4 mr-3"
                  />
                  Infos du Profil
                </Link>
                <Link
                  to="/settings?page=security"
                  className={clsx([
                    "flex items-center py-3 first:-mt-3 last:-mb-3 [&.active]:text-primary [&.active]:font-medium hover:text-primary",
                    { active: queryParams.get("page") === "security" },
                  ])}
                >
                  <Lucide
                    icon="KeyRound"
                    className="stroke-[1.3] w-4 h-4 mr-3"
                  />
                  Sécurité
                </Link>
                <Link
                  to="/settings?page=connected-services"
                  className={clsx([
                    "flex items-center py-3 first:-mt-3 last:-mb-3 [&.active]:text-primary [&.active]:font-medium hover:text-primary",
                    {
                      active: queryParams.get("page") === "connected-services",
                    },
                  ])}
                >
                  <Lucide
                    icon="Workflow"
                    className="stroke-[1.3] w-4 h-4 mr-3"
                  />
                  Services Connectés
                </Link>
                <Link
                  to="/settings?page=account-deactivation"
                  className={clsx([
                    "flex items-center py-3 first:-mt-3 last:-mb-3 [&.active]:text-primary [&.active]:font-medium hover:text-primary",
                    {
                      active:
                        queryParams.get("page") === "account-deactivation",
                    },
                  ])}
                >
                  <Lucide icon="Trash2" className="stroke-[1.3] w-4 h-4 mr-3" />
                  Désactivation du Compte
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col col-span-12 xl:col-span-9 gap-y-7">
            {queryParams.get("page") === null && (
              <div className="flex flex-col p-5 box box--stacked">
                <div className="pb-5 mb-6 font-medium border-b border-dashed border-slate-300/70 text-[0.94rem]">
                  Infos du Profil
                </div>
                <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
                  <div>
                    <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                      <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                        <div className="text-left">
                          <div className="flex items-center">
                            <div className="font-medium">Nom Complet</div>
                            <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                              Requis
                            </div>
                          </div>
                          <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400">
                            Entrez votre nom légal complet tel qu'il apparaît
                            sur votre pièce d'identité officielle.
                          </div>
                        </div>
                      </label>
                      <div className="flex-1 w-full mt-3 xl:mt-0">
                        <div className="flex flex-col items-center md:flex-row">
                          <div className="w-full">
                            <FormInput
                              {...registerProfile("prenom")}
                              type="text"
                              placeholder="Prénom"
                              className="first:rounded-b-none first:md:rounded-bl-md first:md:rounded-r-none [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:md:mt-0 [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:rounded-none last:rounded-t-none last:md:rounded-l-none last:md:rounded-tr-md last:-mt-px last:md:mt-0 last:md:-ml-px focus:z-10"
                            />
                            {profileErrors.prenom && (
                              <div className="mt-2 text-danger">
                                {typeof profileErrors.prenom.message ===
                                  "string" && profileErrors.prenom.message}
                              </div>
                            )}
                          </div>
                          <div className="w-full mt-3 md:mt-0 md:ml-2">
                            <FormInput
                              {...registerProfile("nom")}
                              type="text"
                              placeholder="Nom"
                              className="first:rounded-b-none first:md:rounded-bl-md first:md:rounded-r-none [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:md:mt-0 [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:rounded-none last:rounded-t-none last:md:rounded-l-none last:md:rounded-tr-md last:-mt-px last:md:mt-0 last:md:-ml-px focus:z-10"
                            />
                            {profileErrors.nom && (
                              <div className="mt-2 text-danger">
                                {typeof profileErrors.nom.message ===
                                  "string" && profileErrors.nom.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                      <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                        <div className="text-left">
                          <div className="flex items-center">
                            <div className="font-medium">Date de Naissance</div>
                            <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                              Requis
                            </div>
                          </div>
                          <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400">
                            Cette information est requise pour vérifier votre
                            âge et fournir des services adaptés à votre âge.
                          </div>
                        </div>
                      </label>
                      <div className="flex-1 w-full mt-3 xl:mt-0">
                        <Litepicker
                          {...registerProfile("date_naissance")}
                          onChange={(e: any) => {
                            setProfileValue("date_naissance", e.target.value);
                          }}
                          options={{
                            autoApply: false,
                            format: "YYYY-MM-DD",
                            lang: "fr-FR",
                            dropdowns: {
                              minYear: 1990,
                              maxYear: null,
                              months: true,
                              years: true,
                            },
                          }}
                          value={parsedUser.personne.date_naissance}
                        />
                        {profileErrors.date_naissance && (
                          <div className="mt-2 text-danger">
                            {typeof profileErrors.date_naissance.message ===
                              "string" && profileErrors.date_naissance.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                      <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                        <div className="text-left">
                          <div className="flex items-center">
                            <div className="font-medium">Sexe</div>
                          </div>
                          <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400">
                            Sélectionnez votre sexe parmi les options.
                          </div>
                        </div>
                      </label>
                      <div className="flex-1 w-full mt-3 xl:mt-0">
                        <div className="flex flex-col items-center md:flex-row">
                          <div className="bg-white w-full px-3 py-2 border rounded-md shadow-sm border-slate-300/60 first:rounded-b-none first:md:rounded-bl-md first:md:rounded-r-none [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:md:mt-0 [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:rounded-none last:rounded-t-none last:md:rounded-l-none last:md:rounded-tr-md last:-mt-px last:md:mt-0 last:md:-ml-px focus:z-10 dark:bg-darkmode-600">
                            <input
                              className="transition-all duration-100 ease-in-out"
                              {...registerProfile("sexe")}
                              type="radio"
                              name="sexe"
                              value="M"
                              id="checkbox-switch-1"
                            />
                            <FormCheck.Label htmlFor="checkbox-switch-1">
                              Homme
                            </FormCheck.Label>
                          </div>
                          <div className="bg-white w-full px-3 py-2 border rounded-md shadow-sm border-slate-300/60 first:rounded-b-none first:md:rounded-bl-md first:md:rounded-r-none [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:md:mt-0 [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:rounded-none last:rounded-t-none last:md:rounded-l-none last:md:rounded-tr-md last:-mt-px last:md:mt-0 last:md:-ml-px focus:z-10 dark:bg-darkmode-600">
                            <input
                              className="transition-all duration-100 ease-in-out"
                              {...registerProfile("sexe")}
                              type="radio"
                              name="sexe"
                              value="F"
                              id="checkbox-switch-2"
                            />
                            <FormCheck.Label htmlFor="checkbox-switch-2">
                              Femme
                            </FormCheck.Label>
                          </div>
                        </div>
                        {profileErrors.sexe && (
                          <div className="mt-2 text-danger">
                            {typeof profileErrors.sexe.message === "string" &&
                              profileErrors.sexe.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                      <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                        <div className="text-left">
                          <div className="flex items-center">
                            <div className="font-medium">Email</div>
                            <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                              Requis
                            </div>
                          </div>
                          <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400">
                            Veuillez fournir une adresse email valide à laquelle
                            vous avez accès.
                          </div>
                        </div>
                      </label>
                      <div className="flex-1 w-full mt-3 xl:mt-0">
                        <FormInput
                          {...registerProfile("email")}
                          type="text"
                          placeholder="email@example.com"
                        />
                        {profileErrors.email && (
                          <div className="mt-2 text-danger">
                            {typeof profileErrors.email.message === "string" &&
                              profileErrors.email.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                      <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-60 xl:mr-14">
                        <div className="text-left">
                          <div className="flex items-center">
                            <div className="font-medium">Téléphone</div>
                            <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                              Requis
                            </div>
                          </div>
                          <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400">
                            Veuillez fournir un numéro de téléphone valide où
                            nous pouvons vous joindre si nécessaire.
                          </div>
                        </div>
                      </label>
                      <div className="flex-1 w-full mt-3 xl:mt-0">
                        <FormInput
                          {...registerProfile("tel")}
                          type="text"
                          placeholder="Numéro de téléphone"
                          className="first:rounded-b-none first:md:rounded-bl-md first:md:rounded-r-none [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:md:mt-0 [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:rounded-none last:rounded-t-none last:md:rounded-l-none last:md:rounded-tr-md last:-mt-px last:md:mt-0 last:md:-ml-px focus:z-10"
                        />
                        {profileErrors.tel && (
                          <div className="mt-2 text-danger">
                            {typeof profileErrors.tel.message === "string" &&
                              profileErrors.tel.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex pt-5 mt-6 border-t border-dashed md:justify-end border-slate-300/70">
                      <Button
                        variant="outline-primary"
                        className="w-full px-4 border-primary/50 md:w-auto"
                        type="submit"
                        disabled={loading}
                        ref={submitButtonRef}
                      >
                        {loading ? (
                          <LoadingIcon
                            icon="tail-spin"
                            color="primary"
                            className="w-5 h-5"
                          />
                        ) : (
                          "Enregistrer les modifications"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {queryParams.get("page") === "security" && (
              <div className="flex flex-col p-5 box box--stacked">
                <div className="pb-5 mb-6 font-medium border-b border-dashed border-slate-300/70 text-[0.94rem]">
                  Sécurité
                </div>
                <form onSubmit={handleSubmitSecurity(onSubmitSecurity)}>
                  <div>
                    <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                      <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-64 xl:mr-14">
                        <div className="text-left">
                          <div className="flex items-center">
                            <div className="font-medium">
                              Mot de Passe Actuel
                            </div>
                            <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                              Requis
                            </div>
                          </div>
                          <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400">
                            Entrez votre mot de passe actuel pour vérifier votre
                            identité.
                          </div>
                        </div>
                      </label>
                      <div className="flex-1 w-full mt-3 xl:mt-0">
                        <FormInput
                          {...registerSecurity("current_password")}
                          type="password"
                          placeholder="Mot de passe actuel"
                        />
                        {securityErrors.current_password && (
                          <div className="mt-2 text-danger">
                            {securityErrors.current_password.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                      <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-64 xl:mr-14">
                        <div className="text-left">
                          <div className="flex items-center">
                            <div className="font-medium">
                              Nouveau Mot de Passe
                            </div>
                            <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                              Requis
                            </div>
                          </div>
                          <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400">
                            Créez un nouveau mot de passe pour votre compte.
                          </div>
                        </div>
                      </label>
                      <div className="flex-1 w-full mt-3 xl:mt-0">
                        <FormInput
                          {...registerSecurity("new_password")}
                          type="password"
                          placeholder="Nouveau mot de passe"
                        />
                        {securityErrors.new_password && (
                          <div className="mt-2 text-danger">
                            {securityErrors.new_password.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-col block pt-5 mt-5 xl:items-center sm:flex xl:flex-row first:mt-0 first:pt-0">
                      <label className="inline-block mb-2 sm:mb-0 sm:mr-5 sm:text-right xl:w-64 xl:mr-14">
                        <div className="text-left">
                          <div className="flex items-center">
                            <div className="font-medium">
                              Confirmer le Nouveau Mot de Passe
                            </div>
                            <div className="ml-2.5 px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-darkmode-300 dark:text-slate-400 text-xs rounded-md border border-slate-200">
                              Requis
                            </div>
                          </div>
                          <div className="mt-1.5 xl:mt-3 text-xs leading-relaxed text-slate-500/80 dark:text-slate-400">
                            Veuillez réentrer le nouveau mot de passe que vous
                            venez de choisir.
                          </div>
                        </div>
                      </label>
                      <div className="flex-1 w-full mt-3 xl:mt-0">
                        <FormInput
                          {...registerSecurity("confirm_password")}
                          type="password"
                          placeholder="Confirmer le mot de passe"
                        />
                        {securityErrors.confirm_password && (
                          <div className="mt-2 text-danger">
                            {securityErrors.confirm_password.message}
                          </div>
                        )}
                        <div className="mt-4 text-slate-500">
                          <div className="font-medium">
                            Exigences du mot de passe :
                          </div>
                          <ul className="flex flex-col gap-1 pl-3 mt-2.5 list-disc text-slate-500">
                            <li className="pl-0.5">
                              Les mots de passe doivent comporter au moins 8
                              caractères.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex pt-5 mt-6 border-t border-dashed md:justify-end border-slate-300/70">
                      <Button
                        variant="outline-primary"
                        className="w-full px-4 border-primary/50 md:w-auto"
                        type="submit"
                        disabled={loading}
                        ref={submitButtonRef}
                      >
                        {loading ? (
                          <LoadingIcon
                            icon="tail-spin"
                            color="primary"
                            className="w-5 h-5"
                          />
                        ) : (
                          "Enregistrer les modifications"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {queryParams.get("page") === "connected-services" && (
              <div className="flex flex-col p-5 box box--stacked">
                <div className="pb-5 mb-6 font-medium border-b border-dashed border-slate-300/70 text-[0.94rem]">
                  Services Connectés
                </div>
                <div>
                  <div className="flex items-center pt-2.5 mt-2.5 last:mb-2 first:mt-0 first:pt-0">
                    <div>
                      <div className="flex items-center justify-center w-10 h-10 ml-2 border rounded-full border-primary/10 bg-primary/10">
                        <Lucide
                          icon="Facebook"
                          className="stroke-[1.3] w-4 h-4 text-primary fill-primary/10"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-center ml-5 gap-y-2.5 sm:flex-row w-full">
                      <div>
                        <div className="flex items-center">
                          <div className="font-medium">Facebook</div>
                        </div>
                        <div className="pr-10 mt-1 text-xs leading-relaxed text-slate-500">
                          Connexions sociales et mises à jour personnelles
                        </div>
                      </div>
                      <div className="flex flex-1 w-full sm:justify-end">
                        <FormSwitch.Input
                          id="checkbox-switch-facebook"
                          type="checkbox"
                          defaultChecked={parsedUser.provider === "facebook"}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center pt-2.5 mt-2.5 last:mb-2 first:mt-0 first:pt-0">
                    <div>
                      <div className="flex items-center justify-center w-10 h-10 ml-2 border rounded-full border-primary/10 bg-primary/10">
                        <Lucide
                          icon="Twitter"
                          className="stroke-[1.3] w-4 h-4 text-primary fill-primary/10"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-center ml-5 gap-y-2.5 sm:flex-row w-full">
                      <div>
                        <div className="flex items-center">
                          <div className="font-medium">Google</div>
                        </div>
                        <div className="pr-10 mt-1 text-xs leading-relaxed text-slate-500">
                          Services Google et intégrations
                        </div>
                      </div>
                      <div className="flex flex-1 w-full sm:justify-end">
                        <FormSwitch.Input
                          id="checkbox-switch-google"
                          type="checkbox"
                          defaultChecked={parsedUser.provider === "google"}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center pt-2.5 mt-2.5 last:mb-2 first:mt-0 first:pt-0">
                    <div>
                      <div className="flex items-center justify-center w-10 h-10 ml-2 border rounded-full border-primary/10 bg-primary/10">
                        <Lucide
                          icon="Github"
                          className="stroke-[1.3] w-4 h-4 text-primary fill-primary/10"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-center ml-5 gap-y-2.5 sm:flex-row w-full">
                      <div>
                        <div className="flex items-center">
                          <div className="font-medium">GitHub</div>
                        </div>
                        <div className="pr-10 mt-1 text-xs leading-relaxed text-slate-500">
                          Dépôts de code et contributions open source
                        </div>
                      </div>
                      <div className="flex flex-1 w-full sm:justify-end">
                        <FormSwitch.Input
                          id="checkbox-switch-github"
                          type="checkbox"
                          defaultChecked={parsedUser.provider === "github"}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button
                      variant="outline-primary"
                      className="w-full px-4 border-primary/50 md:w-auto"
                      onClick={() => {
                        setBasicModalPreview(true);
                      }}
                    >
                      {parsedUser.provider ? "Changer" : "Connecter"}
                    </Button>
                  </div>
                </div>

                <Dialog
                  open={basicModalPreview}
                  onClose={() => {
                    setBasicModalPreview(false);
                  }}
                >
                  <Dialog.Panel className="p-10 text-center">
                    <h4>Choisissez le réseau social</h4>
                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                      <Button
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center w-full sm:w-1/3 py-2 border border-slate-300/80 rounded-[0.6rem] hover:bg-slate-50 dark:border-darkmode-400 dark:hover:bg-darkmode-500"
                      >
                        <Lucide icon="Chrome" className="w-5 h-5 mr-2" />
                        Google
                      </Button>
                      <Button
                        onClick={handleGithubLogin}
                        className="flex items-center justify-center w-full sm:w-1/3 py-2 border border-slate-300/80 rounded-[0.6rem] hover:bg-slate-50 dark:border-darkmode-400 dark:hover:bg-darkmode-500"
                      >
                        <Lucide icon="Github" className="w-5 h-5 mr-2" />
                        GitHub
                      </Button>
                      <Button
                        onClick={handleFacebookLogin}
                        className="flex items-center justify-center w-full sm:w-1/3 py-2 border border-slate-300/80 rounded-[0.6rem] hover:bg-slate-50 dark:border-darkmode-400 dark:hover:bg-darkmode-500"
                      >
                        <Lucide icon="Facebook" className="w-5 h-5 mr-2" />
                        Facebook
                      </Button>
                    </div>
                  </Dialog.Panel>
                </Dialog>
              </div>
            )}

            {queryParams.get("page") === "account-deactivation" && (
              <div className="flex flex-col p-5 box box--stacked">
                <div className="flex items-center pb-5 mb-6 font-medium border-b border-dashed border-slate-300/70 text-[0.94rem]">
                  Désactivation du Compte
                </div>
                <div>
                  <div className="leading-relaxed">
                    Lorsque vous initiez le processus de suppression du compte,
                    vous n'aurez plus accès aux services du compte Front, et vos
                    données personnelles seront définitivement supprimées. Vous
                    disposez d'un délai de 10 jours pour annuler la suppression
                    si nécessaire.
                  </div>
                  <FormCheck className="mt-5">
                    <FormCheck.Input
                      id="checkbox-switch-1"
                      type="checkbox"
                      value=""
                    />
                    <FormCheck.Label htmlFor="checkbox-switch-1">
                      Confirmer que je souhaite supprimer mon compte.
                    </FormCheck.Label>
                  </FormCheck>
                </div>
                <div className="flex flex-col-reverse gap-3 pt-5 mt-6 border-t border-dashed md:flex-row md:justify-end border-slate-300/70">
                  <Button
                    variant="outline-secondary"
                    className="w-full px-4 md:w-auto"
                  >
                    En savoir plus
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="w-full px-4 border-danger/50 bg-danger/5 md:w-auto"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <Notification id="success-notification-profile" className="flex hidden">
        <Lucide icon="CheckCircle" className="text-success" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Profil mis à jour !</div>
          <div className="mt-1 text-slate-500">
            Vos informations ont été mises à jour avec succès.
          </div>
        </div>
      </Notification>
      <Notification id="success-notification-security" className="flex hidden">
        <Lucide icon="CheckCircle" className="text-success" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Mot de passe modifié !</div>
          <div className="mt-1 text-slate-500">
            Votre mot de passe a été modifié avec succès.
          </div>
        </div>
      </Notification>
      <Notification id="failed-notification" className="flex hidden">
        <Lucide icon="XCircle" className="text-danger" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Échec de l'opération !</div>
          <div className="mt-1 text-slate-500">
            Une erreur s'est produite. Veuillez réessayer.
          </div>
        </div>
      </Notification>
    </div>
  );
}

export default Main;
