import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { LogBox } from "react-native";

const backgroundImage = require("../../assets/bg_clases.png");
const logo = require("../../assets/logo_FitControl.png");

LogBox.ignoreLogs([
  "VirtualizedLists should never be nested inside plain ScrollViews",
]);

export default function CrearClaseScreen() {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [entrenador, setEntrenador] = useState("");
  const [aforo, setAforo] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowModal(false);
    if (selectedDate) setFecha(selectedDate);
  };
  const [entrenadores, setEntrenadores] = useState<any[]>([]);

  const [openTipo, setOpenTipo] = useState(false);
  const [openEntrenador, setOpenEntrenador] = useState(false);

  useEffect(() => {
    const fetchEntrenadores = async () => {
      const q = query(collection(db, "usuarios"), where("rol", "==", "dueno"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({
        label: doc.data().nombre,
        value: doc.data().nombre,
      }));
      setEntrenadores(lista);
    };
    fetchEntrenadores();
  }, []);

  // ✅ Cierra el otro dropdown cuando uno se abre
  useEffect(() => {
    if (openTipo) setOpenEntrenador(false);
  }, [openTipo]);

  useEffect(() => {
    if (openEntrenador) setOpenTipo(false);
  }, [openEntrenador]);

  const handleSubmit = async () => {
    if (!nombre || !tipo || !entrenador || !aforo) {
      Alert.alert("Faltan campos", "Por favor completa todos los campos.");
      return;
    }

    try {
      await addDoc(collection(db, "clases"), {
        nombre,
        tipo,
        entrenador,
        horario: fecha.toLocaleString("es-ES"),
        aforoMax: parseInt(aforo),
        participantes: [],
        completada: false,
      });

      Alert.alert("Clase creada", "La clase se ha registrado correctamente.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar la clase.");
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <Text style={styles.title}>Crear nueva clase</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la clase"
              placeholderTextColor="#ccc"
              value={nombre}
              onChangeText={setNombre}
            />

            <DropDownPicker
              open={openTipo}
              value={tipo}
              setOpen={setOpenTipo}
              setValue={setTipo}
              setItems={() => {}}
              placeholder="Tipo de clase"
              items={[
                { label: "Cardio", value: "Cardio" },
                { label: "Fuerza", value: "Fuerza" },
                { label: "Flexibilidad", value: "Flexibilidad" },
                { label: "HIIT", value: "HIIT" },
              ]}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={{ color: "#fff" }}
              placeholderStyle={{ color: "#ccc" }}
              zIndex={2000}
              zIndexInverse={1000}
            />

            <DropDownPicker
              open={openEntrenador}
              value={entrenador}
              setOpen={setOpenEntrenador}
              setValue={setEntrenador}
              setItems={setEntrenadores}
              placeholder="Seleccionar entrenador"
              items={entrenadores}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={{ color: "#fff" }}
              placeholderStyle={{ color: "#ccc" }}
              zIndex={1000}
              zIndexInverse={2000}
            />

            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={styles.input}
              activeOpacity={0.8}
            >
              <Text style={styles.inputText}>
                {fecha.toLocaleDateString("es-ES", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                {fecha.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={showModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowModal(false)}
            >
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      onPress={() => setShowModal(false)}
                      style={styles.btnCerrar}
                    >
                      <Text style={styles.btnCerrarTexto}>Cerrar</Text>
                    </TouchableOpacity>
                  )}

                  <DateTimePicker
                    value={fecha}
                    mode="datetime"
                    display="spinner" // ⚠️ spinner muestra todo: fecha completa + hora + minutos
                    themeVariant="light"
                    onChange={onChange}
                    style={{ backgroundColor: "#fff", width: "100%" }}
                  />
                </View>
              </View>
            </Modal>

            <TextInput
              style={styles.input}
              placeholder="Aforo máximo"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              value={aforo}
              onChangeText={setAforo}
            />

            <TouchableOpacity style={styles.boton} onPress={handleSubmit}>
              <Text style={styles.botonTexto}>Registrar clase</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  inner: {
    flex: 1,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    marginBottom: 16,
  },
  inputText: {
    color: "#fff",
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 16,
  },
  dropdownContainer: {
    backgroundColor: "#333",
    borderColor: "#ccc",
    borderRadius: 10,
  },
  boton: {
    borderColor: "#D00000",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  botonTexto: {
    color: "#D00000",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    width: "90%",
    alignItems: "center",
  },
  btnCerrar: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  btnCerrarTexto: {
    color: "#D00000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
