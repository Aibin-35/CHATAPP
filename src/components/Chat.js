import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase-config";
import {
  collection,
  addDoc,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import "../styles/Chat.css";

// FIXED: Moved messagesRef OUTSIDE the component so it doesn't trigger the useEffect dependency warning
const messagesRef = collection(db, "messages");

export default function Chat({ room }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Effect hook to listen for real-time updates from Firestore
  useEffect(() => {
    // Logic: Create a query that filters the 'messages' collection where the 'room' matches.
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt")
    );

    // Set up the real-time listener
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let tempMessages = [];
      snapshot.forEach((doc) => {
        tempMessages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(tempMessages);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [room]); // React is now perfectly happy with just 'room' here!

  // Handler function for submitting a new message
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newMessage.trim() === "") return;

    // Logic: Add a new document to the messages collection
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
      <div className="header">
        <h1>Welcome to Room: <span className="room-title">{room.toUpperCase()}</span></h1>
      </div>
      
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <span className="user">
              {message.photo && <img src={message.photo} alt="avatar" className="avatar" />}
              <strong>{message.user}:</strong>
            </span>
            <p className="message-text">{message.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="new-message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="new-message-input"
          placeholder="Type your message here..."
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}
