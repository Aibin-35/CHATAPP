import React, { useState, useEffect } from "react";
import { Auth } from "./components/Auth";
import Chat from "./components/Chat"; 
import Cookies from "universal-cookie";
import { auth } from "./firebase-config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import "./App.css";

const cookies = new Cookies();

export default function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  
  // FIX 1: Read from localStorage first so refreshing doesn't lose your room!
  const [room, setRoom] = useState(localStorage.getItem("activeRoom") || "general"); 
  const [roomsList, setRoomsList] = useState(["general", "react", "javascript", "projects", "soso"]);
  const [newRoom, setNewRoom] = useState("");
  
  // FIX 2: Create a state to wait for Firebase to load before rendering the UI
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // FIX 3: Safely check auth state so the app doesn't crash on refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // FIX 4: Save the room to localStorage instantly every time you click a new room
  useEffect(() => {
    if (room) {
      localStorage.setItem("activeRoom", room);
    }
  }, [room]);

  const handleLogout = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom("general");
    localStorage.removeItem("activeRoom"); // Clear memory on logout
  };

  const handleCreateRoom = () => {
    // FIX 5: Force strict lowercase so phones and laptops always match exactly
    const trimmedRoom = newRoom.trim().toLowerCase(); 
    if (trimmedRoom !== "") {
      if (!roomsList.includes(trimmedRoom)) {
        setRoomsList([...roomsList, trimmedRoom]);
      }
      setRoom(trimmedRoom);
      setNewRoom("");
    }
  };

  if (!isAuth) {
    return (
      <div className="auth-wrapper">
        <Auth setIsAuth={setIsAuth} />
      </div>
    );
  }

  // FIX 6: Show a quick loading screen so the profile pic doesn't break the app
  if (!isUserLoaded) {
    return <div style={{ color: "white", display: "flex", justifyContent: "center", marginTop: "20vh" }}><h3>Loading chat securely...</h3></div>;
  }

  return (
    <div className="app-layout">
      
      {/* LEFT COLUMN: Sidebar Navigation */}
      <div className="sidebar">
        <h2 className="sidebar-title">Chat Rooms</h2>
        
        <div className="create-room-box">
          <input 
            type="text" 
            placeholder="Create room" 
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            className="create-room-input"
          />
          <button onClick={handleCreateRoom} className="create-room-btn">+</button>
        </div>

        <div className="room-list">
          {roomsList.map((r) => (
            <div 
              key={r} 
              className={`room-item ${room === r ? "active" : ""}`}
              onClick={() => setRoom(r)}
            >
              # {r.charAt(0).toUpperCase() + r.slice(1)}
            </div>
          ))}
        </div>

        <div className="user-profile">
          {auth.currentUser?.photoURL && (
            <img src={auth.currentUser.photoURL} alt="Profile" className="profile-pic" />
          )}
          <div className="profile-info">
            <span className="profile-name">{auth.currentUser?.displayName || "User"}</span>
            <span className="profile-email">{auth.currentUser?.email}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* RIGHT COLUMN: Active Chat Feed */}
      <div className="main-chat-area">
        <Chat room={room} />
      </div>

    </div>
  );
}
