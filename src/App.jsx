import { useState, useEffect, useRef } from "react"
import Header from "./components/Header"
import Auth from "./components/auth"
import {auth, db} from './config/firebase-config'
import {getDocs, collection, addDoc, deleteDoc, doc} from "firebase/firestore"
import ImageToText from "./components/ImageToText"
import Flashcard from "./components/Flashcard"
import SetCard from "./components/SetCard"
import SetsZone from "./components/SetsZone"
import { anthroKey, ocrKey } from "./ai"
import { signOut } from "firebase/auth"
import StudyBreak from "./components/studybreak"

export default function App() {
  const [userList, setUserList] = useState([])
  const [notesList, setNotesList] = useState([])

  const ogMount = useRef(false)

  const [isBreak, setIsBreak] = useState(false)

  const [signedIn, setSignedIn] = useState(false)

  const [isRepeat, setIsRepeat] = useState(false)

  const [newUsername, setNewUsername] = useState("")

  const usersCollectionRef = collection(db, "users")
  const notesCollectionRef = collection(db, "notelists")

  const [userName, setUsername] = useState("")

  const [email, setEmail] = useState("")

  const [setNum, setSetNum] = useState(0)

  const [mySets, setMySets] = useState([[]])

  const [isSets, setIsSets] = useState(false)

  const [isUpload, setIsUpload] = useState(false)

  const[leaving, setLeaving] = useState(false)

  async function checkSets() {
    const data = await getDocs(notesCollectionRef)
    const filteredData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }))
    setNotesList(filteredData)
  }

  const getUserList = async () => {
      try {
      const data = await getDocs(usersCollectionRef)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }))
      setUserList(filteredData)
      } catch (err) {
        //console.error(err)
      }
    }

  useEffect(() => {
    getUserList()
    checkSets()
    displaySets()
  }, [])

  useEffect(() => {
    checkSets()
    displaySets()
  }, [userName.length])

  function displaySets() {
    //console.log("Running")
    let setNumm = 0
    let tempSet = []
    for (let i = 0; i < notesList.length; i++) {
      //console.log("Email with: " + notesList[i].emailWith)
      if (notesList[i].emailWith === email && notesList[i].title !== undefined && notesList[i].idWith !== undefined) {
        //console.log("Match!")
        setNumm++
        tempSet.push([notesList[i].emailWith, notesList[i].data, notesList[i].title, notesList[i].idWith])
      }
    }
    setSetNum(setNumm)
    setMySets(tempSet)
    //console.log(tempSet)
    //console.log(tempSet.length)
  }

  const setMapper = mySets.map((currSet) => {
    if (currSet[2] !== undefined && currSet[3].length > 0 && currSet[1] !== undefined)
    {
    return <SetCard coll={notesCollectionRef} allData={currSet} key={currSet} name={currSet[2]} data={currSet[1]} importantID={currSet[3]}/>
    }
  })

  const onSubmitUser = async () => {
    try {
    for (let i = 0; i < userList.length; i++)
    {
      if (userList[i].username === newUsername) {
        //console.log("No repeats!!")
      }
    }
    await addDoc(usersCollectionRef, {username: newUsername, likes: []})
    getUserList()
    } catch (err) {
      //console.error(err)
    }
  }

  const deleteUser = async (id) => {
    try {
      const userDoc = doc(db, "users", id)
      await deleteDoc(userDoc)
      getUserList()
    } catch (err) {
      //console.error(err)
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

  //console.log("Email: "+ email)

  //getDocs(notesCollectionRef).then(data => console.log(data))

  //console.log(ocrKey)

  //console.log(anthroKey)

  useEffect(() => {
    if (!ogMount.current) {
      ogMount.current = true
      return
    }

    signOut(auth).then(() => console.log("Done")).then(() => setUsername(""))
  }, [leaving])

  console.log(leaving)
  console.log(userName.length)

  return (
    <>
      <Header name={userName} handler={setUsername} toSign={setLeaving}/>
      {(userName.length <= 0) && <Auth userList={userList} handleSign={setUsername} handleMail={setEmail} coll={usersCollectionRef} toSign={leaving}/>}

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

      {userName.length > 0 && <div className="chooser">
        <button onClick={() => setIsSets(prev => !prev && !isUpload && !isBreak)}>My Sets</button>
        <button onClick={() => setIsUpload(prev => !prev && !isSets && !isBreak)}>Upload Files</button>
        <button onClick={() => setIsBreak(prev => !prev && !isSets && !isUpload)}>Take a study break</button>
      </div>}

      {isSets && <SetsZone userName={userName} setNum={setNum} setMapper={setMapper}/>}

      {isUpload && <ImageToText username={userName} coll={notesCollectionRef} email={email}/>}

      {isBreak && <StudyBreak />}
    </>
  )
}