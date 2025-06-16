import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Alert, ImageBackground } from "react-native";
import {
  Box,
  Text,
  Button,
  VStack,
  Spinner,
  useToast,
} from "@gluestack-ui/themed";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const backgroundImage = require("../../assets/bg_clases.png");


interface Clase {
  id: string;
  nombre: string;
  tipo: string;
  horario: string;
  entrenador: string;
  aforoMax: number;
  participantes: string[];
  completada: boolean;
}

const ClasesDisponiblesScreen = () => {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clases"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ ...(doc.data() as Clase), id: doc.id }))
        .filter((clase) => clase.completada === false);
      setClases(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const apuntarse = async (claseId: string) => {
    const claseRef = doc(db, "clases", claseId);
    const clase = clases.find((c) => c.id === claseId);
    if (!clase) return;

    const yaApuntado = clase.participantes?.includes(uid!);
    if (yaApuntado) return;

    try {
      await updateDoc(claseRef, {
        participantes: [...(clase.participantes || []), uid!],
      });
      toast.show({
        render: () => (
          <Box
            style={{
              backgroundColor: "#22c55e",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white" }}>
              Te has apuntado a la clase ✅
            </Text>
          </Box>
        ),
      });
    } catch (error) {
      toast.show({
        render: () => (
          <Box
            style={{
              backgroundColor: "#dc2626",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white" }}>Error al apuntarse ❌</Text>
          </Box>
        ),
      });
    }
  };

  const cancelarInscripcion = async (claseId: string) => {
    const claseRef = doc(db, "clases", claseId);
    const clase = clases.find((c) => c.id === claseId);
    if (!clase) return;

    try {
      const nuevosParticipantes = clase.participantes.filter((p) => p !== uid);
      await updateDoc(claseRef, {
        participantes: nuevosParticipantes,
      });
      toast.show({
        render: () => (
          <Box
            style={{
              backgroundColor: "#dc2626",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white" }}>
              Has cancelado tu inscripción ❌
            </Text>
          </Box>
        ),
      });
    } catch (error) {
      toast.show({
        render: () => (
          <Box
            style={{
              backgroundColor: "#dc2626",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white" }}>
              Error al cancelar inscripción ❌
            </Text>
          </Box>
        ),
      });
    }
  };

  const handleApuntarse = (claseId: string) => {
    Alert.alert(
      "Confirmar inscripción",
      "¿Estás seguro de que deseas apuntarte a esta clase?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí", onPress: () => apuntarse(claseId) },
      ]
    );
  };

  const handleCancelar = (claseId: string) => {
    Alert.alert(
      "Cancelar inscripción",
      "¿Seguro que deseas cancelar tu inscripción?",
      [
        { text: "No", style: "cancel" },
        { text: "Sí", onPress: () => cancelarInscripcion(claseId) },
      ]
    );
  };

  const clasesApuntadas = clases.filter((clase) =>
    clase.participantes?.includes(uid!)
  );
  const clasesDisponibles = clases.filter(
    (clase) => !clase.participantes?.includes(uid!)
  );

  const renderClase = (clase: Clase, mostrarBoton: boolean) => (
    <Box key={clase.id} style={styles.card}>
      <VStack style={styles.stack}>
        <Text style={styles.title}>{clase.nombre}</Text>
        <Text style={styles.text}>Tipo: {clase.tipo}</Text>
        <Text style={styles.text}>Horario: {clase.horario}</Text>
        <Text style={styles.text}>Entrenador: {clase.entrenador}</Text>
        <Text style={styles.text}>
          Aforo actual: {clase.participantes?.length || 0} / Máximo:{" "}
          {clase.aforoMax}
        </Text>
        {mostrarBoton ? (
          <Button
            onPress={() => handleApuntarse(clase.id)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Apuntarse</Text>
          </Button>
        ) : (
          <Button
            onPress={() => handleCancelar(clase.id)}
            style={[styles.button, { backgroundColor: "#D00000" }]}
          >
            <Text style={styles.buttonText}>Cancelar inscripción</Text>
          </Button>
        )}
      </VStack>
    </Box>
  );

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={{ padding: 16 }}>
        <VStack>
          <Text style={styles.sectionTitle}>Clases Disponibles</Text>
          {clasesDisponibles.length === 0 ? (
            <Text style={styles.text}>No hay clases disponibles</Text>
          ) : (
            clasesDisponibles.map((clase) => renderClase(clase, true))
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Tus Clases Apuntadas
          </Text>
          {clasesApuntadas.length === 0 ? (
            <Text style={styles.text}>No estás apuntado a ninguna clase</Text>
          ) : (
            clasesApuntadas.map((clase) => renderClase(clase, false))
          )}
        </VStack>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
  },
  stack: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F110C",
  },
  background: { flex: 1 },
  text: {
    color: "#696D7D",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#696D7D",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ClasesDisponiblesScreen;
