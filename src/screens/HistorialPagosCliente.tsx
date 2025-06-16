import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";

const backgroundImage = require("../../assets/bg_pagos.png");

export default function HistorialPagosClienteScreen() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const q = query(collection(db, "pagos"), orderBy("fecha", "desc"));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs
          .map((doc) => {
            const data = doc.data() as {
              uidCliente: string;
              fecha: any;
              importe: number;
            };
            return { id: doc.id, ...data };
          })
          .filter((item) => item.uidCliente === uid);

        setPagos(lista);
      } catch (error) {
        console.log("❌ Error al obtener pagos del cliente:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.info}>
        📅 {new Date(item.fecha.seconds * 1000).toLocaleString("es-ES")}
      </Text>
      <Text style={styles.importe}>💶 {item.importe.toFixed(2)} €</Text>
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
        <Text style={styles.title}>Mis Pagos</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E4FDE1" />
          </View>
        ) : pagos.length === 0 ? (
          <Text style={styles.empty}>No tienes pagos registrados.</Text>
        ) : (
          <FlatList
            data={pagos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  info: {
    fontSize: 14,
    color: "#696D7D",
    marginBottom: 6,
  },
  importe: {
    fontSize: 16,
    color: "#696D7D",
    fontWeight: "600",
  },
  empty: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
