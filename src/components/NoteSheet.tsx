import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/src/lib/utils';
import React, { useMemo, useRef, useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileDown, CheckCircle, Sparkles, History, ChevronDown, ChevronUp } from 'lucide-react';

interface NoteSheetProps {
  content: string;
}

const PYQSection = ({ content, parseCustomTags }: { content: string, parseCustomTags: (text: string) => React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-12 print:block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 bg-zinc-900 text-white rounded-[32px] shadow-xl hover:scale-[1.01] transition-all active:scale-[0.99] print:hidden"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <History className="w-6 h-6 text-jee-blue" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold m-0">Previous Year Question Vault</h3>
            <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">JEE Advanced Patterns (2010-2024)</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-700 ease-in-out print:max-h-none print:opacity-100",
        isOpen ? "max-h-[5000px] opacity-100 mt-6" : "max-h-0 opacity-0"
      )}>
        <div className="p-10 bg-white rounded-[40px] border-4 border-zinc-900 shadow-2xl relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <History className="w-48 h-48 text-zinc-900" />
          </div>
          <div className="relative z-10 space-y-8 font-sans text-zinc-800">
            {parseCustomTags(content)}
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-between items-center opacity-50 text-xs uppercase tracking-widest font-bold">
            <span>Academic Archive Access</span>
            <span>Original JEE Advanced Variants</span>
          </div>
        </div>
      </div>
      
      {/* Print-only title */}
      <div className="hidden print:block mb-8">
        <h2 className="text-3xl font-bold border-b-4 border-zinc-900 pb-4">Previous Year Question Vault</h2>
      </div>
    </div>
  );
};

const GraphComponent = ({ data }: { data: string }) => {
  try {
    // Extract JSON from within [GRAPH] tags more robustly
    const match = data.match(/\[GRAPH\]([\s\S]*?)\[\/GRAPH\]/);
    const rawJson = match ? match[1] : data;
    
    const jsonStr = rawJson
      .replace(/```json|```/g, '')
      .replace(/\[GRAPH\]/g, '')
      .replace(/\[\/GRAPH\]/g, '')
      .trim();
    
    const config = JSON.parse(jsonStr);
    const { type, data: chartData, title, xLabel, yLabel } = config;

    if (!chartData || !Array.isArray(chartData)) return null;

    return (
      <div className="my-10 p-8 bg-white rounded-[32px] shadow-pinterest border border-zinc-100 overflow-hidden">
        {title && <h4 className="text-center font-bold mb-8 text-zinc-800 text-xl font-serif">{title}</h4>}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" label={{ value: xLabel, position: 'insideBottom', offset: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />
                <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 12 }} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            ) : type === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 9 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  } catch (e) {
    console.error("Graph Error:", e);
    return null;
  }
};

