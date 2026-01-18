import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';

export const createController = (model: Model<any>) => ({
    getAll: async (req: Request, res: Response) => {
        try {
            const items = await model.find().sort({ createdAt: -1 });
            res.status(200).json(items);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    getOne: async (req: Request, res: Response) => {
        try {
            const item = await model.findById(req.params.id);
            if (!item) return res.status(404).json({ message: 'Not found' });
            res.status(200).json(item);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const newItem = new model(req.body);
            const savedItem = await newItem.save();
            res.status(201).json(savedItem);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const updatedItem = await model.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedItem) return res.status(404).json({ message: 'Not found' });
            res.status(200).json(updatedItem);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const deletedItem = await model.findByIdAndDelete(req.params.id);
            if (!deletedItem) return res.status(404).json({ message: 'Not found' });
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },
});