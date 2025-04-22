import "@/assets/css/vendors/full-calendar.css";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { CalendarOptions, EventClickArg, EventInput } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import { useEffect, useState } from "react";
import { addCourse, getCourses } from "@/services/courses";
import FullCalendar from "@fullcalendar/react";
import Button from "../Base/Button";
import { Slideover } from "../Base/Headless";
import LoadingIcon from "../Base/LoadingIcon";
import TomSelect from "../Base/TomSelect";
import { getFilieres } from "@/services/filieres";
import Litepicker from "../Base/Litepicker";
import { FormCheck, FormInput, FormLabel } from "../Base/Form";
import { getSalles } from "@/services/salles";
import { getMatieres } from "@/services/matieres";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Interfaces
interface Cours {
  id: number;
  heure_debut: string;
  heure_fin: string;
  date: string;
  type: string;
  salle: { nom: string; id: number };
  matiere: { nom: string; id: number; niveau_id: number };
  filiere: { nom: string; id: number };
  niveau: { nom: string; id: number; filiere_id: number };
}

interface Filiere {
  id: number;
  nom: string;
  description: string;
  niveaux: { id: number; nom: string; filiere_id: number }[];
}

interface Salle {
  id: number;
  nom: string;
  description: string;
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
  title: string;
  start: string;
  end: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  filiere: string;
  niveau: string;
  salle: string;
  matiere: string;
}

// Schéma de validation avec Yup
const courseSchema = yup
  .object({
    filiere: yup.string().required("La filière est requise"),
    niveau: yup.string().required("Le niveau est requis"),
    matiere: yup.string().required("La matière est requise"),
    salle: yup.string().required("La salle est requise"),
    type: yup
      .string()
      .required("Le type est requis")
      .oneOf(["cours", "devoir", "autre"], "Type invalide"),
    start: yup
      .string()
      .required("La date est requise")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format AAAA-MM-JJ"),
    heure_debut: yup.string().required("L'heure de début est requise"),
    heure_fin: yup.string().required("L'heure de fin est requise"),
  })
  .required();

