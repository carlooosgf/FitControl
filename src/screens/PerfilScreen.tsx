import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    edad: "",
    objetivo: "",
    rol: "",
  });

  useEffect(() => {
    const cargarUsuario = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(db, "usuarios", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsuario(data);
        setForm({
          nombre: data.nombre ?? "",
          apellido1: data.apellido1 ?? "",
          apellido2: data.apellido2 ?? "",
          edad: data.edad ? String(data.edad) : "",
          objetivo: data.objetivo ?? "",
          rol: data.rol ?? "cliente",
        });
      }

      setLoading(false);
    };

    cargarUsuario();
  }, []);

  const handleGuardar = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      await updateDoc(doc(db, "usuarios", uid), {
        ...form,
        edad: parseInt(form.edad) || 0, 
      });

      setEditando(false);
    } catch (error) {
      console.log("Error al actualizar:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D00000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "grey" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>👤 Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.label}>Correo</Text>
          <Text style={styles.staticText}>{auth.currentUser?.email}</Text>

          {usuario?.rol !== "dueno" && (
            <>
              <Text style={styles.label}>Estado del abono</Text>
              <Text
                style={[
                  styles.staticText,
                  {
                    color:
                      usuario?.estadoAbono === "activo" ? "#2ecc71" : "#D00000",
                  },
                ]}
              >
                {usuario?.estadoAbono ?? "Desconocido"}
              </Text>
            </>
          )}

          {["nombre", "apellido1", "apellido2", "edad", "objetivo"].map(
            (campo) => (
              <View key={campo}>
                <Text style={styles.label}>
                  {campo === "apellido1"
                    ? "Primer apellido"
                    : campo === "apellido2"
                    ? "Segundo apellido"
                    : campo.charAt(0).toUpperCase() + campo.slice(1)}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    !editando && { backgroundColor: "#eee", color: "#0F110C" },
                  ]}
                  editable={editando}
                  value={form[campo as keyof typeof form] || ""}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, [campo]: text }))
                  }
                  multiline={campo === "objetivo"}
                  placeholder={editando ? "Escribe aquí..." : ""}
                  placeholderTextColor="#999"
                  keyboardType={campo === "edad" ? "numeric" : "default"}
                />
              </View>
            )
          )}

          <TouchableOpacity
            style={editando ? styles.saveBtn : styles.editBtn}
            onPress={editando ? handleGuardar : () => setEditando(true)}
          >
            <Text style={styles.btnText}>
              {editando ? "💾 Guardar" : "✏️ Editar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "black",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#222",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#696D7D",
  },
  staticText: {
    fontSize: 16,
    marginBottom: 16,
    color: "#0F110C",
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 16,
    color: "#0F110C",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  editBtn: {
    backgroundColor: "#696D7D",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: "#2ecc71",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E4FDE1",
  },
});
