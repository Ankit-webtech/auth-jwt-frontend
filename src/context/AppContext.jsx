import { createContext, useEffect, useState, useContext } from "react";
// import { server } from "../main";
// import axios from 'axios';
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // async function fetchUser() {
  //   setLoading(true);
  //   try{
  //    const {data} = await api.get('/api/v1/me');

  //     setUser(data);
  //     setIsAuth(true);

  //   }catch(error){
  //     console.log(error);
  //     setIsAuth(false);
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // In AppContext.jsx, modify the fetchUser function:
  // async function fetchUser() {
  //   setLoading(true);
  //   try {
  //     const controller = new AbortController();
  //     const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  //     // const { data } = await api.get('/api/v1/me', { signal: controller.signal });
  //     const { data } = await api.get("/api/v1/me");
  //     setUser(data.user);
  //     setIsAuth(true);
  //   } catch (error) {
  //     console.log("Auth check failed:", error.message);
  //     setIsAuth(false);
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function fetchUser() {
  setLoading(true);
  try {
    const { data } = await api.get("/api/v1/me");
    setUser(data.user);
    setIsAuth(true);
  } catch (error) {
    setIsAuth(false);
    setUser(null);
  } finally {
    setLoading(false);
  }
}


////// logout user
  async function logoutUser(navigate) {
    try {
      const { data } = await api.post("/api/v1/logout");
      toast.success(data.message);
      setIsAuth(false);
      setUser(null);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        setIsAuth,
        isAuth,
        user,
        setUser,
        loading,
        fetchUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

///////
export const AppData = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppData must be used within an Approvider");
  return context;
};
