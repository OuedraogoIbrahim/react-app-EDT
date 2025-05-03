import Lucide from "@/components/Base/Lucide";
import TinySlider, { TinySliderElement } from "@/components/Base/TinySlider";
import { FormSelect } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Litepicker from "@/components/Base/Litepicker";
import Table from "@/components/Base/Table";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import _ from "lodash";
import { getMatieres } from "@/services/matieres";
import { getFilieres } from "@/services/filieres";
import { getEnseignants } from "@/services/enseignants";
import LoadingIcon from "@/components/Base/LoadingIcon";
import eCommerce from "@/fakers/e-commerce";

interface Matiere {
  id: number;
  nom: string;
  niveau_id: number;
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

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
}

function Main() {
  const [generalReportFilter, setGeneralReportFilter] = useState<string>();
  const sliderRef = useRef<TinySliderElement>();
  const prevImportantNotes = () => {
    sliderRef.current?.tns.goTo("prev");
  };
  const nextImportantNotes = () => {
    sliderRef.current?.tns.goTo("next");
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [matieresData, filieresData, enseignantsData] = await Promise.all(
          [getMatieres(), getFilieres(), getEnseignants()]
        );
        setMatieres(matieresData);
        setFilieres(filieresData);
        setEnseignants(enseignantsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Activités récentes (mock)
  const recentActivities = [
    {
      id: 1,
      action: `Nouvelle matière ajoutée : ${
        matieres[0]?.nom || "Mathématiques"
      }`,
      date: "2025-04-28",
    },
    {
      id: 2,
      action: `Nouvelle filière ajoutée : ${
        filieres[0]?.nom || "Informatique"
      }`,
      date: "2025-04-27",
    },
    {
      id: 3,
      action: `Enseignant ajouté : ${enseignants[0]?.nom || "Dupont"} ${
        enseignants[0]?.prenom || "Jean"
      }`,
      date: "2025-04-26",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingIcon icon="ball-triangle" className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            Rapport Général
          </div>
          {/* <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
            <div className="relative">
              <Lucide
                icon="CalendarCheck2"
                className="absolute group-[.mode--light]:!text-slate-200 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
              />
              <FormSelect className="sm:w-44 rounded-[0.5rem] group-[.mode--light]:bg-chevron-white group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent pl-9 dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box">
                <option value="custom-date">Date personnalisée</option>
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
              </FormSelect>
            </div>
            <div className="relative">
              <Lucide
                icon="Calendar"
                className="absolute group-[.mode--light]:!text-slate-200 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
              />
              <Litepicker
                value={generalReportFilter}
                onChange={(e) => {
                  setGeneralReportFilter(e.target.value);
                }}
                options={{
                  autoApply: false,
                  singleMode: false,
                  numberOfColumns: 2,
                  numberOfMonths: 2,
                  showWeekNumbers: true,
                  dropdowns: {
                    minYear: 1990,
                    maxYear: null,
                    months: true,
                    years: true,
                  },
                }}
                className="pl-9 sm:w-64 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box"
              />
            </div>
          </div> */}
        </div>
        <div className="grid grid-cols-12 gap-5 mt-3.5">
          <div className="col-span-12 p-1 md:col-span-6 2xl:col-span-3 box box--stacked">
            <div className="-mx-1 overflow-hidden h-[244px] [&_.tns-nav]:bottom-auto [&_.tns-nav]:w-auto [&_.tns-nav]:ml-5 [&_.tns-nav]:mt-5 [&_.tns-nav_button]:w-2 [&_.tns-nav_button]:h-2 [&_.tns-nav_button.tns-nav-active]:w-5 [&_.tns-nav_button]:mx-0.5 [&_.tns-nav_button]:bg-white/40 [&_.tns-nav_button.tns-nav-active]:bg-white/70">
              <TinySlider options={{ mode: "gallery", nav: true }}>
                <div className="px-1">
                  <div className="overflow-hidden relative flex flex-col w-full h-full p-5 rounded-[0.5rem] bg-gradient-to-b from-theme-2/90 to-theme-1/[0.85]">
                    <Lucide
                      icon="Medal"
                      className="absolute top-0 right-0 w-36 h-36 -mt-5 -mr-5 text-white/20 fill-white/[0.03] transform rotate-[-10deg] stroke-[0.3]"
                    />
                    <div className="mt-12 mb-9">
                      <div className="text-2xl font-medium leading-snug text-white">
                        Nouvelle fonctionnalité
                        <br />
                        débloquée !
                      </div>
                      <div className="mt-1.5 text-lg text-white/70">
                        Améliorez vos performances !
                      </div>
                    </div>
                    <div className="flex items-center font-medium text-white">
                      Découvrir maintenant
                      <Lucide icon="MoveRight" className="w-4 h-4 ml-1.5" />
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <div className="overflow-hidden relative flex flex-col w-full h-full p-5 rounded-[0.5rem] bg-gradient-to-b from-theme-2/90 to-theme-1/90">
                    <Lucide
                      icon="Database"
                      className="absolute top-0 right-0 w-36 h-36 -mt-5 -mr-5 text-white/20 fill-white/[0.03] transform rotate-[-10deg] stroke-[0.3]"
                    />
                    <div className="mt-12 mb-9">
                      <div className="text-2xl font-medium leading-snug text-white">
                        Restez à jour
                        <br />
                        avec les nouveautés
                      </div>
                      <div className="mt-1.5 text-lg text-white/70">
                        Fonctionnalités et mises à jour !
                      </div>
                    </div>
                    <div className="flex items-center font-medium text-white">
                      Explorer maintenant
                      <Lucide icon="ArrowRight" className="w-4 h-4 ml-1.5" />
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <div className="overflow-hidden relative flex flex-col w-full h-full p-5 rounded-[0.5rem] bg-gradient-to-b from-theme-2/90 to-theme-1/90">
                    <Lucide
                      icon="Gauge"
                      className="absolute top-0 right-0 w-36 h-36 -mt-5 -mr-5 text-white/20 fill-white/[0.03] transform rotate-[-10deg] stroke-[0.3]"
                    />
                    <div className="mt-12 mb-9">
                      <div className="text-2xl font-medium leading-snug text-white">
                        Optimisez
                        <br />
                        votre flux de travail
                      </div>
                      <div className="mt-1.5 text-lg text-white/70">
                        Boostez vos performances !
                      </div>
                    </div>
                    <div className="flex items-center font-medium text-white">
                      Commencer maintenant
                      <Lucide icon="ArrowRight" className="w-4 h-4 ml-1.5" />
                    </div>
                  </div>
                </div>
              </TinySlider>
            </div>
          </div>
          <div className="flex flex-col col-span-12 p-5 md:col-span-6 2xl:col-span-3 box box--stacked">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 border rounded-full border-primary/10 bg-primary/10">
                <Lucide
                  icon="Book"
                  className="w-6 h-6 text-primary fill-primary/10"
                />
              </div>
              <div className="ml-4">
                <div className="text-base font-medium">
                  {filieres.length} Filières
                </div>
                <div className="text-slate-500 mt-0.5">
                  Total des filières académiques
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col col-span-12 p-5 md:col-span-6 2xl:col-span-3 box box--stacked">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 border rounded-full border-success/10 bg-success/10">
                <Lucide
                  icon="BookOpen"
                  className="w-6 h-6 text-success fill-success/10"
                />
              </div>
              <div className="ml-4">
                <div className="text-base font-medium">
                  {matieres.length} Matières
                </div>
                <div className="text-slate-500 mt-0.5">Total des matières</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col col-span-12 p-5 md:col-span-6 2xl:col-span-3 box box--stacked">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 border rounded-full border-warning/10 bg-warning/10">
                <Lucide
                  icon="User"
                  className="w-6 h-6 text-warning fill-warning/10"
                />
              </div>
              <div className="ml-4">
                <div className="text-base font-medium">
                  {enseignants.length} Enseignants
                </div>
                <div className="text-slate-500 mt-0.5">
                  Total des enseignants
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="col-span-12">
        <div className="flex flex-col md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium">Aperçu des Performances</div>
          <div className="flex gap-x-3 gap-y-2 md:ml-auto">
            <Button
              data-carousel="important-notes"
              data-target="prev"
              className="box"
              onClick={prevImportantNotes}
            >
              <div className="flex items-center justify-center w-3.5 h-5">
                <Lucide icon="ChevronLeft" className="w-4 h-4" />
              </div>
            </Button>
            <Button
              data-carousel="important-notes"
              data-target="next"
              className="box"
              onClick={nextImportantNotes}
            >
              <div className="flex items-center justify-center w-3.5 h-5">
                <Lucide icon="ChevronRight" className="w-4 h-4" />
              </div>
            </Button>
          </div>
        </div>
        <div className="mt-3.5 -mx-2.5">
          <TinySlider
            options={{
              autoplay: false,
              controls: false,
              items: 1,
              responsive: {
                640: { items: 2 },
                768: { items: 3 },
                1024: { items: 4 },
                1320: { items: 5 },
              },
            }}
            getRef={(el) => {
              sliderRef.current = el;
            }}
          >
            {eCommerce.fakePerformanceInsights().map((faker, fakerKey) => (
              <div className="px-2.5 pb-3" key={fakerKey}>
                <div className="relative p-5 box box--stacked">
                  <div className="flex items-center">
                    <div
                      className={clsx([
                        "group flex items-center justify-center w-10 h-10 border rounded-full",
                        "[&.primary]:border-primary/10 [&.primary]:bg-primary/10",
                        "[&.success]:border-success/10 [&.success]:bg-success/10",
                        ["primary", "success"][_.random(0, 1)],
                      ])}
                    >
                      <Lucide
                        icon={faker.icon}
                        className={clsx([
                          "w-5 h-5",
                          "group-[.primary]:text-primary group-[.primary]:fill-primary/10",
                          "group-[.success]:text-success group-[.success]:fill-success/10",
                        ])}
                      />
                    </div>
                    <div className="flex ml-auto">
                      <div className="w-8 h-8 image-fit zoom-in">
                        <img
                          alt="Tableau de bord académique"
                          className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                          src={faker.images[0].path}
                        />
                      </div>
                      <div className="w-8 h-8 -ml-3 image-fit zoom-in">
                        <img
                          alt="Tableau de bord académique"
                          className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                          src={faker.images[1].path}
                        />
                      </div>
                      <div className="w-8 h-8 -ml-3 image-fit zoom-in">
                        <img
                          alt="Tableau de bord académique"
                          className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                          src={faker.images[2].path}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-11">
                    <div className="text-base font-medium">{faker.title}</div>
                    <div className="text-slate-500 mt-0.5">
                      {faker.subtitle}
                    </div>
                  </div>
                  <div className="flex items-center pt-4 mt-4 font-medium border-t border-dashed text-primary">
                    {faker.link}
                    <Lucide icon="ArrowRight" className="w-4 h-4 ml-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </TinySlider>
        </div>
      </div>
      <div className="col-span-12">
        <div className="flex flex-col md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium">Activités Récentes</div>
        </div>
        <div className="mt-3.5">
          <Table className="border-b border-slate-200/60">
            <Table.Thead>
              <Table.Tr>
                <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                  Action
                </Table.Td>
                <Table.Td className="py-4 font-medium border-t bg-slate-50 border-slate-200/60 text-slate-500 dark:bg-darkmode-400">
                  Date
                </Table.Td>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recentActivities.map((activity) => (
                <Table.Tr key={activity.id} className="[&_td]:last:border-b-0">
                  <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                    <div className="text-slate-500 text-xs mt-0.5">
                      {activity.action}
                    </div>
                  </Table.Td>
                  <Table.Td className="py-4 border-dashed dark:bg-darkmode-600">
                    <div className="text-slate-500 text-xs mt-0.5">
                      {activity.date}
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div> */}
    </div>
  );
}

export default Main;
