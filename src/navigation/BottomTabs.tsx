import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeCliente from "../screens/HomeCliente";
import HomeDueno from "../screens/HomeDueno";
import PerfilScreen from "../screens/PerfilScreen";
import SociosScreen from "../screens/ListaSociosScreen";
import ChatScreen from "../screens/ChatScreen";
import ListaEntrenadoresScreen from "../screens/ListaEntrenadoresScreen";
import Clases from "../screens/ListadoClasesScreen"
import ClaseDisponibles from "../screens/ClasesDisponiblesScreen";

import { useUserRol } from "../hooks/useUserRol";
import { CustomHeader } from "../screens/CustomHeader"; // 👈 header con fecha y logout

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const rol = useUserRol(); // cliente | dueno | null

  if (!rol) {
    return null; // o muestra un loader si prefieres
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <CustomHeader />, // 👈 usar header personalizado
        tabBarStyle: {
          backgroundColor: "black", // negro
          borderTopColor: "#696D7D",  // línea superior opcional
          height: 60,
        },
        tabBarActiveTintColor: "red",
        tabBarInactiveTintColor: "#B0B3BB",  // gris claro
        tabBarIcon: ({ color, size }) => {
          let icon = "home-outline";

          if (route.name === "Chat") icon = "chatbubble-ellipses-outline";
          else if (route.name === "Perfil") icon = "person-outline";
          else if (route.name === "Clientes") icon = "people-outline";
          else if (route.name === "Clases") icon = "barbell-outline";

          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      {rol === "cliente" ? (
        <>
          <Tab.Screen name="Inicio" component={HomeCliente} />
          <Tab.Screen name="Chat" component={ListaEntrenadoresScreen} />
          <Tab.Screen name="Clases" component={ClaseDisponibles}/>
        </>
      ) : (
        <>
          <Tab.Screen name="Inicio" component={HomeDueno} />
          <Tab.Screen name="Clases" component={Clases}/>
          <Tab.Screen name="Clientes" component={SociosScreen} />
          
        </>
      )}
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
