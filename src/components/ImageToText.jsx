import React from "react"
import {getDocs, collection, addDoc, deleteDoc, doc} from "firebase/firestore"
import Anthropic from "@anthropic-ai/sdk"
import ReactMarkdown from "react-markdown"

import { getAI } from "../ai"
import Flashcard from "./Flashcard"

export default function ImageToText(props) {

    const formData = new FormData()

    const [currFile, setCurrFile] = React.useState({})
    const [imgData, setImgData] = React.useState([])
    const [linear, setLinear] = React.useState([])
    const [isReady, setIsReady] = React.useState(false)
    const [resp, setResp] = React.useState("")
    const [front, setFront] = React.useState("")
    const [back, setBack] = React.useState("")
    const [passedArr, setPassedArr] = React.useState([])
    
    const handleFiles = (e) => {
        setCurrFile(e.target.files[0])
    }
    
    const important = () => {
        console.log(currFile)
        formData.append("image", currFile)
        fetch("https://api.api-ninjas.com/v1/imagetotext", {
            method: "POST",
            headers: {
                "X-Api-Key": "ShlxnZh/n+gQcaBmWyyoRg==SK8DhVp32JOOYkLT"
            },
            body: formData
        }).then(response => response.json()).then(data => setImgData(data))
    }

    const loopy = async () => {
        let lines = []
        let currLine = ""
        for (let i = 0; i < imgData.length - 1; i++)
        {
            //console.log(imgData[i].text)
            //console.log(imgData[i].bounding_box.y1)
            //console.log(imgData[i+1].bounding_box.y1)
            if (Math.abs(imgData[i].bounding_box.y1 - imgData[i + 1].bounding_box.y1) <= 20)
            {
                currLine += imgData[i].text + " "
                if (i === imgData.length - 2)
                {
                    currLine += imgData[i + 1].text
                    lines.push(currLine)
                }
            }
            else
            {
                currLine += imgData[i].text
                lines.push(currLine)
                currLine = ""
                if (i === imgData.length - 2)
                {
                    currLine += imgData[i + 1].text
                    lines.push(currLine)
                }
            }
            
            //console.log(currLine)
        }
        //console.log(lines)
        setLinear(lines)
        await addDoc(props.coll, {data: lines})
    }

    async function test() {
        const response = await getAI(["Christopher Columbus sailed the sea", "He did so in 1492", "He was an excellent sailor"])
        setResp(response)
        const newResponse = response.split("\n")
        setPassedArr(newResponse)
        let lengthTrack = 0
        for (let i = 0; i < newResponse.length; i += 2) {
            const newer = newResponse[i].split("->")
            console.log(newer[0])
            console.log(newer[1])
            setFront(newer[0])
            setBack(newer[1])
        }
        setIsReady(true)
    }

    const mapper = linear.map(
        (line) => {
                    return <li key={line}>{line}</li>
                }
    )

    return (
        <>
        {props.username.length > 0 && <div>
            <input type="file" id="fileInput" onChange={(e) => handleFiles(e)}/>

            <button onClick={important}>Important</button>

            <button onClick={loopy}>Loop</button>

            <ul style={{color: "white"}}>{mapper}</ul>

            {linear.length >= 0 && <button onClick={test}>Analyze</button>}

            {isReady && <div className="markdown"><ReactMarkdown>{resp}</ReactMarkdown></div>}

            {isReady && <Flashcard front={front} back={back} passedArr={passedArr}/>}
        </div>}
        </>
    )
}