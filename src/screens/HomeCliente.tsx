import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase/firebaseConfig";
import SafeContainer from "./SafeContainer";

export default function HomeCliente() {
  const [nombre, setNombre] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(true);

  const backgroundImage = require("../../assets/bg_cliente.png");
  const logo = require("../../assets/logo_FitControl.png");

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

  const obtenerFrase = async () => {
    const ref = doc(db, "frases", "fraseDelDia");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setFrase(snap.data().texto || "");
    }
  };

  useEffect(() => {
    const cargar = async () => {
      await obtenerNombre();
      await obtenerFrase();
      setLoading(false);
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <SafeContainer>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#696D7D" />
        </View>
      </SafeContainer>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.saludo}>👋 Bienvenido, {nombre}</Text>

        <View style={styles.fraseBox}>
          <Text style={styles.fraseTitulo}>💬 Frase motivacional del día</Text>
          <Text style={styles.fraseTexto}>{frase}</Text>
        </View>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.navigate("HistorialPagosCliente")}
        >
          <Text style={styles.botonTexto}> Ver historial de pagos</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  saludo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginBottom: 60,
    marginTop: 50,
  },
  fraseBox: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fraseTitulo: {
    fontSize: 16,
    color: "#696D7D",
    marginBottom: 8,
    fontWeight: "600",
  },
  fraseTexto: {
    fontSize: 18,
    color: "#0F110C",
    fontStyle: "italic",
    lineHeight: 24,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // opcional: oscurece para mejorar legibilidad
  },
  boton: {
    marginTop: 60,
    borderColor: "#D00000",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  botonTexto: {
    color: "#D00000",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
  },
});
