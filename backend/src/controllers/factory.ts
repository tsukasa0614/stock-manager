import { Request, Response } from 'express';
import { Factory } from '../models/factory';

// 工場一覧の取得
export const getFactories = async (req: Request, res: Response) => {
  try {
    const factories = await Factory.find();
    res.json(factories);
  } catch (error) {
    res.status(500).json({ message: '工場一覧の取得に失敗しました' });
  }
};

// 工場の作成
export const createFactory = async (req: Request, res: Response) => {
  try {
    const factory = new Factory({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    await factory.save();
    res.status(201).json(factory);
  } catch (error) {
    res.status(400).json({ message: '工場の作成に失敗しました' });
  }
};

// 工場の更新
export const updateFactory = async (req: Request, res: Response) => {
  try {
    const factory = await Factory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    if (!factory) {
      return res.status(404).json({ message: '工場が見つかりません' });
    }
    res.json(factory);
  } catch (error) {
    res.status(400).json({ message: '工場の更新に失敗しました' });
  }
};

// 工場の削除
export const deleteFactory = async (req: Request, res: Response) => {
  try {
    const factory = await Factory.findByIdAndDelete(req.params.id);
    if (!factory) {
      return res.status(404).json({ message: '工場が見つかりません' });
    }
    res.json({ message: '工場を削除しました' });
  } catch (error) {
    res.status(400).json({ message: '工場の削除に失敗しました' });
  }
};

// 倉庫の追加
export const addWarehouse = async (req: Request, res: Response) => {
  try {
    const factory = await Factory.findById(req.params.id);
    if (!factory) {
      return res.status(404).json({ message: '工場が見つかりません' });
    }
    factory.warehouses.push(req.body);
    factory.updatedBy = req.user._id;
    await factory.save();
    res.status(201).json(factory);
  } catch (error) {
    res.status(400).json({ message: '倉庫の追加に失敗しました' });
  }
};

// 倉庫の更新
export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const factory = await Factory.findById(req.params.id);
    if (!factory) {
      return res.status(404).json({ message: '工場が見つかりません' });
    }
    const warehouse = factory.warehouses.id(req.params.warehouseId);
    if (!warehouse) {
      return res.status(404).json({ message: '倉庫が見つかりません' });
    }
    Object.assign(warehouse, req.body);
    factory.updatedBy = req.user._id;
    await factory.save();
    res.json(factory);
  } catch (error) {
    res.status(400).json({ message: '倉庫の更新に失敗しました' });
  }
};

// 倉庫の削除
export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const factory = await Factory.findById(req.params.id);
    if (!factory) {
      return res.status(404).json({ message: '工場が見つかりません' });
    }
    factory.warehouses.pull(req.params.warehouseId);
    factory.updatedBy = req.user._id;
    await factory.save();
    res.json({ message: '倉庫を削除しました' });
  } catch (error) {
    res.status(400).json({ message: '倉庫の削除に失敗しました' });
  }
};

// 棚の追加
export const addShelf = async (req: Request, res: Response) => {
  try {
    const factory = await Factory.findById(req.params.id);
    if (!factory) {
      return res.status(404).json({ message: '工場が見つかりません' });
    }
    const warehouse = factory.warehouses.id(req.params.warehouseId);
    if (!warehouse) {
      return res.status(404).json({ message: '倉庫が見つかりません' });
    }
    warehouse.shelves.push(req.body);
    factory.updatedBy = req.user._id;
    await factory.save();
    res.status(201).json(factory);
  } catch (error) {
    res.status(400).json({ message: '棚の追加に失敗しました' });
  }
};

// 棚の更新
export const updateShelf = async (req: Request, res: Response) => {
  try {
    const factory = await Factory.findById(req.params.id);
    if (!factory) {
      return res.status(404).json({ message: '工場が見つかりません' });
    }
    const warehouse = factory.warehouses.id(req.params.warehouseId);
    if (!warehouse) {
      return res.status(404).json({ message: '倉庫が見つかりません' });
    }
    const shelf = warehouse.shelves.id(req.params.shelfId);
    if (!shelf) {
      return res.status(404).json({ message: '棚が見つかりません' });
    }
    Object.assign(shelf, req.body);
    factory.updatedBy = req.user._id;
    await factory.save();
    res.json(factory);
  } catch (error) {
    res.status(400).json({ message: '棚の更新に失敗しました' });
  }
};

// 棚の削除
export const deleteShelf = async (req: Request, res: Response) => {
  try {
    const factory = await Factory.findById(req.params.id);
    if (!factory) {
      return res.status(404).json({ message: '工場が見つかりません' });
    }
    const warehouse = factory.warehouses.id(req.params.warehouseId);
    if (!warehouse) {
      return res.status(404).json({ message: '倉庫が見つかりません' });
    }
    warehouse.shelves.pull(req.params.shelfId);
    factory.updatedBy = req.user._id;
    await factory.save();
    res.json({ message: '棚を削除しました' });
  } catch (error) {
    res.status(400).json({ message: '棚の削除に失敗しました' });
  }
}; 