import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { useEffect, useState, useRef } from "react";
import {
  getMatieres,
  addMatiere,
  deleteMatiere,
  updateMatiere,
} from "@/services/matieres";
import { getFilieres } from "@/services/filieres";
import LoadingIcon from "@/components/Base/LoadingIcon";
import Notification from "@/components/Base/Notification";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Toastify from "toastify-js";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface Matiere {
  id: number;
  nom: string;
  description: string | undefined;
  nombre_heures: number;
  heures_utilisees: number;
  periode: string;
  niveau_id: number;
}

interface Filiere {
  id: number;
  nom: string;
  description: string;
  niveaux: Niveau[];
}

interface Niveau {
  id: number;
  nom: string;
  filiere_id: number;
}

function Main() {
  const schema = yup
    .object({
      nom: yup
        .string()
        .required("Le nom de la matière est requis")
        .min(2, "Le nom doit contenir au moins 2 caractères"),
      description: yup.string(),
      // .required()
      // .nullable()
      // .min(10, "La description doit contenir au moins 10 caractères"),
      nombre_heures: yup
        .string()
        .required("Le nombre d'heures est requis")
        .test(
          "len",
          "Le nombre d'heures ne doit pas dépasser 3 chiffres",
          (val) => (val && val.toString().length <= 3 ? true : false)
        ),
      periode: yup
        .string()
        .required("La période est requise")
        .notOneOf([""], "Veuillez sélectionner un semestre"),
      filiere: yup
        .string()
        .required("La filière est requise")
        .notOneOf([""], "Veuillez sélectionner une filière"),
      niveau_id: yup
        .string()
        .required("Le niveau est requis")
        .notOneOf([""], "Veuillez sélectionner un niveau"),
    })
    .required();

  const {
    register,
    trigger,
    formState: { errors },
    getValues,
    reset,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [filteredMatieres, setFilteredMatieres] = useState<Matiere[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFiliereId, setSelectedFiliereId] = useState<string>("");
  const [selectedNiveauId, setSelectedNiveauId] = useState<string>("");
  const [deleteModalPreview, setDeleteModalPreview] = useState(false);
  const [selectedMatiereId, setSelectedMatiereId] = useState<number | null>(
    null
  );
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [headerFooterModalPreview, setHeaderFooterModalPreview] =
    useState(false);
  const sendButtonRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [matieresData, filieresData] = await Promise.all([
        getMatieres(),
        getFilieres(),
      ]);
      setMatieres(matieresData);
      setFilteredMatieres(matieresData);
      setFilieres(filieresData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFiliereId) {
      const selectedFiliere = filieres.find(
        (filiere) => filiere.id === parseInt(selectedFiliereId)
      );
      setNiveaux(selectedFiliere ? selectedFiliere.niveaux : []);
      if (!editingMatiere) {
        setSelectedNiveauId("");
      }
    } else {
      setNiveaux([]);
      setSelectedNiveauId("");
    }
  }, [selectedFiliereId, filieres, editingMatiere]);

  useEffect(() => {
    let filtered = matieres;

    if (searchTerm) {
      filtered = filtered.filter((matiere) =>
        matiere.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedNiveauId) {
      filtered = filtered.filter(
        (matiere) => matiere.niveau_id === parseInt(selectedNiveauId)
      );
    } else if (selectedFiliereId) {
      const selectedFiliere = filieres.find(
        (filiere) => filiere.id === parseInt(selectedFiliereId)
      );
      if (selectedFiliere) {
        const niveauIds = selectedFiliere.niveaux.map((niveau) => niveau.id);
        filtered = filtered.filter((matiere) =>
          niveauIds.includes(matiere.niveau_id)
        );
      }
    }

    setFilteredMatieres(filtered);
  }, [searchTerm, selectedFiliereId, selectedNiveauId, matieres, filieres]);

  const handleUpdateClick = (matiere: Matiere) => {
    // Trouver la filière correspondant au niveau_id de la matière
    const niveau = filieres
      .flatMap((filiere) => filiere.niveaux)
      .find((niveau) => niveau.id === matiere.niveau_id);

    const filiereId = niveau ? niveau.filiere_id.toString() : "";

    // Mettre à jour l'état de la filière sélectionnée
    setSelectedFiliereId(filiereId);

    // Pré-remplir le formulaire avec les données de la matière
    reset({
      nom: matiere.nom,
      description: matiere.description || "",
      nombre_heures: matiere.nombre_heures.toString(),
      periode: matiere.periode,
      filiere: filiereId,
      niveau_id: matiere.niveau_id.toString(),
    });

    // Définir la matière en cours de modification
    setEditingMatiere(matiere);
    setHeaderFooterModalPreview(true);
  };

  const handleConfirmUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (editingMatiere) {
      setLoading(true);
      const result = await trigger();

      if (!result) {
        const failedEl = document
          .querySelectorAll("#failed-notification-content")[0]
          .cloneNode(true) as HTMLElement;
        failedEl.classList.remove("hidden");
        Toastify({
          node: failedEl,
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
        }).showToast();
      } else {
        const formData = getValues();
        try {
          const updatedMatiere = await updateMatiere(editingMatiere.id, {
            nom: formData.nom,
            nombre_heures: parseInt(formData.nombre_heures),
            periode: formData.periode,
            niveau_id: parseInt(formData.niveau_id),
            description: formData.description,
          });
          setMatieres(
            matieres.map((matiere) =>
              matiere.id === updatedMatiere.id ? updatedMatiere : matiere
            )
          );
          setFilteredMatieres(
            filteredMatieres.map((matiere) =>
              matiere.id === updatedMatiere.id ? updatedMatiere : matiere
            )
          );
          setHeaderFooterModalPreview(false);
          setEditingMatiere(null);
          reset(); // Reset form fields
          const successEl = document
            .querySelectorAll("#success-notification-content")[0]
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
        } catch (error) {
          console.error("Erreur lors de la modification de la matière:", error);
          const failedEl = document
            .querySelectorAll("#failed-notification-content")[0]
            .cloneNode(true) as HTMLElement;
          failedEl.classList.remove("hidden");
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
      }
    }
  };

  const handleDeleteClick = (matiereId: number) => {
    setSelectedMatiereId(matiereId);
    setDeleteModalPreview(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedMatiereId !== null) {
      setLoading(true);
      try {
        await deleteMatiere(selectedMatiereId);
        setMatieres(
          matieres.filter((matiere) => matiere.id !== selectedMatiereId)
        );
        setFilteredMatieres(
          filteredMatieres.filter((matiere) => matiere.id !== selectedMatiereId)
        );
        const successEl = document
          .querySelectorAll("#success-notification-content")[0]
          .cloneNode(true) as HTMLElement;
        successEl.classList.remove("hidden");
        Toastify({
          node: successEl,
          duration: 4000,
          newWindow: true,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
        }).showToast();
      } catch (error) {
        console.error("Erreur lors de la suppression de la matière:", error);
        const failedEl = document
          .querySelectorAll("#failed-notification-content")[0]
          .cloneNode(true) as HTMLElement;
        failedEl.classList.remove("hidden");
        Toastify({
          node: failedEl,
          duration: 4000,
          newWindow: true,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
        }).showToast();
      } finally {
        setLoading(false);
      }
    }
    setDeleteModalPreview(false);
    setSelectedMatiereId(null);
  };

  const onSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await trigger();

    if (!result) {
      const failedEl = document
        .querySelectorAll("#failed-notification-content")[0]
        .cloneNode(true) as HTMLElement;
      failedEl.classList.remove("hidden");
      Toastify({
        node: failedEl,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
      }).showToast();
    } else {
      const formData = getValues();
      setLoading(true);
      try {
        const newMatiere = await addMatiere({
          nom: formData.nom,
          nombre_heures: parseInt(formData.nombre_heures),
          heures_utilisees: 0, // Default value for new matiere
          periode: formData.periode,
          niveau_id: parseInt(formData.niveau_id),
          description: formData.description,
        });
        await addMatiere(newMatiere);
        setMatieres([...matieres, newMatiere]);
        setHeaderFooterModalPreview(false);
        setSelectedFiliereId("");
        reset(); // Reset form fields
        const successEl = document
          .querySelectorAll("#success-notification-content")[0]
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
      } catch (error) {
        console.error("Erreur lors de l'ajout de la matière:", error);
        const failedEl = document
          .querySelectorAll("#failed-notification-content")[0]
          .cloneNode(true) as HTMLElement;
        failedEl.classList.remove("hidden");
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
    }
  };

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col md:flex-row md:items-center gap-y-3 mb-3.5">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            Matières
          </div>
          <div className="md:ml-auto">
            <Button
              variant="primary"
              className="group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
              onClick={(event: React.MouseEvent) => {
                event.preventDefault();
                setHeaderFooterModalPreview(true);
              }}
            >
              <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
              Ajouter une matière
            </Button>
          </div>
        </div>

        <div className="flex flex-col box box--stacked">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Lucide
                  icon="Search"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                />
                <FormInput
                  type="text"
                  placeholder="Rechercher une matière"
                  className="pl-9 sm:w-64 rounded-[0.5rem]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <FormSelect
                value={selectedFiliereId}
                onChange={(e) => setSelectedFiliereId(e.target.value)}
                className="sm:w-48 rounded-[0.5rem]"
              >
                <option value="">Toutes les filières</option>
                {filieres.map((filiere) => (
                  <option key={filiere.id} value={filiere.id}>
                    {filiere.nom}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                value={selectedNiveauId}
                onChange={(e) => setSelectedNiveauId(e.target.value)}
                className="sm:w-48 rounded-[0.5rem]"
                disabled={!selectedFiliereId}
              >
                <option value="">Tous les niveaux</option>
                {niveaux.map((niveau) => (
                  <option key={niveau.id} value={niveau.id}>
                    {niveau.nom}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="overflow-auto xl:overflow-visible p-5">
            <Table className="border-b border-slate-200/60">
              <Table.Thead>
                <Table.Tr>
                  <Table.Td className="w-5 py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    <FormCheck.Input type="checkbox" />
                  </Table.Td>
                  <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Nom
                  </Table.Td>
                  <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Nombre d'heures
                  </Table.Td>
                  <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Heures utilisées
                  </Table.Td>
                  <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Période
                  </Table.Td>
                  {/* <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Niveau ID
                  </Table.Td> */}
                  <Table.Td className="py-4 font-medium text-center border-t w-36 bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Action
                  </Table.Td>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredMatieres.map((matiere) => (
                  <Table.Tr key={matiere.id} className="[&_td]:last:border-b-0">
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <FormCheck.Input type="checkbox" />
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="font-medium whitespace-nowrap">
                        {matiere.nom}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5 text-center">
                        {matiere.nombre_heures}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5 text-center">
                        {matiere.heures_utilisees}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                        {matiere.periode}
                      </div>
                    </Table.Td>
                    {/* <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="whitespace-nowrap text-center">
                        {matiere.niveau_id}
                      </div>
                    </Table.Td> */}
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="flex items-center justify-center">
                        <Menu className="h-5">
                          <Menu.Button className="w-5 h-5 text-slate-500">
                            <Lucide
                              icon="MoreVertical"
                              className="w-5 h-5 stroke-slate-400/70 fill-slate-400/70"
                            />
                          </Menu.Button>
                          <Menu.Items className="w-40">
                            <Menu.Item
                              onClick={() => handleUpdateClick(matiere)}
                            >
                              <Lucide
                                icon="CheckSquare"
                                className="w-4 h-4 mr-2"
                              />
                              Modifier
                            </Menu.Item>
                            <Menu.Item
                              className="text-danger"
                              onClick={() => handleDeleteClick(matiere.id)}
                            >
                              <Lucide icon="Trash2" className="w-4 h-4 mr-2" />
                              Supprimer
                            </Menu.Item>
                          </Menu.Items>
                        </Menu>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog
        open={deleteModalPreview}
        onClose={() => {
          setDeleteModalPreview(false);
          setSelectedMatiereId(null);
        }}
        initialFocus={deleteButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon="XCircle"
              className="w-16 h-16 mx-auto mt-3 text-danger"
            />
            <div className="mt-5 text-3xl">Êtes-vous sûr ?</div>
            <div className="mt-2 text-slate-500">
              Voulez-vous vraiment supprimer cette matière ? <br />
              Cette action est irréversible.
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setDeleteModalPreview(false);
                setSelectedMatiereId(null);
              }}
              className="w-24 mr-1"
            >
              Annuler
            </Button>
            <Button
              disabled={loading}
              type="button"
              variant="danger"
              className="w-24"
              ref={deleteButtonRef}
              onClick={handleConfirmDelete}
            >
              {!loading ? (
                "Supprimer"
              ) : (
                <div>
                  <LoadingIcon
                    icon="tail-spin"
                    color="white"
                    className="w-8 h-8"
                  />
                </div>
              )}
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={headerFooterModalPreview}
        onClose={() => {
          setHeaderFooterModalPreview(false);
          setSelectedFiliereId("");
          setEditingMatiere(null);
          reset(); // Reset form fields
        }}
        initialFocus={sendButtonRef}
      >
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="mr-auto text-base font-medium">
              {editingMatiere ? "Modifier une matière" : "Ajouter une matière"}
            </h2>
          </Dialog.Title>
          <Dialog.Description>
            <form onSubmit={editingMatiere ? handleConfirmUpdate : onSubmit}>
              <div className="grid grid-cols-12 gap-4 gap-y-3">
                <div className="col-span-12">
                  <FormLabel htmlFor="modal-form-nom">
                    Nom de la matière
                  </FormLabel>
                  <FormInput
                    {...register("nom")}
                    id="modal-form-nom"
                    type="text"
                    placeholder="Ex: Mathématiques"
                    name="nom"
                  />
                  {errors.nom && (
                    <div className="mt-2 text-danger">
                      {typeof errors.nom.message === "string" &&
                        errors.nom.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12">
                  <FormLabel htmlFor="modal-form-description">
                    Description
                  </FormLabel>
                  <FormTextarea
                    {...register("description")}
                    id="modal-form-description"
                    placeholder="Description de la matière (optionnel)"
                    name="description"
                  />
                  {errors.description && (
                    <div className="mt-2 text-danger">
                      {typeof errors.description.message === "string" &&
                        errors.description.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-nombre-heures">
                    Nombre d'heures
                  </FormLabel>
                  <FormInput
                    {...register("nombre_heures")}
                    id="modal-form-nombre-heures"
                    type="number"
                    placeholder="Ex: 60"
                    name="nombre_heures"
                  />
                  {errors.nombre_heures && (
                    <div className="mt-2 text-danger">
                      {typeof errors.nombre_heures.message === "string" &&
                        errors.nombre_heures.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-periode">Semestre</FormLabel>
                  <select
                    id="modal-form-periode"
                    className={
                      "bg-[length:20px_auto] " +
                      twMerge([
                        "disabled:bg-slate-100 disabled:cursor-not-allowed disabled:dark:bg-darkmode-700/50",
                        "[&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-700/50",
                        "bg-chevron-black transition duration-200 ease-in-out w-full text-sm border-slate-300/60 shadow-sm rounded-md py-2 px-3 pr-8 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:!bg-darkmode-700 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:bg-chevron-white",
                      ])
                    }
                    {...register("periode")}
                  >
                    <option value="">Sélectionner</option>
                    <option value="semestre 1">Semestre 1</option>
                    <option value="semestre 2">Semestre 2</option>
                  </select>
                  {errors.periode && (
                    <div className="mt-2 text-danger">
                      {typeof errors.periode.message === "string" &&
                        errors.periode.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-filiere">Filière</FormLabel>
                  <select
                    className={
                      "bg-[length:20px_auto] " +
                      twMerge([
                        "disabled:bg-slate-100 disabled:cursor-not-allowed disabled:dark:bg-darkmode-700/50",
                        "[&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-700/50",
                        "bg-chevron-black transition duration-200 ease-in-out w-full text-sm border-slate-300/60 shadow-sm rounded-md py-2 px-3 pr-8 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:!bg-darkmode-700 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:bg-chevron-white",
                      ])
                    }
                    {...register("filiere")}
                    value={selectedFiliereId}
                    onChange={(e) => setSelectedFiliereId(e.target.value)}
                    id="modal-form-filiere"
                    name="filiere"
                  >
                    <option value="">Sélectionner une filière</option>
                    {filieres.map((filiere) => (
                      <option key={filiere.id} value={filiere.id}>
                        {filiere.nom}
                      </option>
                    ))}
                  </select>
                  {errors.filiere && (
                    <div className="mt-2 text-danger">
                      {typeof errors.filiere.message === "string" &&
                        errors.filiere.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-niveau">Niveau</FormLabel>
                  <select
                    className={
                      "bg-[length:20px_auto] " +
                      twMerge([
                        "disabled:bg-slate-100 disabled:cursor-not-allowed disabled:dark:bg-darkmode-700/50",
                        "[&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-700/50",
                        "bg-chevron-black transition duration-200 ease-in-out w-full text-sm border-slate-300/60 shadow-sm rounded-md py-2 px-3 pr-8 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:!bg-darkmode-700 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:bg-chevron-white",
                      ])
                    }
                    {...register("niveau_id")}
                    id="modal-form-niveau"
                    name="niveau_id"
                    disabled={!selectedFiliereId}
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveaux.map((niveau) => (
                      <option key={niveau.id} value={niveau.id}>
                        {niveau.nom}
                      </option>
                    ))}
                  </select>
                  {errors.niveau_id && (
                    <div className="mt-2 text-danger">
                      {typeof errors.niveau_id.message === "string" &&
                        errors.niveau_id.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-5">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    setHeaderFooterModalPreview(false);
                    setSelectedFiliereId("");
                    setEditingMatiere(null);
                    reset(); // Reset form fields
                  }}
                  className="w-20 mr-1"
                >
                  Annuler
                </Button>
                <Button
                  disabled={loading}
                  type="submit"
                  variant="primary"
                  className="w-20"
                  ref={sendButtonRef}
                >
                  {!loading ? (
                    editingMatiere ? (
                      "Modifier"
                    ) : (
                      "Ajouter"
                    )
                  ) : (
                    <div>
                      <LoadingIcon
                        icon="tail-spin"
                        color="white"
                        className="w-8 h-8"
                      />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Notification id="success-notification-content" className="flex hidden">
        <Lucide icon="CheckCircle" className="text-success" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Ajout réussi !</div>
          <div className="mt-1 text-slate-500">
            La matière a été ajoutée avec succès.
          </div>
        </div>
      </Notification>
      <Notification id="failed-notification-content" className="flex hidden">
        <Lucide icon="XCircle" className="text-danger" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Échec de l'ajout !</div>
          <div className="mt-1 text-slate-500">
            Veuillez vérifier les champs du formulaire.
          </div>
        </div>
      </Notification>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-75">
          <div className="flex flex-col items-center">
            <LoadingIcon icon="ball-triangle" className="w-8 h-8" />
            <div className="mt-2 text-xs text-gray-600">Chargement...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;
