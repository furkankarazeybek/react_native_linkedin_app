import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJJQAglq-3zbFfXH8cQ-VSOhrS37JXxy8",
  authDomain: "reactnativelinkedin-39a5c.firebaseapp.com",
  projectId: "reactnativelinkedin-39a5c",
  storageBucket: "reactnativelinkedin-39a5c.appspot.com",
  messagingSenderId: "708778698960",
  appId: "1:708778698960:web:a5323c05a769069094d6d5"
};

// Initialize Firebase
if(!firebase.apps.length)
{
    firebase.initializeApp(firebaseConfig)
}
export  {firebase} ;
