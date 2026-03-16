import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
// import { server } from "../main";
import Loding from "../Loding";
// import axios from "axios";
import api from "../apiInterceptor";

const Verify = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const params = useParams();

  const [loading, setLoading] = useState(true);

  async function verifyUser() {
    try {
     const { data } = await api.post(`/api/v1/verify-email/${params.token}`);

      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return; // ← double call rok do
    hasCalled.current = true;
    verifyUser();
  }, []);

  return (
    <>
      {loading ? (
        <Loding />
      ) : (
        <div className="w-[200px] m-auto mt-48">
          {successMessage && (
            <p className="text-green-500 text-2xl">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-2xl">{errorMessage}</p>
          )}
        </div>
      )}
    </>
  );
};

export default Verify;
