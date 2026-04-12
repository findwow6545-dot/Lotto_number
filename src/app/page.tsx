'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Trophy, History, Share2, CircleSlash } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Lotto number generation logic
const generateLottoNumbers = () => {
  const numbers: number[] = [];
  while (numbers.length < 7) { // Change to 7 (6 + 1 bonus)
    const r = Math.floor(Math.random() * 45) + 1;
    if (numbers.indexOf(r) === -1) numbers.push(r);
  }
  // Sort first 6, keep 7th as bonus
  const main = numbers.slice(0, 6).sort((a, b) => a - b);
  return [...main, numbers[6]];
};

const getBallColorClass = (n: number) => {
  if (n <= 10) return 'ball-yellow';
  if (n <= 20) return 'ball-blue';
  if (n <= 30) return 'ball-red';
  if (n <= 40) return 'ball-gray';
  return 'ball-green';
};

export default function LottoPage() {
  const [sets, setSets] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false); // New: for machine animation
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsDrawing(true); // Start machine animation
    setError(null);
    
    // Simulate drawing animation duration (e.g. 2.5 seconds)
    setTimeout(async () => {
      const newSets = Array.from({ length: 5 }, () => generateLottoNumbers());
      setSets(newSets);
      setIsDrawing(false); // Stop machine animation
      setIsGenerating(false);

      // Firebase Log (Optional/Logical Design)
      // Firestore nested array issue fix: Convert to object
      const setsObject = newSets.reduce((acc, set, idx) => {
        acc[`set${idx + 1}`] = set;
        return acc;
      }, {} as any);

      try {
        // 1. Get current history first (before adding new one)
        await fetchHistory();

        // 2. Add new doc to DB
        await addDoc(collection(db, "lotto_history"), {
          sets: setsObject,
          timestamp: serverTimestamp(),
        });
      } catch (e: any) {
        console.error("Firebase log error:", e);
        setError("Firebase 저장 실패: " + (e.message || "권한 또는 설정 오류"));
      }
    }, 2800);
  };

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "lotto_history"), orderBy("timestamp", "desc"), limit(3));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => doc.data());
      setHistory(docs);
    } catch (e) {
      console.log("History fetch ignored (Firebase not configured)");
    }
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="text-yellow-400 w-8 h-8" />
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            PREMIUM AI LOTTO
          </h1>
        </div>
        <p className="text-gray-400 text-xs md:text-sm tracking-widest font-medium">
          최신 AI를 활용한 로또번호 데이터 분석 생성기
        </p>
      </motion.div>

      {/* Latest Draw Info Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl glass-card p-6 mb-8 border-yellow-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy size={80} className="text-yellow-500" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">Latest Draw</span>
              <h2 className="text-xl font-bold">제 1219회 당첨 결과</h2>
            </div>
            <p className="text-xs text-gray-400">추첨일: 2026.04.11 | 1등 당첨금: <span className="text-yellow-400 font-bold">25억 8백만원</span> (12명)</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 15, 28, 39, 45].map(n => (
              <span key={n} className={`w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm flex items-center justify-center rounded-full font-bold shadow-lg ${getBallColorClass(n)}`}>
                {n}
              </span>
            ))}
            <span className="text-gray-500 font-bold mx-1">+</span>
            <span className="w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm flex items-center justify-center rounded-full font-bold shadow-lg ball-gray">
              31
            </span>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl text-sm"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Generator UI Area */}
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles size={18} />
            <span className="font-semibold">오늘의 추천 번호 (5세트)</span>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 z-10"
          >
            <RefreshCw className={isGenerating ? "animate-spin" : ""} size={18} />
            {isGenerating ? "추첨 중..." : "다시 생성"}
          </button>
        </div>

        {/* Dynamic Lotto Machine Animation */}
        <AnimatePresence>
          {isDrawing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center items-center py-20"
            >
              <div className="relative w-64 h-64 border-4 border-indigo-500/30 rounded-full flex items-center justify-center bg-black/40 shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-indigo-400 opacity-50 rounded-full"
                />
                
                {/* Simulated Bouncing Small Balls */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                      y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + Math.random(),
                      ease: "easeInOut"
                    }}
                    className={`absolute w-3 h-3 rounded-full opacity-70 ${
                      ["bg-yellow-400", "bg-blue-400", "bg-red-400", "bg-green-400"][i % 4]
                    }`}
                  />
                ))}
                
                <div className="z-10 text-center">
                  <div className="text-white font-black text-2xl tracking-tighter animate-pulse">LUCKY DRAW</div>
                  <div className="text-indigo-400 text-[10px] font-bold mt-1">RANDOMIZING...</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lotto Sets Grid (Only visible when not drawing) */}
        {!isDrawing && (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="wait">
              {!isGenerating && sets.map((set, setIdx) => (
              <motion.div
                key={setIdx + JSON.stringify(set)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: setIdx * 0.1 }}
                className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                  <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-indigo-400 border border-white/10 shrink-0">
                    {setIdx + 1}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {set.slice(0, 6).map((num, numIdx) => (
                      <motion.div
                        key={numIdx}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 260, 
                          damping: 20,
                          delay: (setIdx * 0.1) + (numIdx * 0.05) 
                        }}
                        className={`lotto-ball ${getBallColorClass(num)} scale-90 md:scale-100`}
                      >
                        {num}
                      </motion.div>
                    ))}
                    <span className="text-gray-600 font-bold">+</span>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: (setIdx * 0.1) + (6 * 0.05) 
                      }}
                      className={`lotto-ball ${getBallColorClass(set[6])} scale-90 md:scale-100 border-2 border-white/20`}
                    >
                      {set[6]}
                    </motion.div>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                  <Share2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}

        {/* History / Info Section */}
        <div className="mt-12 glass-card p-8 border-indigo-500/20 animate-glow">
          <div className="flex items-center gap-2 mb-6 text-indigo-300 font-bold">
            <History size={20} />
            <span>과거 생성 이력 (가장 최근 3회 기록)</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {history.length > 0 ? (
              history.map((record, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={i} 
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-3 cursor-pointer transition-all hover:bg-white/10 hover:border-indigo-500/30"
                >
                  <div className="text-xs text-gray-400 flex justify-between items-center">
                    <span className="font-bold flex items-center gap-1">
                      <Trophy size={12} className="text-yellow-500" /> 기록 #{history.length - i}
                    </span>
                    <span>{record.timestamp?.toDate().toLocaleString() || "방금 전"}</span>
                  </div>

                  <AnimatePresence>
                    {expandedIndex === i ? (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex flex-col gap-3 overflow-hidden"
                      >
                        {Object.entries(record.sets).map(([key, set]: [string, any], setIdx) => (
                          <div key={key} className="flex flex-col gap-1.5 p-2 rounded-lg bg-black/20">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">SET {setIdx + 1}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {set.map((n: number, j: number) => (
                                <span key={j} className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold ${getBallColorClass(n)} shadow-sm`}>
                                  {n}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="flex flex-wrap gap-2 items-center">
                        {/* Preview of first set only */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(Object.values(record.sets)[0] as number[]).slice(0, 6).map((n: number, j: number) => (
                            <span key={j} className="text-[10px] w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-indigo-200 border border-white/5">
                              {n}
                            </span>
                          ))}
                          <span className="text-[10px] text-gray-600">+</span>
                          <span className="text-[10px] w-6 h-6 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-100 border border-indigo-500/30">
                            {(Object.values(record.sets)[0] as number[])[6]}
                          </span>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-medium font-bold">
                          + {Object.keys(record.sets).length - 1}개 세트 상세 보기 (클릭)
                        </span>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                아직 저장된 이력이 없습니다. 번호를 생성해 보세요!
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-20 text-gray-600 text-xs text-center border-t border-white/5 pt-8 w-full max-w-2xl">
        <p>© 2026 Premium Lotto Engine. All rights reserved.</p>
        <p className="mt-2">본 서비스는 인공지능에 의해 생성된 번호를 제공하며, 당첨을 보장하지 않습니다.</p>
      </footer>
    </main>
  );
}