export function NoteSheet({ content }: NoteSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  const { format, cleanContent } = useMemo(() => {
    const formatMatch = content.match(/\[FORMAT: (.*?)\]/);
    const format = formatMatch ? formatMatch[1].toLowerCase() : 'ruled';
    const cleanContent = content.replace(/\[FORMAT: .*?\]/, '').trim();
    return { format, cleanContent };
  }, [content]);

  const parseCustomTags = (text: string) => {
    const parts = text.split(/(<red>.*?<\/red>|<blue>.*?<\/blue>|<black>.*?<\/black>)/g);
    return parts.map((part, i) => {
      if (part.startsWith('<red>')) {
        return <span key={i} className="text-jee-red font-bold">{part.replace(/<\/?red>/g, '')}</span>;
      }
      if (part.startsWith('<blue>')) {
        return <span key={i} className="text-jee-blue italic">{part.replace(/<\/?blue>/g, '')}</span>;
      }
      if (part.startsWith('<black>')) {
        return <span key={i} className="text-jee-black">{part.replace(/<\/?black>/g, '')}</span>;
      }
      return part;
    });
  };

  const exportPDF = async () => {
    if (!sheetRef.current) return;
    const canvas = await html2canvas(sheetRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('JEE_Master_Notes.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-6 py-3 bg-jee-black text-white rounded-2xl font-bold shadow-pinterest hover:scale-105 transition-transform active:scale-95"
        >
          <FileDown className="w-5 h-5" />
          Export as PDF
        </button>
      </div>

      <div 
        ref={sheetRef}
        className={cn(
          "w-full max-w-4xl mx-auto bg-paper shadow-pinterest min-h-[1123px] p-8 md:p-16 border border-zinc-200 rounded-[40px] relative overflow-hidden print:shadow-none print:border-none",
          format === 'grid' ? 'paper-grid' : format === 'dotted' ? 'paper-dotted' : format === 'blank' ? 'paper-blank' : 'paper-ruled'
        )}
      >
        {/* School Notebook Header */}
        <div className="absolute top-8 right-12 flex gap-8 font-mono text-xs text-jee-red/60 uppercase tracking-widest print:top-4 print:right-8">
          <div className="border-b border-jee-red/30 pb-1">Date: ___/___/2026</div>
          <div className="border-b border-jee-red/30 pb-1">Page No: ________</div>
        </div>

        {/* Red Margin Line */}
        <div className="absolute left-24 top-0 bottom-0 w-[2px] bg-jee-red/20 pointer-events-none" />

        {/* Margin for Teacher's Remarks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 flex flex-col items-center pt-32 pointer-events-none opacity-30">
          <span className="rotate-270 text-[9px] uppercase tracking-[0.4em] text-zinc-400 font-sans whitespace-nowrap">
            Instructor's Remarks
          </span>
        </div>

        <div className="pl-20 pr-4 font-hand text-xl leading-[2.8rem] text-jee-black relative z-10">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children }) => {
                const contentArray = React.Children.toArray(children);
                const processed = contentArray.map((child, i) => {
                  if (typeof child === 'string') {
                    const trimmed = child.trim();
                    if (!trimmed) return null;

                    if (child.includes('[CONCEPT BOX]')) {
                      const inner = child.replace('[CONCEPT BOX]', '').trim();
                      if (!inner) return null;
                      return <div key={i} className="concept-box">{parseCustomTags(inner)}</div>;
                    }
                    if (child.includes('[DEFINITION BOX]')) {
                      const inner = child.replace('[DEFINITION BOX]', '').trim();
                      if (!inner) return null;
                      return <div key={i} className="definition-box">{parseCustomTags(inner)}</div>;
                    }
                    if (child.includes('[DERIVATION]')) {
                      const inner = child.replace('[DERIVATION]', '').trim();
                      if (!inner) return null;
                      return <div key={i} className="derivation-box">{parseCustomTags(inner)}</div>;
                    }
                    if (child.includes('[TRAP ALERT]')) {
                      const inner = child.replace('[TRAP ALERT]', '').trim();
                      if (!inner) return null;
                      return <div key={i} className="trap-alert">
                        <div className="bg-jee-red text-white px-2 py-1 rounded text-[10px] font-bold shrink-0">TRAP</div>
                        <div className="italic">{parseCustomTags(inner)}</div>
                      </div>;
                    }
                    if (child.includes('[ADVANCED STRATEGY]')) {
                      const inner = child.replace('[ADVANCED STRATEGY]', '').trim();
                      if (!inner) return null;
                      return (
                        <div key={i} className="my-8 p-8 border-2 border-jee-blue bg-blue-50/10 rounded-2xl relative shadow-md">
                          <div className="absolute -top-3 left-6 bg-jee-blue text-white text-[10px] px-3 py-1 rounded-full font-sans font-bold tracking-widest">ADVANCED STRATEGY</div>
                          <div className="font-serif italic text-zinc-700">{parseCustomTags(inner)}</div>
                        </div>
                      );
                    }
                    if (child.includes('[MASTER EXAMPLE]')) {
                      const inner = child.replace('[MASTER EXAMPLE]', '').trim();
                      if (!inner) return null;
                      return (
                        <div key={i} className="my-8 p-8 border-2 border-jee-green bg-green-50/20 rounded-2xl relative shadow-sm">
                          <div className="absolute -top-3 left-6 bg-jee-green text-white text-[10px] px-3 py-1 rounded-full font-sans font-bold tracking-wider">MASTER EXAMPLE</div>
                          {parseCustomTags(inner)}
                        </div>
                      );
                    }
                    if (child.includes('[QUICK RECAP]')) {
                      const inner = child.replace('[QUICK RECAP]', '').trim();
                      if (!inner) return null;
                      return (
                        <div key={i} className="my-8 p-8 border-2 border-zinc-800 bg-zinc-800 text-white rounded-2xl relative shadow-lg">
                          <div className="text-[10px] uppercase tracking-widest opacity-60 mb-3 font-bold">Quick Recap</div>
                          {parseCustomTags(inner)}
                        </div>
                      );
                    }
                    if (child.includes('[PYQ SECTION]')) {
                      const inner = child.replace('[PYQ SECTION]', '').trim();
                      if (!inner) return null;
                      return <PYQSection key={i} content={inner} parseCustomTags={parseCustomTags} />;
                    }
                    if (child.includes('[VERIFICATION REPORT]')) {
                      const inner = child.replace('[VERIFICATION REPORT]', '').trim();
                      if (!inner) return null;
                      return (
                        <div key={i} className="my-12 p-8 border-4 border-jee-green bg-green-50/20 rounded-[32px] relative shadow-xl overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-24 h-24 text-jee-green" />
                          </div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-jee-green text-white rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-jee-green m-0">HOD Verification Report</h3>
                          </div>
                          <div className="space-y-4 text-zinc-700 font-sans">
                            {parseCustomTags(inner)}
                          </div>
                          <div className="mt-8 pt-6 border-t border-jee-green/20 flex justify-between items-center">
                            <div className="text-[10px] uppercase tracking-[0.4em] text-jee-green font-bold">Certified Kota Standard</div>
                            <div className="font-hand text-jee-black opacity-60">Signed: Kota HOD Architect</div>
                          </div>
                        </div>
                      );
                    }
                    if (child.includes('[GRAPH]')) {
                      return <GraphComponent key={i} data={child} />;
                    }
                    return parseCustomTags(child);
                  }
                  return child;
                });
                return <div className="mb-6">{processed}</div>;
              },
              h1: ({ children }) => (
                <h1 className="text-5xl font-serif font-bold mb-12 border-b-4 border-jee-black pb-6 inline-block">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-3xl font-serif font-semibold mb-8 mt-16 border-l-8 border-jee-blue pl-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-2xl font-semibold mb-6 mt-10 underline decoration-wavy decoration-zinc-300 underline-offset-8">
                  {children}
                </h3>
              ),
              ul: ({ children }) => <ul className="list-disc pl-10 mb-10 space-y-6">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-10 mb-10 space-y-6">{children}</ol>,
              li: ({ children }) => (
                <li className="pl-2">
                  {React.Children.map(children, child => 
                    typeof child === 'string' ? parseCustomTags(child) : child
                  )}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-10 p-8 border-l-4 border-zinc-200 italic text-zinc-500 bg-zinc-50/30 rounded-r-3xl rotate-hand">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-zinc-100 px-3 py-1 rounded-xl font-mono text-lg border border-zinc-200">{children}</code>
              )
            }}
          >
            {cleanContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}



