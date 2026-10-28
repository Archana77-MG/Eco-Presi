import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Zap,
  Droplets,
  Trash,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { CampusBlock, BlockType, Language } from '../types';
import { CampusMap } from '../components/CampusMap';
import { ActionCard } from '../components/ActionCard';
import { translations } from '../config/translations';

interface BlocksPageProps {
  blocks: CampusBlock[];
  language: Language;
  onOpenAddModal: () => void;
  onOpenEditModal: (block: CampusBlock) => void;
  onDeleteBlock: (id: string) => void;
  onSelectBlock: (block: CampusBlock) => void;
}

export const BlocksPage: React.FC<BlocksPageProps> = ({
  blocks,
  language,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteBlock,
  onSelectBlock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const t = translations[language] || translations.en;

  // Filter blocks
  const filteredBlocks = blocks.filter(b => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.meterId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || b.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white">
      {/* What should I do now? */}
      <ActionCard
        language={language}
        actionText={t.whatShouldIDoBlocks}
        buttonLabel="Add New Block"
        onActionClick={onOpenAddModal}
        accentColor="blue"
      />

      {/* Visual Campus Map Grid */}
      <CampusMap
        blocks={blocks}
        onSelectBlock={onSelectBlock}
        language={language}
      />

      {/* Blocks Management Header & Controls */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl shadow-black/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-blue-900/30">
          <div>
            <h3 className="text-xl font-black text-white">
              Campus Facilities & Sub-Meters ({blocks.length} Total)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Presidency University Itgalpura Campus buildings, areas & IoT meters
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-950 border border-blue-400/40 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-cyan-200" />
            <span>Add Campus Block</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
          <div className="relative">
            <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by block name, code or meter..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-blue-900/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-600/30 bg-slate-950 text-white placeholder-slate-500 font-medium"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-blue-900/50 focus:outline-none focus:border-blue-400 bg-slate-950 text-white font-medium"
            >
              <option value="all">All Facility Types</option>
              <option value="classroom">Classrooms</option>
              <option value="lab">Laboratories</option>
              <option value="hostel">Hostels</option>
              <option value="canteen">Canteen & Mess</option>
              <option value="office">Administration</option>
              <option value="other">Auditorium / Sports</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-blue-900/50 focus:outline-none focus:border-blue-400 bg-slate-950 text-white font-medium"
            >
              <option value="all">All Statuses (Green / Amber / Red)</option>
              <option value="efficient">Green: Efficient</option>
              <option value="warning">Amber: Needs Attention</option>
              <option value="wasting">Red: High Wastage</option>
            </select>
          </div>
        </div>

        {/* Table of Blocks */}
        <div className="overflow-x-auto border border-blue-900/40 rounded-2xl shadow-inner">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 border-b border-blue-900/40 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Block / Code</th>
                <th className="px-4 py-3">Type & Area</th>
                <th className="px-4 py-3">Electricity (kWh)</th>
                <th className="px-4 py-3">Water (Litres)</th>
                <th className="px-4 py-3">Daily Wastage (₹)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 bg-slate-900/40">
              {filteredBlocks.map(block => (
                <tr key={block.id} className="hover:bg-blue-950/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800/60">
                        {block.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectBlock(block)}
                        className="font-bold text-white hover:text-cyan-300 text-left transition-colors cursor-pointer"
                      >
                        {block.name}
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      Meter: {block.meterId}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="capitalize font-semibold text-slate-200">{block.type}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {block.areaSqFt.toLocaleString()} sq ft • {block.numberOfRooms} rooms
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-amber-300">
                    {block.electricityKwh} kWh
                  </td>

                  <td className="px-4 py-3 font-semibold text-cyan-300">
                    {block.waterLitres.toLocaleString()} L
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`font-black ${
                        block.wastageRupees > 1000 ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      ₹{block.wastageRupees.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        block.status === 'efficient'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : block.status === 'warning'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          block.status === 'efficient'
                            ? 'bg-emerald-400 shadow-xs shadow-emerald-400'
                            : block.status === 'warning'
                            ? 'bg-amber-400 shadow-xs shadow-amber-400'
                            : 'bg-rose-400 shadow-xs shadow-rose-400'
                        }`}
                      />
                      {block.status === 'efficient'
                        ? t.efficient
                        : block.status === 'warning'
                        ? t.warning
                        : t.wasting}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectBlock(block)}
                        title="View Analytics"
                        className="p-1.5 text-cyan-400 hover:bg-blue-950 rounded-lg cursor-pointer transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(block)}
                        title="Edit Block"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to remove "${block.name}" from campus tracking?`
                            )
                          ) {
                            onDeleteBlock(block.id);
                          }
                        }}
                        title="Delete Block"
                        className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
