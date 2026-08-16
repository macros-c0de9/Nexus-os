import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Search,
  BookOpen,
  Maximize2,
  FileText
} from 'lucide-react';
import { vfs } from '../../services/vfs';

interface PDFViewerProps {
  filePath?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ filePath = '/Desktop/AuraOS_Whitepaper.pdf' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(200, Math.max(50, prev + delta)));
  };

  return (
    <div id="pdf-viewer-container" className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top PDF Controls Toolbar */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        {/* Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => handleZoom(-15)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-300 px-1 font-mono">{zoomLevel}%</span>
          <button
            onClick={() => handleZoom(15)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find in doc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 rounded-lg pl-6 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 w-28 sm:w-36 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Document Canvas View */}
      <div className="flex-1 bg-slate-900/60 p-6 overflow-auto flex items-center justify-center">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="bg-white text-slate-900 shadow-2xl rounded-sm p-10 min-h-[700px] w-[540px] sm:w-[600px] transition-transform duration-150 flex flex-col justify-between"
        >
          {currentPage === 1 && (
            <div className="space-y-6">
              <div className="border-b-2 border-blue-600 pb-4">
                <span className="text-xs uppercase tracking-widest font-bold text-blue-600">
                  SYSTEM SPECIFICATION WHITEPAPER
                </span>
                <h1 className="text-2xl font-black text-slate-950 mt-1">
                  AuraOS Architecture & R1 Free Storage
                </h1>
                <p className="text-xs text-slate-500 mt-1">Document Ref: AOS-SPEC-2026.08</p>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p className="font-semibold text-slate-900">1. EXECUTIVE OVERVIEW</p>
                <p>
                  AuraOS provides a unified Web OS environment capable of turning remote web URLs into responsive windowed desktop processes. Window management is coordinated via a centralized state manager supporting 50/50 dual splits, 1.5:0.5 ratio splits, and four-quadrant 2x2 grids.
                </p>

                <p className="font-semibold text-slate-900">2. CLOUDFLARE WORKER & R1 COMPATIBILITY</p>
                <p>
                  To operate within the Cloudflare free tier and R1 object storage specifications, all file uploads are capped at a strict <strong>20 MB per file ceiling</strong>. Larger payloads are blocked at the client VFS gate to eliminate bandwidth overages.
                </p>

                <div className="bg-slate-100 p-3 rounded border border-slate-200 text-[11px] font-mono">
                  [Storage Architecture]<br />
                  - LocalStorage / IndexedDB VFS Cache<br />
                  - Cloudflare R1 Bucket Bridge (20MB Max File Limit)<br />
                  - Client-Side Multi-Window Sandbox
                </div>
              </div>
            </div>
          )}

          {currentPage === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-slate-950">2. Window Management & Multi-Display Layouts</h2>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p>
                  The window manager supports flexible tiling matrices designed for high productivity:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-800">
                  <li><strong>Two-Side 50/50 Split:</strong> Equal balance for side-by-side editing.</li>
                  <li><strong>1.5 : 0.5 Asymmetric Split:</strong> Primary task focus (60%) with secondary reference pane (40%).</li>
                  <li><strong>4-Quadrant 2x2 Grid:</strong> Quad-window simultaneous telemetry.</li>
                </ul>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="border border-blue-400 bg-blue-50/50 p-3 rounded text-center text-[11px] text-blue-900 font-semibold">
                    Primary Workspace (60%)
                  </div>
                  <div className="border border-slate-300 bg-slate-50 p-3 rounded text-center text-[11px] text-slate-700">
                    Secondary Feed (40%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-slate-950">3. Mobile Gesture Matrix</h2>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p>Touch devices map gestures seamlessly to desktop ergonomics:</p>
                <div className="space-y-2 mt-2">
                  <div className="p-2.5 bg-slate-100 rounded border border-slate-200 flex items-center justify-between">
                    <span>1 Finger Tap:</span>
                    <span className="font-semibold text-slate-900">Left Click / Focus / Drag</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded border border-slate-200 flex items-center justify-between">
                    <span>2 Fingers Tap:</span>
                    <span className="font-semibold text-slate-900">Right Click (Context Menu)</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded border border-slate-200 flex items-center justify-between">
                    <span>3 Fingers Swipe/Tap:</span>
                    <span className="font-semibold text-slate-900">All Tab View (Task Exposé)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-slate-950">4. Security & Process Isolation</h2>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p>
                  Every web app spawned through App Maker runs inside a sandboxed frame with explicit origin isolation. File clipboard operations are restricted cleanly within the active window context to maintain cross-frame boundaries.
                </p>
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-emerald-950">
                  <p className="font-semibold">Verification Complete</p>
                  <p className="text-[11px] mt-1">All prebuilt viewers and window controls tested and operational.</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400">
            <span>AuraOS Specification</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
