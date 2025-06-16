import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


const backgroundImage = require("../../assets/bg_login.png");
const logo = require("../../assets/logo_FitControl.png");

type Props = NativeStackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <KeyboardAwareScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
          extraHeight={100}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />

          <View style={styles.card}>
            <Text style={styles.title}>Iniciar sesión</Text>

            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="email"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="lock"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#ccc"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.bottomLinks}>
              <TouchableOpacity onPress={() => navigation.replace("Register")}>
                <Text style={styles.link}>Registrarse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("RecuperarContraseña")}
              >
                <Text style={styles.link}>¿Olvidaste tu{"\n"}contraseña?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  inner: {
    padding: 30,
    justifyContent: "flex-start",
    flexGrow: 1,
    paddingTop: 140,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  logo: {
    width: 160,
    height: 160,
    alignSelf: "center",
    marginBottom: 55,
    marginTop: 10,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 5,
    gap: 12,
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
    height: 45,
    color: "#fff",
    fontSize: 16,
  },
  loginButton: {
    borderColor: "#D00000",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#D00000",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  bottomLinks: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  link: {
    color: "#E4FDE1",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});
