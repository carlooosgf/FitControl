import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { ImageBackground } from "react-native";

export default function ListaSociosScreen({ navigation }: any) {
  const [socios, setSocios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSocios = async () => {
    const q = query(collection(db, "usuarios"), where("rol", "==", "cliente"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSocios(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSocios();
    }, [])
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("DetalleSocio", { socio: item })}
    >
      <View style={styles.row}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.nombre}>
          {item.nombre} {item.apellido1} {item.apellido2}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.emoji}>💳</Text>
        <Text style={styles.estado}>
          Estado:{" "}
          <Text
            style={{
              color: item.estadoAbono === "activo" ? "#4CAF50" : "#D00000",
            }}
          >
            {item.estadoAbono === "activo" ? "🟢 Activo" : "🔴 Inactivo"}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/bg_clientes.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay} />

      <View style={styles.wrapper}>
        <Text style={styles.title}>Listado de Socios</Text>

        <FlatList
          data={socios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#696D7D",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 0,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F110C",
  },
  estado: {
    fontSize: 16,
    color: "#696D7D",
  },
  background: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    padding: 24,
    paddingTop: 25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
});
