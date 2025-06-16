import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { auth } from "../firebase/firebaseConfig";
import { globalStyles } from "../theme/estilos"; // ajusta la ruta si es necesario


export default function HomeScreen({ navigation }: any) {
  const logout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  return (
    <View style={globalStyles.container}>
      <Text style={styles.title}>👋 ¡Bienvenido a FitControl!</Text>
      <Text style={styles.subtitle}>¿Qué quieres gestionar hoy?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Ir a Gestión de Socios")}
      >
        <Text style={styles.buttonText}>👥 Gestión de Socios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Ir a Pagos")}
      >
        <Text style={styles.buttonText}>💸 Pagos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Ir a Chat")}
      >
        <Text style={styles.buttonText}>💬 Chat con clientes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#f44336" }]}
        onPress={logout}
      >
        <Text style={styles.buttonText}>🚪 Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 30 },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});
