import { useState, useEffect } from "react"
import Header from "./components/Header"
import Auth from "./components/auth"
import {db} from './config/firebase-config'
import {getDocs, collection, addDoc, deleteDoc, doc} from "firebase/firestore"
import ImageToText from "./components/ImageToText"
import Flashcard from "./components/Flashcard"

export default function App() {
  const [userList, setUserList] = useState([])

  const [signedIn, setSignedIn] = useState(false)

  const [isRepeat, setIsRepeat] = useState(false)

  const [newUsername, setNewUsername] = useState("")

  const usersCollectionRef = collection(db, "users")
  const notesCollectionRef = collection(db, "notelists")

  const [userName, setUsername] = useState("h")

  const getUserList = async () => {
      try {
      const data = await getDocs(usersCollectionRef)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }))
      setUserList(filteredData)
      } catch (err) {
        console.error(err)
      }
    }

  useEffect(() => {
    getUserList()
  }, [])

  const onSubmitUser = async () => {
    try {
    for (let i = 0; i < userList.length; i++)
    {
      if (userList[i].username === newUsername) {
        console.log("No repeats!!")
      }
    }
    await addDoc(usersCollectionRef, {username: newUsername, likes: []})
    getUserList()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteUser = async (id) => {
    try {
      const userDoc = doc(db, "users", id)
      await deleteDoc(userDoc)
      getUserList()
    } catch (err) {
      console.error(err)
    }
  }

  function changeUserNameLive(event) {
    setNewUsername(event.target.value)
    //console.log(event.target.value)
    let found = false
    for (let i = 0; i < userList.length; i++)
    {
      if (event.target.value === userList[i].username) {
        found = true
      }
    }
    if (found) {
      setIsRepeat(true)
    }
    else {
      setIsRepeat(false)
    }
    getUserList()
  }

  return (
    <>
      <Header name={userName} handler={setUsername}/>
      {userName.length <= 0 && <Auth userList={userList} handleSign={setUsername} coll={usersCollectionRef}/>}

      {false && <div style={{color: "white"}}>
        <input placeholder="Username..." onInput={(e) => changeUserNameLive(e)}/>
        <button onClick={onSubmitUser}>Add User</button>
      </div>}

      {signedIn && <div style={{color:"white"}}>
        {userList.map((user) => (
          <div>
            <h1>{user.username}</h1>
            <p>Enjoys: {user.likes.join(", ")}</p>
            <button onClick={() => deleteUser(user.id)}>Delete User</button>
          </div>
        ))}
      </div>}

      {userName.length > 0 && <h1>Lets go</h1>}

      <ImageToText username={userName} coll={notesCollectionRef}/>
    </>
  )
}