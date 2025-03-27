// src/services/openRouter.service.ts
import OpenAI from 'openai';
//import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

interface ClubBadge {
  name: string;
  badgeUrl: string;
  lastUpdated?: Date;
}

export class OpenRouterService {
  private client: OpenAI;
  private cachePath = path.join(__dirname, '../../data/badge-cache.json');

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: process.env.OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_REFERRER,
        "X-Title": process.env.APP_TITLE
      }
    });
  }

  public async getClubBadges(clubNames: string[]): Promise<ClubBadge[]> {
    // 1. Load cached badges
    const cachedBadges = await this.loadCache();
    
    // 2. Identify missing badges
    const missingClubs = clubNames.filter(name => 
      !cachedBadges.some(b => b.name === name)
    );

    // 3. Fetch missing badges in batches
    if (missingClubs.length > 0) {
      const newBadges = await this.fetchBatchBadges(missingClubs);
      cachedBadges.push(...newBadges);
      await this.saveCache(cachedBadges);
    }

    // 4. Return all requested badges
    return clubNames.map(name => 
      cachedBadges.find(b => b.name === name) || 
      { name, badgeUrl: this.getFallbackBadge(name) }
    );
  }

  private async fetchBatchBadges(clubs: string[]): Promise<ClubBadge[]> {
    const batchSize = 5; // Avoid rate limiting
    const results: ClubBadge[] = [];

    for (let i = 0; i < clubs.length; i += batchSize) {
      const batch = clubs.slice(i, i + batchSize);
      const response = await this.client.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [{
          role: "user",
          content: `Return a JSON object with club names as keys and their English Wikipedia page URLs as values.
                   Example: {
                     "Newell's Old Boys": "https://en.wikipedia.org/wiki/Newell's_Old_Boys",
                     "FC Barcelona": "https://en.wikipedia.org/wiki/FC_Barcelona"
                   }
                   Clubs: ${JSON.stringify(batch)}`
        }],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const badges = JSON.parse(
        response.choices[0].message.content || '{}'
      );

      for (const [name, url] of Object.entries(badges)) {
        if (typeof url === 'string' && this.isValidUrl(url)) {
          results.push({
            name,
            badgeUrl: url,
            lastUpdated: new Date()
          });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }

    return results;
  }

  private async loadCache(): Promise<ClubBadge[]> {
    try {
      const data = await fs.readFile(this.cachePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveCache(data: ClubBadge[]): Promise<void> {
    await fs.writeFile(this.cachePath, JSON.stringify(data, null, 2));
  }

  private isValidUrl(url: string): boolean {
    return /^https?:\/\/.+(\.(png|jpg|jpeg|svg))($|\?)/i.test(url);
  }

  private getFallbackBadge(clubName: string): string {
    // Optional: Use a placeholder service
    return `https://via.placeholder.com/150?text=${encodeURIComponent(clubName)}`;
  }
}