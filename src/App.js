import './App.css';
import Button from './component/button';
import firebase from './firebase'
import { useState,useEffect } from 'react';
import Channel from './component/channel';

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(() => firebase.auth().currentUser);
  
  useEffect(() => {
  const unsubscribe = firebase.auth().onAuthStateChanged(user => {
    if (user) {
      setUser(user);
    } else {
      setUser(false);
    }
    if (initializing) {
      setInitializing(false);
    }
  });

  // Cleanup subscription
  return unsubscribe;
}, [initializing]);
  const signInWithGoogle = async () => {
    // Get Google provider object
    const provider = new firebase.auth.GoogleAuthProvider();
    // Set language to the default browser preference
    firebase.auth().useDeviceLanguage();
    // Start sign in
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.log(error.message);
    }
  };

    const signOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.log(error.message);
    }
  };
  
  return (
    <div>
      {
        user ? (
          <>
            <Button onClick={signOut}>Sign out</Button>
            <p>Welcome to the chat!</p>
            <Channel user={user} />
          </>
        ) :
      <Button onClick={signInWithGoogle}>Sign in with Google</Button>
        }
    </div>
  );
}

export default App;
