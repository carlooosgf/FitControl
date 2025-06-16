import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function DetalleClaseScreen({ route, navigation }: any) {
  const { clase } = route.params;
  const [participantes, setParticipantes] = useState<any[]>([]);

  useEffect(() => {
    const fetchParticipantes = async () => {
      const lista = [];
      for (const uid of clase.participantes) {
        const ref = doc(db, "usuarios", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          lista.push({ id: uid, ...snap.data() });
        }
      }
      setParticipantes(lista);
    };

    fetchParticipantes();
  }, [clase.participantes]);

  const marcarComoCompletada = async () => {
    try {
      const ref = doc(db, "clases", clase.id);
      await updateDoc(ref, { completada: true });
      Alert.alert("Clase marcada como completada");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la clase");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>{clase.nombre}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>🧩 Tipo: <Text style={styles.valor}>{clase.tipo}</Text></Text>
        <Text style={styles.label}>🧑‍🏫 Entrenador: <Text style={styles.valor}>{clase.entrenador}</Text></Text>
        <Text style={styles.label}>🗓️ Horario: <Text style={styles.valor}>{clase.horario}</Text></Text>
        <Text style={styles.label}>👥 Aforo máximo: <Text style={styles.valor}>{clase.aforoMax}</Text></Text>
      </View>

      <Text style={styles.subtitulo}>👤 Participantes ({participantes.length})</Text>
      {participantes.length === 0 ? (
        <Text style={styles.sinParticipantes}>Ningún cliente se ha apuntado todavía.</Text>
      ) : (
        participantes.map((user) => (
          <View key={user.id} style={styles.participante}>
            <Text style={styles.participanteNombre}>{user.nombre} {user.apellidos}</Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.boton} onPress={marcarComoCompletada}>
        <Text style={styles.botonTexto}>✅ Marcar como completada</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F110C",
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "#E4FDE1",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: "#696D7D",
    marginBottom: 8,
  },
  valor: {
    color: "#0F110C",
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#0F110C",
  },
  sinParticipantes: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  participante: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },
  participanteNombre: {
    fontSize: 16,
    color: "#0F110C",
  },
  boton: {
    marginTop: 32,
    backgroundColor: "#0F110C",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
