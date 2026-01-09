import React from "react"
import {getDocs, collection, addDoc, deleteDoc, doc, getDoc, updateDoc} from "firebase/firestore"
import Anthropic from "@anthropic-ai/sdk"
import ReactMarkdown from "react-markdown"

import { ocrKey } from "../ai"

import { db } from "../config/firebase-config"

import { getAI, getAITitle } from "../ai"
import Flashcard from "./Flashcard"
import { playAudio } from "openai/helpers/audio.mjs"

export default function ImageToText(props) {

    const didMount = React.useRef(false)

    const didMountBig = React.useRef(false)

    const didMountStatus = React.useRef(false)

    const formData = new FormData()

    const [currFile, setCurrFile] = React.useState({})
    const [imgData, setImgData] = React.useState([])
    const [linear, setLinear] = React.useState([])
    const [isReady, setIsReady] = React.useState(false)
    const [resp, setResp] = React.useState("")
    const [front, setFront] = React.useState("")
    const [back, setBack] = React.useState("")
    const [passedArr, setPassedArr] = React.useState(0)

    const [passedTwoD, setPassedTwoD] = React.useState([[]])

    const [status, setStatus] = React.useState("")

    const [isProcessing, setIsProcessing] = React.useState(false)

    const [isProcessed, setIsProcessed] = React.useState(false)

    const [importantId, setImportantId] = React.useState("")

    const [isReadyTwo, setIsReadyTwo] = React.useState(false)

    const [isError, setIsError] = React.useState(false)

    const [isProcessingOriginal, setIsProcessingOriginal] = React.useState(false)

    const [isProcessingShow, setIsProcessingShow] = React.useState(false)

    const [isProcessingBig, setIsProcessingBig] = React.useState(false)
    
    function handleFiles(e) {
        setCurrFile(e.target.files[0])
    }

    /*const apiKey = "AIzaSyBV4yvISDWQlrK4-Xi2XGkgSxma6O-Tb8M"
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`*/

    
    
    const important = () => {
        //console.log(currFile)
        setIsProcessingOriginal(true)
        setIsProcessingShow(true)
    }

    //console.log(imgData.status)

    //console.log(Object.keys(imgData).length)

    //console.log(currFile.name)

    const checker = async () => {
        fetch('https://www.handwritingocr.com/api/v3/documents?page=1&per_page=100', {
            headers: {
                'Authorization': `Bearer ${ocrKey}`,
                'Accept': 'application/json'
            }
        }).then(response => response.json()).then(data => setStatus(data.documents[0].status))
    }

    const loopy = async () => {
        if (status === "processed")
        {
            
        }
        else {
            setIsProcessingBig(true)
            setIsProcessingShow(true)
        }
    }

    React.useEffect(() => {
        if (!didMountBig.current) {
            didMountBig.current = true
            return
        }
        //console.log("Checking.")
        fetch('https://www.handwritingocr.com/api/v3/documents?page=1&per_page=100', {
            headers: {
                'Authorization': `Bearer ${ocrKey}`,
                'Accept': 'application/json'
            }
        }).then(response => response.json()).then(data => 
            {
                //console.log("Gotem.")
                //setStatus(data.documents[0].status)
                if (data.documents[0].status === "processed")
                {
                    setIsProcessingShow(false)
                    setStatus("processed")
                }
                else {
                    setIsProcessingBig(prev => !prev)
                }
            })
    }, [isProcessingBig])

    React.useEffect(() => {
        if (!didMountStatus.current) {
            didMountStatus.current = true
            return
        }

        console.log("Status changed.")
        
        let fetchedData = []

        setIsProcessingShow(true)
            fetch(`https://www.handwritingocr.com/api/v3/documents/${imgData.id}`, {
                headers: {
                    'Authorization': `Bearer ${ocrKey}`,
                    'Accept': 'application/json'
                }
            }).then(response => response.json()).then(data => {
                fetchedData = data.results[0].transcript.split("\n")
                setLinear(data.results[0].transcript.split("\n"))
            }).then(() => {
                getAI(fetchedData).then(response => {
                    setResp(response)
                const newResponse = response.split("\n")
                let lengthTrack = 0
                let qapair = [[]]
                for (let i = 0; i < newResponse.length; i += 2) {
                    
                    const newer = newResponse[i].split("->")
                    //console.log(newer[0])
                    //console.log(newer[1])
                    setFront(newer[0])
                    setBack(newer[1])
                    qapair.push([])
                    qapair[lengthTrack][0] = newer[0]
                    qapair[lengthTrack][1] = newer[1]
                    lengthTrack++
                }
                //console.log(qapair)
                setPassedArr(lengthTrack)
                
                setPassedTwoD(qapair)
                setIsProcessed(false)
                let docID = ""
                getAITitle(fetchedData).then(response => {addDoc(props.coll, {data: newResponse, emailWith: props.email, title: response, idWith: ""}).then((doc) => setImportantId(doc.id)).then(() => {
                    setIsProcessingShow(false)
                    setIsReady(true)

                })})
                })
                
            })
            let lines = []
            let currLine = ""
            for (let i = 0; i < imgData.length - 1; i++)
            {
                lines.push(imgData[i].LineText)
            }
    }, [status])

    async function test() {
        
    }

    const mapper = linear.map(
        (line) => {
                    return <li key={line}>{line}</li>
                }
    )

    function hiddenFunc() {
        try {
            let trackID = ""
            let docRef
            getDoc(doc(db, "notelists", importantId)).then(data => {
                console.log(data.id)
                trackID = data.id
                docRef = doc(db, "notelists", trackID)
            }).then(() => updateDoc(docRef, {
                idWith: trackID
            }))
            setIsReadyTwo(true)
            setIsError(false)
        }
        catch {
            setIsReadyTwo(false)
            setIsError(true)
        }
    }

    console.log(importantId)

    React.useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        formData.append("file", currFile)
        formData.append("action", "transcribe")
        formData.append("delete_after", "604800")
        fetch("https://www.handwritingocr.com/api/v3/documents", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ocrKey}`,
                "Accept": "application/json"
            },
            body: formData
        }).then(response => response.json()).then(data => setImgData(data)).then(() => console.log("listo")).then(() => setIsProcessingShow(false))
    }, [isProcessingOriginal])

    return (
        <>
        {props.username.length > 0 && <div>
            <input type="file" id="fileInput" onChange={(e) => handleFiles(e)}/>

            <button onClick={important}>Extract text</button>

            {Object.keys(imgData).length > 0 && <button onClick={loopy}>Generate flashcards</button>}

            {isProcessingShow && <h1 style={{color: "white"}}>Processing...</h1>}

            {isProcessing && <h1 style={{color: "white"}}>Processing... Please try again in a few seconds.</h1>}

            {isProcessed && <h1 style={{color: "white"}}>Processed... Please wait.</h1>}

            {isReady && <button onClick={hiddenFunc}>Show flashcards</button>}

            {isError && <h1 style={{color: "white"}}>Please try again in a few seconds.</h1>}

            {false && <ul style={{color: "white"}}>{mapper}</ul>}

            {isReadyTwo && <div className="markdown"><ReactMarkdown>{resp}</ReactMarkdown></div>}

            {isReadyTwo && <div className="flashZone"><Flashcard passedArr={passedArr} passedTwoD={passedTwoD}/></div>}
        </div>}
        </>
    )
}