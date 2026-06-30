import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase-config";
import { collection, addDoc, where, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import "../styles/Chat.css";

const messagesRef = collection(db, "messages");

// Added setRoom as a prop here so we can trigger the exit function
export default function Chat({ room, setRoom }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  // Ref to automatically scroll to the newest message
  const bottomRef = useRef(null);

  useEffect(() => {
    const queryMessages = query(messagesRef, where("room", "==", room), orderBy("createdAt"));
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let tempMessages = [];
      snapshot.forEach((doc) => {
        tempMessages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(tempMessages);
    });
    return () => unsubscribe();
  }, [room]);

  // Logic: Triggers an auto-scroll to the bottom of the chat every time the 'messages' array updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newMessage.trim() === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      photo: auth.currentUser.photoURL,
      room: room, 
    });
    setNewMessage("");
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>Room: <span>{room.toUpperCase()}</span></h1>
        {/* Logic: Clicking this button sets the active room to null in App.js, returning the user to the lobby */}
        <button className="exit-button" onClick={() => setRoom(null)}>Exit Room</button>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => {
          // Logic: Determines if the message was sent by the currently logged-in user to apply the correct CSS alignment class
          const isMe = message.user === auth.currentUser.displayName;
          
          return (
            <div key={message.id} className={`message-wrapper ${isMe ? "my-message" : "other-message"}`}>
              <div className="message-bubble">
                {!isMe && message.photo && <img src={message.photo} alt="avatar" className="avatar" />}
                <div className="message-content">
                  {!isMe && <span className="user-name">{message.user}</span>}
                  <p className="message-text">{message.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        {/* An empty invisible div at the bottom of the feed for the auto-scroll to target */}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="new-message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="new-message-input"
          placeholder="Type your message here..."
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
}
