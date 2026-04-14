import { useState, useRef } from 'react';
import { Send, Loader2, FileText, Sparkles, Upload, X, File } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface InputSectionProps {
  onGenerate: (data: string, fileContext?: string, customPrompt?: string) => Promise<void>;
  isLoading: boolean;
  isVerifying: boolean;
}

export function InputSection({ onGenerate, isLoading, isVerifying }: InputSectionProps) {
  const [input, setInput] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileContent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || fileContent) && !isLoading) {
      onGenerate(input, fileContent || undefined, customPrompt.trim() || undefined);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-jee-blue to-jee-red rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-zinc-200">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2 text-zinc-600 font-medium">
              <FileText className="w-4 h-4" />
              <span>Chapter Data / Session Notes</span>
            </div>
            <div className="text-xs text-zinc-400">
              Textbook Standard Generation
            </div>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter chapter name or paste rough notes. I will architect a full textbook-standard chapter for you."
            className="w-full h-40 p-6 text-zinc-800 placeholder:text-zinc-300 focus:outline-none resize-none font-sans text-lg leading-relaxed"
            disabled={isLoading}
          />

          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-jee-blue uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Custom Focus / Instructions
            </div>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Focus on organic mechanisms', 'Include more derivations', 'Make it concise'"
              className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-lg text-sm focus:outline-none focus:border-jee-blue/30 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* File Preview */}
          {file && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white border border-zinc-200 rounded">
                    <File className="w-4 h-4 text-jee-blue" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-zinc-700 truncate">{file.name}</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
          )}

          <div className="p-4 bg-zinc-50/50 border-t border-zinc-100">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                "Focus on Organic Mechanisms",
                "Include Numerical Problems",
                "Derive from First Principles",
                "Make it Concise",
                "Add More PYQs"
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCustomPrompt(p)}
                  className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-500 hover:border-jee-blue hover:text-jee-blue transition-colors"
                >
                  + {p}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.csv,.json"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-zinc-500 hover:text-jee-blue hover:bg-blue-50 rounded-lg transition-all"
                title="Upload Context File"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={(!input.trim() && !fileContent) || isLoading}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200",
                (input.trim() || fileContent) && !isLoading
                  ? "bg-jee-black text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl active:scale-95"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isVerifying ? "Verifying Formulas & Syllabus..." : "Architecting Kota Module..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Master Chapter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </form>
    </div>
  );
}
