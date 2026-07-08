import React, { useState, useEffect } from "react";
import { Auth } from "./components/Auth";
import Chat from "./components/Chat"; 
import Cookies from "universal-cookie";
import { db, auth } from "./firebase-config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import "./App.css";

const cookies = new Cookies();
const roomsRef = collection(db, "rooms");

export default function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  
  // Advanced State for Rooms
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  
  // UI State for Creating/Joining
  const [newRoomName, setNewRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // 1. Wait for Firebase Auth to load securely
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoaded(true);
      if (user) {
        // Try to load the last visited room from local memory
        const savedRoom = localStorage.getItem("activeRoom");
        if (savedRoom) setActiveRoom(JSON.parse(savedRoom));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch all rooms from Firebase globally (No indexes required!)
  useEffect(() => {
    if (!isAuth) return;
    const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
      const fetchedRooms = [];
      snapshot.forEach((doc) => {
        fetchedRooms.push({ id: doc.id, ...doc.data() });
      });
      setRooms(fetchedRooms);
    });
    return () => unsubscribe();
  }, [isAuth]);

  // 3. Save active room to local storage so refreshes don't break the UI
  useEffect(() => {
    if (activeRoom) {
      localStorage.setItem("activeRoom", JSON.stringify(activeRoom));
    }
  }, [activeRoom]);

  const handleLogout = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setActiveRoom(null);
    localStorage.removeItem("activeRoom");
  };

  const createRoom = async () => {
    if (newRoomName.trim() === "") return;
    
    // Generate a 6-character random invite code if private
    const inviteCode = isPrivate ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;

    const newRoomData = {
      name: newRoomName.trim(),
      isPrivate: isPrivate,
      inviteCode: inviteCode,
      createdBy: auth.currentUser.displayName || "Unknown",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(roomsRef, newRoomData);
    const createdRoom = { id: docRef.id, ...newRoomData };
    
    setActiveRoom(createdRoom);
    setNewRoomName("");
    setIsPrivate(false);
  };

  const joinPrivateRoom = () => {
    const roomToJoin = rooms.find(r => r.inviteCode === joinCode.trim().toUpperCase());
    if (roomToJoin) {
      setActiveRoom(roomToJoin);
      setJoinCode("");
    } else {
      alert("Invalid Invite Code!");
    }
  };

  if (!isAuth) {
    return <div className="auth-wrapper"><Auth setIsAuth={setIsAuth} /></div>;
  }

  if (!isUserLoaded) return <h2 style={{color: "white", textAlign: "center", marginTop: "20vh"}}>Loading Secure Chat...</h2>;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="sidebar-title">Server Hub</h2>
        
        {/* CREATE ROOM UI */}
        <div className="sidebar-section">
          <h3>Create a Room</h3>
          <input 
            type="text" 
            placeholder="Room Name" 
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="ui-input"
          />
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={isPrivate} 
              onChange={(e) => setIsPrivate(e.target.checked)} 
            /> Make Private
          </label>
          <button onClick={createRoom} className="ui-btn create-btn">Create</button>
        </div>

        {/* JOIN PRIVATE ROOM UI */}
        <div className="sidebar-section">
          <h3>Join Private Room</h3>
          <div className="flex-row">
            <input 
              type="text" 
              placeholder="Invite Code" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="ui-input short-input"
            />
            <button onClick={joinPrivateRoom} className="ui-btn join-btn">Join</button>
          </div>
        </div>

        {/* PUBLIC ROOMS LIST */}
        <div className="room-list">
          <h3>Public Rooms</h3>
          {rooms.filter(r => !r.isPrivate).map((r) => (
            <div 
              key={r.id} 
              className={`room-item ${activeRoom?.id === r.id ? "active" : ""}`}
              onClick={() => setActiveRoom(r)}
            >
              # {r.name}
            </div>
          ))}
        </div>

        {/* USER PROFILE */}
        <div className="user-profile">
          <img src={auth.currentUser?.photoURL || "https://via.placeholder.com/50"} alt="Profile" className="profile-pic" />
          <div className="profile-info">
            <span className="profile-name">{auth.currentUser?.displayName}</span>
          </div>
          <button onClick={handleLogout} className="ui-btn logout-btn">Logout</button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="main-chat-area">
        {activeRoom ? (
          <Chat activeRoom={activeRoom} />
        ) : (
          <div className="empty-chat-state">
            <h2>Select or create a room to start chatting!</h2>
          </div>
        )}
      </div>
    </div>
  );
}
