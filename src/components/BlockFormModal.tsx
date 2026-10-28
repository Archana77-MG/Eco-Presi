import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { CampusBlock, BlockType } from '../types';

interface BlockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockData: Partial<CampusBlock>) => void;
  initialBlock?: CampusBlock | null;
}

export const BlockFormModal: React.FC<BlockFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBlock,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<BlockType>('classroom');
  const [floor, setFloor] = useState<number>(3);
  const [areaSqFt, setAreaSqFt] = useState<number>(35000);
  const [numberOfRooms, setNumberOfRooms] = useState<number>(24);
  const [meterId, setMeterId] = useState('');

  useEffect(() => {
    if (initialBlock) {
      setName(initialBlock.name);
      setCode(initialBlock.code);
      setType(initialBlock.type);
      setFloor(initialBlock.floor);
      setAreaSqFt(initialBlock.areaSqFt);
      setNumberOfRooms(initialBlock.numberOfRooms);
      setMeterId(initialBlock.meterId);
    } else {
      setName('');
      setCode('AB-NEW');
      setType('classroom');
      setFloor(4);
      setAreaSqFt(35000);
      setNumberOfRooms(24);
      setMeterId(`PU-ELEC-BLK-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [initialBlock, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      code: code.trim().toUpperCase() || 'BLK',
      type,
      floor: Number(floor) || 1,
      areaSqFt: Number(areaSqFt) || 10000,
      numberOfRooms: Number(numberOfRooms) || 10,
      meterId: meterId.trim() || 'PU-ELEC-GEN',
      electricityKwh: initialBlock ? initialBlock.electricityKwh : 280,
      waterLitres: initialBlock ? initialBlock.waterLitres : 8500,
      wasteKg: initialBlock ? initialBlock.wasteKg : 40,
      wastageRupees: initialBlock ? initialBlock.wastageRupees : 240,
      status: initialBlock ? initialBlock.status : 'efficient',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-950 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-blue-900/60 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-700/60 text-blue-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {initialBlock ? 'Edit Campus Block' : 'Add New Campus Block'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure facility parameters & meter bindings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Block / Facility Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design & Architecture Wing"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Short Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. D-WING"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Facility Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as BlockType)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="classroom" className="bg-slate-900 text-white">Classroom / Lecture</option>
                <option value="lab" className="bg-slate-900 text-white">Laboratory / Computer Center</option>
                <option value="hostel" className="bg-slate-900 text-white">Hostel (Student Residence)</option>
                <option value="canteen" className="bg-slate-900 text-white">Canteen / Food Court</option>
                <option value="office" className="bg-slate-900 text-white">Administrative Office</option>
                <option value="other" className="bg-slate-900 text-white">Sports / Auditorium / Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Floors
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={floor}
                onChange={e => setFloor(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-blue-900/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Area (Sq Ft)
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={areaSqFt}
                onChange={e => setAreaSqFt(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-blue-900/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Rooms
              </label>
              <input
                type="number"
                min="1"
                value={numberOfRooms}
                onChange={e => setNumberOfRooms(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-blue-900/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              IoT Sensor / Sub-Meter ID
            </label>
            <input
              type="text"
              required
              value={meterId}
              onChange={e => setMeterId(e.target.value)}
              placeholder="e.g. PU-ELEC-BLK-D-01"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-900/60 text-cyan-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialBlock ? 'Update Block' : 'Save Block'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
