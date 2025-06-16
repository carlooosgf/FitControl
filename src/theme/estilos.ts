// estilos.ts
import { StyleSheet } from "react-native";

export const Colores = {
  fondo: "#FFFFFF",
  primario: "#A0A4B8",
  peligro: "#D00000",
  texto: "#0F110C",
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: Colores.fondo,
  },
  texto: {
    color: Colores.texto,
  },
});
