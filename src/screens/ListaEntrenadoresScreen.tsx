import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import SafeContainer from "./SafeContainer";

export default function ListaEntrenadoresScreen() {
  const [entrenadores, setEntrenadores] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const cargarEntrenadores = async () => {
      const q = query(collection(db, "usuarios"), where("rol", "==", "dueno"));
      const snap = await getDocs(q);
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntrenadores(lista);
    };

    cargarEntrenadores();
  }, []);

  const abrirChat = async (entrenador: any) => {
    const uid1 = currentUser?.uid;
    const uid2 = entrenador.id;
    const miembros = [uid1, uid2];

    const chatsSnap = await getDocs(query(collection(db, "chats")));
    const existente = chatsSnap.docs.find(
      (doc) => {
        const m = doc.data().miembros || [];
        return m.includes(uid1) && m.includes(uid2) && m.length === 2;
      }
    );

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

    navigation.getParent()?.navigate("Chat", { chatId });
  };


  const renderItem = ({ item }: any) => {
    const nombreCompleto = `${item.nombre ?? ""} ${
      item.apellidos?.split(" ")[0] ?? ""
    }`.trim();
    return (
      <TouchableOpacity style={styles.card} onPress={() => abrirChat(item)}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: item.fotoPerfil ?? "https://via.placeholder.com/40",
            }}
            style={styles.avatar}
          />
          <Text style={styles.nombre}>{nombreCompleto}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    
      <ImageBackground
        source={require("../../assets/bg_chat.png")} // 👈 tu imagen aquí
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Entrenadores disponibles</Text>
          <FlatList
            data={entrenadores}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay entrenadores disponibles.</Text>
            }
          />
        </View>
      </ImageBackground>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E4FDE1",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    marginRight: 12,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F110C",
  },
  separator: {
    height: 8,
  },
  empty: {
    textAlign: "center",
    color: "#696D7D",
    marginTop: 40,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // blanco semitransparente sobre imagen
    padding: 20,
  },
});
