import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

const UserContext = createContext(null);

export const useUserContext = () => useContext(UserContext);

const fetchUserByUsername = async (username,setUpdatedData) => {
  if (!username) return null;

  const token = localStorage.getItem("token"); 
  console.log(token)
  const { data } = await axios.get(
    `${API_URL}/user/profile/${username}`,
     { withCredentials: true }
  );
  setUpdatedData(data)
  return data;
};


export const UserContextProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null); 
  const [updatedData,setUpdatedData]=useState(null)

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["user", userProfile?.username], 
    queryFn: () => fetchUserByUsername(userProfile?.username,setUpdatedData),
    enabled: !!userProfile?.username, 
  });
  console.log(updatedData,'.....')

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        userData,
        isLoading,
        error,
        updatedData,setUpdatedData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
