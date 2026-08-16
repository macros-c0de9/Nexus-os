import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { vfs } from '../../services/vfs';
import { TerminalCommandDef } from '../../types/os';
import { Terminal as TerminalIcon, Sparkles } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  text?: string;
  elements?: React.ReactNode;
  prompt?: string;
}

const COMMAND_DEFINITIONS: Record<string, TerminalCommandDef> = {
  help: {
    command: 'help',
    description: 'Displays a comprehensive discovery manual of all available Linux commands and their definitions.',
    usage: 'help [command]',
    category: 'system',
    examples: ['help', 'help ls', 'help quota'],
  },
  ls: {
    command: 'ls',
    description: 'Lists all files and directories in the current or specified path.',
    usage: 'ls [-la] [path]',
    category: 'file',
    examples: ['ls', 'ls -la', 'ls /Documents'],
  },
  cd: {
    command: 'cd',
    description: 'Changes the active working directory.',
    usage: 'cd <directory>',
    category: 'file',
    examples: ['cd Desktop', 'cd ..', 'cd ~', 'cd /Pictures'],
  },
  pwd: {
    command: 'pwd',
    description: 'Prints the current absolute working directory path.',
    usage: 'pwd',
    category: 'file',
  },
  cat: {
    command: 'cat',
    description: 'Concatenates and displays the text content of a file in the terminal.',
    usage: 'cat <filename>',
    category: 'file',
    examples: ['cat Welcome_To_AuraOS.txt', 'cat QuickNotes.txt'],
  },
  mkdir: {
    command: 'mkdir',
    description: 'Creates a new folder at the current or specified directory path.',
    usage: 'mkdir <folder_name>',
    category: 'file',
    examples: ['mkdir Projects', 'mkdir /Documents/Archive'],
  },
  touch: {
    command: 'touch',
    description: 'Creates a new empty file or updates its timestamp.',
    usage: 'touch <filename>',
    category: 'file',
    examples: ['touch script.sh', 'touch todo.txt'],
  },
  rm: {
    command: 'rm',
    description: 'Removes (deletes) a file or recursively deletes a directory.',
    usage: 'rm [-r] <target>',
    category: 'file',
    examples: ['rm file.txt', 'rm -r /Desktop/OldFolder'],
  },
  cp: {
    command: 'cp',
    description: 'Copies a file or folder from source to destination path.',
    usage: 'cp <source> <destination_directory>',
    category: 'file',
    examples: ['cp Notes.txt /Desktop'],
  },
  mv: {
    command: 'mv',
    description: 'Moves or renames a file or folder.',
    usage: 'mv <source> <target_name_or_dest>',
    category: 'file',
    examples: ['mv old.txt new.txt', 'mv file.txt /Downloads'],
  },
  echo: {
    command: 'echo',
    description: 'Prints text to stdout or redirects output into a file (> or >>).',
    usage: 'echo <text> [> filename]',
    category: 'utility',
    examples: ['echo Hello AuraOS', 'echo "test data" > test.txt'],
  },
  clear: {
    command: 'clear',
    description: 'Clears the terminal output screen.',
    usage: 'clear',
    category: 'system',
  },
  date: {
    command: 'date',
    description: 'Outputs current date, time, and timezone information.',
    usage: 'date',
    category: 'system',
  },
  whoami: {
    command: 'whoami',
    description: 'Prints the effective username of the current session.',
    usage: 'whoami',
    category: 'system',
  },
  uname: {
    command: 'uname',
    description: 'Prints operating system name, kernel version, and architecture info.',
    usage: 'uname [-a]',
    category: 'system',
    examples: ['uname', 'uname -a'],
  },
  ps: {
    command: 'ps',
    description: 'Lists all active processes, open windows, and memory allocations in AuraOS.',
    usage: 'ps',
    category: 'process',
  },
  kill: {
    command: 'kill',
    description: 'Terminates an active window or process by PID or Window ID.',
    usage: 'kill <pid>',
    category: 'process',
    examples: ['kill 102'],
  },
  open: {
    command: 'open',
    description: 'Launches a file or app in its native AuraOS GUI window viewer.',
    usage: 'open <filename_or_app_id>',
    category: 'utility',
    examples: ['open Welcome_To_AuraOS.txt', 'open Cyberpunk_Neon.jpg', 'open app-maker'],
  },
  quota: {
    command: 'quota',
    description: 'Inspects Cloudflare Worker / R1 free tier virtual storage usage and the 20MB file upload limit.',
    usage: 'quota',
    category: 'system',
  },
  calc: {
    command: 'calc',
    description: 'Evaluates basic mathematical expressions directly in the console.',
    usage: 'calc <expression>',
    category: 'utility',
    examples: ['calc 42 * 12', 'calc Math.sqrt(256)'],
  },
  neofetch: {
    command: 'neofetch',
    description: 'Displays a rich ASCII logo and system telemetry statistics.',
    usage: 'neofetch',
    category: 'system',
  },
  history: {
    command: 'history',
    description: 'Shows previously executed terminal commands in current session.',
    usage: 'history',
    category: 'utility',
  },
  theme: {
    command: 'theme',
    description: 'Switches the operating system theme mode.',
    usage: 'theme <dark|light|mica>',
    category: 'utility',
    examples: ['theme dark', 'theme light'],
  },
};

