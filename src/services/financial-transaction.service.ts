import { FinancialTransactionModel, INewFinancialTrasactionData, IFinancialTransaction } from '../models/financial-transaction.model';
import { mongoose } from '../mongoose-instance';
import { Error, Schema } from 'mongoose';
import { FinancialAccountModel, IFinancialAccount } from '../models/financial-account.model';

export const createFinancialTransaction = async (data: INewFinancialTrasactionData): Promise<IFinancialTransaction> => {
    const financialTransaction: IFinancialTransaction = await new FinancialTransactionModel(data).save()
        .catch((err) => {
            console.error(err);
            throw new Error('Chyba při ukládání účetního zápisu');
        });
    return financialTransaction;
}

export const getAllFinancialTransactions = async (financialUnitId: string): Promise<IFinancialTransaction[]> => {
    const financialTransactions: IFinancialTransaction[] = await FinancialTransactionModel.find({ financialUnitId })
        .catch((err) => {
            console.error(err);
            throw new Error('Chyba při načítání účetních zápisů');
        });
    return financialTransactions;
}

export const deleteAllFinancialTransactions = async (financialUnitId: string): Promise<'OK'> => {
    await FinancialTransactionModel.deleteMany({ financialUnitId })
        .catch((err) => {
            console.error(err);
            throw new Error('Chyba při odstraňování účetních zápisů');
        });
    return 'OK';
}

