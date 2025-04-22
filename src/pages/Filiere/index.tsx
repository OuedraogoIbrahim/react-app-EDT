import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { useEffect, useState, useRef } from "react";
import {
  getFilieres,
  addFiliere,
  updateFiliere,
  deleteFiliere,
} from "@/services/filieres";
import LoadingIcon from "@/components/Base/LoadingIcon";
import Notification from "@/components/Base/Notification";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Toastify from "toastify-js";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";

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

function Main() {
  // Validation schema avec Yup
  const schema = yup
    .object({
      nom: yup
        .string()
        .required("Le nom de la filière est requis")
        .min(2, "Le nom doit contenir au moins 2 caractères"),
      description: yup
        .string()
        .required("La description est requise")
        .min(4, "La description doit contenir au moins 10 caractères"),
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

  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [filteredFilieres, setFilteredFilieres] = useState<Filiere[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFiliere, setSelectedFiliere] = useState<Filiere | null>(null);
  const [staticBackdropModalPreview, setStaticBackdropModalPreview] =
    useState(false);
  const [deleteModalPreview, setDeleteModalPreview] = useState(false);
  const [headerFooterModalPreview, setHeaderFooterModalPreview] =
    useState(false);
  const [selectedFiliereId, setSelectedFiliereId] = useState<number | null>(
    null
  );
  const [editingFiliere, setEditingFiliere] = useState<Filiere | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const sendButtonRef = useRef(null);

  useEffect(() => {
    const fetchFilieres = async () => {
      setLoading(true);
      try {
        const filieresData = await getFilieres();
        setFilieres(filieresData);
        setFilteredFilieres(filieresData);
      } catch (error) {
        console.error("Erreur lors du chargement des filières:", error);
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
    };
    fetchFilieres();
  }, []);

  useEffect(() => {
    setFilteredFilieres(
      filieres.filter((filiere) =>
        filiere.nom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, filieres]);

  const handleViewNiveaux = (filiere: Filiere) => {
    setSelectedFiliere(filiere);
    setStaticBackdropModalPreview(true);
  };

  const handleAddClick = () => {
    setEditingFiliere(null);
    reset();
    setHeaderFooterModalPreview(true);
  };

  const handleUpdateClick = (filiere: Filiere) => {
    setEditingFiliere(filiere);
    reset({
      nom: filiere.nom,
      description: filiere.description,
    });
    setHeaderFooterModalPreview(true);
  };

  const handleConfirmUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (editingFiliere) {
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
          const updatedFiliere = await updateFiliere(editingFiliere.id, {
            nom: formData.nom,
            description: formData.description,
          });
          setFilieres(
            filieres.map((filiere) =>
              filiere.id === updatedFiliere.id ? updatedFiliere : filiere
            )
          );
          setFilteredFilieres(
            filteredFilieres.map((filiere) =>
              filiere.id === updatedFiliere.id ? updatedFiliere : filiere
            )
          );
          setHeaderFooterModalPreview(false);
          setEditingFiliere(null);
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
          console.error("Erreur lors de la modification de la filière:", error);
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

  const handleDeleteClick = (filiereId: number) => {
    setSelectedFiliereId(filiereId);
    setDeleteModalPreview(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedFiliereId !== null) {
      setLoading(true);
      try {
        await deleteFiliere(selectedFiliereId);
        setFilieres(
          filieres.filter((filiere) => filiere.id !== selectedFiliereId)
        );
        setFilteredFilieres(
          filteredFilieres.filter((filiere) => filiere.id !== selectedFiliereId)
        );
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
        console.error("Erreur lors de la suppression de la filière:", error);
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
    setDeleteModalPreview(false);
    setSelectedFiliereId(null);
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
        const newFiliere = await addFiliere({
          nom: formData.nom,
          description: formData.description,
        });
        setFilieres([...filieres, newFiliere]);
        setFilteredFilieres([...filteredFilieres, newFiliere]);
        setHeaderFooterModalPreview(false);
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
        console.error("Erreur lors de l'ajout de la filière:", error);
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
      {/* Main Content */}
      <div className="col-span-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-y-3 mb-3.5">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            Filières
          </div>
          <div className="md:ml-auto">
            <Button
              variant="primary"
              className="group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
              onClick={handleAddClick}
            >
              <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
              Ajouter une filière
            </Button>
          </div>
        </div>

        {/* Search and Table Section */}
        <div className="flex flex-col box box--stacked">
          {/* Search Bar */}
          <div className="p-5">
            <div className="relative">
              <Lucide
                icon="Search"
                className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
              />
              <FormInput
                type="text"
                placeholder="Rechercher une filière"
                className="pl-9 sm:w-64 rounded-[0.5rem]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
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
                    Description
                  </Table.Td>
                  <Table.Td className="py-4 font-medium text-center border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Total niveaux
                  </Table.Td>
                  <Table.Td className="py-4 font-medium text-center border-t w-36 bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Action
                  </Table.Td>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredFilieres.map((filiere) => (
                  <Table.Tr key={filiere.id} className="[&_td]:last:border-b-0">
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <FormCheck.Input type="checkbox" />
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="font-medium whitespace-nowrap">
                        {filiere.nom}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                        {filiere.description}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="whitespace-nowrap text-center">
                        {filiere.niveaux.length}
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
                              onClick={() => handleUpdateClick(filiere)}
                            >
                              <Lucide
                                icon="CheckSquare"
                                className="w-4 h-4 mr-2"
                              />
                              Modifier
                            </Menu.Item>
                            <Menu.Item
                              className="text-danger"
                              onClick={() => handleDeleteClick(filiere.id)}
                            >
                              <Lucide icon="Trash2" className="w-4 h-4 mr-2" />
                              Supprimer
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => handleViewNiveaux(filiere)}
                            >
                              <Lucide icon="Eye" className="w-4 h-4 mr-2" />
                              Voir les niveaux
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

      {/* Modal for Viewing Niveaux */}
      <Dialog
        staticBackdrop
        open={staticBackdropModalPreview}
        onClose={() => setStaticBackdropModalPreview(false)}
      >
        <Dialog.Panel className="px-5 py-10">
          <div className="text-center">
            <h2 className="text-lg font-medium">
              Niveaux de {selectedFiliere?.nom}
            </h2>
            <ul className="mt-4">
              {selectedFiliere?.niveaux.map((niveau) => (
                <li key={niveau.id} className="text-base">
                  {niveau.nom}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="primary"
              onClick={() => setStaticBackdropModalPreview(false)}
              className="w-24 mt-5"
            >
              Ok
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Modal for Adding/Editing Filiere */}
      <Dialog
        open={headerFooterModalPreview}
        onClose={() => {
          setHeaderFooterModalPreview(false);
          setEditingFiliere(null);
          reset();
        }}
        initialFocus={sendButtonRef}
      >
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="mr-auto text-base font-medium">
              {editingFiliere ? "Modifier une filière" : "Ajouter une filière"}
            </h2>
          </Dialog.Title>
          <Dialog.Description>
            <form onSubmit={editingFiliere ? handleConfirmUpdate : onSubmit}>
              <div className="grid grid-cols-12 gap-4 gap-y-3">
                <div className="col-span-12">
                  <FormLabel htmlFor="modal-form-nom">
                    Nom de la filière
                  </FormLabel>
                  <FormInput
                    {...register("nom")}
                    id="modal-form-nom"
                    type="text"
                    placeholder="Ex: Informatique"
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
                    placeholder="Description de la filière"
                    name="description"
                  />
                  {errors.description && (
                    <div className="mt-2 text-danger">
                      {typeof errors.description.message === "string" &&
                        errors.description.message}
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
                    setEditingFiliere(null);
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
                    editingFiliere ? (
                      "Modifier"
                    ) : (
                      "Ajouter"
                    )
                  ) : (
                    <LoadingIcon
                      icon="tail-spin"
                      color="white"
                      className="w-8 h-8"
                    />
                  )}
                </Button>
              </div>
            </form>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalPreview}
        onClose={() => {
          setDeleteModalPreview(false);
          setSelectedFiliereId(null);
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
              Voulez-vous vraiment supprimer cette filière ? <br />
              Cette action est irréversible.
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setDeleteModalPreview(false);
                setSelectedFiliereId(null);
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
                <LoadingIcon
                  icon="tail-spin"
                  color="white"
                  className="w-8 h-8"
                />
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
            La filière a été {editingFiliere ? "modifiée" : "ajoutée"} avec
            succès.
          </div>
        </div>
      </Notification>
      <Notification id="failed-notification-content" className="flex hidden">
        <Lucide icon="XCircle" className="text-danger" />
        <div className="ml-4 mr-4">
          <div className="font-medium">Échec de l'opération !</div>
          <div className="mt-1 text-slate-500">
            Veuillez vérifier les champs du formulaire ou réessayer.
          </div>
        </div>
      </Notification>

      {/* Loading Overlay */}
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
