import { Request, Response, NextFunction } from 'express';
import { clientsService } from '../services/clients.service';

export const createClientHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const client = await clientsService.createClient(req.body);
        res.status(201).json({
            success: true,
            data: client
        });
    } catch (error) {
        next(error);
    }
};

export const getClientsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clients = await clientsService.getClients(req.query);
        res.status(200).json({
            success: true,
            data: clients
        });
    } catch (error) {
        next(error);
    }
};

export const getClientByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const client = await clientsService.getClientById(req.params.id as string);
        res.status(200).json({
            success: true,
            data: client
        });
    } catch (error) {
        next(error);
    }
};

export const updateClientHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const client = await clientsService.updateClient(req.params.id as string, req.body);
        res.status(200).json({
            success: true,
            data: client
        });
    } catch (error) {
        next(error);
    }
};

export const deleteClientHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await clientsService.deleteClient(req.params.id as string);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
