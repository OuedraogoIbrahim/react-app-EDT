import Lucide from "@/components/Base/Lucide";
import { Dialog, Slideover } from "@/components/Base/Headless";
import { FormLabel } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getFilieres } from "@/services/filieres";
import { getMatieres } from "@/services/matieres";
import { getSalles } from "@/services/salles";
import TomSelect from "@/components/Base/TomSelect";
import LoadingIcon from "@/components/Base/LoadingIcon";
import Litepicker from "@/components/Base/Litepicker";
import Notification from "@/components/Base/Notification";
import Toastify from "toastify-js";
import {
  deleteEDT,
  getProvisionalEDT,
  provisionalEDT,
} from "@/services/courses";
import _ from "lodash";

import products from "@/fakers/products";
import reviews from "@/fakers/reviews";
import Tippy from "@/components/Base/Tippy";

// Interfaces
interface Filiere {
  id: number;
  nom: string;
  description: string;
  niveaux: { id: number; nom: string; filiere_id: number }[];
}

interface Salle {
  id: number;
  nom: string;
  capacite: number;
  description: string | null;
}

interface Matiere {
  id: number;
  nom: string;
  nombre_heures: number;
  heures_utilisees: number;
  periode: string;
  niveau_id: number;
}

interface FormData {
  semestre: string;
  filiere: string;
  niveau: string;
  salle: string;
  matiere: string[];
}

