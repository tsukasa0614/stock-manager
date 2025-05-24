import { Schema, model, Document } from 'mongoose';

// 棚の区画
interface ShelfLocation {
  code: string;
  status: 'empty' | 'occupied';
  item?: string;
}

// 棚
interface Shelf {
  name: string;
  levels: number;
  sections: number;
  locations: ShelfLocation[];
  x: number;
  y: number;
}

// 倉庫
interface Warehouse {
  name: string;
  type: 'warehouse';
  x: number;
  y: number;
  color: string;
  status: 'active' | 'inactive' | 'maintenance';
  shelves: Shelf[];
  address?: string;
  notes?: string;
  capacity?: number;
}

// 工場
interface Factory {
  name: string;
  type: 'factory';
  x: number;
  y: number;
  color: string;
  warehouses: Warehouse[];
  address?: string;
  notes?: string;
  capacity?: number;
  createdBy: Schema.Types.ObjectId; // 作成者のユーザーID
  updatedBy: Schema.Types.ObjectId; // 最終更新者のユーザーID
}

const factorySchema = new Schema<Factory>({
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'factory' },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  color: { type: String, required: true },
  warehouses: [{
    name: { type: String, required: true },
    type: { type: String, required: true, default: 'warehouse' },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    color: { type: String, required: true },
    status: { type: String, required: true, default: 'active' },
    shelves: [{
      name: { type: String, required: true },
      levels: { type: Number, required: true },
      sections: { type: Number, required: true },
      locations: [{
        code: { type: String, required: true },
        status: { type: String, required: true, default: 'empty' },
        item: { type: String }
      }],
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    }],
    address: String,
    notes: String,
    capacity: Number
  }],
  address: String,
  notes: String,
  capacity: Number,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export const Factory = model<Factory>('Factory', factorySchema); 