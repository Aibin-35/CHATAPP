import React, { useState } from "react";
import { Auth } from "./components/Auth";
import Chat from "./components/Chat"; 
import Cookies from "universal-cookie";
import { auth } from "./firebase-config";
import { signOut } from "firebase/auth";
import "./App.css";

const cookies = new Cookies();

export default function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  
  // Sets the default room that loads when you log in
  const [room, setRoom] = useState("general"); 
  
  // State to handle the list of rooms in the sidebar
  const [roomsList, setRoomsList] = useState(["General", "React", "JavaScript", "Projects", "Soso"]);
  
  // State for the text inside the "Create room" input
  const [newRoom, setNewRoom] = useState("");

  // Logic: Handles the sign-out process and clears cookies
  const handleLogout = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
  };

  // Logic: Adds a new room to the sidebar if it doesn't already exist, then automatically joins it
  const handleCreateRoom = () => {
    const trimmedRoom = newRoom.trim();
    if (trimmedRoom !== "") {
      // Check if room already exists to prevent duplicates
      const roomExists = roomsList.some(r => r.toLowerCase() === trimmedRoom.toLowerCase());
      if (!roomExists) {
        setRoomsList([...roomsList, trimmedRoom]);
      }
      setRoom(trimmedRoom.toLowerCase());
      setNewRoom("");
    }
  };

  // Guard Clause: Render login screen if not authenticated
  if (!isAuth) {
    return (
      <div className="auth-wrapper">
        <Auth setIsAuth={setIsAuth} />
      </div>
    );
  }

  return (
    <div className="app-layout">
      
      {/* LEFT COLUMN: Sidebar Navigation */}
      <div className="sidebar">
        <h2 className="sidebar-title">Chat Rooms</h2>
        
        {/* Create Room Input Area */}
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

        {/* List of Available Rooms */}
        <div className="room-list">
          {roomsList.map((r) => (
            <div 
              key={r} 
              // Highlights the room blue if it is currently active
              className={`room-item ${room.toLowerCase() === r.toLowerCase() ? "active" : ""}`}
              onClick={() => setRoom(r.toLowerCase())}
            >
              # {r}
            </div>
          ))}
        </div>

        {/* User Profile Section at Bottom */}
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
