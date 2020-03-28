import { Router, Request, Response } from 'express';
import * as financialTransactionService from '../services/financial-transaction.service';
import * as trialBalanceService from '../services/trial-balance.service';
import * as utilitiesService from '../services/utilities.service';

const router: Router = Router();

router.get('/get-all-financial-transactions', (req: Request, res: Response) => {
    const financialUnitId: string = req.query.financialUnitId;
    financialTransactionService.getAllFinancialTransactions(financialUnitId).then((financialTransactions) => {
        res.send(financialTransactions);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
});

router.get('/get-filtred-financial-transactions', (req: Request, res: Response) => {
    const financialUnitId: string = req.query.financialUnitId;
    const accountId: string | null = req.query.accountId;
    const dateFrom: Date | null = req.query.dateFrom ? utilitiesService.getUTCDate(new Date(req.query.dateFrom)) : null;
    const dateTo: Date | null = req.query.dateTo ? utilitiesService.getUTCDate(new Date(req.query.dateTo)) : null;
    financialTransactionService.getFiltredFinancialTransaction(
        financialUnitId, accountId, dateFrom, dateTo
    ).then((financialTransactions) => {
        res.send(financialTransactions);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
});

router.get('/get-trial-balance', (req: Request, res: Response) => {
    const financialUnitId: string = req.query.financialUnitId;
    const startDate: Date = new Date(req.query.startDate);
    const endDate: Date = new Date(req.query.endDate);
    trialBalanceService.getTrialBalance(financialUnitId, startDate, endDate)
        .then((trialBalance) => {
            res.send(trialBalance);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json(err);
        });
})

router.get('/get-financial-period-trial-balance', (req: Request, res: Response) => {
    const financialPeriodId: string = req.query.financialPeriodId;
    trialBalanceService.getFinancialPeriodTrialBalance(financialPeriodId).then((trialBalance) => {
        res.send(trialBalance);
    }).catch((err) => {
        console.error(err);
        res.status(500).json(err);
    });
})
export default router;