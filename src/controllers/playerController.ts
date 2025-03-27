import { Request, Response } from 'express';
import Player from '../models/Player';
import { readPlayerNamesFromJson } from '../utils/jsonReaderUtil';
import { aiHelperClubs } from '../utils/ai-helper/aiHelperClubs';
import pLimit from 'p-limit';

export const checkPlayers = async (req: Request, res: Response): Promise<void> => {
    console.log('📥 Entered checkPlayers route');

    try {
        const jsonPlayerNames = readPlayerNamesFromJson();
        console.log('📄 Loaded players from JSON:', jsonPlayerNames.length);

        const existingPlayers = await Player.find({
            name: { $in: jsonPlayerNames },
        }).select('name clubs -_id').lean();

        console.log('📦 Existing players in DB:', existingPlayers.length);

        const existingNames = existingPlayers.map(p => p.name);
        const missingPlayers = jsonPlayerNames.filter(name => !existingNames.includes(name));
        const playersWithClubs = existingPlayers.filter(p => Array.isArray(p.clubs) && p.clubs.length > 0);
        const playersWithoutClubs = existingPlayers.filter(p => !Array.isArray(p.clubs) || p.clubs.length === 0);

        console.log('✅ Players with clubs:', playersWithClubs.length);
        console.log('🚫 Players without clubs:', playersWithoutClubs.length);
        console.log('❓ Missing in DB:', missingPlayers.length);

        const result: { name: string; clubsFound: string[] }[] = [];

        const limit = pLimit(5);
        const tasks = playersWithoutClubs.map(player =>
            limit(async () => {
                try {
                    console.log(`🤖 Asking AI for ${player.name}`);
                    const clubsFound = await aiHelperClubs(player.name);
                    console.log(`✅ Got clubs for ${player.name}`);
                    result.push({ name: player.name, clubsFound });
                } catch (err) {
                    console.error(`❌ Error for ${player.name}:`, err);
                    result.push({ name: player.name, clubsFound: [] });
                }
            })
        );

        await Promise.all(tasks);

        console.log('📤 Sending final response to Postman');
        res.json({
            success: true,
            totalProcessed: result.length,
            playersWithClubs: playersWithClubs.length,
            playersWithoutClubs: playersWithoutClubs.length,
            missingPlayersInDB: missingPlayers,
            newClubResults: result,
        });

    } catch (error) {
        console.error('❌ Route-level error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to check players', error: String(error) });
    }
};

export const syncPlayers = async (req: Request, res: Response): Promise<void> => {
    try {
        const jsonPlayers = readPlayerNamesFromJson();

        const operations = jsonPlayers.map(name => ({
            updateOne: {
                filter: { name },
                update: { $setOnInsert: { name, clubs: [] } },
                upsert: true
            }
        }));

        const result = await Player.bulkWrite(operations);

        res.status(200).json({
            success: true,
            inserted: result.upsertedCount,
            existing: result.matchedCount,
            total: jsonPlayers.length
        });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
}