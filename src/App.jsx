import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import VerifyOtp from "./pages/VerifyOtp";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Loding from "./Loding";
import { AppData } from './context/AppContext';
import Dashboard from "./pages/Dashboard";

const RoleRoute = ({ element, role }) => {
  const { isAuth, user } = AppData();
  if (!isAuth) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return element;
};

const App = () => {
  const { isAuth, loading } = AppData();

  return (
    <>
      {loading ? (<Loding />) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isAuth ? <Home /> : <Login />} />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route path="/register" element={isAuth ? <Home /> : <Register />} />
            <Route path="/verifyotp" element={isAuth ? <Home /> : <VerifyOtp />} />
            <Route path="/token/:token" element={isAuth ? <Home /> : <Verify />} />
            <Route path="/dashboard" element={<RoleRoute element={<Dashboard />} role="admin" />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      )}
    </>
  );
};

export default App;