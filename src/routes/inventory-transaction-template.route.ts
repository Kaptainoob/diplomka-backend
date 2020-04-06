import { Router, Request, Response } from 'express';
import * as inventoryTransactionTemplateService from '../services/inventory-transaction-template.service';
import * as inventoryTransactionTypeService from '../services/inventory-transaction-type.service';
import { INewInventoryTransactionTemplateRequestData, INewInventoryTransactionTemplate } from '../models/inventory-transaction-template.model';
import { InventoryTransactionType } from '../models/inventory-transaction.model';

const router: Router = Router();

router.get('/get-inventory-transaction-templates', (req: Request, res: Response) => {
    const inventoryGroupId: string = req.query.inventoryGroupId;
    inventoryTransactionTemplateService.getInventoryTransactionTemplatesWithPopulatedRefs(inventoryGroupId).then((transactionTemplates) => {
        res.send(transactionTemplates);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
});

router.get('/get-all-inventory-transaction-templates', (req: Request, res: Response) => {
    const financialUnitId: string = req.query.financialUnitId;
    inventoryTransactionTemplateService.getAllInventoryTransactionTemplatesWithPopulatedRefs(financialUnitId).then((transactionTemplates) => {
        res.send(transactionTemplates);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
});

router.post('/create-inventory-transaction-template', (req: Request, res: Response) => {
    const financialUnitId: string = req.query.financialUnitId;
    const requestData: INewInventoryTransactionTemplateRequestData = req.body;
    const data: INewInventoryTransactionTemplate = {
        financialUnit: financialUnitId,
        description: requestData.description,
        inventoryGroup: requestData.inventoryGroupId,
        transactionType: inventoryTransactionTypeService.parseInventoryTransactiontType(requestData.transactionType) as InventoryTransactionType,
        creditAccount: requestData.creditAccountId,
        debitAccount: requestData.debitAccountId
    };
    inventoryTransactionTemplateService.createInventoryTransactionTemplate(data).then((transactionTemplate) => {
        res.send(transactionTemplate);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
})

export default router;