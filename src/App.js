import React, { useState, useRef } from "react";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import AppWrapper from "./components/AppWrapper";
import Cookies from "universal-cookie";
import "./App.css";

const cookies = new Cookies();

function App() {
  // State to check if the user is authenticated via their cookie token
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  // State to hold the current active chat room name
  const [room, setRoom] = useState(null);

  // A reference to the input field where users type the room name
  const roomInputRef = useRef(null);

  // If the user isn't logged in, render the Auth component inside the wrapper
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
        /* If a room is selected, pass the room name down as a prop to the Chat component */
        <Chat room={room} />
      ) : (
        /* If no room is selected yet, show the UI to enter or join a room */
        <div className="room-container">
          <h2>Enter Room Name:</h2>
          <input 
            type="text" 
            placeholder="e.g., General, Coding, Sports..." 
            ref={roomInputRef} 
          />
          <button onClick={() => setRoom(roomInputRef.current.value.trim().toLowerCase())}>
            Join Chat Room
          </button>
        </div>
      )}
    </AppWrapper>
  );
}

export default App;
