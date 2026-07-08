import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase-config";
import { collection, addDoc, where, serverTimestamp, onSnapshot, query } from "firebase/firestore";
import "../styles/Chat.css";

const messagesRef = collection(db, "messages");

export default function Chat({ activeRoom }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!activeRoom) return;

    // THE FIX: We removed orderBy() entirely. This prevents the silent Firebase index bug!
    const queryMessages = query(messagesRef, where("roomId", "==", activeRoom.id));
    
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let tempMessages = [];
      snapshot.forEach((doc) => {
        tempMessages.push({ ...doc.data(), id: doc.id });
      });
      
      // Sort messages locally in the browser to guarantee real-time sync across all devices
      tempMessages.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt ? b.createdAt.toMillis() : Date.now();
        return timeA - timeB;
      });

      setMessages(tempMessages);
    });
    
    return () => unsubscribe();
  }, [activeRoom]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newMessage.trim() === "" || !auth.currentUser) return;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      photo: auth.currentUser.photoURL,
      roomId: activeRoom.id, 
    });
    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Extract unique users who have chatted in this room for the "Participants" feature
  const activeParticipants = [...new Set(messages.map(m => m.user))];

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <h1>#{activeRoom.name} {activeRoom.isPrivate && "🔒"}</h1>
          <p className="room-meta">Created by {activeRoom.createdBy}</p>
        </div>
        
        {activeRoom.isPrivate && (
          <div className="invite-badge">
            Invite Code: <strong>{activeRoom.inviteCode}</strong>
          </div>
        )}
      </div>

      <div className="participants-bar">
        <span><strong>Active:</strong> {activeParticipants.length > 0 ? activeParticipants.join(", ") : "Just you so far!"}</span>
      </div>
      
      <div className="messages-feed">
        {messages.map((message) => (
          <div key={message.id} className="message-card">
            {message.photo ? (
              <img src={message.photo} alt="avatar" className="message-avatar" />
            ) : (
              <div className="message-avatar-fallback">{message.user?.charAt(0)}</div>
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
          placeholder={`Message #${activeRoom.name}`}
          className="message-input"
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
}
