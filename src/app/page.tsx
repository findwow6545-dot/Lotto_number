'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Trophy, History, Share2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Lotto number generation logic
const generateLottoNumbers = () => {
  const numbers: number[] = [];
  while (numbers.length < 6) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (numbers.indexOf(r) === -1) numbers.push(r);
  }
  return numbers.sort((a, b) => a - b);
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
  const [history, setHistory] = useState<any[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate thinking/premium feel
    setTimeout(async () => {
      const newSets = Array.from({ length: 5 }, () => generateLottoNumbers());
      setSets(newSets);
      setIsGenerating(false);

      // Firebase Log (Optional/Logical Design)
      try {
        await addDoc(collection(db, "lotto_history"), {
          sets: newSets,
          timestamp: serverTimestamp(),
        });
        fetchHistory();
      } catch (e) {
        console.error("Firebase log error:", e);
      }
    }, 800);
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
            PREMIUM LOTTO
          </h1>
        </div>
        <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase">
          Your Intelligent Number Generator
        </p>
      </motion.div>

      {/* Main Generator Action */}
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles size={18} />
            <span className="font-semibold">오늘의 추천 번호 (5세트)</span>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={isGenerating ? "animate-spin" : ""} size={18} />
            {isGenerating ? "추첨 중..." : "다시 생성"}
          </button>
        </div>

        {/* Lotto Sets Grid */}
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
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-indigo-400 border border-white/10">
                    {setIdx + 1}
                  </div>
                  <div className="flex gap-2 md:gap-4">
                    {set.map((num, numIdx) => (
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
                        className={`lotto-ball ${getBallColorClass(num)}`}
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                  <Share2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* History / Info Section */}
        <div className="mt-12 glass-card p-8 border-indigo-500/20 animate-glow">
          <div className="flex items-center gap-2 mb-6 text-indigo-300 font-bold">
            <History size={20} />
            <span>최근 생성 이력 (실시간 Firebase 연동)</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {history.length > 0 ? (
              history.map((record, i) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={i} 
                  className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-2"
                >
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>기록 #{history.length - i}</span>
                    <span>{record.timestamp?.toDate().toLocaleString() || "방금 전"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {record.sets[0].map((n: number, j: number) => (
                      <span key={j} className="text-xs px-2 py-1 rounded-md bg-white/10 text-indigo-200">
                        {n}
                      </span>
                    ))}
                    <span className="text-xs text-gray-600 self-center">...외 {record.sets.length - 1}세트</span>
                  </div>
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
