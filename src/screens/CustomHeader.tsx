import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  Login: undefined;
  // Agrega aquí otros nombres de rutas si es necesario
};

export function CustomHeader() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fecha = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            await signOut(auth);
          } catch (e) {
            Alert.alert("Error al cerrar sesión");
            console.error(e);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.header}>
      <Text style={styles.fecha}>
        {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
      </Text>
      <TouchableOpacity onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#B0B3BB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "black",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  fecha: {
    color: "#D00000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
