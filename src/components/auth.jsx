import { auth, googleProvider } from '../config/firebase-config'
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import React, { use } from "react"
import {addDoc} from 'firebase/firestore'
import OpenAI from 'openai'

export default function Auth(props) {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [isNotFound, setIsNotFound] = React.useState(false)
    const [signUp, setSignUp] = React.useState(false)
    const [userName, setUserName] = React.useState("")
    const [isSafe, setIsSafe] = React.useState(false)
    const [currFile, setCurrFile] = React.useState({})
    const [imgData, setImgData] = React.useState([])
    const [linear, setLinear] = React.useState([])

    const signIn = () => {
        try {
            let found = false
            for (let i = 0; i < props.userList.length; i++)
            {
                if (email === props.userList[i].email && password === props.userList[i].password)
                {
                    found = true
                    props.handleSign(props.userList[i].username)
                }
            }
            setIsNotFound(!found)
            //await createUserWithEmailAndPassword(auth, email, password)
        } catch(err) {
            console.error(err)
        }
    }

    //auth?.currentUser?.displayName)

    const signInWithGoogle = () => {
        try {
            setSignUp(prev => !prev)
            //await signInWithPopup(auth, googleProvider)
        } catch(err) {
            console.error(err)
        }
    }

    const logOut = async () => {
        try {
            await signOut(auth)
        } catch(err) {
            console.error(err)
        }
    }

    const signUpFunc = async () => {
        let wrong = false
        for (let i = 0; i < props.userList.length; i++)
        {
            if (email === props.userList[i].email || userName === props.userList[i].username)
            {
                wrong = true
            }
        }
        if (!wrong) {
            await addDoc(props.coll, {username: userName, email: email, password: password, likes: []})
            props.handleSign(userName)
        }
        setIsSafe(wrong)
    }

    return (
        <div className="mainpage">
            {!signUp && <div className="signinform">
                <h1>Please Sign In</h1>

                <input
                    placeholder="Email..."
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    placeholder="Password..."
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={signIn}>Sign In</button>

                {isNotFound && <h3>Email or Password not found</h3>}

                <div className="horizontal_line"></div>

                <button onClick={signInWithGoogle}>Or, sign up...</button>

                {false && <button onClick={logOut}>Log Out</button>}
            </div>}
            {signUp && <div className="signinform">
                <h1>Sign Up!</h1>
                <input
                    placeholder="Username..."
                    type="text"
                    onChange={(e) => setUserName(e.target.value)}
                />
                <input
                    placeholder="Email..."
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    placeholder="Password..."
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                

                <button onClick={signUpFunc}>Sign up</button>

                {isSafe && <h3>Username and/or email is in use already.</h3>}

                <div className="horizontal_line"></div>
                <button onClick={signInWithGoogle}>Sign in</button>
            </div>}
        </div>
    )
}