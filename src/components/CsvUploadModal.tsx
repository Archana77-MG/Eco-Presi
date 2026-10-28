import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  X,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { ResourceReading, ResourceType } from '../types';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataMerged: (readings: ResourceReading[], summaryCount: number) => void;
}

interface ValidationError {
  row: number;
  message: string;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onDataMerged,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Sample CSV generator
  const handleDownloadSample = () => {
    const csvContent =
      'timestamp,location,resource,value,unit\n' +
      '2026-10-28 08:00,Academic Block A,electricity,380,kWh\n' +
      '2026-10-28 09:30,Academic Block B,electricity,610,kWh\n' +
      '2026-10-28 10:15,Hostel Boys,water,48000,L\n' +
      '2026-10-28 11:00,University Canteen,waste,310,kg\n' +
      '2026-10-28 12:30,Central Library,electricity,260,kWh\n' +
      '2026-10-28 14:00,Academic Block C (Labs),electricity,540,kWh\n' +
      '2026-10-28 15:45,Hostel Girls,water,36000,L\n' +
      '2026-10-28 17:00,Sports Complex,electricity,210,kWh\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'presidency_campus_meter_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setValidationErrors([]);
    setParsedRows([]);
    setIsValidated(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const errors: ValidationError[] = [];
        const validReadings: any[] = [];

        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // header is row 1
          const { timestamp, location, resource, value, unit } = row;

          if (!timestamp || !timestamp.trim()) {
            errors.push({ row: rowNumber, message: 'Missing timestamp.' });
          }
          if (!location || !location.trim()) {
            errors.push({ row: rowNumber, message: 'Missing location / block name.' });
          }

          const cleanResource = resource?.toLowerCase()?.trim();
          if (!['electricity', 'water', 'waste'].includes(cleanResource)) {
            errors.push({
              row: rowNumber,
              message: `Invalid resource "${resource}". Expected: electricity, water, or waste.`,
            });
          }

          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue < 0) {
            errors.push({
              row: rowNumber,
              message: `Invalid measurement value "${value}". Must be a positive number.`,
            });
          }

          if (!unit || !unit.trim()) {
            errors.push({ row: rowNumber, message: 'Missing unit (e.g., kWh, L, kg).' });
          }

          validReadings.push({
            id: `reading-csv-${Date.now()}-${index}`,
            timestamp: timestamp || new Date().toISOString(),
            location: location || 'Unknown Block',
            resource: cleanResource as ResourceType,
            value: numValue || 0,
            unit: unit || 'units',
          });
        });

        setParsedRows(validReadings);
        setValidationErrors(errors);
        setIsValidated(true);
      },
      error: error => {
        setValidationErrors([{ row: 0, message: `Failed to parse CSV: ${error.message}` }]);
        setIsValidated(true);
      },
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleMergeData = () => {
    if (parsedRows.length === 0) return;
    onDataMerged(parsedRows, parsedRows.length);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-950 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-blue-900/60 my-auto relative text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-700/60 text-blue-300 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Upload Campus Meter CSV</h3>
              <p className="text-xs text-slate-400">
                Bulk ingest university electricity, water & waste records
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

        {/* Template Download Callout */}
        <div className="my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-950/40 rounded-2xl border border-blue-800/40">
          <div>
            <div className="text-xs font-bold text-blue-200">Need the official template?</div>
            <div className="text-xs text-slate-300 mt-0.5">
              Columns: <code className="text-cyan-300">timestamp, location, resource, value, unit</code>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-200 bg-blue-900/60 border border-blue-700 rounded-xl hover:bg-blue-800 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-400 bg-blue-950/50 scale-[1.01]'
              : 'border-blue-900/60 hover:border-blue-500 bg-slate-900/60 hover:bg-slate-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-950 shadow-md border border-blue-900/60 flex items-center justify-center text-cyan-400 mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white">
            {fileName ? fileName : 'Click to browse or drag & drop CSV here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports standard CSV exported from smart meters, BMS or manual logs
          </p>
        </div>

        {/* Validation Feedback & Preview */}
        {isValidated && (
          <div className="mt-5 space-y-3">
            {validationErrors.length > 0 ? (
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Found {validationErrors.length} Issue(s) in File</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 text-xs text-rose-300">
                  {validationErrors.map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-semibold text-rose-200">Row {err.row}:</span>
                      <span>{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Validation passed! {parsedRows.length} rows verified and ready to merge into campus dataset.
                </span>
              </div>
            )}

            {/* Preview Table */}
            {parsedRows.length > 0 && (
              <div className="border border-blue-900/50 rounded-xl overflow-hidden bg-slate-900/90">
                <div className="bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 flex justify-between border-b border-blue-900/40">
                  <span>Data Preview ({parsedRows.length} rows)</span>
                  <span className="text-slate-400">Showing first 4 rows</span>
                </div>
                <div className="max-h-36 overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950/80 border-b border-blue-900/30 text-slate-400">
                      <tr>
                        <th className="px-3 py-1.5">Timestamp</th>
                        <th className="px-3 py-1.5">Location</th>
                        <th className="px-3 py-1.5">Resource</th>
                        <th className="px-3 py-1.5">Value</th>
                        <th className="px-3 py-1.5">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/30 text-slate-200">
                      {parsedRows.slice(0, 4).map((row, i) => (
                        <tr key={i} className="hover:bg-blue-950/40">
                          <td className="px-3 py-1.5 font-mono text-cyan-300">{row.timestamp}</td>
                          <td className="px-3 py-1.5 font-medium">{row.location}</td>
                          <td className="px-3 py-1.5 capitalize text-slate-300">{row.resource}</td>
                          <td className="px-3 py-1.5 font-bold text-white">{row.value}</td>
                          <td className="px-3 py-1.5 text-slate-400">{row.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-blue-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || validationErrors.length > 0}
            onClick={handleMergeData}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Merge & Refresh Campus Charts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
