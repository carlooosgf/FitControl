import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { BarChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";

const backgroundImage = require("../../assets/bg_numeros.png");

export default function EstadisticasScreen() {
  const navigation = useNavigation();
  const scrollContentRef = useRef<View>(null);

  const [activos, setActivos] = useState(0);
  const [inactivos, setInactivos] = useState(0);
  const [topClases, setTopClases] = useState<{ nombre: string; count: number }[]>([]);
  const [ingresosPorMes, setIngresosPorMes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, "usuarios"));
      let act = 0;
      let inact = 0;
      usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.rol === "cliente") {
          if (data.estadoAbono === "activo") act++;
          else if (data.estadoAbono === "inactivo") inact++;
        }
      });
      setActivos(act);
      setInactivos(inact);

      const clasesSnap = await getDocs(collection(db, "clases"));
      const clases = clasesSnap.docs.map((doc) => ({
        nombre: doc.data().nombre,
        count: doc.data().participantes?.length || 0,
      }));
      const top3 = clases.sort((a, b) => b.count - a.count).slice(0, 3);
      setTopClases(top3);

      const pagosSnap = await getDocs(collection(db, "pagos"));
      const ingresos: Record<string, number> = {};
      pagosSnap.forEach((doc) => {
        const fecha = doc.data().fecha.toDate();
        const mes = fecha.toLocaleString("es-ES", { month: "short", year: "numeric" });
        ingresos[mes] = (ingresos[mes] || 0) + doc.data().importe;
      });
      setIngresosPorMes(ingresos);

      setLoading(false);
    };

    fetchStats();
  }, []);

  const mesesOrden = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic"
  ];

  const ordenarMeses = (a: string, b: string) => {
    const [mesA, añoA] = a.split(" ");
    const [mesB, añoB] = b.split(" ");
    if (añoA !== añoB) return parseInt(añoA) - parseInt(añoB);
    return mesesOrden.indexOf(mesA) - mesesOrden.indexOf(mesB);
  };

  const allMeses = Object.keys(ingresosPorMes).sort(ordenarMeses);
  let ultimosMeses = allMeses.slice(-4);
  while (ultimosMeses.length < 4) {
    ultimosMeses.unshift("");
  }

  const valores = ultimosMeses.map((mes) => ingresosPorMes[mes] || 0);
  const maxIngreso = Math.max(...valores);
  const minIngreso = Math.min(...valores);
  const yMin = Math.max(minIngreso - 50, 0);
  const yMax = maxIngreso + 50;

  const chartData = {
    labels: ultimosMeses,
    datasets: [{ data: valores }],
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={{ paddingTop: 80, paddingHorizontal: 20 }}>
        <Text style={styles.title}>Panel de estadísticas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View ref={scrollContentRef}>
          {loading ? (
            <ActivityIndicator size="large" color="#E4FDE1" />
          ) : (
            <>
              <View style={styles.boxRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Socios activos</Text>
                  <Text style={styles.statValue}>{activos}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Socios inactivos</Text>
                  <Text style={styles.statValue}>{inactivos}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>🏆 Top 3 clases con más inscripciones</Text>
              {topClases.map((clase, index) => (
                <View style={styles.claseItem} key={index}>
                  <Text style={styles.claseNombre}>{index + 1}. {clase.nombre}</Text>
                  <Text style={styles.claseCount}>{clase.count} inscritos</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>💶 Ingresos mensuales</Text>
              <BarChart
                data={chartData}
                width={Dimensions.get("window").width - 40}
                height={220}
                yAxisLabel="€"
                yAxisSuffix=""
                chartConfig={chartConfig}
                fromZero
                segments={5}
                style={styles.chart}
              />

              <TouchableOpacity style={styles.boton} onPress={() => navigation.goBack()}>
                <Text style={styles.botonTexto}>Volver atrás</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const chartConfig = {
  backgroundColor: "#0F110C",
  backgroundGradientFrom: "#696D7D",
  backgroundGradientTo: "#696D7D",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: () => "#fff",
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  boxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  statBox: {
    backgroundColor: "#fff",
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  statLabel: {
    color: "#696D7D",
    fontWeight: "bold",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F110C",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E4FDE1",
    marginBottom: 12,
  },
  claseItem: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  claseNombre: {
    color: "#fff",
    fontWeight: "bold",
  },
  claseCount: {
    color: "#ccc",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  boton: {
    marginTop: 20,
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
});
