import { mongoose } from '../mongoose-instance';
import { Document, Schema } from 'mongoose';
import { IPlainMongooseDoc } from './plain-mongoose-doc.model';
import { IStock, StockValuationMethod } from './stock.model';
import { IInventoryItemDoc } from './inventory-item.model';
import { IFinancialUnitDoc } from './financial-unit.model';
import { IFinancialAccountDoc } from './financial-account.model';
import { IUserDoc } from './user.model';

export enum InventoryTransactionType {
    Increment = 'increment',
    Decrement = 'decrement',
    Sale = 'sale'
}

export interface IIncrementInventoryTransactionSpecificData {
    quantity: number;
    costPerUnit: number;
};

export interface IDecrementInventoryTransactionSpecificData {
    quantity: number;
}

export interface IDecrementInventoryTransactionSpecificData {
    quantity: number;
    pricePerUnit: number;
    saleDebitAccountId: string;
    saleCreditAccountId: string;
}

export interface INewInventoryTransactionRequestData<SpecificData> {
    inventoryItemId: string;
    description: string;
    effectiveDate: Date;
    addBeforeTransactionWithIndex?: number;
    debitAccountId: string;
    creditAccountId: string;
    specificData: SpecificData;
}

interface IInventoryTransactionBase<SpecificData> {
    type: InventoryTransactionType;
    description: string;
    effectiveDate: Date;
    specificData: SpecificData;
    totalTransactionAmount: number;
    stockBeforeTransaction: IStock;
    stockAfterTransaction: IStock;
    stockValuationMethodApplied: StockValuationMethod;
    inventoryItemTransactionIndex: number;
    isDerivedTransaction: boolean;
    isActive: boolean;
    created: Date;
}

interface IReferences {
    financialUnit: IFinancialUnitDoc['_id'];
    inventoryItem: IInventoryItemDoc['_id'];
    debitAccount: IFinancialAccountDoc['_id'];
    creditAccount: IFinancialAccountDoc['_id'];
    transactionForcingDerivation: IInventoryTransactionDoc<any>['_id'] | null;
    creator: IUserDoc['_id'];
}

interface IPopulatedReferences {
    financialUnit: IFinancialUnitDoc;
    inventoryItem: IInventoryItemDoc['_id'];
    debitAccount: IFinancialAccountDoc;
    creditAccount: IFinancialAccountDoc;
    transactionForcingDerivation: IInventoryTransactionDoc<any>['_id'] | null;
    creator: IUserDoc;
}

export interface INewInventoryTransaction<SpecificData> extends IInventoryTransactionBase<SpecificData>, IReferences {}
export interface IInventoryTransaction<SpecificData> extends IInventoryTransactionBase<SpecificData>, IReferences, IPlainMongooseDoc {}
export interface IInventoryTransactionDoc<SpecificData> extends IInventoryTransactionBase<SpecificData>, IReferences, Document {}
export interface IInventoryTransactionPopulatedDoc<SpecificData> extends IInventoryTransactionBase<SpecificData>, IPopulatedReferences, Document {}

const InventoryTransactionSchema = new Schema<IInventoryTransaction<any>>({
    type: {
        type: String,
        required: true
    },
    inventoryItem: {
        type: Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true
    },
    financialUnit: {
        type: Schema.Types.ObjectId,
        ref: 'FinancialUnit',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    effectiveDate: {
        type: Date,
        required: true
    },
    inventoryItemTransactionIndex: {
        type: Number,
        required: true
    },
    debitAccount: {
        type: Schema.Types.ObjectId,
        ref: 'FinancialAccount',
        required: true
    },
    creditAccount: {
        type: Schema.Types.ObjectId,
        ref: 'FinancialAccount',
        required: true
    },
    specificData: {
        type: Object,
        required: true
    },
    totalTransactionAmount: {
        type: Number,
        required: true
    },
    stockBeforeTransaction: {
        type: {
            totalStockQuantity: Number,
            totalStockCost: Number,
            batches: [
                {
                    quantity: Number,
                    costPerUnit: Number,
                    added: Date,
                    transactionIndex: Number
                }
            ]
        },
        required: true
    },
    stockAfterTransaction: {
        type: {
            totalStockQuantity: Number,
            totalStockCost: Number,
            batches: [
                {
                    quantity: Number,
                    costPerUnit: Number,
                    added: Date,
                    transactionIndex: Number
                }
            ]
        },
        required: true
    },
    stockValuationMethodApplied: {
        type: StockValuationMethod,
        required: true
    },
    isDerivedTransaction: {
        type: Boolean,
        required: true,        
    },
    transactionForcingDerivation: {
        type: Schema.Types.ObjectId,
        ref: 'InventoryTransaction',
        default: null
    },
    isActive: {
        type: Boolean,
        required: true
    },
    created: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export const InventoryTransactionModel = mongoose.model<IInventoryTransactionDoc<any>>(
    'InventoryTransaction', InventoryTransactionSchema
);