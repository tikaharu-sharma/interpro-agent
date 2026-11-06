import type {ChatResponse} from './types';


const API_URL = import.meta.env.VITE_API_URL;

export async function askQuestion(query: string, threadId: string): Promise<ChatResponse>{
    const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({query, thread_id: threadId})
    });

    if (!res.ok){
        let message = `Request failed (${res.status})`;

        try{
            const body = await res.json();
            if (typeof body.detail === 'string') message = body.detail;
        } catch {
            // ignore
        }
        throw new Error(message);
    }   

    return (await res.json()) as ChatResponse;
}
