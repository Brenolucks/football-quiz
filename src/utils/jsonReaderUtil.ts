import fs from 'fs';
import path from 'path';

interface Player {
  name: string;
}

export const readPlayerNamesFromJson = (filename: string = 'players.json'): string[] => {
  try {
    const filePath = path.join(__dirname, '..', 'data', filename);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const players: Player[] = JSON.parse(rawData);
    
    return players
      .map(player => player.name.trim())
      .filter(name => name.length > 0);
      
  } catch (error) {
    console.error('Error reading players JSON:', error);
    return [];
  }
};