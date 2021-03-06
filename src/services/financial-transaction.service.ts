import { FinancialTransactionModel, INewFinancialTransaction, IFinancialTransactionDoc } from '../models/financial-transaction.model';
import { Error } from 'mongoose';
import * as financialPeriodService from './financial-period.service';
import * as financialAccountService from './financial-account.service';



export const createInactiveFinancialTransaction = async (data: INewFinancialTransaction): Promise<IFinancialTransactionDoc> => {
    if (!(await financialPeriodService.getIsFinancialPeriodExistsWithDate(data.financialUnit, data.effectiveDate))) {
        throw new Error('Ucetni obdobi s danym datem nenalezeno');   
    }
    if (!(await financialAccountService.getIsFinancialAccountExist(data.debitAccount, data.financialUnit))) {
        throw new Error('Financni ucet s danym ID nenalezen');   
    }
    if (!(await financialAccountService.getIsFinancialAccountExist(data.creditAccount, data.financialUnit))) {
        throw new Error('Financni ucet s danym ID nenalezen');   
    }
    data.isActive = false;
    const financialTransaction: IFinancialTransactionDoc = await new FinancialTransactionModel(data).save()
        .catch((err) => {
            console.error(err);
            throw new Error('Chyba při ukládání účetního zápisu');
        });
    return financialTransaction;
}



export const activateCreatedFinancialTransactions = async (
    inventoryTransactionId: string
): Promise<'OK'> => {
    await Promise.all([
        FinancialTransactionModel.updateMany(
            { inventoryTransaction: inventoryTransactionId },
            { isActive: true }
        ).exec(),
        FinancialTransactionModel.updateMany(
            { inventoryTransactionForcingDerivation: inventoryTransactionId },
            { isActive: true }
        ).exec()
    ]);
    return 'OK';
}



export const deleteActiveFinancialTransactionsWithIndexEqualOrLarger = async (
    inventoryItemId: string,
    inventoryItemTransactionIndex: number
): Promise<'OK'> => {
    await FinancialTransactionModel.deleteMany({
        inventoryItem: inventoryItemId,
        inventoryItemTransactionIndex: { $gte: inventoryItemTransactionIndex },
        isActive: true
    }).exec();
    return 'OK';
}



export const deleteInactiveFinancialTransaction = async (
    inventoryTransactionId: string
) : Promise<'OK'> => {
    await Promise.all([
        FinancialTransactionModel.deleteMany({
            inventoryTransactionForcingDerivation: inventoryTransactionId,
            isActive: false
        }).exec(),
        FinancialTransactionModel.deleteMany({
            inventoryTransaction: inventoryTransactionId,
            isActive: false
        }).exec()
    ]);
    return 'OK';
}



export const getAllFinancialTransactions = async (financialUnitId: string): Promise<IFinancialTransactionDoc[]> => {
    const financialTransactions: IFinancialTransactionDoc[] = await FinancialTransactionModel
        .find({ financialUnit: financialUnitId })
        .populate('debitAccount')
        .populate('creditAccount')
        .exec().catch((err) => {
            console.error(err);
            throw new Error('Chyba při načítání účetních zápisů');
        });
    return financialTransactions;
}



export const getFiltredFinancialTransaction = async (
    financialUnitId: string,
    accountId: string | null,
    dateFrom: Date | null,
    dateTo: Date | null,
): Promise<IFinancialTransactionDoc[]> => {
    const financialTransactions: IFinancialTransactionDoc[] = await FinancialTransactionModel
        .find({
            financialUnit: financialUnitId,
            effectiveDate: { $gte: dateFrom as Date, $lte: dateTo as Date },
            isActive: true
        })
        .or(accountId ? [{ debitAccount: accountId }, { creditAccount: accountId }] : [{_id: { $exists: true }}])
        .populate('debitAccount')
        .populate('creditAccount')
        .populate('creator', '-username -password')
        .sort({ effectiveDate: 1 })
        .exec().catch((err) => {
            console.error(err);
            throw new Error('Chyba při načítání účetních zápisů');
        });
    return financialTransactions;
}



export const getFiltredFinancialTransactionCount = async (
    financialUnitId: string,
    accountId: string | null,
    dateFrom: Date | null,
    dateTo: Date | null,
): Promise<number> => {
    const count: number = await FinancialTransactionModel
        .countDocuments({
            financialUnit: financialUnitId,
            effectiveDate: { $gte: dateFrom as Date, $lte: dateTo as Date },
            isActive: true
        })
        .or(accountId ? [{ debitAccount: accountId }, { creditAccount: accountId }] : [{_id: { $exists: true }}])
        .exec().catch((err) => {
            console.error(err);
            throw new Error('Chyba při načítání účetních zápisů');
        });
    return count;
}



export const getFiltredPaginatedFinancialTransaction = async (
    financialUnitId: string,
    accountId: string | null,
    dateFrom: Date | null,
    dateTo: Date | null,
    pageIndex: number,
    pageSize: number,
): Promise<IFinancialTransactionDoc[]> => {
    const financialTransactions: IFinancialTransactionDoc[] = await FinancialTransactionModel
        .find({
            financialUnit: financialUnitId,
            effectiveDate: { $gte: dateFrom as Date, $lte: dateTo as Date },
            isActive: true
        })
        .or(accountId ? [{ debitAccount: accountId }, { creditAccount: accountId }] : [{_id: { $exists: true }}])
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .populate('debitAccount')
        .populate('creditAccount')
        .populate('creator', '-username -password')
        .sort({ effectiveDate: 1 })
        .exec().catch((err) => {
            console.error(err);
            throw new Error('Chyba při načítání účetních zápisů');
        });
    return financialTransactions;
}



export const deleteAllFinancialTransactions = async (financialUnitId: string): Promise<'OK'> => {
    await FinancialTransactionModel.deleteMany({ financialUnit: financialUnitId })
        .catch((err) => {
            console.error(err);
            throw new Error('Chyba při odstraňování účetních zápisů');
        });
    return 'OK';
}