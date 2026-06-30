import React, { useState, useRef } from "react";
// Fixed: Using named imports with curly braces to match the repository's export structure
import { Auth } from "./components/Auth";
import Chat from "./components/Chat"; 
import { AppWrapper } from "./components/AppWrapper";
import Cookies from "universal-cookie";
import "./App.css";

const cookies = new Cookies();

function App() {
  // State to track if the user is authenticated via their cookie token
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  
  // State to hold the current active chat room name input by the user
  const [room, setRoom] = useState(null);

  // Reference hook to grab the text value from the input field cleanly
  const roomInputRef = useRef(null);

  // Guard Clause: If the user is not authenticated, render the Auth login screen
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
        /* UI Logic: If a room name exists in state, render that specific room's chat feed */
        <Chat room={room} />
      ) : (
        /* UI Logic: If no room is active, render the welcome screen to create/join a room */
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
