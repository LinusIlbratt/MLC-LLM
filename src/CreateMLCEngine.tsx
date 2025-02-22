import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

const HF_TOKEN = import.meta.env.VITE_API_KEY; 
const DEFAULT_MODEL = "meta-llama/Llama-3.2-3B-Instruct";

const fetchModelConfig = async (modelName: string) => {
    const url = `https://huggingface.co/mlc-ai/${modelName}/resolve/main/mlc-chat-config.json`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Misslyckades att hämta modellkonfiguration: ${response.statusText}`);
        }

        console.log("Modellkonfiguration hämtad!");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const initializeMLCEngine = async (
    modelName: string = DEFAULT_MODEL, 
    onProgress?: (progress: { progress: number; text: string }) => void
): Promise<MLCEngine | null> => {
    try {
        const correctedModelName = modelName.endsWith("-MLC") ? modelName : `${modelName}-MLC`;

        console.log("Laddar modell:", correctedModelName);

        if (sessionStorage.getItem("modelLoaded")) {
            console.log("Modell redan laddad, hoppar över.");
            return null;
        }

        const modelConfig = await fetchModelConfig(correctedModelName);
        if (!modelConfig) {
            console.error("Kunde inte hämta modellkonfiguration.");
            return null;
        }

        const appConfig = {
            useIndexedDBCache: true,
            model_list: [
                {
                    model: `https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f32_1-MLC`,
                    model_id: "Llama-3.1-8B-Instruct-q4f32_1-MLC",
                    model_lib: `https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_48/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm`, // ✅ Bytt till rätt fil
                },
            ],
        };
        
        

        const mlcEngine = await CreateMLCEngine(correctedModelName, {
            appConfig,
            initProgressCallback: (status) => {
                if (onProgress) {
                    onProgress({ progress: status.progress, text: status.text });
                }
                console.log("Laddningsstatus:", status);
            },
        });

        console.log("Modell laddad!");

        sessionStorage.setItem("modelLoaded", "true");

        return mlcEngine;
    } catch (error) {
        console.error("Misslyckades att ladda modellen:", error);
        return null;
    }
};

