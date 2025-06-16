import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const background = require("../../assets/bg_login.png"); // ajusta si tienes otro fondo

export default function RecuperarContraseña({ navigation }: any) {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Campo vacío", "Por favor, introduce tu correo electrónico.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja de entrada y sigue las instrucciones."
      );
      navigation.replace("Login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="#fff" style={styles.icon} />
            <TextInput
              placeholder="Introduce tu correo electrónico"
              placeholderTextColor="#ccc"
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>Enviar enlace de recuperación</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <Text style={styles.link}>← Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 30,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#fff",
    fontSize: 15,
  },
  button: {
    borderColor: "#D00000",
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#D00000",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#E4FDE1",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});
