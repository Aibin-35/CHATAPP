import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase-config";
// FIXED: Removed "orderBy" from this import so Firebase stops blocking the data
import { collection, addDoc, where, serverTimestamp, onSnapshot, query } from "firebase/firestore"; 
import "../styles/Chat.css";

const messagesRef = collection(db, "messages");

export default function Chat({ room }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const safeRoom = room.toLowerCase();
    
    // THE FIX: We removed orderBy("createdAt") here. Firebase will now send the data immediately to ALL users without demanding an index.
    const queryMessages = query(messagesRef, where("room", "==", safeRoom));
    
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let tempMessages = [];
      snapshot.forEach((doc) => {
        tempMessages.push({ ...doc.data(), id: doc.id });
      });
      
      // THE FIX: We sort the messages locally in React in milliseconds. No database index required!
      tempMessages.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt ? b.createdAt.toMillis() : Date.now();
        return timeA - timeB;
      });

      setMessages(tempMessages);
    });
    
    return () => unsubscribe();
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newMessage.trim() === "") return;
    if (!auth.currentUser) return;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName || "Unknown User",
      photo: auth.currentUser.photoURL || "",
      room: room.toLowerCase(), 
    });
    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>#{room.charAt(0).toUpperCase() + room.slice(1)}</h1>
        <p>Real-time chat powered by Firebase Authentication & Firestore</p>
      </div>
      
      <div className="messages-feed">
        {messages.map((message) => (
          <div key={message.id} className="message-card">
            {message.photo ? (
              <img src={message.photo} alt="avatar" className="message-avatar" />
            ) : (
              <div className="message-avatar-fallback">{message.user?.charAt(0) || "?"}</div>
            )}
            <div className="message-details">
              <span className="message-user">{message.user}</span>
              <span className="message-time">{formatTime(message.createdAt)}</span>
            </div>
            <p className="message-text">{message.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message #${room}`}
          className="message-input"
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
}
