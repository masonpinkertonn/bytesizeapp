import { getAIFact } from "../ai"

import { useEffect, useState, useRef } from "react"

export default function StudyBreak() {
    const ogMount = useRef(false)

    const [fact, setFact] = useState("")

    const [catalyst, setCatalyst] = useState(false)

    const [response, setResponse] = useState("")

    const [isProcessing, setIsProcessing] = useState(true)

    const [facts, setFacts] = useState([])

    const [currIndex, setCurrIndex] = useState(0)

    useEffect(() => {
        getAIFact().then(data => {setResponse(data); setFacts(prev => [...prev, data])}).then(() => setIsProcessing(false))
    }, [catalyst])

    console.log(facts)

    function makeNext() {
        if (currIndex + 1 === facts.length) {
            setCatalyst(prev => !prev); setIsProcessing(true); setCurrIndex(prev => ++prev)
        }
        else {
            setCurrIndex(prev => ++prev)
        }
    }

    function goBack() {
        if (currIndex > 0) {
            setCurrIndex(prev => --prev)
        }
    }

    return (
        <div className="factarea">
            <button onClick={() => goBack()}>&uarr;</button>
            <div className="factcard">
            <p style={{color: "white"}}>{isProcessing ? "Processing..." : facts[currIndex]}</p>
            </div>
            <button onClick={() => makeNext()}>&darr;</button>
        </div>
    )
}