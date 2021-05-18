import React, { useEffect, useRef, useState } from 'react'
import { formatRelative } from 'date-fns';
import firebase from 'firebase';

const formatDate = date => {
  let formattedDate = '';
  if (date) {
    // Convert the date in words relative to the current date
    formattedDate = formatRelative(date, new Date());
    // Uppercase the first letter
    formattedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }
  return formattedDate;
};

const db = firebase.firestore();
const query = db.collection('messages').orderBy('createdAt').limit(100);

const Message = ({
  createdAt = null,
  text = '',
  displayName = '',
  photoURL = '',
}) => {

  if (!text) return null;
  
  return <div>
     {photoURL ? (
        <img
          src={photoURL}
          alt="Avatar"
          className="rounded-full mr-4"
          width={45}
          height={45}
        />
      ) : null}
      {displayName ? <p>{displayName}</p> : null}
      {createdAt?.seconds ? (
        <span>{formatDate(new Date(createdAt.seconds * 1000))}</span>
      ) : null}
      <p>{text}</p>
  </div>;
};

const Channel = ({ user = null }) => {
const { uid, displayName, photoURL } = user;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const inputRef=useRef(null)

  useEffect(() => {
  // Subscribe to query with onSnapshot
  
  const unsubscribe = query.onSnapshot(querySnapshot => {
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
    setMessages(data);
  });

  // Detach listener
  return unsubscribe;
}, []);



  const handleOnChange = e => {
    setNewMessage(e.target.value);
  };

  const handleOnSubmit = e => {
  e.preventDefault();

  const trimmedMessage = newMessage.trim();
  if (trimmedMessage) {
    // Add new message in Firestore
    let messagesRef=db.collection("messages")
    messagesRef.add({
      text: trimmedMessage,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
      photoURL,
    });
    // Clear input field
    setNewMessage('');
  }
};

  return  (<>
  <ul>
      {messages.map(message => (
        <>
        <li key={message.id}>{message.text}</li>
        <Message {...message} />
          </>
      ))}
    </ul>
     <form
        onSubmit={handleOnSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={handleOnChange}
          placeholder="Type your message here..."
        />
        <button
          type="submit"
          disabled={!newMessage}
        >
          Send
        </button>
      </form>  
  </>)
};

export default Channel;