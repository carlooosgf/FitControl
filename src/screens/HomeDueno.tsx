import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const backgroundImage = require("../../assets/bg_dueno.png"); // tu imagen de fondo
const logo = require("../../assets/logo_FitControl.png");

export default function HomeDueno() {
  const [nuevaFrase, setNuevaFrase] = useState("");
  const [ultimaFrase, setUltimaFrase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");

  const navigation = useNavigation<any>();

  const obtenerNombre = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ref = doc(db, "usuarios", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setNombre(snap.data().nombre);
    }
  };

  const cargarFrase = async () => {
    try {
      const ref = doc(db, "frases", "fraseDelDia");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUltimaFrase(snap.data().texto);
      }
    } catch (e) {
      console.error("Error al cargar la frase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFrase();
    obtenerNombre();
  }, []);

  const publicarFrase = async () => {
    if (!nuevaFrase.trim()) {
      Alert.alert("Error", "Escribe una frase antes de publicarla.");
      return;
    }

    try {
      await setDoc(doc(db, "frases", "fraseDelDia"), {
        texto: nuevaFrase.trim(),
        fecha: new Date().toISOString().split("T")[0],
        autor: auth.currentUser?.email || "Anónimo",
      });
      Alert.alert("Publicado", "La frase fue actualizada correctamente.");
      setUltimaFrase(nuevaFrase);
      setNuevaFrase("");
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la frase.");
      console.error(e);
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.overlayWrapper}>
          <View style={styles.overlay} />
          <ScrollView contentContainerStyle={styles.container}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.titulo}>Hola, {nombre} 👋</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#E4FDE1" />
            ) : (
              ultimaFrase && (
                <View style={styles.card}>
                  <Text style={styles.label}>Frase publicada:</Text>
                  <Text style={styles.frase}>"{ultimaFrase}"</Text>
                </View>
              )
            )}

            <Text style={styles.label}>Nueva frase:</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe una frase motivacional..."
              placeholderTextColor="#ccc"
              multiline
              value={nuevaFrase}
              onChangeText={setNuevaFrase}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={publicarFrase}
            >
              <Text style={styles.loginButtonText}>Publicar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { borderColor: "#fff", marginTop: 16 },
              ]}
              onPress={() => navigation.navigate("HistorialPagos")}
            >
              <Text style={[styles.loginButtonText, { color: "#fff" }]}>
                📜 Ver historial de pagos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.loginButton,
                { borderColor: "#4CAF50", marginTop: 16 },
              ]}
              onPress={() => navigation.navigate("Estadisticas")}
            >
              <Text style={[styles.loginButtonText, { color: "#4CAF50" }]}>
                📊 Ver estadísticas
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlayWrapper: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: -1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E4FDE1",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
  frase: {
    fontSize: 18,
    color: "#fff",
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: 12,
    padding: 15,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  loginButton: {
    borderColor: "#D00000",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#D00000",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
});
