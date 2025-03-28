import { model } from 'mongoose';
import { OpenAI } from 'openai';
import { readCache, writeCache } from '../cache-helper/cache';
import { response } from 'express';
import { withTimeout } from '../withTimeout';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL })

export async function aiHelperClubs(playerName: string): Promise<string[]> {
    const cache = await readCache();

    if (cache[playerName]) return cache[playerName];

    const prompt = `Give a JSON array of football clubs that ${playerName} has played for, in order. Just return the array.`;

    console.log(prompt);
    const ask = await withTimeout(
        openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.3
        }),
        20000
    );

    console.log(ask);
    const responseChat = ask.choices[0]?.message?.content ?? '';
    if (!responseChat) {
        console.error('❌ No content received from GPT:', responseChat);
        return [];
    }
    
    let clubs: string[];

    try {
        const clubsParsed = JSON.parse(responseChat);
        clubs = Array.isArray(clubsParsed) ? clubsParsed : [clubsParsed];
    } catch {
        clubs = responseChat.split(',').map(respC => respC.trim());
    }

    cache[playerName] = clubs;
    await writeCache(cache);

    return clubs;
}