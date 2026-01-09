import Anthropic from "@anthropic-ai/sdk"

//import fs from "fs/promises"

//import vision from "@google-cloud/vision"

//const vision = require("@google-cloud/vision")

/*const client = new vision.ImageAnnotatorClient({
    keyFilename: "ustudy-483603-f4019647ec57.json"
})

/*const img = "../src/images/pfp.jpg"

const image = await fs.readFile(img)*/

export const ocrKey = process.env.ocrKey

const anthropic = new Anthropic({
        apiKey: process.env.anthroKey,
        dangerouslyAllowBrowser: true
    })

export async function getAI(notesdata) {
    const notes = notesdata.join("...newline...")

    const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [
            {
                role: "user",
                content: `Create flashcards from the given notes, using as much of the information as possible. Format them as front -> back and then a new line. Make sure to specifically use "->" when doing front to back: ${notes}`
            }
        ]
    })

    return msg.content[0].text
}

export async function getAITitle(notesdata) {
    const notes = notesdata.join("...newline...")

    const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [
            {
                role: "user",
                content: `The following notes were used to make flashcards. Generate a basic title describing the flashcard set, 2-10 words. Notes are as follows: ${notes}`
            }
        ]
    })

    return msg.content[0].text
}