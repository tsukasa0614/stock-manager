import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getFactories,
  createFactory,
  updateFactory,
  deleteFactory,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse,
  addShelf,
  updateShelf,
  deleteShelf
} from '../controllers/factory';

const router = Router();

// 工場のルート
router.get('/', auth, getFactories);
router.post('/', auth, createFactory);
router.put('/:id', auth, updateFactory);
router.delete('/:id', auth, deleteFactory);

// 倉庫のルート
router.post('/:id/warehouses', auth, addWarehouse);
router.put('/:id/warehouses/:warehouseId', auth, updateWarehouse);
router.delete('/:id/warehouses/:warehouseId', auth, deleteWarehouse);

// 棚のルート
router.post('/:id/warehouses/:warehouseId/shelves', auth, addShelf);
router.put('/:id/warehouses/:warehouseId/shelves/:shelfId', auth, updateShelf);
router.delete('/:id/warehouses/:warehouseId/shelves/:shelfId', auth, deleteShelf);

export default router; 