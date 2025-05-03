import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { icons } from "@/components/Base/Lucide";

export interface Menu {
  icon: keyof typeof icons;
  title: string;
  badge?: number;
  pathname?: string;
  subMenu?: Menu[];
  ignore?: boolean;
}

export interface SideMenuState {
  menu: Array<Menu | string>;
}

const initialState: SideMenuState = {
  menu: [
    "Tableau de bord",
    {
      icon: "GaugeCircle",
      pathname: "/dashboard",
      title: "Tableau de bord",
    },
    
    "Pages",
    {
      icon: "BookOpen",
      pathname: "/filieres",
      title: "Filières",
    },
    {
      icon: "Layers",
      pathname: "/niveaux",
      title: "Niveaux",
    },
    {
      icon: "Book",
      pathname: "/matieres",
      title: "Matières",
    },
    {
      icon: "Calendar",
      pathname: "/emploi-du-temps",
      title: "Emploi du Temps",
    },
    // {
    //   icon: "Clock",
    //   pathname: "/provisoire",
    //   title: "Emploi du temps provisoire",
    // },
    {
      icon: "Users",
      pathname: "/professeurs",
      title: "Gestion des professeurs",
    },
    {
      icon: "Building",
      pathname: "/salles",
      title: "Gestion des salles",
    }
 
  ],
};

export const sideMenuSlice = createSlice({
  name: "sideMenu",
  initialState,
  reducers: {},
});

export const selectSideMenu = (state: RootState) => state.sideMenu.menu;

export default sideMenuSlice.reducer;
