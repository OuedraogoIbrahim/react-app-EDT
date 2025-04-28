import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import { FormCheck, FormInput, FormLabel } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import TomSelect from "@/components/Base/TomSelect";
import { useEffect, useState, useRef } from "react";

import { getFilieres } from "@/services/filieres";
import { getMatieres } from "@/services/matieres";
import LoadingIcon from "@/components/Base/LoadingIcon";
import Notification from "@/components/Base/Notification";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Toastify from "toastify-js";
import { useForm } from "react-hook-form";
import {
  addEnseignant,
  deleteEnseignant,
  getEnseignants,
  updateEnseignant,
} from "@/services/enseignants";

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  tel: string;
  user: { email: string };
  enseignant: { matieres: Matiere[] };
}

interface Matiere {
  id: number;
  nom: string;
  niveau_id: number;
  niveau: Niveau;
}

interface Niveau {
  id: number;
  nom: string;
  filiere_id: number;
}

interface Filiere {
  id: number;
  nom: string;
  niveaux: Niveau[];
}

function Main() {
  const schema = yup
    .object({
      nom: yup
        .string()
        .required("Le nom est requis")
        .min(2, "Le nom doit contenir au moins 2 caractères"),
      prenom: yup
        .string()
        .required("Le prénom est requis")
        .min(2, "Le prénom doit contenir au moins 2 caractères"),
      email: yup
        .string()
        .required("L'email est requis")
        .email("L'email doit être valide"),
      date_naissance: yup
        .string()
        .required("La date de naissance est requise")
        .matches(
          /^\d{4}-\d{2}-\d{2}$/,
          "La date doit être au format AAAA-MM-JJ"
        ),
      sexe: yup
        .string()
        .required("Le sexe est requis")
        .oneOf(["M", "F"], "Le sexe doit être M ou F"),
      tel: yup
        .string()
        .required("Le téléphone est requis")
        .matches(/^\+?\d{8,8}$/, "Le numéro de téléphone doit être valide"),
      matiere_ids: yup
        .array()
        .of(yup.number())
        .min(1, "Au moins une matière doit être sélectionnée"),
    })
    .required();

  const {
    register,
    trigger,
    formState: { errors },
    getValues,
    reset,
    setValue,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [filteredEnseignants, setFilteredEnseignants] = useState<Enseignant[]>(
    []
  );
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFiliereId, setSelectedFiliereId] = useState<string>("");
  const [deleteModalPreview, setDeleteModalPreview] = useState(false);
  const [selectedEnseignantId, setSelectedEnseignantId] = useState<
    number | null
  >(null);
  const [editingEnseignant, setEditingEnseignant] = useState<Enseignant | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [headerFooterModalPreview, setHeaderFooterModalPreview] =
    useState(false);
  const sendButtonRef = useRef(null);

  const [selectMatieres, setSelectMatieres] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [enseignantsData, filieresData, matieresData] = await Promise.all([
        getEnseignants(),
        getFilieres(),
        getMatieres(),
      ]);

      setEnseignants(enseignantsData);
      setFilteredEnseignants(enseignantsData);
      setFilieres(filieresData);
      setMatieres(matieresData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = enseignants;

    if (searchTerm) {
      filtered = filtered.filter((enseignant) =>
        `${enseignant.nom} ${enseignant.prenom}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFiliereId) {
      const selectedFiliere = filieres.find(
        (filiere) => filiere.id === parseInt(selectedFiliereId)
      );
      if (selectedFiliere) {
        const niveauIds = selectedFiliere.niveaux.map((niveau) => niveau.id);
        filtered = filtered.filter((enseignant) =>
          enseignant.enseignant.matieres.some((matiere) =>
            niveauIds.includes(matiere.niveau_id)
          )
        );
      }
    }

    setFilteredEnseignants(filtered);
  }, [searchTerm, selectedFiliereId, enseignants, filieres]);

  const handleUpdateClick = (enseignant: Enseignant) => {
    setEditingEnseignant(enseignant);
    reset({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      date_naissance: enseignant.date_naissance,
      sexe: enseignant.sexe,
      tel: enseignant.tel,
      email: enseignant.user.email,
      matiere_ids: enseignant.enseignant.matieres.map((matiere) => matiere.id),
    });
    setSelectMatieres(
      enseignant.enseignant.matieres.map((matiere) => matiere.id)
    );
    setValue(
      "matiere_ids",
      enseignant.enseignant.matieres.map((matiere) => matiere.id)
    );
    setHeaderFooterModalPreview(true);
  };

  const handleConfirmUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (editingEnseignant) {
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
          const updatedEnseignant = await updateEnseignant(
            editingEnseignant.id,
            {
              nom: formData.nom,
              prenom: formData.prenom,
              date_naissance: formData.date_naissance,
              sexe: formData.sexe,
              tel: formData.tel,
              email: formData.email,
              matiere_ids: selectMatieres,
            }
          );
          setEnseignants(
            enseignants.map((enseignant) =>
              enseignant.id === updatedEnseignant.id
                ? updatedEnseignant
                : enseignant
            )
          );
          setFilteredEnseignants(
            filteredEnseignants.map((enseignant) =>
              enseignant.id === updatedEnseignant.id
                ? updatedEnseignant
                : enseignant
            )
          );
          setHeaderFooterModalPreview(false);
          setEditingEnseignant(null);
          setSelectMatieres([]);
          reset();
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
          console.error(
            "Erreur lors de la modification de l'enseignant:",
            error
          );
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

  const handleDeleteClick = (enseignantId: number) => {
    setSelectedEnseignantId(enseignantId);
    setDeleteModalPreview(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedEnseignantId !== null) {
      setLoading(true);
      try {
        await deleteEnseignant(selectedEnseignantId);
        setEnseignants(
          enseignants.filter(
            (enseignant) => enseignant.id !== selectedEnseignantId
          )
        );
        setFilteredEnseignants(
          filteredEnseignants.filter(
            (enseignant) => enseignant.id !== selectedEnseignantId
          )
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
        console.error("Erreur lors de la suppression de l'enseignant:", error);
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
    setSelectedEnseignantId(null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
        const newEnseignant = await addEnseignant({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          date_naissance: formData.date_naissance,
          sexe: formData.sexe,
          tel: formData.tel,
          matiere_ids: selectMatieres,
        });
        setEnseignants([...enseignants, newEnseignant]);
        setHeaderFooterModalPreview(false);
        setSelectMatieres([]);
        reset();
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
        console.error("Erreur lors de l'ajout de l'enseignant:", error);
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

  // Calculer les matières attribuées
  const assignedMatiereIds = Array.from(
    new Set(
      enseignants.flatMap((enseignant) =>
        enseignant.enseignant.matieres.map((matiere) => matiere.id)
      )
    )
  );

  console.log(assignedMatiereIds);

  // Filtrer les matières non attribuées pour la création
  const availableMatieres = editingEnseignant
    ? matieres
    : matieres.filter((matiere) => !assignedMatiereIds.includes(matiere.id));

  console.log(availableMatieres);
  console.log("-----------");
  console.log(matieres);

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col md:flex-row md:items-center gap-y-3 mb-3.5">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            Enseignants
          </div>
          <div className="md:ml-auto">
            <Button
              variant="primary"
              className="group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
              onClick={(event: React.MouseEvent) => {
                event.preventDefault();
                setHeaderFooterModalPreview(true);
                setSelectMatieres([]);
              }}
            >
              <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
              Ajouter un enseignant
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
                  placeholder="Rechercher un enseignant"
                  className="pl-9 sm:w-64 rounded-[0.5rem]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <TomSelect
                value={selectedFiliereId}
                onChange={(e) => setSelectedFiliereId(e.target.value)}
                options={{
                  placeholder: "Sélectionner une filière",
                }}
                className="sm:w-48"
              >
                <option value="">Toutes les filières</option>
                {filieres.map((filiere) => (
                  <option key={filiere.id} value={filiere.id}>
                    {filiere.nom}
                  </option>
                ))}
              </TomSelect>
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
                    Nom et prénom
                  </Table.Td>
                  <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Téléphone
                  </Table.Td>
                  <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Matières enseignées
                  </Table.Td>
                  <Table.Td className="py-4 font-medium text-center border-t w-36 bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Action
                  </Table.Td>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredEnseignants.map((enseignant) => (
                  <Table.Tr
                    key={enseignant.id}
                    className="[&_td]:last:border-b-0"
                  >
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <FormCheck.Input type="checkbox" />
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="font-medium whitespace-nowrap">
                        {enseignant.nom} {enseignant.prenom}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                        {enseignant.tel}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="text-slate-500 text-xs mt-0.5 max-w-xs">
                        <ul className="list-disc pl-4">
                          {enseignant.enseignant.matieres.map((matiere) => (
                            <li key={matiere.id}>{matiere.nom}</li>
                          ))}
                        </ul>
                      </div>
                    </Table.Td>
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
                              onClick={() => handleUpdateClick(enseignant)}
                            >
                              <Lucide
                                icon="CheckSquare"
                                className="w-4 h-4 mr-2"
                              />
                              Modifier
                            </Menu.Item>
                            <Menu.Item
                              className="text-danger"
                              onClick={() => handleDeleteClick(enseignant.id)}
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
          setSelectedEnseignantId(null);
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
              Voulez-vous vraiment supprimer cet enseignant ? <br />
              Cette action est irréversible.
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setDeleteModalPreview(false);
                setSelectedEnseignantId(null);
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
          setEditingEnseignant(null);
          reset();
        }}
        initialFocus={sendButtonRef}
      >
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="mr-auto text-base font-medium">
              {editingEnseignant
                ? "Modifier un enseignant"
                : "Ajouter un enseignant"}
            </h2>
          </Dialog.Title>
          <Dialog.Description>
            <form onSubmit={editingEnseignant ? handleConfirmUpdate : onSubmit}>
              <div className="grid grid-cols-12 gap-4 gap-y-3">
                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-nom">Nom</FormLabel>
                  <FormInput
                    {...register("nom")}
                    id="modal-form-nom"
                    type="text"
                    placeholder="Ex: Dupont"
                    name="nom"
                  />
                  {errors.nom && (
                    <div className="mt-2 text-danger">
                      {typeof errors.nom.message === "string" &&
                        errors.nom.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-prenom">Prénom</FormLabel>
                  <FormInput
                    {...register("prenom")}
                    id="modal-form-prenom"
                    type="text"
                    placeholder="Ex: Jean"
                    name="prenom"
                  />
                  {errors.prenom && (
                    <div className="mt-2 text-danger">
                      {typeof errors.prenom.message === "string" &&
                        errors.prenom.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12">
                  <FormLabel htmlFor="modal-form-matiere-ids">
                    Matières enseignées
                  </FormLabel>
                  <TomSelect
                    {...register("matiere_ids")}
                    id="modal-form-matiere-ids"
                    name="matiere_ids"
                    multiple
                    value={selectMatieres}
                    onChange={(e) => {
                      setSelectMatieres(e.target.value);
                    }}
                    options={{
                      placeholder: "Sélectionner les matières",
                    }}
                    className="w-full"
                  >
                    {filieres.map((filiere) => (
                      <optgroup
                        key={`filiere-${filiere.id}`}
                        label={filiere.nom}
                      >
                        {filiere.niveaux.flatMap((niveau) =>
                          availableMatieres
                            .filter(
                              (matiere) => matiere.niveau_id === niveau.id
                            )
                            .map((matiere) => (
                              <option key={matiere.id} value={matiere.id}>
                                {niveau.nom} - {matiere.nom}
                              </option>
                            ))
                        )}
                      </optgroup>
                    ))}
                  </TomSelect>
                  {errors.matiere_ids && (
                    <div className="mt-2 text-danger">
                      {typeof errors.matiere_ids.message === "string" &&
                        errors.matiere_ids.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12">
                  <FormLabel htmlFor="modal-form-email">Email</FormLabel>
                  <FormInput
                    {...register("email")}
                    id="modal-form-email"
                    type="email"
                    placeholder="Ex: jean.dupont@example.com"
                    name="email"
                  />
                  {errors.email && (
                    <div className="mt-2 text-danger">
                      {typeof errors.email.message === "string" &&
                        errors.email.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-date-naissance">
                    Date de naissance
                  </FormLabel>
                  <FormInput
                    {...register("date_naissance")}
                    id="modal-form-date-naissance"
                    type="date"
                    name="date_naissance"
                  />
                  {errors.date_naissance && (
                    <div className="mt-2 text-danger">
                      {typeof errors.date_naissance.message === "string" &&
                        errors.date_naissance.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <FormLabel htmlFor="modal-form-sexe">Sexe</FormLabel>
                  <TomSelect
                    {...register("sexe")}
                    id="modal-form-sexe"
                    name="sexe"
                    value={getValues("sexe") || ""}
                    onChange={(e) => setValue("sexe", e.target.value)}
                    options={{
                      placeholder: "Sélectionner le sexe",
                    }}
                    className="w-full"
                  >
                    <option value=""></option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </TomSelect>
                  {errors.sexe && (
                    <div className="mt-2 text-danger">
                      {typeof errors.sexe.message === "string" &&
                        errors.sexe.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12">
                  <FormLabel htmlFor="modal-form-tel">Téléphone</FormLabel>
                  <FormInput
                    {...register("tel")}
                    id="modal-form-tel"
                    type="text"
                    placeholder="Ex: +33612345678"
                    name="tel"
                  />
                  {errors.tel && (
                    <div className="mt-2 text-danger">
                      {typeof errors.tel.message === "string" &&
                        errors.tel.message}
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
                    setEditingEnseignant(null);
                    reset();
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
                    editingEnseignant ? (
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

      <Notification id="success-notification-content" className="flex">
        <Lucide icon="CheckCircle" className="text-success" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Opération réussie !</div>
          <div className="mt-1 text-slate-500">
            L'enseignant a été {editingEnseignant ? "modifié" : "ajouté"} avec
            succès.
          </div>
        </div>
      </Notification>
      <Notification id="failed-notification-content" className="flex">
        <Lucide icon="XCircle" className="text-danger" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Échec de l'opération !</div>
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
