import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
        apiKey: "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",
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