import "@/assets/css/pages/landing-page.css";
import Lucide from "@/components/Base/Lucide";
import { Menu } from "@/components/Base/Headless";
import { FormInput } from "@/components/Base/Form";
import {
  setColorScheme,
  colorSchemes,
  ColorSchemes,
} from "@/stores/colorSchemeSlice";
import { selectColorScheme } from "@/stores/colorSchemeSlice";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { Link } from "react-router-dom";
import Tippy from "@/components/Base/Tippy";
import Button from "@/components/Base/Button";
import { useState } from "react";
import clsx from "clsx";

function Main() {
  const dispatch = useAppDispatch();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [topBarActive, setTopBarActive] = useState(false);
  const [showcaseActive, setShowcaseActive] = useState(true);
  const activeColorScheme = useAppSelector(selectColorScheme);
  const [tempActiveColorScheme, setTempActiveColorScheme] =
    useState(activeColorScheme);

  const setColorSchemeClass = () => {
    const el = document.querySelectorAll("html")[0];
    el.setAttribute("class", activeColorScheme);
  };

  const switchColor = (colorScheme: ColorSchemes) => {
    setTempActiveColorScheme(colorScheme);
    setTimeout(() => {
      dispatch(setColorScheme(colorScheme));
    }, 500);
    localStorage.setItem("colorScheme", colorScheme);
    setColorSchemeClass();
  };

  const scrollTo = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetId = (e.target as HTMLElement).getAttribute("data-link");
    const el = document.getElementById(
      targetId !== null ? targetId.slice(1) : ""
    );
    if (el !== null) {
      window.scroll({
        behavior: "smooth",
        left: 0,
        top: el.offsetTop - 140,
      });
    }
  };

  setColorSchemeClass();

  window.onscroll = () => {
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      setTopBarActive(true);
    } else {
      setTopBarActive(false);
    }
    if (
      document.body.scrollTop > 100 ||
      document.documentElement.scrollTop > 100
    ) {
      setShowcaseActive(false);
    } else {
      setShowcaseActive(true);
    }
  };

  return (
    <div
      className={clsx([
        "landing-page relative",
        "before:content-[''] before:w-screen before:h-screen before:fixed before:bg-slate-100 before:z-[-1]",
        !showcaseActive && "landing-page--scrolled",
      ])}
    >
      <div
        className={clsx([
          "relative group background overflow-x-hidden scroll-smooth",
          "before:content-[''] before:w-screen before:h-screen before:rounded-[0_0_50%] [&.background--hidden]:before:from-slate-100 [&.background--hidden]:before:to-transparent before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 before:absolute before:z-[-1] before:transition-colors before:ease-in-out before:duration-300",
          topBarActive && "background--hidden",
        ])}
      >
        <div className="container fixed inset-x-0 z-50 px-5 mx-auto xl:px-0">
          <div
            className={clsx([
              "relative flex items-center h-16 w-full mt-5 px-5",
              "before:content-[''] before:inset-0 before:box before:absolute before:opacity-0 before:border-0 before:bg-gradient-to-r before:from-theme-1 before:to-theme-2 before:rounded-xl",
              "group-[.background--hidden]:before:opacity-100",
              "after:content-[''] after:z-[-1] after:inset-x-4 after:shadow-sm after:opacity-0 after:h-full after:bg-primary/5 after:border after:border-primary/10 after:absolute after:rounded-lg after:mx-auto after:top-0 after:mt-3 after:dark:bg-darkmode-600/70 after:dark:border-darkmode-500/60",
              "group-[.background--hidden]:after:opacity-100",
            ])}
          >
            <a className="relative z-10 flex items-center lg:mr-14" href="">
              {/* <div className="flex items-center justify-center w-[34px] rounded-lg h-[34px] bg-white/10 border-white/10 border">
                <Lucide icon="Settings" className="w-5 h-5 text-white" />
              </div> */}
              <div className="font-medium text-white ml-3.5 text-lg">
                Planify
              </div>
            </a>
            <div
              className={clsx([
                "main-menu [&.main-menu--show]:flex hidden fixed inset-0 md:flex flex-col items-center justify-center flex-1 gap-5 text-xl text-white md:text-sm md:relative md:flex-row lg:gap-10 bg-gradient-to-b from-theme-1 to-theme-2/90 md:bg-none",
                { "main-menu--show": showMobileMenu },
              ])}
            >
              {/* <a
                onClick={(e) => {
                  scrollTo(e);
                  setShowMobileMenu(!showMobileMenu);
                }}
                data-link="#fonctionnalites"
                className="cursor-pointer"
              >
                Fonctionnalités
              </a>
              <a
                onClick={(e) => {
                  scrollTo(e);
                  setShowMobileMenu(!showMobileMenu);
                }}
                data-link="#filieres"
                className="cursor-pointer"
              >
                Filières
              </a>
              <a
                onClick={(e) => {
                  scrollTo(e);
                  setShowMobileMenu(!showMobileMenu);
                }}
                data-link="#contact"
                className="cursor-pointer"
              >
                Contact
              </a> */}
            </div>
            <div className="flex gap-2.5 relative ml-auto md:ml-0">
              <Button
                as="a"
                href="/login"
                rounded
                className="hidden px-5 text-white md:block bg-white/10 border-white/10"
              >
                <span className="hidden lg:block">Se connecter</span>
                <Lucide icon="LogIn" className="w-4 h-4 lg:hidden" />
              </Button>
              <Button
                rounded
                className="px-5 text-white bg-white/10 border-white/10 md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? (
                  <Lucide icon="X" className="w-4 h-4" />
                ) : (
                  <Lucide icon="AlignJustify" className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="container relative z-10 pt-40">
          <div className="flex flex-col items-center gap-56 mb-40">
            <div className="flex flex-col items-center">
              <div className="text-5xl leading-[1.2] text-center text-white group-[.background--hidden]:text-slate-600 font-medium">
                Gérez les emplois du temps
                <div>avec Planify</div>
              </div>
              <div className="mt-4 text-lg leading-[1.75] text-center text-white/70 group-[.background--hidden]:text-slate-600/70 px-10 md:px-0">
                Planify offre aux administrateurs de l'IBAM une plateforme
                centralisée pour organiser les emplois du temps des filières,
                avec une interface intuitive et efficace.
              </div>
              <Link to="/login">
                <Button
                  rounded
                  className="zoom-in px-7 py-3 mt-8 text-white bg-white/10 border-white/10 group-[.background--hidden]:bg-primary group-[.background--hidden]:border-primary text-[0.94rem]"
                >
                  Découvrir Planify
                </Button>
              </Link>
              <div className="grid w-full gap-5 px-5 sm:px-24 lg:px-20 lg:grid-cols-3 landing-page__showcase">
                <div className="flex flex-col gap-7">
                  <div className="p-5 box box--stacked">
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-r from-theme-1 to-theme-2">
                        <Lucide icon="Table" className="w-16 h-16 text-white" />
                      </div>
                      <div className="mt-4 text-base font-medium">
                        Gestion centralisée
                      </div>
                      <div className="text-slate-500 mt-0.5 text-center">
                        Créez et modifiez les emplois du temps des filières en
                        un seul endroit.
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        rounded
                        className="w-full mt-5"
                      >
                        Gérer les emplois
                      </Button>
                    </div>
                  </div>
                  <div className="p-5 box box--stacked">
                    <div className="relative">
                      <FormInput
                        type="text"
                        className="pr-11"
                        rounded
                        placeholder="Rechercher un cours..."
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-11">
                        <Lucide
                          icon="Search"
                          className="stroke-[1.3] w-4 h-4 text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col mt-3.5 gap-2">
                      {[
                        { name: "Mathématiques", filiere: "Informatique" },
                        { name: "Physique", filiere: "Génie" },
                        { name: "Économie", filiere: "Gestion" },
                        { name: "Biologie", filiere: "Sciences de la vie" },
                      ].map((cours, key) => (
                        <div
                          className="hover:bg-slate-50 transition-all rounded-lg cursor-pointer px-2 -mx-2 py-1.5 flex items-center gap-3.5"
                          key={key}
                        >
                          <div>
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                              <Lucide
                                icon="Book"
                                className="w-5 h-5 text-primary"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{cours.name}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {cours.filiere}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col lg:-mt-10 gap-7">
                  <div className="p-5 box box--stacked">
                    <div className="flex flex-col items-center my-1">
                      <div
                        className={clsx([
                          "relative flex items-center justify-center rounded-full w-48 h-48 bg-gradient-to-r from-slate-100 via-theme-1 to-theme-2",
                          "before:content-[''] before:w-1.5 before:h-2 before:absolute before:bg-white before:inset-y-0 before:my-auto before:right-0",
                          "after:content-[''] after:w-2 after:h-1.5 after:absolute after:bg-white after:inset-x-0 after:mx-auto after:top-0",
                        ])}
                      >
                        <div className="bg-white rounded-full w-[97%] h-[97%] ml-0.5 mb-0.5 flex items-center justify-center">
                          <Lucide
                            icon="Building"
                            className="w-32 h-32 text-primary"
                          />
                        </div>
                        <Tippy
                          as="a"
                          className="absolute bottom-0 flex items-center justify-center w-12 h-12 -mb-5 border border-transparent rounded-full box bg-gradient-to-b from-theme-1/90 to-theme-2/90"
                          content="Voir"
                        >
                          <Lucide
                            icon="Eye"
                            className="w-5 h-5 stroke-[0.9] text-white fill-white/5 -mr-1"
                          />
                        </Tippy>
                      </div>
                      <div className="mt-10 text-base font-medium">
                        Gestion des filières
                      </div>
                      <div className="text-slate-500 mt-1.5 text-center mx-5">
                        Organisez les emplois du temps pour Informatique, Génie,
                        Gestion et Sciences de la vie.
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        rounded
                        className="w-full mt-5"
                      >
                        Configurer les filières
                      </Button>
                    </div>
                  </div>
                  <div className="p-5 box box--stacked">
                    <div className="flex flex-col items-center pb-8 mb-5 border-b border-dashed">
                      <div className="max-w-[17rem] text-base font-medium truncate">
                        Conflits d'horaires
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Vérifiez et résolvez les conflits rapidement
                      </div>
                      <div className="flex items-center gap-4 mt-8">
                        <div className="text-[2.1rem] font-medium opacity-90">
                          2 alertes
                        </div>
                      </div>
                    </div>
                    <div
                      className={clsx([
                        "flex flex-col gap-5 relative",
                        "before:content-[''] before:w-px before:h-full before:absolute before:bg-slate-200 before:ml-5",
                      ])}
                    >
                      <div className="flex items-center gap-3.5 relative z-10">
                        <div>
                          <div className="flex items-center justify-center w-10 h-10 border-2 rounded-full bg-primary/90 border-slate-200/70">
                            <Lucide
                              icon="AlertTriangle"
                              className="w-4 h-4 text-white fill-white/10"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium truncate max-w-[15rem]">
                            Conflit : Salle A102
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Informatique, 10h-12h
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-7">
                  <div className="p-5 box box--stacked">
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-r from-theme-1 to-theme-2">
                        <Lucide
                          icon="Smartphone"
                          className="w-16 h-16 text-white"
                        />
                      </div>
                      <div className="mt-4 text-base font-medium">
                        Accès mobile
                      </div>
                      <div className="text-slate-500 mt-0.5 text-center">
                        Les étudiants et enseignants consultent les emplois via
                        l'application mobile.
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        rounded
                        className="w-full mt-5"
                      >
                        En savoir plus
                      </Button>
                    </div>
                  </div>
                  <div className="p-1 box box--stacked">
                    <div className="flex items-center gap-3.5 bg-gradient-to-r from-theme-2/[0.85] to-theme-1/[0.85] p-4 rounded-lg">
                      <div>
                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 border-[3px] border-white/20">
                          <Lucide icon="Bell" className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-base font-medium text-white">
                          Mise à jour
                        </div>
                        <div className="text-slate-500 mt-0.5 text-white/80">
                          Nouveau cours ajouté pour Génie.
                        </div>
                        <div className="mt-1 text-white/80">
                          {new Date().toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full px-10 -mt-24 sm:px-20">
              <div className="p-1 box box--stacked">
                <div
                  className={clsx([
                    "relative px-10 sm:px-20 py-20 overflow-hidden bg-gradient-to-b from-theme-1 to-theme-2 rounded-[0.6rem]",
                  ])}
                >
                  <div className="relative z-10 text-center lg:w-96 mx-auto">
                    <div className="text-xl font-medium text-white">
                      Pourquoi choisir Planify ?
                    </div>
                    <div className="mt-4 text-base leading-relaxed text-white/70">
                      Planify permet aux administrateurs de l'IBAM de gérer
                      efficacement les emplois du temps des filières, avec des
                      outils puissants pour organiser, vérifier et publier les
                      horaires.
                    </div>
                    <Link to="/login">
                      <Button
                        variant="primary"
                        rounded
                        className="px-8 py-2.5 mt-7 bg-white/5 border-white/[0.15]"
                      >
                        Commencer maintenant
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
