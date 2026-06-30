import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase-config";
import { collection, addDoc, where, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import "../styles/Chat.css";

const messagesRef = collection(db, "messages");

export default function Chat({ room }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    // FIX 7: Guarantee the query is always lowercase so all devices find the same messages
    const safeRoom = room.toLowerCase();
    const queryMessages = query(messagesRef, where("room", "==", safeRoom), orderBy("createdAt"));
    
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let tempMessages = [];
      snapshot.forEach((doc) => {
        tempMessages.push({ ...doc.data(), id: doc.id });
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
    
    // FIX 8: Prevent sending if Firebase hasn't locked in the user yet
    if (!auth.currentUser) return;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName || "Unknown User",
      photo: auth.currentUser.photoURL || "",
      room: room.toLowerCase(), // Force lowercase saving
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
