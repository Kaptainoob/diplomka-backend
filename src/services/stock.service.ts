import { StockDecrementType, IStock, IStockBatch, IStockQuantityChangeResult } from "../models/stock.model";
import * as utilitiesService from './utilities.service';



export const parseStockDecrementType = (typeAsString: string): StockDecrementType | null => {
    switch (typeAsString) {
        case StockDecrementType.FIFO:
            return StockDecrementType.FIFO;
        case StockDecrementType.LIFO:
            return StockDecrementType.LIFO;
        case StockDecrementType.Average:
            return StockDecrementType.Average;
        default:
            return null;
    }
}



export const getSortedStock = (stock: IStock, stockDecrementType: StockDecrementType): IStock => {
    if (stock.batches.length < 2) {
        return stock;
    } else if (stockDecrementType == StockDecrementType.FIFO) {
        const sortedBatches: IStockBatch[] = stock.batches.sort((a, b) => a.transactionIndex - b.transactionIndex);
        const sortedStock: IStock = {
            totalStockQuantity: stock.totalStockQuantity,
            totalStockCost: stock.totalStockCost,
            batches: sortedBatches
        }
        return sortedStock;
    } else if (stockDecrementType == StockDecrementType.LIFO) {
        const sortedBatches: IStockBatch[] = stock.batches.sort((a, b) => b.transactionIndex - a.transactionIndex);
        const sortedStock: IStock = {
            totalStockQuantity: stock.totalStockQuantity,
            totalStockCost: stock.totalStockCost,
            batches: sortedBatches
        }
        return sortedStock;
    } else if (stockDecrementType == StockDecrementType.Average) {
        const sortedStock: IStock = {
            totalStockQuantity: stock.totalStockQuantity,
            totalStockCost: stock.totalStockCost,
            batches: [{
                quantity: stock.totalStockQuantity,
                costPerUnit: stock.totalStockCost / stock.totalStockQuantity,
                added: new Date(),
                transactionIndex: 0
            }]
        };
        return sortedStock;
    } else {
        throw new Error('Neznámá oceňovací metoda pro vyskladnění');
    }
}



export const getStockDecrementResult = (
    currentStock: IStock,
    quantityToRemove: number,
    stockDecrementType: StockDecrementType
): IStockQuantityChangeResult => {
    const currentStockQuantity: number = currentStock.batches
        .map((stockBatch) => stockBatch.quantity)
        .reduce((acc, val) => acc + val, 0);
    if (currentStockQuantity < quantityToRemove) {
        throw new Error('Nedostačné množství pro vyskladnění');
    }
    const sortedStock: IStock = getSortedStock(currentStock, stockDecrementType);
    let quantityToRemoveLeft: number = quantityToRemove;
    let changeCost: number = 0;
    const unfiltredBatches: IStockBatch[] = sortedStock.batches.map((batch): IStockBatch => {
        if (quantityToRemoveLeft == 0) {
            const { quantity, costPerUnit, added } = batch;
            return {
                quantity,
                costPerUnit,
                added,
                transactionIndex: batch.transactionIndex
            };
        } else if (batch.quantity < quantityToRemoveLeft) {
            changeCost += batch.quantity * batch.costPerUnit;
            quantityToRemoveLeft = quantityToRemoveLeft - batch.quantity;
            return {
                quantity: 0,
                costPerUnit: batch.costPerUnit,
                added: batch.added,
                transactionIndex: batch.transactionIndex
            };
        } else {
            const newBatchQuantity: number = batch.quantity - quantityToRemoveLeft;
            changeCost += quantityToRemoveLeft * batch.costPerUnit;
            quantityToRemoveLeft = 0;
            return {
                quantity: newBatchQuantity,
                costPerUnit: batch.costPerUnit,
                added: batch.added,
                transactionIndex: batch.transactionIndex
            };
        }
    })
    const batches: IStockBatch[] = unfiltredBatches.filter(batch => batch.quantity > 0)
    const stock: IStock = {
        totalStockQuantity: batches.map(batch => batch.quantity).reduce((acc, val) => acc + val, 0),
        totalStockCost: batches.map(batch => batch.costPerUnit * batch.quantity).reduce((acc, val) => acc + val, 0),
        batches
    };
    return {
        stock,
        changeCost: utilitiesService.getRoundedNumber(changeCost, 2)
    };
}



export const getStockIncrementResult = (
    currentStock: IStock,
    newStockBatch: IStockBatch
): IStockQuantityChangeResult => {
    const batches: IStockBatch[] = [...currentStock.batches, newStockBatch];
    const stock: IStock = {
        totalStockQuantity: batches.map(batch => batch.quantity).reduce((acc, val) => acc + val, 0),
        totalStockCost: batches.map(batch => batch.costPerUnit * batch.quantity).reduce((acc, val) => acc + val, 0),
        batches
    };
    return {
        stock,
        changeCost: utilitiesService.getRoundedNumber(newStockBatch.quantity * newStockBatch.costPerUnit, 2)
    };
} 