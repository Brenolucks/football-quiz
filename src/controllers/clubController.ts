import { Request, Response } from 'express';
import Club from '../models/Club';
import { readPlayerNamesFromJson } from '../utils/jsonReaderUtil';

export const getClubs = async (req: Request, res: Response): Promise<void> => {
  try {
    const clubs = await Club.find();
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};