interface edtData {
  id: number;
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

// Schéma de validation avec Yup
const courseSchema = yup
  .object({
    filiere: yup.string().required("La filière est requise"),
    niveau: yup.string().required("Le niveau est requis"),
    matiere: yup.array().required("La matière est requise"),
    salle: yup.string().required("La salle est requise"),
    semestre: yup
      .string()
      .required("Le semestre est requis")
      .oneOf(["semestre 1", "semestre 2"], "Type invalide"),
  })
  .required();

function Main() {
  const [basicSlideoverPreview, setBasicSlideoverPreview] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState<string>("");
  const [selectedNiveau, setSelectedNiveau] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [edt, setEdt] = useState<edtData[]>([]);

  const [niveaux, setNiveaux] = useState<{ id: number; nom: string }[]>([]);
  const [formNiveaux, setFormNiveaux] = useState<{ id: number; nom: string }[]>(
    []
  );
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [filteredMatieres, setFilteredMatieres] = useState<Matiere[]>([]);
  const [isFormReady, setIsFormReady] = useState<boolean>(false);
  const [selectedEdt, setSelectedEdt] = useState<edtData | null>(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Initialisation de react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    getValues,
  } = useForm<FormData>({
    mode: "onChange",
    resolver: yupResolver(courseSchema),
  });

  // Fonction utilitaire pour afficher les notifications
  const showNotification = (type: "success" | "error", message?: string) => {
    const id =
      type === "success"
        ? "#success-notification-content"
        : "#failed-notification-content";
    const notificationEl = document
      .querySelectorAll(id)[0]
      .cloneNode(true) as HTMLElement;
    notificationEl.classList.remove("hidden");
    if (message) {
      const messageEl = notificationEl.querySelector(".text-slate-500");
      if (messageEl) messageEl.textContent = message;
    }
    Toastify({
      node: notificationEl,
      duration: 6000,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
    }).showToast();
  };

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [filieresData, matieresData, sallesData, edtData] =
          await Promise.all([
            getFilieres(),
            getMatieres(),
            getSalles(),
            getProvisionalEDT(),
          ]);
        setFilieres(filieresData);
        setMatieres(matieresData);
        setSalles(sallesData);
        setEdt(edtData);
        console.log(edtData);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        showNotification("error", "Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mise à jour des filtres
  useEffect(() => {
    if (selectedFiliere) {
      const selectedFiliereObj = filieres.find(
        (filiere) => filiere.id.toString() === selectedFiliere
      );
      if (selectedFiliereObj) {
        setNiveaux(selectedFiliereObj.niveaux);
      } else {
        setNiveaux([]);
      }
    } else {
      setNiveaux([]);
    }

    if (!selectedFiliere) {
      setSelectedNiveau("");
    }
  }, [selectedFiliere, selectedNiveau, filieres]);

  // Initialisation du formulaire
  useEffect(() => {
    if (basicSlideoverPreview) {
      const timer = setTimeout(() => {
        setIsFormReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsFormReady(false);
      reset();
    }
  }, [basicSlideoverPreview, reset]);

  // Gestion de la soumission du formulaire
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await provisionalEDT(data);
      showNotification("success", "EDT provisoire ajouté avec succès.");
      reset();
      setBasicSlideoverPreview(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du cours :", error);
      showNotification("error", "Erreur lors de l'ajout du cours.");
    } finally {
      setLoading(false);
    }
  };

  // Méthode pour mettre comme actif
  const handleActivate = async (edtItem: edtData) => {
    setLoading(true);
    try {
      //   await updateEDTStatus(edtItem.id, { activite: "active" });
      showNotification("success", "EDT mis à jour avec succès.");
      //   setEdt((prevEdt) =>
      //     prevEdt.map((edt) =>
      //       edt.id === edtItem.id ? { ...edt, activite: "active" } : edt
      //     )
      //   );
      setShowActivateModal(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'EDT :", error);
      showNotification("error", "Erreur lors de la mise à jour de l'EDT.");
    } finally {
      setLoading(false);
    }
  };

  // Méthode pour supprimer
  const handleDelete = async (edtItem: edtData) => {
    setLoading(true);
    try {
      await deleteEDT(edtItem.date_creation, edtItem.niveau_id);
      showNotification("success", "EDT supprimé avec succès.");
      setEdt((prevEdt) => prevEdt.filter((edt) => edt.id !== edtItem.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'EDT :", error);
      showNotification("error", "Erreur lors de la suppression de l'EDT.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:h-10 gap-y-3 md:items-center md:flex-row">
        <div className="text-base font-medium">Emploi du temps provisoire</div>
        <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
          <Button
            variant="primary"
            onClick={() => setBasicSlideoverPreview(true)}
          >
            <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
            Ajouter un EDT provisoire
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-12 px-5 -mx-5 border-dashed border-y">
          {edt.map((edtItem, index) => {
            const filiere = filieres.find((f) => f.id === edtItem.filiere_id);
            const niveau = filiere?.niveaux.find(
              (n) => n.id === edtItem.niveau_id
            );

            return (
              <div
                key={index}
                className="col-span-12 sm:col-span-6 xl:col-span-3 border-dashed border-slate-300/80 [&:nth-child(4n)]:border-r-0 px-5 py-5 [&:nth-last-child(-n+4)]:border-b-0 border-r border-b flex flex-col"
              >
                <div className="overflow-hidden rounded-lg h-52 image-fit before:block before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-gradient-to-t before:from-slate-900/90 before:to-black/20">
                  <img
                    alt="Tailwise - Admin Dashboard Template"
                    className="rounded-md"
                    src={
                      products.fakeProducts()[
                        index % products.fakeProducts().length
                      ].images[0].path
                    }
                  />
                  {edtItem.activite === "active" ? (
                    <span className="absolute top-0 z-10 px-2.5 py-1 m-5 text-xs text-white rounded-lg bg-success/80 font-medium border-white/20 border">
                      Active
                    </span>
                  ) : (
                    <span className="absolute top-0 z-10 px-2.5 py-1 m-5 text-xs text-white rounded-lg bg-pending/80 font-medium border-white/20 border">
                      Inactive
                    </span>
                  )}
                  <div className="absolute bottom-0 z-10 w-full px-5 pb-6 text-white">
                    <span className="block text-lg font-medium truncate">
                      {edtItem.date_creation}
                    </span>
                  </div>
                </div>
                <div className="pt-5">
                  <div className="flex flex-col gap-3.5 mb-5 pb-5 mt-auto border-b border-dashed border-slate-300/70">
                    <div className="flex items-center">
                      <div className="text-slate-500">Filière:</div>
                      <div className="ml-auto">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <Lucide
                              icon="Star"
                              className="w-4 h-4 mr-1 text-pending fill-pending/30"
                            />
                            <Lucide
                              icon="Star"
                              className="w-4 h-4 mr-1 text-pending fill-pending/30"
                            />
                            <Lucide
                              icon="Star"
                              className="w-4 h-4 mr-1 text-pending fill-pending/30"
                            />
                            <Lucide
                              icon="Star"
                              className="w-4 h-4 mr-1 text-pending fill-pending/30"
                            />
                            <Lucide
                              icon="Star"
                              className="w-4 h-4 mr-1 text-slate-400 fill-slate/30"
                            />
                          </div>
                          <div className="ml-1 text-xs text-slate-500">
                            ({filiere?.nom || "Inconnu"})
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-slate-500">Niveau:</div>
                      <div className="ml-auto">
                        <div className="flex justify-center">
                          <div className="ml-1 text-xs text-slate-500">
                            {niveau?.nom || "Inconnu"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => {
                        setSelectedEdt(edtItem);
                        setShowActivateModal(true);
                      }}
                    >
                      <Lucide
                        icon="KanbanSquare"
                        className="w-4 h-4 stroke-[1.3] mr-1.5"
                      />{" "}
                      Activer
                    </Button>
                    <Button
                      variant="danger"
                      type="button"
                      onClick={() => {
                        setSelectedEdt(edtItem);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Lucide
                        icon="Trash2"
                        className="w-4 h-4 stroke-[1.3] mr-1.5"
                      />{" "}
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-75">
          <div className="flex flex-col items-center">
            <LoadingIcon icon="ball-triangle" className="w-8 h-8" />
            <div className="mt-2 text-xs text-gray-600">Chargement...</div>
          </div>
        </div>
      )}

      {/* Slideover Form */}
      <Slideover
        open={basicSlideoverPreview}
        onClose={() => setBasicSlideoverPreview(false)}
      >
        <Slideover.Panel>
          <Slideover.Title className="p-5 bg-gray-100 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              {/* Ajouter un EDT provisoire */}
            </h2>
          </Slideover.Title>
          <Slideover.Description className="p-6 space-y-6">
            {isFormReady && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="p-4 border rounded-md bg-white">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Filière
                  </FormLabel>
                  <input type="hidden" {...register("filiere")} />
                  <TomSelect
                    value={getValues("filiere") || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setValue("filiere", value);
                      setValue("niveau", "");
                      setValue("matiere", []);
                      const selectedFiliereObj = filieres.find(
                        (filiere) => filiere.id.toString() === value
                      );
                      setFormNiveaux(
                        selectedFiliereObj ? selectedFiliereObj.niveaux : []
                      );
                      setFilteredMatieres([]);
                    }}
                    options={{ placeholder: "Sélectionner une filière" }}
                    className="w-full mt-1"
                  >
                    <option value="">Sélectionner</option>
                    {filieres.map((filiere) => (
                      <option key={filiere.id} value={filiere.id.toString()}>
                        {filiere.nom}
                      </option>
                    ))}
                  </TomSelect>
                  {errors.filiere && (
                    <div className="mt-2 text-red-600 text-sm">
                      {errors.filiere.message}
                    </div>
                  )}
                </div>

                {formNiveaux.length > 0 && (
                  <div className="p-4 border rounded-md bg-white">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Niveau
                    </FormLabel>
                    <input type="hidden" {...register("niveau")} />
                    <TomSelect
                      value={getValues("niveau") || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue("niveau", value);
                        setValue("matiere", []);
                        const selectedNiveau = formNiveaux.find(
                          (niveauItem) => niveauItem.nom === value
                        );
                        setFilteredMatieres(
                          selectedNiveau
                            ? matieres.filter(
                                (matiere) =>
                                  matiere.niveau_id === selectedNiveau.id
                              )
                            : []
                        );
                      }}
                      options={{ placeholder: "Sélectionner un niveau" }}
                      className="w-full mt-1"
                    >
                      <option value="">Sélectionner</option>
                      {formNiveaux.map((niveau) => (
                        <option key={niveau.id} value={niveau.nom}>
                          {niveau.nom}
                        </option>
                      ))}
                    </TomSelect>
                    {errors.niveau && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.niveau.message}
                      </div>
                    )}
                  </div>
                )}

                {filteredMatieres.length > 0 && (
                  <div className="p-4 border rounded-md bg-white">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Matières
                    </FormLabel>
                    <input type="hidden" {...register("matiere")} />
                    <TomSelect
                      value={getValues("matiere") || ""}
                      onChange={(e) => setValue("matiere", e.target.value)}
                      options={{ placeholder: "Sélectionner les matière" }}
                      className="w-full mt-1"
                      multiple
                    >
                      <option value="">Sélectionner</option>
                      {filteredMatieres.map((matiere) => (
                        <option key={matiere.id} value={matiere.id}>
                          {matiere.nom}
                        </option>
                      ))}
                    </TomSelect>
                    {errors.matiere && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.matiere.message}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 border rounded-md bg-white">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Salle
                  </FormLabel>
                  <input type="hidden" {...register("salle")} />
                  <TomSelect
                    value={getValues("salle") || ""}
                    onChange={(e) => setValue("salle", e.target.value)}
                    options={{ placeholder: "Sélectionner une salle" }}
                    className="w-full mt-1"
                  >
                    <option value="">Sélectionner</option>
                    {salles.map((salle) => (
                      <option key={salle.id} value={salle.id}>
                        {salle.nom}
                      </option>
                    ))}
                  </TomSelect>
                  {errors.salle && (
                    <div className="mt-2 text-red-600 text-sm">
                      {errors.salle.message}
                    </div>
                  )}
                </div>

                <div className="p-4 border rounded-md bg-white">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Semestre
                  </FormLabel>
                  <input type="hidden" {...register("semestre")} />
                  <TomSelect
                    value={getValues("semestre") || ""}
                    onChange={(e) => setValue("semestre", e.target.value)}
                    options={{ placeholder: "Sélectionner un semestre" }}
                    className="w-full mt-1"
                  >
                    <option value="">Sélectionner</option>
                    <option value="semestre 1">Semestre 1</option>
                    <option value="semestre 2">Semestre 2</option>
                  </TomSelect>
                  {errors.semestre && (
                    <div className="mt-2 text-red-600 text-sm">
                      {errors.semestre.message}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => setBasicSlideoverPreview(false)}
                  >
                    Annuler
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <LoadingIcon
                        icon="tail-spin"
                        color="white"
                        className="w-4 h-4"
                      />
                    ) : (
                      "Générer l'EDT provisoire"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>

      {/* Activate Modal */}
      <Dialog
        open={showActivateModal}
        onClose={() => setShowActivateModal(false)}
      >
        <Dialog.Panel>
          <div className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmation
            </h2>
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir mettre cet EDT comme actif ?
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowActivateModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => handleActivate(selectedEdt as edtData)}
                disabled={loading}
              >
                {loading ? (
                  <LoadingIcon
                    icon="tail-spin"
                    color="white"
                    className="w-4 h-4"
                  />
                ) : (
                  "Confirmer"
                )}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon="XCircle"
              className="w-16 h-16 mx-auto mt-3 text-danger"
            />
            <div className="mt-5 text-3xl">Etes vous sur?</div>
            <div className="mt-2 text-slate-500">
              La suppression est irréverssible? <br />
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              variant="outline-secondary"
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="w-24 mr-1"
            >
              Annuler
            </Button>

            <Button
              variant="danger"
              type="button"
              onClick={() => handleDelete(selectedEdt as edtData)}
              disabled={loading}
            >
              {loading ? (
                <LoadingIcon
                  icon="tail-spin"
                  color="white"
                  className="w-4 h-4"
                />
              ) : (
                "Confirmer"
              )}
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Notifications */}
      <Notification id="success-notification-content" className="flex hidden">
        <Lucide icon="CheckCircle" className="text-success" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Opération réussie !</div>
          <div className="mt-1 text-slate-500">
            Emploi du temps provisoire généré avec succès.
          </div>
        </div>
      </Notification>
      <Notification id="failed-notification-content" className="flex hidden">
        <Lucide icon="XCircle" className="text-danger" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Échec de l'opération !</div>
          <div className="mt-1 text-slate-500">
            Une erreur est survenue. Veuillez vérifier les champs ou réessayer.
          </div>
        </div>
      </Notification>
    </div>
  );
}

export default Main;
