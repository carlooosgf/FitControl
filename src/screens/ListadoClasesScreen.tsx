import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const backgroundImage = require("../../assets/bg_clases.png");

export default function ListadoClasesScreen() {
  const [clases, setClases] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  const eliminarClase = async (id: string) => {
    try {
      await deleteDoc(doc(db, "clases", id));
      setClases((prev) => prev.filter((clase) => clase.id !== id));
    } catch (error) {
      console.log("Error al eliminar clase:");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchClases = async () => {
        const ref = collection(db, "clases");
        const q = query(ref, where("completada", "==", false));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClases(lista);
      };

      fetchClases();
    }, [])
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <TouchableOpacity onPress={() => eliminarClase(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#D00000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.info}>Tipo: {item.tipo}</Text>
      <Text style={styles.info}>Entrenador: {item.entrenador}</Text>
      <Text style={styles.info}>Horario: {item.horario}</Text>
      <Text style={styles.info}>Aforo máximo: {item.aforoMax}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Clases registradas</Text>

        {clases.length === 0 ? (
          <Text style={styles.noClases}>
            Todavía no hay clases registradas.
          </Text>
        ) : (
          <FlatList
            data={clases}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CrearClase")}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  noClases: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F110C",
  },
  info: {
    fontSize: 14,
    color: "#696D7D",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#0F110C",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
