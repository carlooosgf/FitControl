import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { auth } from "./src/firebase/firebaseConfig";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import RecuperarContraseña from "./src/screens/RecuperarContraseña";
import BottomTabs from "./src/navigation/BottomTabs";
import ChatScreen from "./src/screens/ChatScreen";
import DetalleSocioScreen from "./src/screens/DetalleSocioScreen";
import CrearClaseScreen from "./src/screens/CrearClaseScreen";
import HistorialPagosScreen from "./src/screens/HistorialPagosScreen";
import EstadisticasScreen from "./src/screens/EstadisticasScreen";
import HistorialPagosClienteScreen from "./src/screens/HistorialPagosCliente";

const Stack = createNativeStackNavigator();

export default function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("🟢 Cambio de sesión detectado:", user?.email);
      setUsuario(user);
      setCargando(false);
    });
    return unsubscribe;
  }, []);

  if (cargando) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#D00000" />
      </View>
    );
  }

 return (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!usuario ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="RecuperarContraseña"
            component={RecuperarContraseña}
          />
        </>
      ) : usuario.rol === null ? (
        // 🕐 Mostrar un spinner mientras se carga el rol
        <Stack.Screen
          name="Loading"
          component={() => (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#D00000" />
            </View>
          )}
        />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={BottomTabs} />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerShown: true }}
          />
          <Stack.Screen name="DetalleSocio" component={DetalleSocioScreen} />
          <Stack.Screen name="CrearClase" component={CrearClaseScreen} />
          <Stack.Screen name="HistorialPagos" component={HistorialPagosScreen} />
          <Stack.Screen name="Estadisticas" component={EstadisticasScreen} />
          <Stack.Screen
            name="HistorialPagosCliente"
            component={HistorialPagosClienteScreen}
          />
        </>
      )}
    </Stack.Navigator>
  </NavigationContainer>
);

}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F110C",
  },
});
