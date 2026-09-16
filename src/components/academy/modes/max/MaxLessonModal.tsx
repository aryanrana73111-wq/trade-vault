import React, { useState } from 'react';
import { X, PlayCircle, Activity, CheckCircle2, AlertTriangle, ExternalLink, BookOpen, NotebookText, BarChart2 } from 'lucide-react';
import { MaxConceptItem } from '@/types/academyTier';
import { useAcademy } from '@/contexts/AcademyContext';

interface MaxLessonModalProps {
  concept: MaxConceptItem;
  onClose: () => void;
}

export const MaxLessonModal: React.FC<MaxLessonModalProps> = ({ concept, onClose }) => {
  const { progress } = useAcademy();
  const [activeTab, setActiveTab] = useState<'learn' | 'visualize' | 'quiz' | 'resources' | 'notes'>('learn');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex justify-center p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="relative w-full max-w-7xl min-h-screen sm:min-h-[auto] bg-white dark:bg-slate-900 sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0 sm:rounded-t-3xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400">
                Phase {concept.level || 'Max'} • {concept.domain || 'Concept'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {concept.estimatedMinutes || 15} min masterclass
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {concept.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Layout */}
        <div className="flex flex-col lg:flex-row flex-1 h-full">
          {/* LEFT/TOP Navigation */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 shrink-0 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Workspace</div>
            <button
              onClick={() => setActiveTab('learn')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'learn' ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-left">Deep Dive Lesson</span>
            </button>
            <button
              onClick={() => setActiveTab('visualize')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'visualize' ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-left">Interactive Chart / Lab</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'quiz' ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-left">Practice & Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'resources' ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-left">External Resources</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'notes' ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <NotebookText className="w-4 h-4" />
              <span className="text-left">My Notes & Revision</span>
            </button>
          </div>

          {/* CENTER Content Area */}
          <div className="flex-1 p-6 sm:p-10 pb-24">
            {activeTab === 'learn' && (
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Explanation</h3>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    {concept.subtitle || concept.simpleExplanation || "Detailed explanation of the trading concept goes here. This section covers the fundamental theory, mathematical models, and psychological underpinnings required to master this topic."}
                  </p>
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                    <span className="font-bold text-amber-700 dark:text-amber-500 mb-3 block">Professional Definition:</span>
                    {concept.professionalExplanation || "A formal, institution-grade definition that establishes the precise parameters of this concept in a live trading environment."}
                  </div>
                </div>

                {/* Example/Case Study Section */}
                <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Real Market Example</h3>
                  {concept.realScenario ? (
                    <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-6">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">{concept.realScenario.scenarioA.title}</h4>
                      <div className="space-y-4 text-base text-slate-700 dark:text-slate-300">
                        <p><span className="font-bold text-slate-900 dark:text-white">Context:</span> {concept.realScenario.scenarioA.desc}</p>
                        <p><span className="font-bold text-slate-900 dark:text-white">Application:</span> {concept.realScenario.scenarioA.math}</p>
                        <div className="mt-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                          <span className="font-bold text-amber-600 dark:text-amber-500 block mb-2">Key Takeaway:</span>
                          {concept.realScenario.keyTakeaway}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                      <BarChart2 className="w-12 h-12 text-slate-400 mx-auto" />
                      <p className="text-slate-500 font-medium text-lg">Historical market example processing...</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Common Mistakes & Limitations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                      <h4 className="font-bold text-rose-800 dark:text-rose-400 mb-2">Retail Trap</h4>
                      <p className="text-sm text-rose-700 dark:text-rose-300">Over-leveraging or misinterpreting the signal frequency without confirming volume and structural context.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-slate-800 dark:text-slate-300 mb-2">Institutional Truth</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Used strictly as a confluence tool, not a standalone entry trigger. Requires strict invalidation modeling.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visualize' && (
              <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[500px] space-y-8 text-center">
                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Activity className="w-12 h-12 text-amber-500" />
                </div>
                <div className="max-w-xl">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                    Interactive Chart Simulator
                  </h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400">
                    Interact with historical market data and visualize the underlying mechanics of this concept in real-time.
                  </p>
                </div>
                <button className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-md flex items-center gap-3 text-lg">
                  <PlayCircle className="w-6 h-6" />
                  <span>Launch Visual Lab</span>
                </button>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="max-w-3xl mx-auto space-y-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Knowledge & Practice</h3>
                
                {concept.quiz && concept.quiz.length > 0 ? (
                  <div className="space-y-8">
                    {concept.quiz.map((q, idx) => (
                      <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-6">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Question {idx + 1}: {q.question}</h4>
                        <div className="space-y-3">
                          {q.options.map((opt, optIdx) => (
                            <button key={optIdx} className="w-full p-4 text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 text-base text-slate-700 dark:text-slate-300 font-medium flex items-center gap-4 transition-colors">
                              <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0"></div>
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button className="px-8 py-4 rounded-xl bg-slate-900 dark:bg-amber-500 text-white font-bold transition-all shadow-md text-lg w-full sm:w-auto">
                      Submit Answers for Review
                    </button>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-slate-500 font-medium text-lg">No advanced quiz configured yet. Please check practice center.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Verified External Resources</h3>
                <p className="text-slate-500 text-lg">Curated materials from official and professional institutions.</p>
                
                <div className="grid gap-4">
                  {concept.resources && concept.resources.length > 0 ? concept.resources.map((res, i) => (
                    <div key={i} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            res.type === 'Video' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {res.type === 'Video' ? '📺 Video Lesson' : '🌐 Research Article'}
                          </span>
                          <span className="text-sm font-bold text-slate-500">{res.authorOrSource}</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{res.title}</h4>
                      </div>
                      <a
                        href={res.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-base font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2 shrink-0"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  )) : (
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                      No external resources linked.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Quick Revision & Notes</h3>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-96 flex items-center justify-center">
                  <p className="text-slate-500 font-medium text-lg">Personal notes and flashcards will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
