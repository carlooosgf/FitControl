import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function ChatScreen({ route, navigation }: any) {
  const currentUid = auth.currentUser?.uid;
  const chatId = route?.params?.chatId;

  const [otroUid, setOtroUid] = useState<string | null>(null);
  const [otroUsuario, setOtroUsuario] = useState<any>(null);
  const [rawMessages, setRawMessages] = useState<any[]>([]);
  const [groupedMessages, setGroupedMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    if (!chatId || !auth.currentUser?.uid) return;

    const fetchOtroUsuario = async () => {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const miembros: string[] = chatSnap.data().miembros || [];
        const otro = miembros.find((uid) => uid !== auth.currentUser?.uid);
        setOtroUid(otro ?? null);

        if (otro) {
          const userSnap = await getDoc(doc(db, "usuarios", otro));
          if (userSnap.exists()) {
            setOtroUsuario(userSnap.data());
          }
        }
      }
    };

    fetchOtroUsuario();
  }, [chatId]);

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "mensajes"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensajes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRawMessages(mensajes);
    });

    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    const grupos: any = {};
    rawMessages.forEach((msg) => {
      const fecha = msg.timestamp?.toDate
        ? formatearFecha(msg.timestamp.toDate())
        : "Sin fecha";
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(msg);
    });

    const gruposOrdenados = Object.keys(grupos).map((fecha) => ({
      fecha,
      mensajes: grupos[fecha],
    }));

    setGroupedMessages(gruposOrdenados);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [rawMessages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "chats", chatId, "mensajes"), {
      texto: text,
      emisor: currentUid,
      timestamp: serverTimestamp(),
    });

    await setDoc(
      doc(db, "chats", chatId),
      {
        miembros: [currentUid, otroUid].sort(),
        ultimoMensaje: text,
        timestamp: serverTimestamp(),
      },
      { merge: true }
    );

    setText("");
  };

  const renderItem = ({ item }: any) => {
    const isMine = item.emisor === currentUid;
    const hora = item.timestamp?.toDate
      ? item.timestamp.toDate().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <View style={[styles.msgContainer, isMine ? styles.right : styles.left]}>
        <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
          <Text
            style={[
              styles.msgText,
              isMine ? { color: "#fff" } : { color: "#fff" },
            ]}
          >
            {item.texto}
          </Text>
        </View>
        <Text
          style={[styles.time, isMine ? styles.rightTime : styles.leftTime]}
        >
          {hora}
        </Text>
      </View>
    );
  };

  const renderGroupedMessages = () => {
    return groupedMessages.map((grupo, index) => (
      <View key={index}>
        <Text style={styles.dateSeparator}>{grupo.fecha}</Text>
        {grupo.mensajes.map((msg: any) => (
          <View key={msg.id}>{renderItem({ item: msg })}</View>
        ))}
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* Cabecera */}
        <View style={[styles.headerCustom, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: otroUsuario?.fotoPerfil ?? "https://via.placeholder.com/40" }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>
            {otroUsuario?.nombre} {otroUsuario?.apellidos?.split(" ")[0] ?? ""}
          </Text>
        </View>

        {/* Mensajes + fondo */}
        <View style={{ flex: 1, backgroundColor: "#E4FDE1" }}>
          <FlatList
            ref={flatListRef}
            data={[]} // render manual
            renderItem={null}
            ListHeaderComponent={<View>{renderGroupedMessages()}</View>}
            contentContainerStyle={styles.list}
          />
        </View>

        {/* Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <MaterialIcons
              name="send"
              size={20}
              color="#D00000"
              style={{ transform: [{ rotate: "-45deg" }] }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const formatearFecha = (fecha: Date) => {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const f = fecha.toLocaleDateString("es-ES");
  const hoyStr = hoy.toLocaleDateString("es-ES");
  const ayerStr = ayer.toLocaleDateString("es-ES");
  if (f === hoyStr) return "HOY";
  if (f === ayerStr) return "AYER";
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const styles = StyleSheet.create({
  headerCustom: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#111",
  },
  backArrow: {
    fontSize: 22,
    marginRight: 12,
    color: "#fff",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  list: {
    paddingVertical: 16,
    gap: 10,
  },
  msgContainer: {
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },
  mine: {
    backgroundColor: "#D00000",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  theirs: {
    backgroundColor: "#696D7D",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  msgText: {
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: "#111",
    marginTop: 4,
  },
  right: {
    alignItems: "flex-end",
  },
  left: {
    alignItems: "flex-start",
  },
  rightTime: {
    textAlign: "right",
    marginRight: 10,
  },
  leftTime: {
    textAlign: "left",
    marginLeft: 10,
  },
  dateSeparator: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
    color: "#555",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#111",
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    fontSize: 14,
    
  },
  sendButton: {
    backgroundColor: "#fff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
