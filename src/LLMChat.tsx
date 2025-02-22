import { useState, useEffect } from "react";
import { MLCEngine, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { initializeMLCEngine } from "./CreateMLCEngine";

const LLMChat: React.FC = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("Svar kommer här...");
    const [engine, setEngine] = useState<MLCEngine | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>("Laddar modellen...");

    useEffect(() => {
        const loadModel = async () => {
            const mlcEngine = await initializeMLCEngine("Llama-3.1-8B-Instruct-q4f32_1", (status) => {
                setProgress(Math.round(status.progress * 100));
                setLoadingMessage(status.text);
            });

            if (mlcEngine) {
                setEngine(mlcEngine);
                setLoadingMessage("Modell laddad!");
                setProgress(null);
            } else {
                setLoadingMessage("Fel vid laddning av modellen.");
            }
        };

        loadModel();
    }, []);

    const handleSubmit = async () => {
        if (!engine) {
            setResponse("Modellen laddas... Vänta lite!");
            return;
        }

        setLoading(true);
        try {
            console.log("Genererar svar...");
            const messages: ChatCompletionMessageParam[] = [
                { role: "system", content: "Du är en hjälpsam AI-assistent." },
                { role: "user", content: input },
            ];

            const reply = await engine.chat.completions.create({ messages });

            setResponse(reply.choices[0]?.message.content || "Inget svar genererat.");
            console.log("Svar genererat!");
        } catch (error) {
            console.error("Fel vid generering:", error);
            setResponse("Ett fel uppstod vid generering.");
        }
        setLoading(false);
    };

    return (
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "auto", padding: "10px" }}>
            <h2>Lokal LLM Chatt</h2>
            <p>{loadingMessage}</p>
            {progress !== null && <progress value={progress} max="100" />}
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv din fråga här..."
                style={{ width: "100%", height: "100px" }}
            />
            <button onClick={handleSubmit} disabled={loading} style={{ margin: "10px", padding: "10px" }}>
                {loading ? "Genererar..." : "Skicka"}
            </button>
            <p>{response}</p>
        </div>
    );
};

export default LLMChat;