interface LinuxTerminalProps {
  initialPath?: string;
  initialCommand?: string;
}

export const LinuxTerminal: React.FC<LinuxTerminalProps> = ({ initialPath, initialCommand }) => {
  const { windows, closeWindow, openApp, openFileInDefaultApp, updateSettings } = useOS();
  const [cwd, setCwd] = useState(initialPath || '/Desktop');
  const [inputVal, setInputVal] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialCommandRunRef = useRef(false);

  const promptStr = `user@aura-webos:${cwd === '/Desktop' ? '~/Desktop' : cwd}$`;

  useEffect(() => {
    // Initial welcome banner
    const initLines: TerminalLine[] = [
      {
        id: 'init-1',
        type: 'system',
        text: 'AuraOS Linux Environment [Version 2.4.0-amd64-webos]',
      },
      {
        id: 'init-2',
        type: 'system',
        text: 'Type "help" to discover all available Linux commands and their definitions.',
      },
      {
        id: 'init-3',
        type: 'system',
        text: 'Cloudflare Worker & R1 Storage active (Max file limit: 20MB).',
      },
    ];
    setLines(initLines);

    if (initialCommand && !initialCommandRunRef.current) {
      initialCommandRunRef.current = true;
      setTimeout(() => {
        executeCommand(initialCommand);
      }, 100);
    }
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const executeCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) {
      setLines((prev) => [
        ...prev,
        { id: `line_${Date.now()}`, type: 'input', prompt: promptStr, text: '' },
      ]);
      return;
    }

    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const inputLine: TerminalLine = {
      id: `in_${Date.now()}`,
      type: 'input',
      prompt: promptStr,
      text: trimmed,
    };

    // Handle redirection (e.g. echo "hello" > test.txt)
    let commandToRun = trimmed;
    let redirectFile: string | null = null;

    if (trimmed.includes('>')) {
      const parts = trimmed.split('>');
      commandToRun = parts[0].trim();
      redirectFile = parts[1]?.trim() || null;
    }

    const tokens = commandToRun.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    let outputLines: TerminalLine[] = [];

    switch (cmd) {
      case 'help': {
        if (args.length > 0) {
          const targetCmd = args[0].toLowerCase();
          const def = COMMAND_DEFINITIONS[targetCmd];
          if (def) {
            outputLines.push({
              id: `out_${Date.now()}`,
              type: 'output',
              elements: (
                <div className="space-y-1.5 p-2 bg-slate-900/80 rounded border border-slate-800 text-xs">
                  <p className="font-bold text-blue-400">COMMAND: {def.command}</p>
                  <p className="text-slate-200">
                    <span className="text-slate-400">Definition:</span> {def.description}
                  </p>
                  <p className="text-slate-300 font-mono text-[11px]">
                    <span className="text-slate-500">Usage:</span> {def.usage}
                  </p>
                  {def.examples && (
                    <p className="text-slate-400 text-[11px]">
                      <span className="text-slate-500">Examples:</span> {def.examples.join(', ')}
                    </p>
                  )}
                </div>
              ),
            });
          } else {
            outputLines.push({
              id: `out_${Date.now()}`,
              type: 'error',
              text: `No manual entry for "${args[0]}". Type "help" to see all commands.`,
            });
          }
        } else {
          // Complete Discovery Help Output
          outputLines.push({
            id: `out_${Date.now()}`,
            type: 'output',
            elements: (
              <div className="space-y-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    AuraOS Linux Command Reference & Definitions
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  All built-in shell commands and their definitions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  {Object.values(COMMAND_DEFINITIONS).map((def) => (
                    <div
                      key={def.command}
                      className="p-2 bg-slate-950/60 rounded-lg border border-slate-850"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 font-mono">{def.command}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
                          {def.category}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 leading-snug">{def.description}</p>
                      <p className="text-slate-500 font-mono text-[10px] mt-1">Usage: {def.usage}</p>
                    </div>
                  ))}
                </div>

                <p className="text-slate-500 text-[10px] pt-1">
                  Tip: Type "help &lt;command&gt;" for single command details, or "neofetch" for system telemetry.
                </p>
              </div>
            ),
          });
        }
        break;
      }

      case 'ls': {
        const isLong = args.includes('-la') || args.includes('-l') || args.includes('-a');
        const targetPath = args.find((a) => !a.startsWith('-')) || cwd;
        const normalized = vfs.normalizePath(targetPath.startsWith('/') ? targetPath : `${cwd}/${targetPath}`);
        const items = vfs.getItemsInDirectory(normalized);

        if (items.length === 0) {
          outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: '(empty directory)' });
        } else if (isLong) {
          const listText = items
            .map((i) => {
              const perms = i.type === 'folder' ? 'drwxr-xr-x' : '-rw-r--r--';
              const size = (i.size || 0).toString().padStart(8, ' ');
              const date = new Date(i.updatedAt).toLocaleDateString();
              return `${perms} 1 user user ${size} ${date} ${i.name}${i.type === 'folder' ? '/' : ''}`;
            })
            .join('\n');
          outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: listText });
        } else {
          outputLines.push({
            id: `out_${Date.now()}`,
            type: 'output',
            elements: (
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
                {items.map((i) => (
                  <span
                    key={i.id}
                    className={i.type === 'folder' ? 'text-blue-400 font-bold' : 'text-slate-200'}
                  >
                    {i.name}{i.type === 'folder' ? '/' : ''}
                  </span>
                ))}
              </div>
            ),
          });
        }
        break;
      }

      case 'cd': {
        const target = args[0] || '~';
        if (target === '~' || target === '/Desktop') {
          setCwd('/Desktop');
        } else if (target === '..') {
          setCwd(vfs.getParentPath(cwd));
        } else if (target === '/') {
          setCwd('/');
        } else {
          const newPath = target.startsWith('/') ? target : `${cwd}/${target}`;
          const normalized = vfs.normalizePath(newPath);
          const found = vfs.getItemByPath(normalized);
          if (found && found.type === 'folder') {
            setCwd(normalized);
          } else {
            outputLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: `cd: no such file or directory: ${target}`,
            });
          }
        }
        break;
      }

      case 'pwd': {
        outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: cwd });
        break;
      }

      case 'cat': {
        if (args.length === 0) {
          outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: 'cat: missing filename' });
        } else {
          const filePath = args[0].startsWith('/') ? args[0] : `${cwd}/${args[0]}`;
          const item = vfs.getItemByPath(filePath);
          if (!item) {
            outputLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: `cat: ${args[0]}: No such file or directory`,
            });
          } else if (item.type === 'folder') {
            outputLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: `cat: ${args[0]}: Is a directory`,
            });
          } else {
            outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: item.content });
          }
        }
        break;
      }

      case 'mkdir': {
        if (args.length === 0) {
          outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: 'mkdir: missing directory name' });
        } else {
          const res = vfs.createFolder(cwd, args[0]);
          if (!res.success) {
            outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: `mkdir: ${res.error}` });
          }
        }
        break;
      }

      case 'touch': {
        if (args.length === 0) {
          outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: 'touch: missing filename' });
        } else {
          const res = vfs.createFile(cwd, args[0], '', 'text/plain');
          if (!res.success) {
            outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: `touch: ${res.error}` });
          }
        }
        break;
      }

      case 'rm': {
        const isRec = args.includes('-r') || args.includes('-rf');
        const targetName = args.find((a) => !a.startsWith('-'));
        if (!targetName) {
          outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: 'rm: missing operand' });
        } else {
          const targetPath = targetName.startsWith('/') ? targetName : `${cwd}/${targetName}`;
          const ok = vfs.deleteItem(targetPath);
          if (!ok) {
            outputLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: `rm: cannot remove '${targetName}': No such file or directory`,
            });
          }
        }
        break;
      }

      case 'echo': {
        const textToEcho = args.join(' ').replace(/^["']|["']$/g, '');
        if (redirectFile) {
          const res = vfs.createFile(cwd, redirectFile, textToEcho, 'text/plain');
          if (!res.success) {
            outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: `echo: ${res.error}` });
          }
        } else {
          outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: textToEcho });
        }
        break;
      }

      case 'clear': {
        setLines([]);
        return;
      }

      case 'date': {
        outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: new Date().toString() });
        break;
      }

      case 'whoami': {
        outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: 'aura_user' });
        break;
      }

      case 'uname': {
        outputLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          text: 'Linux aura-webos 6.8.0-cloud-r1-generic #42-AuraOS SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
        });
        break;
      }

      case 'ps': {
        const psOutput = [
          '  PID TTY          TIME CMD',
          '    1 ?        00:00:01 systemd',
          '   42 ?        00:00:00 aura_os_kernel',
          '  100 ?        00:00:00 vfs_daemon',
          ...windows.map((w, idx) => `  ${200 + idx} pts/0    00:00:00 [win] ${w.title.substring(0, 20)}`),
        ].join('\n');
        outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: psOutput });
        break;
      }

      case 'kill': {
        if (args.length === 0) {
          outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: 'kill: missing PID' });
        } else {
          const targetPid = parseInt(args[0], 10);
          if (targetPid >= 200 && targetPid < 200 + windows.length) {
            const win = windows[targetPid - 200];
            if (win) {
              closeWindow(win.id);
              outputLines.push({
                id: `out_${Date.now()}`,
                type: 'output',
                text: `Terminated process ${targetPid} (${win.title})`,
              });
            }
          } else {
            outputLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: `kill: (${args[0]}) - No such process`,
            });
          }
        }
        break;
      }

      case 'open': {
        if (args.length === 0) {
          outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: 'open: missing filename or app' });
        } else {
          const item = vfs.getItemByPath(args[0].startsWith('/') ? args[0] : `${cwd}/${args[0]}`);
          if (item) {
            openFileInDefaultApp(item);
            outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: `Opening ${item.name}...` });
          } else {
            // Check if app id
            openApp(args[0]);
            outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: `Launching ${args[0]}...` });
          }
        }
        break;
      }

      case 'quota': {
        const stats = vfs.getStorageStats();
        outputLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          elements: (
            <div className="p-2 bg-slate-900 border border-slate-800 rounded text-xs space-y-1 font-mono">
              <p className="font-bold text-sky-400">--- CLOUDFLARE R1 & VFS QUOTA STATUS ---</p>
              <p>Storage Used: {(stats.usedBytes / 1024).toFixed(1)} KB / 100 MB ({stats.percentage}%)</p>
              <p>Total Files: {stats.fileCount}</p>
              <p className="text-amber-400 font-semibold">Single File Upload Limit: 20.0 MB (Enforced)</p>
              <p className="text-emerald-400">R1 Bucket Status: HEALTHY</p>
            </div>
          ),
        });
        break;
      }

      case 'calc': {
        try {
          // Safe eval calculation
          const sanitized = args.join(' ').replace(/[^0-9+\-*/().% Mathsqrtcosin]/g, '');
          const result = Function(`"use strict"; return (${sanitized})`)();
          outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: `= ${result}` });
        } catch {
          outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: 'calc: invalid syntax' });
        }
        break;
      }

      case 'neofetch': {
        outputLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          elements: (
            <div className="flex gap-4 p-2 bg-slate-900/60 rounded border border-slate-800 font-mono text-xs">
              <pre className="text-blue-400 font-bold leading-tight select-none">
{`   /\\
  /  \\
 / /\\ \\     AURA-OS
/ /__\\ \\    =======
\\/____\\/`}
              </pre>
              <div className="space-y-0.5 text-slate-300 text-[11px]">
                <p><span className="text-blue-400 font-bold">OS:</span> AuraOS Desktop x86_64</p>
                <p><span className="text-blue-400 font-bold">Host:</span> Cloudflare Worker / Browser Container</p>
                <p><span className="text-blue-400 font-bold">Kernel:</span> 6.8.0-webos</p>
                <p><span className="text-blue-400 font-bold">Uptime:</span> Continuous</p>
                <p><span className="text-blue-400 font-bold">Shell:</span> bash 5.2</p>
                <p><span className="text-blue-400 font-bold">R1 File Limit:</span> 20 MB</p>
                <p><span className="text-blue-400 font-bold">Theme:</span> Dark Mica Glass</p>
              </div>
            </div>
          ),
        });
        break;
      }

      case 'history': {
        outputLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          text: commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n'),
        });
        break;
      }

      case 'theme': {
        const t = args[0];
        if (['dark', 'light', 'mica'].includes(t)) {
          updateSettings({ theme: t as any });
          outputLines.push({ id: `out_${Date.now()}`, type: 'output', text: `Theme switched to ${t}` });
        } else {
          outputLines.push({ id: `err_${Date.now()}`, type: 'error', text: 'Usage: theme <dark|light|mica>' });
        }
        break;
      }

      default: {
        outputLines.push({
          id: `err_${Date.now()}`,
          type: 'error',
          text: `bash: ${cmd}: command not found. Type "help" to discover all commands and their uses.`,
        });
        break;
      }
    }

    setLines((prev) => [...prev, inputLine, ...outputLines]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < commandHistory.length) {
          setHistoryIndex(nextIdx);
          setInputVal(commandHistory[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setInputVal('');
        }
      }
    }
  };

  return (
    <div
      id="terminal-container"
      onClick={() => inputRef.current?.focus()}
      className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs p-3 overflow-y-auto cursor-text select-text"
    >
      <div className="space-y-1.5">
        {lines.map((line) => (
          <div key={line.id} className="leading-relaxed">
            {line.type === 'system' && (
              <p className="text-slate-400">{line.text}</p>
            )}
            {line.type === 'input' && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{line.prompt}</span>
                <span className="text-slate-100">{line.text}</span>
              </div>
            )}
            {line.type === 'output' && (
              line.elements ? (
                line.elements
              ) : (
                <pre className="text-slate-300 whitespace-pre-wrap font-mono">{line.text}</pre>
              )
            )}
            {line.type === 'error' && (
              <p className="text-rose-400 font-medium">{line.text}</p>
            )}
          </div>
        ))}

        {/* Active Input Line */}
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">{promptStr}</span>
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono text-xs"
          />
        </div>
      </div>
      <div ref={terminalEndRef} />
    </div>
  );
};
