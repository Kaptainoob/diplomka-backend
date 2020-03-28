import { Router, Request, Response } from 'express';
import * as inventoryItemService from '../services/inventory-item.service';
import * as utilitilesService from '../services/utilities.service'

const router: Router = Router();

router.get('/get-all-inventory-items', (req: Request, res: Response) => {
    const financialUnitId: string = req.query.financialUnitId;
    inventoryItemService.getInventoryItemsWithPopulatedRefs(financialUnitId).then((inventoryItems) => {
        res.send(inventoryItems);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
});

router.get('/get-inventory-items-with-stock', (req: Request, res: Response) => {
    const financialUnitId: string = req.query.financialUnitId;
    const effectiveDate: Date = utilitilesService.getUTCDate(new Date(req.query.effectiveDate), true);
    inventoryItemService.getAllInventoryItemsStocksTillDate(financialUnitId, effectiveDate).then((inventoryItems) => {
        res.send(inventoryItems);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
});

router.post('/create-inventory-item', (req: Request, res: Response) => {
    const name: string = req.query.name;
    const financialUnitId: string = req.query.financialUnitId;
    const inventoryGroupId: string = req.query.inventoryGroupId;
    inventoryItemService.createInventoryItem(
        { name, financialUnit: financialUnitId, inventoryGroup: inventoryGroupId }
    ).then((inventoryItem) => {
        res.json(inventoryItem);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
});

export default router;