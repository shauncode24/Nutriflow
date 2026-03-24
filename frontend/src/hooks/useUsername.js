import { useState, useEffect } from "react";
import { fetchUsername } from "../api/userApi";

export const useUsername = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUsername();
        setUsername(data.name);
      } catch (err) {
        console.error("Error fetching username:", err);
      }
    };
    load();
  }, []);

  return username;
};