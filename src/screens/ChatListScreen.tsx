import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/firebaseConfig";
import SafeContainer from "./SafeContainer";


export default function ChatListScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const q = query(collection(db, "chats"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const chatList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatList);
      setLoading(false);
    };

    fetchChats();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("Chat", {
          chatId: item.id,
          clienteUid: item.clienteUid,
          clienteNombre: `${item.clienteNombre ?? ""}`.trim(),
        })
      }
    >
      <Text style={styles.chatName}>{item.clienteNombre}</Text>
      <Text style={styles.lastMsg}>Último mensaje: {item.ultimoMensaje || "Sin mensajes aún"}</Text>
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
    <SafeContainer>
      <Text style={styles.title}>📬 Conversaciones Activas</Text>
      <FlatList data={chats} keyExtractor={(item) => item.id} renderItem={renderItem} />
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  chatItem: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 10,
  },
  chatName: { fontSize: 18, fontWeight: "600" },
  lastMsg: { fontSize: 14, color: "#666", marginTop: 4 },
});
