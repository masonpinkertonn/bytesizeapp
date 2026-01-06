import ReactMarkdown from "react-markdown"
import { useState } from "react"

export default function Flashcard(props) {
    const [answer, setAnswer] = useState(false)

    function handleFlip() {
        setAnswer(prev => !prev)
    }

    return(
        <div className="flashZone">
            <div className="flashcard">
                {!answer && <h1 className="frontcard"><ReactMarkdown>{props.front}</ReactMarkdown></h1>}
                {answer && <h1 className="frontcard"><ReactMarkdown>{props.back}</ReactMarkdown></h1>}
                <button className="flipper" onClick={handleFlip}>Flip card</button>
            </div>
            <h1 className="counter">0 / {props.passedArr.length}</h1>
        </div>
    )
}