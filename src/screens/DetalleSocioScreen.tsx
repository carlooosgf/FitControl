import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
  TextInput,
  ImageBackground,
} from "react-native";
import { auth, db } from "../firebase/firebaseConfig";
import { API_URL } from "../constants/config";
import { collection, getDocs, query, addDoc } from "firebase/firestore";

const backgroundImage = require("../../assets/bg_info.png");

export default function DetalleSocioScreen({ route, navigation }: any) {
  const { socio } = route.params;
  const [socioData, setSocioData] = useState(socio);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [importePago, setImportePago] = useState("");

  const abrirChat = async () => {
    const uid1 = auth.currentUser?.uid;
    const uid2 = socioData.id;
    const miembros = [uid1, uid2];

    const chatsSnap = await getDocs(query(collection(db, "chats")));
    const existente = chatsSnap.docs.find((doc) => {
      const m = doc.data().miembros || [];
      return m.includes(uid1) && m.includes(uid2) && m.length === 2;
    });

    let chatId;
    if (existente) {
      chatId = existente.id;
    } else {
      const nuevo = await addDoc(collection(db, "chats"), {
        miembros,
        creadoEn: new Date(),
      });
      chatId = nuevo.id;
    }

    navigation.navigate("Chat", { chatId });
  };

  const cambiarEstadoAbono = async () => {
    const nuevoEstado =
      socioData.estadoAbono === "activo" ? "inactivo" : "activo";
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${socioData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estadoAbono: nuevoEstado }),
      });
      if (res.ok) {
        setSocioData({ ...socioData, estadoAbono: nuevoEstado });
        Alert.alert("Actualizado", `Estado cambiado a ${nuevoEstado}`);
      } else {
        Alert.alert("Error", "No se pudo actualizar el estado.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar al servidor.");
    }
  };

  const registrarPago = async () => {
    if (!importePago || isNaN(Number(importePago))) {
      Alert.alert("Error", "Introduce un importe válido.");
      return;
    }

    try {
      await addDoc(collection(db, "pagos"), {
        uidCliente: socioData.id,
        nombreCliente: `${socioData.nombre} ${socioData.apellido1}`,
        importe: parseFloat(importePago),
        fecha: new Date(),
      });

      if (socioData.estadoAbono === "inactivo") {
        await fetch(`${API_URL}/api/usuarios/${socioData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estadoAbono: "activo" }),
        });
        setSocioData({ ...socioData, estadoAbono: "activo" });
      }

      Alert.alert("Pago registrado", "El pago se guardó correctamente.");
      setShowPagoModal(false);
      setImportePago("");
    } catch (error) {
      console.log("❌ Error guardando pago:", error);
      Alert.alert("Error", "No se pudo registrar el pago.");
    }
  };

  const eliminarSocio = () => {
    Alert.alert(
      "Eliminar usuario",
      "¿Seguro que quieres eliminar a este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_URL}/api/usuarios/${socioData.id}`,
                { method: "DELETE" }
              );
              if (res.ok) {
                Alert.alert("Eliminado", "El cliente ha sido eliminado.");
                navigation.goBack();
              } else {
                Alert.alert("Error", "No se pudo eliminar el usuario.");
              }
            } catch (error) {
              Alert.alert("Error", "No se pudo conectar al servidor.");
            }
          },
        },
      ]
    );
  };

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.wrapper}>
        <Text style={styles.title}>Información del cliente</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.section}><Text style={styles.label}>👤 Nombre completo:</Text><Text style={styles.value}>{socioData.nombre} {socioData.apellido1} {socioData.apellido2}</Text></View>
          <View style={styles.section}><Text style={styles.label}>✉️ Correo:</Text><Text style={styles.value}>{socioData.email}</Text></View>
          <View style={styles.section}><Text style={styles.label}>📅 Edad:</Text><Text style={styles.value}>{socioData.edad}</Text></View>
          <View style={styles.section}><Text style={styles.label}>📞 Sexo:</Text><Text style={styles.value}>{socioData.sexo}</Text></View>
          <View style={styles.section}><Text style={styles.label}>🎯 Objetivo personal:</Text><Text style={styles.value}>{socioData.objetivo}</Text></View>
          <View style={styles.section}><Text style={styles.label}>💳 Estado del abono:</Text><Text style={[styles.value, { color: socioData.estadoAbono === "activo" ? "#4CAF50" : "#D00000" }]}>{socioData.estadoAbono === "activo" ? "✔️ Activo" : "❌ Inactivo"}</Text></View>

          <TouchableOpacity style={styles.boton} onPress={abrirChat}><Text style={styles.botonTexto}>Chatear </Text></TouchableOpacity>
          <TouchableOpacity style={styles.boton2} onPress={() => setShowPagoModal(true)}><Text style={styles.botonTexto2}>Añadir pago</Text></TouchableOpacity>
          <TouchableOpacity style={styles.boton3} onPress={cambiarEstadoAbono}><Text style={styles.botonTexto3}>Cambiar estado del abono</Text></TouchableOpacity>
          <TouchableOpacity style={styles.boton4} onPress={eliminarSocio}><Text style={styles.botonTexto4}>Eliminar cliente</Text></TouchableOpacity>
        </ScrollView>

        {showPagoModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Introduce el importe (€)</Text>
              <TextInput
                placeholder="0.00"
                keyboardType="numeric"
                value={importePago}
                onChangeText={setImportePago}
                style={styles.modalInput}
              />
              <TouchableOpacity style={styles.modalButton} onPress={registrarPago}>
                <Text style={styles.modalButtonText}>Registrar pago</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPagoModal(false)} style={{ marginTop: 12, alignItems: "center" }}>
                <Text style={{ color: "#D00000" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  wrapper: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#fff",
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    color: "#ccc",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#fff",
  },
  boton: {
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  boton2: {
    borderColor: "#14fc3b",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  boton3: {
    borderColor: "#c7c9c8",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  boton4: {
    borderColor: "#D00000",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
  },
  botonTexto2: {
    color: "#14fc3b",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
  },
  botonTexto3: {
    color: "#c7c9c8",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
  },
  botonTexto4: {
    color: "#D00000",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 99,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
