import { Router, Request, Response } from 'express';
import * as financialUnitService from '../services/financial-unit.service';
import { StockValuationMethod } from '../models/stock.model';
import * as stockService from '../services/stock.service';

const router: Router = Router();

router.get('/get-all-financial-units', async (req: Request, res: Response) => {
    try {
        const userId: string | null = req.session ? req.session.userId : null;
        const financialUnits = await financialUnitService.getAllFinancialUnits(userId as string)
        res.send(financialUnits);
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/get-financial-unit', async (req: Request, res: Response) => {
    try {
        const financialUnitId: string = req.query.id;
        await financialUnitService.testAccessToFinancialUnit(financialUnitId, req);
        const financialUnit = await financialUnitService.getFinancialUnitWithPopulatedRefs(financialUnitId);
        res.send(financialUnit);
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/create-financial-unit', async (req: Request, res: Response) => {
    try {
        const name: string = req.query.name;
        const createDefaultData: boolean = req.query.createDefaultData == 'true';
        const stockValuationMethod: StockValuationMethod | null = stockService.parseStockValuationMethod(
            req.query.stockValuationMethod
        );
        const creatorId: string | null = req.session ? req.session.userId : null;
        const financialUnit = await financialUnitService.createFinancialUnit(
            { name, users: [creatorId as string], owner: creatorId },
            createDefaultData,
            stockValuationMethod as StockValuationMethod
        );
        res.send(financialUnit);
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/add-user', async (req: Request, res: Response) => {
    try {
        const financialUnitId: string = req.query.financialUnitId;
        const newUserId: string = req.query.userId;
        await financialUnitService.testOwnershipToFinancialUnit(financialUnitId, req);
        await financialUnitService.addUserToFinancialUnit(financialUnitId, newUserId);
        res.send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/remove-user', async (req: Request, res: Response) => {
    try {
        const financialUnitId: string = req.query.financialUnitId;
        const newUserId: string = req.query.userId;
        await financialUnitService.testOwnershipToFinancialUnit(financialUnitId, req);
        await financialUnitService.removeUserToFinancialUnit(financialUnitId, newUserId);
        res.send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/delete-financial-unit', async (req: Request, res: Response) => {
    try {
        const financialUnitId: string = req.query.id;
        await financialUnitService.testOwnershipToFinancialUnit(financialUnitId, req);
        await financialUnitService.deleteFinancialUnit(financialUnitId);
        res.send({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/delete-all-transactions', async (req: Request, res: Response) => {
    try {
        const financialUnitId: string = req.query.financialUnitId;
        await financialUnitService.testAccessToFinancialUnit(financialUnitId, req);
        await financialUnitService.deleteAllTransactions(financialUnitId);
        res.send({ message: 'OK' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

export default router;