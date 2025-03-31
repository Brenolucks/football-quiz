import { model } from 'mongoose';
import { OpenAI } from 'openai';
import { readCache, writeCache } from '../cache-helper/cache';
import { response } from 'express';
import { withTimeout } from '../withTimeout';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL })

export async function aiHelperClubs(playerName: string): Promise<string[]> {
    const cache = await readCache();

    if (cache[playerName]) return cache[playerName];

    const prompt = `Give a JSON array of football clubs that Mohamed Salah has played for, in order.
                    For each club, return an object with:
                    - "club": the name
                    - "badgeUrl": the full Wikipedia media URL of the badge using this 
                    format: https://en.wikipedia.org/wiki/{Wikipedia_Page_Title}#/media/File:{Image_File_Name}
                    Only return the array in JSON format.`;

    console.log(prompt);
    const ask = await openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 800, // ✅ reduce this value
        temperature: 0.3
    });

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