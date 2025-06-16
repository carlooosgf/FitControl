import { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import axios from "axios";
import { API_URL } from "../constants/config";

export function useUserRol() {
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const res = await axios.get<{ rol: string }>(
            `${API_URL}/api/usuarios/rol/${user.uid}`
          );
          setRol(res.data.rol);
        } catch (error: any) {
          console.log("❌ Error al obtener rol:", error.response?.data || error.message);

          if (error.response?.status === 404) {
            console.log("⚠️ Usuario aún no registrado en el backend.");
          }

          setRol(null);
        }
      } else {
        setRol(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return rol;
}
