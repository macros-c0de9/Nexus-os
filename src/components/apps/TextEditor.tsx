import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { vfs } from '../../services/vfs';
import {
  Save,
  FilePlus,
  FolderOpen,
  Eye,
  Edit3,
  Check,
  FileText,
  Copy,
  Info,
  Download,
  UploadCloud
} from 'lucide-react';

interface TextEditorProps {
  filePath?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ filePath }) => {
  const { addNotification, updateWindowTitle } = useOS();
  const [currentPath, setCurrentPath] = useState<string | null>(filePath || null);
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (filePath) {
      const item = vfs.getItemByPath(filePath);
      if (item && item.type === 'file') {
        setContent(item.content || '');
        setCurrentPath(item.path);
        setIsSaved(true);
      }
    } else {
      setContent('// Welcome to AuraOS Notepad\n// Type your notes, code, or markdown here.\n// Select text in another window and drag & drop it right here!\n');
      setCurrentPath(null);
      setIsSaved(true);
    }
  }, [filePath]);

  useEffect(() => {
    const lines = content.split('\n').length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setLineCount(lines);
    setWordCount(words);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  // Cross-Window Drag & Drop Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (showPreview) {
      setShowPreview(false); // Switch to editor mode on drop
    }

    // Check if real text was dragged from another window or web page
    const droppedText =
      e.dataTransfer.getData('text/plain') ||
      e.dataTransfer.getData('text') ||
      e.dataTransfer.getData('text/uri-list');

    if (droppedText) {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const selStart = textarea.selectionStart ?? content.length;
        const selEnd = textarea.selectionEnd ?? content.length;

        const before = content.substring(0, selStart);
        const after = content.substring(selEnd);
        const newContent = before + droppedText + after;

        setContent(newContent);
        setIsSaved(false);

        // Position cursor right after the dropped text
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
              selStart + droppedText.length,
              selStart + droppedText.length
            );
          }
        }, 50);
      } else {
        // Fallback append
        setContent((prev) => (prev ? prev + '\n' + droppedText : droppedText));
        setIsSaved(false);
      }

      addNotification('Text Dropped', `Inserted ${droppedText.length} characters into document`, 'success');
      return;
    }

    // Check if files were dropped from OS desktop or file explorer
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      try {
        const text = await file.text();
        setContent((prev) => (prev ? prev + '\n\n' + text : text));
        setIsSaved(false);
        addNotification('File Content Pasted', `Loaded content from ${file.name}`, 'info');
      } catch (err) {
        addNotification('Drop Error', 'Could not read dropped file', 'error');
      }
    }
  };

  const handleSave = () => {
    if (currentPath) {
      const ok = vfs.updateFileContent(currentPath, content);
      if (ok) {
        setIsSaved(true);
        addNotification('Saved', `Changes saved to ${currentPath}`, 'success');
      } else {
        addNotification('Save Failed', 'Could not save file', 'error');
      }
    } else {
      // Prompt for path
      const fileName = prompt('Enter file name to save in /Documents:', 'Untitled.txt');
      if (fileName) {
        const targetPath = `/Documents/${fileName}`;
        const res = vfs.createFile('/Documents', fileName, content, 'text/plain');
        if (res.success) {
          setCurrentPath(targetPath);
          setIsSaved(true);
          addNotification('File Created', `Saved to ${targetPath}`, 'success');
        } else {
          addNotification('Error', res.error || 'Failed to save', 'error');
        }
      }
    }
  };

  const handleNew = () => {
    if (!isSaved && !confirm('Discard unsaved changes?')) return;
    setContent('');
    setCurrentPath(null);
    setIsSaved(true);
  };

  return (
    <div
      id="text-editor-container"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative"
    >
      {/* Visual Drop Overlay for Cross-Window Drag & Drop */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-blue-950/80 border-2 border-dashed border-blue-400 backdrop-blur-sm flex flex-col items-center justify-center text-blue-200 pointer-events-none animate-in fade-in zoom-in-95">
          <UploadCloud className="w-10 h-10 text-blue-400 mb-2 animate-bounce" />
          <p className="text-sm font-bold text-white">Drop Selected Text Here</p>
          <p className="text-xs text-blue-300 mt-0.5">Text will insert directly at cursor position</p>
        </div>
      )}

      {/* Top Menu Bar */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            id="editor-btn-new"
            onClick={handleNew}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5 text-blue-400" />
            <span>New</span>
          </button>
          <button
            id="editor-btn-save"
            onClick={handleSave}
            className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white font-medium shadow'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved' : 'Save *'}</span>
          </button>
          <button
            id="editor-btn-preview"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              showPreview ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {showPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPreview ? 'Editor' : 'Preview'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs">
          {currentPath || 'Untitled.txt'}
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {!showPreview ? (
          <div className="flex-1 flex overflow-hidden font-mono text-xs sm:text-sm">
            {/* Line numbers column */}
            <div className="w-12 bg-slate-900/60 border-r border-slate-800 py-3 text-right pr-3 select-none text-slate-600 font-mono text-xs flex-shrink-0">
              {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              id="editor-textarea"
              value={content}
              onChange={handleContentChange}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              placeholder="Start typing or select text from any other window and drag & drop it here..."
              spellCheck={false}
              className="flex-1 h-full p-3 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-6 font-mono selection:bg-blue-500/30 overflow-y-auto select-text"
            />
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900/40 text-slate-200 prose prose-invert max-w-none text-sm leading-relaxed select-text">
            <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 text-slate-200 select-text">
              {content || '(Empty document)'}
            </pre>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>Lines: {lineCount}</span>
          <span>Words: {wordCount}</span>
          <span>Chars: {content.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>● {isSaved ? 'Synced' : 'Unsaved Changes'}</span>
        </div>
      </div>
    </div>
  );
};
