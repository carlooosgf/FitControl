import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  ChevronDownIcon,
} from "@gluestack-ui/themed";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import { API_URL } from "../constants/config";

const background = require("../../assets/bg_login.png");

export default function RegisterScreen({ navigation }: any) {
  const [fase, setFase] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repetirPassword, setRepetirPassword] = useState("");
  const contrasenasIguales = password !== "" && password === repetirPassword;

  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [openSexo, setOpenSexo] = useState(false);
  const [sexo, setSexo] = useState(null);

  const [edad, setEdad] = useState("");
  const [objetivo, setObjetivo] = useState("");

  const verificarCorreo = async () => {
    if (!email || !password) {
      Alert.alert("Campos incompletos", "Completa el correo y contraseña.");
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        Alert.alert("Correo en uso", "Ya existe una cuenta con ese correo.");
      } else {
        setFase(2);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const finalizarRegistro = async () => {
    if (!nombre || !apellido1 || !sexo || !edad || !objetivo) {
      Alert.alert("Campos incompletos", "Completa todos los datos.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      await setDoc(doc(db, "usuarios", uid), {
        email,
        nombre,
        apellido1,
        apellido2,
        sexo,
        edad: parseInt(edad),
        objetivo,
        estadoAbono: "activo",
        rol: "cliente",
      });

      

      Alert.alert("Registro exitoso", "Bienvenido a FitControl");
    } catch (error: any) {
      console.log("❌ Error:", error.response?.data || error.message);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground source={background} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {fase === 1 ? (
              <>
                <Text style={styles.title}>Crear cuenta</Text>

                <TextInput
                  placeholder="Correo electrónico"
                  placeholderTextColor="#ccc"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="#ccc"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <View style={{ position: "relative" }}>
                  <TextInput
                    placeholder="Repetir contraseña"
                    placeholderTextColor="#ccc"
                    style={styles.input}
                    secureTextEntry
                    value={repetirPassword}
                    onChangeText={setRepetirPassword}
                  />
                  {contrasenasIguales && (
                    <Text
                      style={{
                        position: "absolute",
                        right: 16,
                        top: 14,
                        fontSize: 18,
                        color: "#4CAF50", // verde
                      }}
                    >
                      ✅
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={verificarCorreo}
                >
                  <Text style={styles.buttonText}>Continuar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>Datos personales</Text>

                <TextInput
                  placeholder="Nombre"
                  placeholderTextColor="#ccc"
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                />
                <TextInput
                  placeholder="Primer apellido"
                  placeholderTextColor="#ccc"
                  style={styles.input}
                  value={apellido1}
                  onChangeText={setApellido1}
                />
                <TextInput
                  placeholder="Segundo apellido"
                  placeholderTextColor="#ccc"
                  style={styles.input}
                  value={apellido2}
                  onChangeText={setApellido2}
                />

                <View style={{ marginBottom: 12 }}>
                  <DropDownPicker
                    open={openSexo}
                    value={sexo}
                    setOpen={setOpenSexo}
                    setValue={setSexo}
                    setItems={() => {}}
                    placeholder="Sexo"
                    items={[
                      { label: "Masculino", value: "Masculino" },
                      { label: "Femenino", value: "Femenino" },
                      { label: "Otro", value: "Otro" },
                    ]}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    textStyle={{ color: "#fff" }}
                    placeholderStyle={{ color: "#ccc" }}
                    zIndex={2000}
                    zIndexInverse={1000}
                  />
                </View>

                <TextInput
                  placeholder="Edad"
                  placeholderTextColor="#ccc"
                  style={styles.input}
                  value={edad}
                  onChangeText={setEdad}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="¿Cuál es tu objetivo personal?"
                  placeholderTextColor="#ccc"
                  style={[
                    styles.input,
                    { height: 80, textAlignVertical: "top" },
                  ]}
                  value={objetivo}
                  onChangeText={setObjetivo}
                  multiline
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={finalizarRegistro}
                >
                  <Text style={styles.buttonText}>Finalizar registro</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={styles.link}>← Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    borderColor: "#D00000",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#D00000",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#E4FDE1",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 0,
    borderRadius: 12,
    marginBottom: 12,
  },
  dropdownContainer: {
    backgroundColor: "#333",
    borderWidth: 0,
  },
});
