import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import {
  FormCheck,
  FormInput,
  FormLabel,
  FormTextarea,
  FormSelect,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Table from "@/components/Base/Table";
import { useEffect, useState, useRef } from "react";
import {
  getSalles,
  addSalle,
  updateSalle,
  deleteSalle,
} from "@/services/salles";
import LoadingIcon from "@/components/Base/LoadingIcon";
import Notification from "@/components/Base/Notification";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Toastify from "toastify-js";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface Salle {
  id: number;
  nom: string;
  description: string | null;
  capacite: number;
}

function Main() {
  const schema = yup
    .object({
      nom: yup
        .string()
        .required("Le nom de la salle est requis")
        .min(2, "Le nom doit contenir au moins 2 caractères"),
      description: yup.string(),
      capacite: yup
        .number()
        .required("La capacité est requise")
        .min(1, "La capacité doit être supérieure à 0"),
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

  const [salles, setSalles] = useState<Salle[]>([]);
  const [filteredSalles, setFilteredSalles] = useState<Salle[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteModalPreview, setDeleteModalPreview] = useState(false);
  const [headerFooterModalPreview, setHeaderFooterModalPreview] =
    useState(false);
  const [selectedSalleId, setSelectedSalleId] = useState<number | null>(null);
  const [editingSalle, setEditingSalle] = useState<Salle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const sendButtonRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const sallesData = await getSalles();
        setSalles(sallesData);
        setFilteredSalles(sallesData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
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
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredSalles(
      salles.filter((salle) => {
        const matchesSearch = salle.nom
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
    );
  }, [searchTerm, salles]);

  const handleAddClick = async () => {
    setEditingSalle(null);
    reset();
    setHeaderFooterModalPreview(true);
  };

  const handleUpdateClick = async (salle: Salle) => {
    setEditingSalle(salle);
    reset({
      nom: salle.nom,
      description: salle.description || "",
      capacite: salle.capacite,
    });
    setHeaderFooterModalPreview(true);
  };

  const handleConfirmUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (editingSalle) {
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
          const updatedSalle = await updateSalle(editingSalle.id, {
            nom: formData.nom,
            description: formData.description,
            capacite: formData.capacite,
          });
          setSalles(
            salles.map((salle) =>
              salle.id === updatedSalle.id ? updatedSalle : salle
            )
          );
          setFilteredSalles(
            filteredSalles.map((salle) =>
              salle.id === updatedSalle.id ? updatedSalle : salle
            )
          );
          setHeaderFooterModalPreview(false);
          setEditingSalle(null);
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
          console.error("Erreur lors de la modification de la salle:", error);
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

  const handleDeleteClick = (salleId: number) => {
    setSelectedSalleId(salleId);
    setDeleteModalPreview(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedSalleId !== null) {
      setLoading(true);
      try {
        await deleteSalle(selectedSalleId);
        setSalles(salles.filter((salle) => salle.id !== selectedSalleId));
        setFilteredSalles(
          filteredSalles.filter((salle) => salle.id !== selectedSalleId)
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
        console.error("Erreur lors de la suppression de la salle:", error);
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
    setSelectedSalleId(null);
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
        const newSalle = await addSalle({
          nom: formData.nom,
          description: formData.description,
          capacite: formData.capacite,
        });
        setSalles([...salles, newSalle]);
        setFilteredSalles([...filteredSalles, newSalle]);
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
        console.error("Erreur lors de l'ajout de la salle:", error);
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
            Salles
          </div>
          <div className="md:ml-auto">
            <Button
              variant="primary"
              className="group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
              onClick={handleAddClick}
            >
              <Lucide icon="PenLine" className="stroke-[1.3] w-4 h-4 mr-2" />
              Ajouter une salle
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col box box--stacked">
          {/* Search Bar and Filter */}
          <div className="p-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Lucide
                icon="Search"
                className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
              />
              <FormInput
                type="text"
                placeholder="Rechercher une salle"
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
                  <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Capacité
                  </Table.Td>
                  <Table.Td className="py-4 font-medium text-center border-t w-36 bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                    Action
                  </Table.Td>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredSalles.map((salle) => (
                  <Table.Tr key={salle.id} className="[&_td]:last:border-b-0">
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <FormCheck.Input type="checkbox" />
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="font-medium whitespace-nowrap">
                        {salle.nom}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                        {salle.description || "-"}
                      </div>
                    </Table.Td>
                    <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                      <div className="whitespace-nowrap">{salle.capacite}</div>
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
                            <Menu.Item onClick={() => handleUpdateClick(salle)}>
                              <Lucide
                                icon="CheckSquare"
                                className="w-4 h-4 mr-2"
                              />
                              Modifier
                            </Menu.Item>
                            <Menu.Item
                              className="text-danger"
                              onClick={() => handleDeleteClick(salle.id)}
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

      {/* Modal for Adding/Editing Salle */}
      <Dialog
        open={headerFooterModalPreview}
        onClose={() => {
          setHeaderFooterModalPreview(false);
          setEditingSalle(null);
          reset();
        }}
        initialFocus={sendButtonRef}
      >
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="mr-auto text-base font-medium">
              {editingSalle ? "Modifier une salle" : "Ajouter une salle"}
            </h2>
          </Dialog.Title>
          <Dialog.Description>
            <form onSubmit={editingSalle ? handleConfirmUpdate : onSubmit}>
              <div className="grid grid-cols-12 gap-4 gap-y-3">
                <div className="col-span-12">
                  <FormLabel htmlFor="modal-form-nom">
                    Nom de la salle
                  </FormLabel>
                  <FormInput
                    {...register("nom")}
                    id="modal-form-nom"
                    type="text"
                    placeholder="Ex: Salle 101"
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
                    placeholder="Description de la salle"
                    name="description"
                  />
                  {errors.description && (
                    <div className="mt-2 text-danger">
                      {typeof errors.description.message === "string" &&
                        errors.description.message}
                    </div>
                  )}
                </div>

                <div className="col-span-12">
                  <FormLabel htmlFor="modal-form-capacite">Capacité</FormLabel>
                  <FormInput
                    {...register("capacite")}
                    id="modal-form-capacite"
                    type="number"
                    placeholder="Ex: 30"
                    name="capacite"
                  />
                  {errors.capacite && (
                    <div className="mt-2 text-danger">
                      {typeof errors.capacite.message === "string" &&
                        errors.capacite.message}
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
                    setEditingSalle(null);
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
                    editingSalle ? (
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
          setSelectedSalleId(null);
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
              Voulez-vous vraiment supprimer cette salle ? <br />
              Cette action est irréversible.
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setDeleteModalPreview(false);
                setSelectedSalleId(null);
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
            La salle a été {editingSalle ? "modifiée" : "ajoutée"} avec succès.
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