function Main() {
  const [courses, setCourses] = useState<Cours[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [basicSlideoverPreview, setBasicSlideoverPreview] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState<string>("");
  const [selectedNiveau, setSelectedNiveau] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [niveaux, setNiveaux] = useState<{ id: number; nom: string }[]>([]);
  const [formNiveaux, setFormNiveaux] = useState<{ id: number; nom: string }[]>(
    []
  );
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [filteredMatieres, setFilteredMatieres] = useState<Matiere[]>([]);
  const [date, setDate] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [isFormReady, setIsFormReady] = useState<boolean>(false);

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

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesData, filieresData, sallesData, matieresData] =
          await Promise.all([
            getCourses(),
            getFilieres(),
            getSalles(),
            getMatieres(),
          ]);
        setCourses(coursesData);
        setFilieres(filieresData);
        setSalles(sallesData);
        setMatieres(matieresData);
        setEvents(transformCoursesToEvents(coursesData));
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mise à jour des filtres du calendrier
  useEffect(() => {
    let filteredCourses = courses;

    if (selectedFiliere) {
      const selectedFiliereObj = filieres.find(
        (filiere) => filiere.id.toString() === selectedFiliere
      );
      if (selectedFiliereObj) {
        setNiveaux(selectedFiliereObj.niveaux);
        filteredCourses = courses.filter(
          (course) => course.filiere.id.toString() === selectedFiliere
        );
      } else {
        setNiveaux([]);
      }
    } else {
      setNiveaux([]);
      filteredCourses = courses;
    }

    if (selectedNiveau && selectedFiliere) {
      filteredCourses = filteredCourses.filter(
        (course) => course.niveau.nom === selectedNiveau
      );
    }

    setEvents(transformCoursesToEvents(filteredCourses));

    if (!selectedFiliere) {
      setSelectedNiveau("");
    }
  }, [selectedFiliere, selectedNiveau, courses, filieres]);

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

  // Mise à jour des données du formulaire pour édition ou ajout
  useEffect(() => {
    if (selectedEvent && selectedEvent.start) {
      const filiereId =
        filieres
          .find((f) => f.nom === selectedEvent.extendedProps?.filiere)
          ?.id.toString() || "";
      setValue("title", selectedEvent.title || "");
      setValue("start", selectedEvent.extendedProps?.date);
      setValue("end", selectedEvent.end?.toString().split("T")[0] || "");
      setValue(
        "heure_debut",
        selectedEvent?.extendedProps?.heure_debut || ""
      );
      setValue(
        "heure_fin",
        selectedEvent?.extendedProps?.heure_fin || ""
      );
      setValue("type", selectedEvent.extendedProps?.type || "");
      setValue("filiere", filiereId);
      setValue("niveau", selectedEvent.extendedProps?.niveau || "");
      setValue("salle", selectedEvent.extendedProps?.salle || "");
      setValue("matiere", selectedEvent.extendedProps?.matiere || "");
      // Mettre à jour formNiveaux et filteredMatieres pour l'édition
      const selectedFiliereObj = filieres.find(
        (filiere) => filiere.id.toString() === filiereId
      );
      const niveaux = selectedFiliereObj ? selectedFiliereObj.niveaux : [];
      setFormNiveaux(niveaux);
      const selectedNiveau = niveaux.find(
        (niveau) => niveau.nom === selectedEvent.extendedProps?.niveau
      );
      setFilteredMatieres(
        selectedNiveau
          ? matieres.filter(
              (matiere) => matiere.niveau_id === selectedNiveau.id
            )
          : []
      );
    } else {
      setValue("title", "");
      setValue("start", date || new Date().toISOString().split("T")[0]);
      setValue("end", date || new Date().toISOString().split("T")[0]);
      setValue("heure_debut", "");
      setValue("heure_fin", "");
      setValue("type", "");
      setValue("filiere", selectedFiliere || "");
      setValue("niveau", selectedNiveau || "");
      setValue("salle", "");
      setValue("matiere", "");
      setFormNiveaux([]);
      setFilteredMatieres([]);
    }
  }, [
    selectedEvent,
    date,
    selectedFiliere,
    selectedNiveau,
    filieres,
    matieres,
    setValue,
  ]);

  const transformCoursesToEvents = (courses: Cours[]): EventInput[] => {
    return courses.map((course) => ({
      id: course.id.toString(),
      title: `${course.matiere.nom} - ${course.salle.nom}`,
      start: new Date(`${course.date}T${course.heure_debut}`),
      end: new Date(`${course.date}T${course.heure_fin}`),
      extendedProps: {
        type: course.type,
        filiere: course.filiere.nom,
        niveau: course.niveau.nom,
        salle: course.salle.nom,
        matiere: course.matiere.nom,
        date: course.date,
        heure_debut: course.heure_debut,
        heure_fin: course.heure_fin,
      },
    }));
  };

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedEvent(null);
    setDate(arg.dateStr);
    setBasicSlideoverPreview(true);
  };

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedEvent(arg.event);
    setDate(arg.event.startStr || "");
    setBasicSlideoverPreview(true);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.start || !data.end) return;
    try {
      if (selectedEvent) {
        const updatedEvents = events.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: data.matiere + " - " + data.salle,
                start: new Date(`${data.start}T${data.heure_debut}`),
                end: new Date(`${data.end}T${data.heure_fin}`),
                extendedProps: {
                  type: data.type,
                  filiere:
                    filieres.find((f) => f.id.toString() === data.filiere)
                      ?.nom || "",
                  niveau: data.niveau,
                  salle: data.salle,
                  matiere: data.matiere,
                },
              }
            : event
        );
        setEvents(updatedEvents);
      } else {
        const newEvent: EventInput = {
          id: (Math.random() * 1000).toString(),
          title: data.matiere + " - " + data.salle,
          start: new Date(`${data.start}T${data.heure_debut}`),
          end: new Date(`${data.end}T${data.heure_fin}`),
          extendedProps: {
            type: data.type,
            filiere:
              filieres.find((f) => f.id.toString() === data.filiere)?.nom || "",
            niveau: data.niveau,
            salle: data.salle,
            matiere: data.matiere,
          },
        };
        setEvents([...events, newEvent]);
        await addCourse(data);
      }
      setBasicSlideoverPreview(false);
      reset();
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout/modification de l'événement :",
        error
      );
    }
  };

  const options: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    droppable: true,
    locale: frLocale,
    firstDay: 1,
    buttonText: {
      today: "Aujourd'hui",
      month: "Mois",
      week: "Semaine",
      day: "Jour",
      list: "Liste",
    },
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    initialDate: new Date(),
    navLinks: true,
    editable: true,
    dayMaxEvents: true,
    events,
    eventClick: handleEventClick,
    dateClick: (info) => handleDateClick(info),
  };

  return (
    <div className="full-calendar p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 flex space-x-4">
        <div>
          <TomSelect
            value={selectedFiliere}
            onChange={(e) => setSelectedFiliere(e.target.value)}
            options={{ placeholder: "Filtrer par filière" }}
            className="w-64"
          >
            <option value="">Toutes les filières</option>
            {filieres.map((filiere) => (
              <option key={filiere.id} value={filiere.id.toString()}>
                {filiere.nom}
              </option>
            ))}
          </TomSelect>
        </div>
        <div>
          <TomSelect
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
            options={{ placeholder: "Filtrer par niveau" }}
            className="w-64"
          >
            <option value="">Tous les niveaux</option>
            {niveaux.map((niveau) => (
              <option key={niveau.id} value={niveau.nom}>
                {niveau.nom}
              </option>
            ))}
          </TomSelect>
        </div>
      </div>
      <FullCalendar {...options} />
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
              {selectedEvent ? "Modifier l'événement" : "Ajouter un événement"}
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
                      setValue("matiere", "");
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
                        setValue("matiere", "");
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
                      Matière
                    </FormLabel>
                    <input type="hidden" {...register("matiere")} />
                    <TomSelect
                      value={getValues("matiere") || ""}
                      onChange={(e) => setValue("matiere", e.target.value)}
                      options={{ placeholder: "Sélectionner une matière" }}
                      className="w-full mt-1"
                    >
                      <option value="">Sélectionner</option>
                      {filteredMatieres.map((matiere) => (
                        <option key={matiere.id} value={matiere.nom}>
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
                      <option key={salle.id} value={salle.nom}>
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
                    Date
                  </FormLabel>
                  <Litepicker
                    {...register("start")}
                    value={getValues("start") || ""}
                    onChange={(e: { target: { value: string } }) => {
                      setValue("start", e.target.value);
                      setValue("end", e.target.value);
                    }}
                    options={{
                      autoApply: false,
                      showWeekNumbers: true,
                      lang: "fr-FR",
                      format: "YYYY-MM-DD",
                      firstDay: 1,
                      dropdowns: {
                        minYear: 2024,
                        maxYear: 2027,
                        months: true,
                        years: true,
                      },
                    }}
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                  />
                  {errors.start && (
                    <div className="mt-2 text-red-600 text-sm">
                      {errors.start.message}
                    </div>
                  )}
                </div>

                <div className="p-4 border rounded-md bg-white">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Type
                  </FormLabel>
                  <input type="hidden" {...register("type")} />
                  <TomSelect
                    value={getValues("type") || ""}
                    onChange={(e) => setValue("type", e.target.value)}
                    options={{ placeholder: "Sélectionner un type" }}
                    className="w-full mt-1"
                  >
                    <option value="">Sélectionner</option>
                    <option value="cours">Cours</option>
                    <option value="devoir">Devoir</option>
                    <option value="autre">Autre</option>
                  </TomSelect>
                  {errors.type && (
                    <div className="mt-2 text-red-600 text-sm">
                      {errors.type.message}
                    </div>
                  )}
                </div>

                <div className="p-4 border rounded-md bg-white">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Heure
                  </FormLabel>
                  <div className="mt-2 space-y-2">
                    <FormCheck>
                      <FormCheck.Input
                        id="radio-morning"
                        type="radio"
                        name="time_slot"
                        value="08:00-12:00"
                        checked={getValues("heure_debut") === "08:00:00"}
                        onChange={() => {
                          setValue("heure_debut", "08:00");
                          setValue("heure_fin", "12:00");
                        }}
                      />
                      <FormCheck.Label
                        htmlFor="radio-morning"
                        className="text-gray-600"
                      >
                        08h-12h
                      </FormCheck.Label>
                    </FormCheck>
                    <FormCheck>
                      <FormCheck.Input
                        id="radio-afternoon"
                        type="radio"
                        name="time_slot"
                        value="14:00-18:00"
                        checked={getValues("heure_debut") === "14:00:00"}
                        onChange={() => {
                          setValue("heure_debut", "14:00");
                          setValue("heure_fin", "18:00");
                        }}
                      />
                      <FormCheck.Label
                        htmlFor="radio-afternoon"
                        className="text-gray-600"
                      >
                        14h-18h
                      </FormCheck.Label>
                    </FormCheck>
                  </div>
                  {(errors.heure_debut || errors.heure_fin) && (
                    <div className="mt-2 text-red-600 text-sm">
                      {errors.heure_debut?.message || errors.heure_fin?.message}
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
                  <Button variant="primary" type="submit">
                    {selectedEvent ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </form>
            )}
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>
    </div>
  );
}

export default Main;
