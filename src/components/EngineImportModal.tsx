import React, { useState } from 'react';
import { X, Upload, FileCode, CheckCircle, AlertCircle, Play, Sparkles, Terminal, Copy, Check } from 'lucide-react';
import { EngineDefinition } from '../types/chess';
import { SAMPLE_CUSTOM_ENGINE_TEMPLATE, SAMPLE_CPP_ENGINE_TEMPLATE } from '../services/enginePresets';
import { runEngineBenchmark } from '../services/chessEngine';

interface EngineImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEngine: (engine: EngineDefinition) => void;
}

export const EngineImportModal: React.FC<EngineImportModalProps> = ({
  isOpen,
  onClose,
  onSaveEngine,
}) => {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [minElo, setMinElo] = useState(800);
  const [maxElo, setMaxElo] = useState(2600);
  const [activeTab, setActiveTab] = useState<'js_wasm' | 'cpp'>('js_wasm');
  const [code, setCode] = useState(SAMPLE_CUSTOM_ENGINE_TEMPLATE);
  const [copiedCpp, setCopiedCpp] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
    benchmarkNps?: number;
  }>({ status: 'idle' });

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        setTestStatus({ status: 'idle' });
      }
    };
    reader.readAsText(file);
  };

  const handleCopyCpp = () => {
    navigator.clipboard.writeText(SAMPLE_CPP_ENGINE_TEMPLATE);
    setCopiedCpp(true);
    setTimeout(() => setCopiedCpp(false), 2000);
  };

  const handleTestEngine = async () => {
    setTestStatus({ status: 'testing' });
    try {
      // Validate function signature syntax
      const runner = new Function(
        'fen',
        'legalMoves',
        'depth',
        'elo',
        `${code}\n return typeof findBestMove === "function" ? findBestMove(fen, legalMoves, depth, elo) : null;`
      );
      const testFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const dummyMoves = [
        { from: 'e7', to: 'e5', san: 'e5' },
        { from: 'c7', to: 'c5', san: 'c5' },
        { from: 'g8', to: 'f6', san: 'Nf6' },
      ];

      const res = runner(testFen, dummyMoves, 3, 1500);
      if (!res || !res.from || !res.to) {
        throw new Error('Engine must return an object with { from, to } string properties');
      }

      // Run benchmark speed test
      const benchmark = await runEngineBenchmark('custom_test', code);

      setTestStatus({
        status: 'success',
        message: `Validation passed! Engine selected: ${res.from} → ${res.to}`,
        benchmarkNps: benchmark.nps,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setTestStatus({
        status: 'error',
        message: `Execution failed: ${errorMessage}`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEngine: EngineDefinition = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      author: author.trim() || 'Custom Developer',
      version: '1.0',
      description: description.trim() || 'User imported custom chess engine script.',
      eloRange: [minElo, maxElo],
      type: 'custom-script',
      isCustom: true,
      scriptCode: code,
      benchmarkScore: testStatus.benchmarkNps || 185000,
      createdAt: new Date().toISOString(),
    };

    onSaveEngine(newEngine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <FileCode className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Import Custom Engine (C++ / WASM / JS)
              </h3>
              <p className="text-xs text-slate-400">
                Integrate custom engines via WebAssembly (WASM), C++ architecture, or JS runners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: JS/WASM vs C++ Native */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('js_wasm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'js_wasm'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Active Runner (WASM / JS)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cpp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'cpp'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            C++ Bitboard Engine Source (.cpp)
          </button>
        </div>

        {activeTab === 'cpp' ? (
          <div className="space-y-3">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-300">
                  C++ Native Engine Architecture (WebAssembly Ready)
                </span>
                <button
                  onClick={handleCopyCpp}
                  className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition border border-slate-700"
                >
                  {copiedCpp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCpp ? 'Copied!' : 'Copy C++ Code'}
                </button>
              </div>
              <p className="text-slate-400">
                To run custom C++ in web browsers, engines are compiled with <code className="text-cyan-300 font-mono">emcc (Emscripten)</code> to WebAssembly (<code className="text-cyan-300 font-mono">.wasm</code>).
              </p>
              <div className="p-2 bg-black/60 rounded font-mono text-[11px] text-cyan-300">
                emcc -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_findBestMoveWASM']" chess_engine.cpp -o chess_engine.wasm
              </div>
            </div>

            <div className="relative">
              <textarea
                readOnly
                rows={9}
                value={SAMPLE_CPP_ENGINE_TEMPLATE}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-300/90 leading-relaxed focus:outline-hidden resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Engine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Fast C++/WASM Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  placeholder="Your Name or Team"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description & Strategy
              </label>
              <input
                type="text"
                placeholder="e.g. High-efficiency tactical engine with alpha-beta pruning."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* ELO Range Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Minimum ELO Rating
                </label>
                <input
                  type="number"
                  min="400"
                  max="3000"
                  step="50"
                  value={minElo}
                  onChange={(e) => setMinElo(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Maximum ELO Rating
                </label>
                <input
                  type="number"
                  min="600"
                  max="3500"
                  step="50"
                  value={maxElo}
                  onChange={(e) => setMaxElo(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* File Upload Shortcut */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Engine Script Code</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-cyan-400 hover:text-cyan-300 font-medium">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .js / .wasm / .cpp file</span>
                <input
                  type="file"
                  accept=".js,.ts,.txt,.wasm,.cpp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Script Editor */}
            <div className="relative">
              <textarea
                rows={7}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setTestStatus({ status: 'idle' });
                }}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-lg p-3 text-xs font-mono text-cyan-200/90 leading-relaxed focus:outline-hidden focus:border-cyan-500 resize-y"
                spellCheck={false}
              />
            </div>

            {/* Testing Status Banner */}
            {testStatus.status === 'success' && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <span>{testStatus.message}</span>
                  {testStatus.benchmarkNps && (
                    <span className="ml-2 font-mono font-bold">
                      ({Math.round(testStatus.benchmarkNps / 1000)}k nodes/sec)
                    </span>
                  )}
                </div>
              </div>
            )}

            {testStatus.status === 'error' && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{testStatus.message}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleTestEngine}
                disabled={testStatus.status === 'testing'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                {testStatus.status === 'testing' ? 'Benchmarking...' : 'Test & Benchmark'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-md shadow-cyan-950/40 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Save & Install Engine
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
