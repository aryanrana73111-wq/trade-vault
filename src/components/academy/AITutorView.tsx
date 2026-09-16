import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Lightbulb, 
  HelpCircle, 
  Brain, 
  Calculator, 
  Compass, 
  Award, 
  Target, 
  Zap, 
  FileText, 
  ChevronRight, 
  Check, 
  X,
  Code,
  ArrowRight,
  TrendingDown,
  Layers,
  GraduationCap
} from 'lucide-react';
import { 
  TutorMode, 
  TutorCommandId, 
  TutorChatMessage, 
  TutorMessageSection, 
  EpistemicClassification,
  InteractiveQuizPayload,
  RemediationState
} from '@/types/academyTutor';
import { useAcademy } from '@/contexts/AcademyContext';
import { AcademyTutorEngine } from '@/lib/academy/tutorEngine';

interface AITutorViewProps {
  initialPrompt?: string;
  isModal?: boolean;
  onClose?: () => void;
  className?: string;
}

const COMMAND_DEFINITIONS: { id: TutorCommandId; label: string; phrase: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'EXPLAIN_SIMPLY', label: 'Explain Simply', phrase: 'Explain this simply', icon: Lightbulb },
  { id: 'EXPLAIN_NUMBERS', label: 'With Numbers', phrase: 'Explain with numbers', icon: Calculator },
  { id: 'SHOW_EXAMPLE', label: 'Show Example', phrase: 'Show me an example', icon: FileText },
  { id: 'COUNTEREXAMPLE', label: 'Counterexample', phrase: 'Give me a counterexample', icon: AlertTriangle },
  { id: 'COMPARE', label: 'Compare Concepts', phrase: 'Compare these concepts', icon: Layers },
  { id: 'TEST_ME', label: 'Test Me', phrase: 'Test me', icon: CheckCircle2 },
  { id: 'CHALLENGE_ME', label: 'Challenge Me', phrase: 'Challenge me', icon: Zap },
  { id: 'EXPLAIN_MISTAKE', label: 'Explain My Mistake', phrase: 'Explain my mistake', icon: Target },
  { id: 'WHAT_NEXT', label: 'What to Learn Next', phrase: 'What should I learn next?', icon: Compass },
  { id: 'TEACH_DEEPER', label: 'Teach Me Deeper', phrase: 'Teach me deeper', icon: Brain }
];

