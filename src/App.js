import React, { useState, useRef } from "react";
import { Auth } from "./components/Auth";
import Chat from "./components/Chat"; 
import { AppWrapper } from "./components/AppWrapper";
import Cookies from "universal-cookie";
import "./App.css";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null);
  const roomInputRef = useRef(null);

  if (!isAuth) {
    return (
      <AppWrapper isAuth={isAuth} setIsAuth={setIsAuth} setIsInChat={!!room}>
        <Auth setIsAuth={setIsAuth} />
      </AppWrapper>
    );
  }

  return (
    <AppWrapper isAuth={isAuth} setIsAuth={setIsAuth} setIsInChat={!!room}>
      {room ? (
        /* Passing setRoom down to the Chat component so the user can click "Exit" to set the room back to null */
        <Chat room={room} setRoom={setRoom} />
      ) : (
        /* Updated UI: Makes it clear to the user that this single input handles both creating and joining */
        <div className="room-container">
          <h2>Create or Join a Chat Room</h2>
          <p>Type a room name below. If it exists, you will join it. If not, you will create a new one!</p>
          <input 
            type="text" 
            placeholder="e.g., General, Project, Sports..." 
            ref={roomInputRef} 
          />
          <button onClick={() => {
            // Grabs the input, removes extra spaces, and forces lowercase to prevent duplicate rooms like "General" and "general"
            const enteredRoom = roomInputRef.current.value.trim().toLowerCase();
            if (enteredRoom) setRoom(enteredRoom);
          }}>
            Enter Room
          </button>
        </div>
      )}
    </AppWrapper>
  );
}

export default App;
