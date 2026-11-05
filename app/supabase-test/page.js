
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Not tested");
  const [message, setMessage] = useState("");

  async function testConnection() {
    setStatus("Testing...");
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "revzeno_connection_check"
      );

      if (error) {
        throw error;
      }

      if (data !== true) {
        throw new Error("Unexpected response from Supabase.");
      }

      setStatus("Connected successfully");
      setMessage(
        "RevZeno successfully communicated with Supabase."
      );
    } catch (error) {
      setStatus("Connection failed");
      setMessage(error.message || "Unknown error");
    }
  }

  return (
    <main style={{
      padding: 30,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>RevZeno Supabase Test</h1>

      <p>Check the connection between RevZeno and Supabase.</p>

      <button
        onClick={testConnection}
        style={{
          padding: "12px 20px",
          background: "#6658E8",
          color: "white",
          border: "none",
          borderRadius: 8
        }}
      >
        Test Supabase Connection
      </button>

      <h2>{status}</h2>
      <p>{message}</p>
    </main>
  );
}