export const AITutorView: React.FC<AITutorViewProps> = ({
  initialPrompt = '',
  isModal = false,
  onClose,
  className = ''
}) => {
  const { progress, recordQuizAttempt } = useAcademy();
  const [mode, setMode] = useState<TutorMode>('INTERMEDIATE');
  const [inputText, setInputText] = useState(initialPrompt);
  const [isTyping, setIsTyping] = useState(false);
  const [showEpistemicTags, setShowEpistemicTags] = useState(true);

  // Initial welcome message from the tutor
  const [messages, setMessages] = useState<TutorChatMessage[]>(() => [
    {
      id: 'welcome-0',
      sender: 'tutor',
      timestamp: 'Just now',
      modeAtGeneration: 'INTERMEDIATE',
      sections: [
        {
          methodologyStep: 'EXPLAIN',
          heading: 'TradeVault Academy Institutional AI Tutor',
          content: `Welcome to the Institutional AI Tutor. I operate as a quantitative educator grounded directly in the **TradeVault Levels 0–10 Curriculum**, your verified progress (Level ${progress.currentLevel}), and your personal **Mistake Bank** (${progress.mistakeBank.filter(m => !m.reviewed).length} unreviewed items).\n\nMy methodology follows a strict pedagogical cycle:\n**EXPLAIN → VISUALIZE → EXAMPLE → CALCULATE → PRACTICE → TEST → CORRECT → REINFORCE → RECOMMEND**`,
          epistemicType: 'FACT'
        },
        {
          methodologyStep: 'REINFORCE',
          heading: 'Academic & Institutional Guardrails',
          content: `I will never make guaranteed profit or strategy claims, predict market direction, or fabricate statistics. Every response explicitly categorizes knowledge into **[FACT]**, **[ASSUMPTION]**, **[EXAMPLE]**, **[SIMULATION]**, **[HISTORICAL OBSERVATION]**, and **[HYPOTHESIS]**.`,
          epistemicType: 'FACT'
        }
      ],
      suggestedFollowUpCommands: ['WHAT_NEXT', 'TEST_ME', 'CHALLENGE_ME', 'EXPLAIN_MISTAKE']
    }
  ]);

  // Track user interactive quiz selections: messageId -> { selectedIndex, isSubmitted, isCorrect, remediationState }
  const [quizStates, setQuizStates] = useState<Record<string, {
    selectedIndex?: number;
    isSubmitted: boolean;
    isCorrect?: boolean;
    remediation?: RemediationState;
    reTestSelectedIndex?: number;
    reTestSubmitted?: boolean;
    reTestCorrect?: boolean;
  }>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, quizStates]);

  const handleSendMessage = (textToSend?: string, commandId?: TutorCommandId) => {
    const query = (textToSend || inputText).trim();
    if (!query && !commandId) return;

    const actualQuery = query || (commandId ? COMMAND_DEFINITIONS.find(c => c.id === commandId)?.phrase || '' : '');

    // Add user message
    const userMsg: TutorChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: actualQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Generate response using Tutor Engine
    setTimeout(() => {
      const tutorReply = AcademyTutorEngine.processMessage(actualQuery, mode, progress, commandId);
      setMessages(prev => [...prev, tutorReply]);
      setIsTyping(false);
    }, 450);
  };

  const handleSelectQuizOption = (messageId: string, optionIndex: number) => {
    setQuizStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        selectedIndex: optionIndex,
        isSubmitted: false
      }
    }));
  };

  const handleSubmitQuizAnswer = (messageId: string, quizPayload: InteractiveQuizPayload) => {
    const state = quizStates[messageId];
    if (state?.selectedIndex === undefined) return;

    const isCorrect = state.selectedIndex === quizPayload.correctAnswerIndex;

    let remediation: RemediationState | undefined = undefined;
    if (!isCorrect) {
      remediation = AcademyTutorEngine.handleIncorrectAnswer(quizPayload, state.selectedIndex, mode);

      // Also automatically log mistake into the Mistake Bank for spaced repetition!
      recordQuizAttempt(quizPayload.conceptId || 'tutor-drill', 0, [
        {
          questionId: quizPayload.questionId,
          questionText: quizPayload.questionText,
          domain: 'Risk Management',
          userChoice: quizPayload.options[state.selectedIndex],
          correctAnswer: quizPayload.options[quizPayload.correctAnswerIndex],
          explanation: quizPayload.explanation
        }
      ]);
    } else {
      recordQuizAttempt(quizPayload.conceptId || 'tutor-drill', 100);
    }

    setQuizStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        isSubmitted: true,
        isCorrect,
        remediation
      }
    }));
  };

  const handleSelectReTestOption = (messageId: string, optionIndex: number) => {
    setQuizStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        reTestSelectedIndex: optionIndex,
        reTestSubmitted: false
      }
    }));
  };

  const handleSubmitReTestAnswer = (messageId: string, reTestPayload: { correctAnswerIndex: number }) => {
    const state = quizStates[messageId];
    if (state?.reTestSelectedIndex === undefined) return;

    const isCorrect = state.reTestSelectedIndex === reTestPayload.correctAnswerIndex;
    setQuizStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        reTestSubmitted: true,
        reTestCorrect: isCorrect
      }
    }));
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'tutor',
        timestamp: 'Just now',
        modeAtGeneration: mode,
        sections: [
          {
            methodologyStep: 'EXPLAIN',
            heading: 'Chat History Cleared',
            content: `Active session reset to Level ${progress.currentLevel} context in **${mode}** mode. Select a command below or ask any quantitative market question to begin.`,
            epistemicType: 'FACT'
          }
        ],
        suggestedFollowUpCommands: ['WHAT_NEXT', 'CHALLENGE_ME', 'TEST_ME']
      }
    ]);
    setQuizStates({});
  };

  const getEpistemicBadgeColor = (type?: EpistemicClassification) => {
    switch (type) {
      case 'FACT':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'ASSUMPTION':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'EXAMPLE':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
      case 'SIMULATION':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'HISTORICAL OBSERVATION':
        return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30';
      case 'HYPOTHESIS':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl ${isModal ? 'h-[85vh] max-h-[750px]' : 'min-h-[750px]'} ${className}`}>
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white flex items-center justify-between border-b border-slate-800 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/30 border border-blue-400/30 text-blue-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-tight">TradeVault Academy AI Tutor</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Institutional Mode
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Grounded in Levels 0–10 Curriculum • Rigorous 9-Stage Educator Loop
            </p>
          </div>
        </div>

        {/* Level badge & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Level {progress.currentLevel} ({progress.overallMastery}%)</span>
          </div>

          <button
            onClick={handleClearChat}
            title="Reset Chat History"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector & Epistemic Filter Bar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex-shrink-0">
            Pedagogical Mode:
          </span>
          {(['BEGINNER', 'INTERMEDIATE', 'PROFESSIONAL', 'QUANT'] as TutorMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                mode === m
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowEpistemicTags(prev => !prev)}
            className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
              showEpistemicTags
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Epistemic Badges:</span>
            <span className="font-bold">{showEpistemicTags ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Quick Commands Bar (10 Required User Commands) */}
      <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
          <Zap className="w-3 h-3 text-amber-500" />
          Commands:
        </span>
        {COMMAND_DEFINITIONS.map(cmd => {
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.id}
              onClick={() => handleSendMessage('', cmd.id)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Icon className="w-3 h-3 text-blue-500" />
              <span>{cmd.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'tutor' && (
              <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1 shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white p-4 rounded-br-xs text-xs sm:text-sm shadow-xs'
                  : 'bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-5 rounded-bl-xs shadow-xs space-y-4'
              }`}
            >
              {/* User text */}
              {msg.sender === 'user' && (
                <div className="leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.text}
                </div>
              )}

              {/* Tutor structured sections */}
              {msg.sender === 'tutor' && msg.sections && (
                <div className="space-y-4">
                  {msg.sections.map((sec, idx) => (
                    <div 
                      key={idx} 
                      className={`space-y-2 pb-3.5 ${idx < (msg.sections?.length ?? 0) - 1 ? 'border-b border-slate-200/70 dark:border-slate-800' : ''}`}
                    >
                      {/* Section Heading & Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {sec.methodologyStep}
                          </span>
                          {sec.heading && (
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                              {sec.heading}
                            </h4>
                          )}
                        </div>

                        {showEpistemicTags && sec.epistemicType && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getEpistemicBadgeColor(sec.epistemicType)}`}>
                            [{sec.epistemicType}]
                          </span>
                        )}
                      </div>

                      {/* Content text */}
                      {sec.content && (
                        <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-normal">
                          {sec.content}
                        </div>
                      )}

                      {/* Calculation Steps Block */}
                      {sec.calculationSteps && (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 font-mono text-xs">
                          {sec.calculationSteps.map(step => (
                            <div key={step.stepNumber} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-850">
                              <div>
                                <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">
                                  Step {step.stepNumber}:
                                </span>
                                <span className="text-slate-800 dark:text-slate-200">{step.label}</span>
                                <span className="text-slate-400 dark:text-slate-500 text-[11px] block sm:inline sm:ml-2">
                                  ({step.plugIn})
                                </span>
                              </div>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                                {step.result}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ASCII Visualization Block */}
                      {sec.asciiVisualization && (
                        <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-[11px] leading-snug overflow-x-auto whitespace-pre">
                          {sec.asciiVisualization}
                        </div>
                      )}

                      {/* Interactive Quiz / Test Section */}
                      {sec.interactiveQuiz && (
                        <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Interactive Knowledge Check</span>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {sec.interactiveQuiz.questionText}
                          </p>

                          <div className="space-y-2">
                            {sec.interactiveQuiz.options.map((opt, optIdx) => {
                              const quizState = quizStates[msg.id];
                              const isSelected = quizState?.selectedIndex === optIdx;
                              const isSubmitted = quizState?.isSubmitted;
                              const isCorrectAnswer = optIdx === sec.interactiveQuiz?.correctAnswerIndex;

                              let btnClasses = 'border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200';

                              if (isSubmitted) {
                                if (isCorrectAnswer) {
                                  btnClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                                } else if (isSelected) {
                                  btnClasses = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold';
                                } else {
                                  btnClasses = 'opacity-40 border-slate-200 dark:border-slate-800';
                                }
                              } else if (isSelected) {
                                btnClasses = 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={isSubmitted}
                                  onClick={() => handleSelectQuizOption(msg.id, optIdx)}
                                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${btnClasses}`}
                                >
                                  <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex-shrink-0">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="flex-1 leading-snug">{opt}</span>
                                  {isSubmitted && isCorrectAnswer && (
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  )}
                                  {isSubmitted && isSelected && !isCorrectAnswer && (
                                    <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {!quizStates[msg.id]?.isSubmitted ? (
                            <button
                              onClick={() => handleSubmitQuizAnswer(msg.id, sec.interactiveQuiz!)}
                              disabled={quizStates[msg.id]?.selectedIndex === undefined}
                              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span>Submit Answer</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="space-y-3 pt-2">
                              {/* Evaluation Status Banner */}
                              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                                quizStates[msg.id]?.isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              }`}>
                                {quizStates[msg.id]?.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className="font-bold">
                                    {quizStates[msg.id]?.isCorrect ? 'Correct! Concept Mastered.' : 'Incorrect Choice. Misconception Detected.'}
                                  </p>
                                  <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                                    {sec.interactiveQuiz.explanation}
                                  </p>
                                </div>
                              </div>

                              {/* 5-Step Misconception Remediation & Re-Test Cycle */}
                              {!quizStates[msg.id]?.isCorrect && quizStates[msg.id]?.remediation && (
                                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
                                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                                    <span>5-Step Misconception Remediation Engine</span>
                                  </div>

                                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                    <p>
                                      <strong className="text-amber-800 dark:text-amber-200">1. Identified Misconception:</strong> {quizStates[msg.id]?.remediation?.misconceptionIdentified}
                                    </p>
                                    <p>
                                      <strong className="text-amber-800 dark:text-amber-200">2. Why It Is Incorrect:</strong> {quizStates[msg.id]?.remediation?.whyIncorrect}
                                    </p>
                                    <p>
                                      <strong className="text-amber-800 dark:text-amber-200">3. Correct Institutional Reasoning:</strong> {quizStates[msg.id]?.remediation?.correctReasoning}
                                    </p>
                                  </div>

                                  {/* Immediate Re-Test */}
                                  <div className="pt-2 border-t border-amber-200 dark:border-amber-900/50 space-y-2">
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                      4 & 5. Immediate Similar Re-Test:
                                    </p>
                                    <p className="text-xs text-slate-800 dark:text-slate-200 italic">
                                      {quizStates[msg.id]?.remediation?.reTestQuestion.questionText}
                                    </p>

                                    <div className="space-y-1.5">
                                      {quizStates[msg.id]?.remediation?.reTestQuestion.options.map((opt, rIdx) => {
                                        const reTestSelected = quizStates[msg.id]?.reTestSelectedIndex === rIdx;
                                        const reTestSub = quizStates[msg.id]?.reTestSubmitted;
                                        const reTestCorrect = rIdx === quizStates[msg.id]?.remediation?.reTestQuestion.correctAnswerIndex;

                                        let rClasses = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
                                        if (reTestSub) {
                                          if (reTestCorrect) rClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold';
                                          else if (reTestSelected) rClasses = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 font-bold';
                                          else rClasses = 'opacity-50';
                                        } else if (reTestSelected) {
                                          rClasses = 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 font-bold';
                                        }

                                        return (
                                          <button
                                            key={rIdx}
                                            disabled={reTestSub}
                                            onClick={() => handleSelectReTestOption(msg.id, rIdx)}
                                            className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${rClasses}`}
                                          >
                                            <span>{opt}</span>
                                            {reTestSub && reTestCorrect && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {!quizStates[msg.id]?.reTestSubmitted ? (
                                      <button
                                        onClick={() => handleSubmitReTestAnswer(msg.id, quizStates[msg.id]?.remediation?.reTestQuestion!)}
                                        disabled={quizStates[msg.id]?.reTestSelectedIndex === undefined}
                                        className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs transition-colors mt-2"
                                      >
                                        Submit Re-Test Answer
                                      </button>
                                    ) : (
                                      <div className="text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border font-medium text-slate-700 dark:text-slate-300">
                                        {quizStates[msg.id]?.reTestCorrect ? '🎉 Re-Test Passed! Misconception remediated.' : 'Keep studying this concept in the Formula Sheet or Labs.'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Follow-up Command Chips */}
                  {msg.suggestedFollowUpCommands && msg.suggestedFollowUpCommands.length > 0 && (
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        Next:
                      </span>
                      {msg.suggestedFollowUpCommands.map(cmdId => {
                        const def = COMMAND_DEFINITIONS.find(c => c.id === cmdId);
                        if (!def) return null;
                        return (
                          <button
                            key={cmdId}
                            onClick={() => handleSendMessage('', cmdId)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>{def.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Institutional AI Tutor
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 animate-pulse">
                Synthesizing curriculum, calculations & verification checks...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Ask anything or use commands (e.g. "Calculate expected value with 45% win rate and 2.5R")...`}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Submit</span>
        </button>
      </div>
    </div>
  );
};
