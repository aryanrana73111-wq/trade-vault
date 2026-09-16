import { 
  TutorMode, 
  TutorCommandId, 
  TutorChatMessage, 
  TutorMessageSection, 
  EpistemicClassification,
  UserAcademicProfile,
  InteractiveQuizPayload,
  RemediationState
} from '@/types/academyTutor';
import { UserAcademyProgress, AcademyDomain, Lesson, AcademyConcept, CurriculumConcept } from '@/types/academy';
import { ALL_CURRICULUM_CONCEPTS } from '@/data/academy/registry';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { TRADING_FORMULAS } from '@/data/academy/formulas';
import { ACADEMY_CASE_STUDIES } from '@/data/academy/caseStudies';

// ---------------------------------------------------------------------------
// 1. SAFETY & REGULATORY GUARDRAILS ENGINE
// ---------------------------------------------------------------------------

interface GuardrailCheckResult {
  isViolation: boolean;
  refusalTitle?: string;
  refusalMessage?: string;
}

export class TutorGuardrails {
  static checkQuery(rawQuery: string): GuardrailCheckResult {
    const query = rawQuery.toLowerCase();

    // 1. Mental Health / Crisis Check
    const crisisPatterns = [
      'depressed', 'kill myself', 'suicide', 'end my life', 'want to die', 
      'lost everything and cant live', 'hopeless ruined my life'
    ];
    if (crisisPatterns.some(p => query.includes(p))) {
      return {
        isViolation: true,
        refusalTitle: 'Clinical & Wellness Boundary Notice',
        refusalMessage: `**Institutional Educator Boundary:**\n\nI am an educational trading system designed solely for technical, quantitative, and risk management instruction. I am not a mental health professional or medical practitioner, and I cannot evaluate or diagnose mental health conditions.\n\nIf you are experiencing severe distress, feelings of despair, or thoughts of self-harm, please immediately contact support services:\n* **National Suicide & Crisis Lifeline:** Call or text **988** (US/Canada)\n* **Crisis Text Line:** Text HOME to **741741**\n* **International Resources:** https://findahelpline.com/\n\nPlease close all active trading platforms and step away from the screens immediately.`
      };
    }

    // 2. Guaranteed Profit / Guaranteed Strategy Claims
    const guaranteePatterns = [
      'guarantee profit', 'guaranteed profit', 'guaranteed return', 
      '100% win rate', '100% winning', 'holy grail strategy', 
      'risk-free trade', 'never lose money', 'can this guarantee',
      'guarantee a profit', 'surefire strategy'
    ];
    if (guaranteePatterns.some(p => query.includes(p))) {
      return {
        isViolation: true,
        refusalTitle: 'Deterministic Profit Claim Rejection',
        refusalMessage: `**[FACT] Epistemological Constraint: Financial Markets Are Stochastic**\n\nNo trading strategy, mathematical model, algorithm, or trading desk can guarantee profits or eliminate the risk of loss.\n\n1. **Expected Value vs. Certainty:** Trading edges are probabilistic distributions, not deterministic promises. A positive expected value $(+EV)$ system only reveals its edge over a statistically significant sample of independent trades, during which drawdown clusters are mathematically inevitable.\n2. **Arbitrage Elimination:** Any truly riskless arbitrage in liquid markets is eliminated within microseconds by high-frequency market makers and prime desks.\n3. **Tail Risk:** Every trade carries positive probability of loss due to slippage, gap risk, counterparty failure, or liquidity exhaustion.\n\nInstitutional desks operate on strict risk budgets and capital preservation mandates, never the illusion of guaranteed returns.`
      };
    }

    // 3. Market Direction Predictions
    const predictionPatterns = [
      'will bitcoin go up', 'will btc pump', 'will spy go up tomorrow', 
      'should i buy nvda today', 'is tesla going to crash', 
      'what will happen to the market tomorrow', 'predict where the price will go'
    ];
    if (predictionPatterns.some(p => query.includes(p))) {
      return {
        isViolation: true,
        refusalTitle: 'Directional Prediction Policy',
        refusalMessage: `**[FACT] Epistemological Stance: Educators Do Not Forecast Single-Asset Outcomes**\n\nAs an institutional educator, I do not provide directional forecasts, buy/sell recommendations, or price targets for specific securities.\n\n**The Institutional Framework for Uncertainty:**\n* Rather than asking *"Will asset X go up?"*, professional desks ask:\n  1. *"What is the market pricing in via implied volatility?"*\n  2. *"Where is the technical or fundamental invalidation level if my thesis is false?"*\n  3. *"Does the asymmetric reward-to-risk ratio justify risking exactly $1.0R$ on this hypothesis?"*\n\nWould you like to study how to construct a probabilistic scenario map or calculate position size for an invalidation stop?`
      };
    }

    // 4. Fabricated Statistics / Fake Claims
    const fakeClaims = [
      'make 10000% a month', 'turn 100 into a million in a week', 
      'secret wall street secret cheat code'
    ];
    if (fakeClaims.some(p => query.includes(p))) {
      return {
        isViolation: true,
        refusalTitle: 'Statistically Unsound Claim Disqualification',
        refusalMessage: `**[FACT] Mathematical Reality Check**\n\nClaims of compounding at triple-digit monthly returns with negligible risk are mathematically inconsistent with capital capacity limits and leverage ruin probabilities.\n\nCompounding \$100 at 100% per month would mathematically exceed total global sovereign wealth within three years—a physical impossibility due to market depth, transaction cost impact, and liquidity ceilings.`
      };
    }

    return { isViolation: false };
  }
}

// ---------------------------------------------------------------------------
// 2. USER PROFILE SYNTHESIZER
// ---------------------------------------------------------------------------

export function synthesizeUserProfile(progress: UserAcademyProgress): UserAcademicProfile {
  const completedCount = progress.completedLessons.length;
  const unreviewedMistakes = progress.mistakeBank.filter(m => !m.reviewed);

  const domainScores: { domain: AcademyDomain; score: number }[] = Object.entries(progress.domainMastery).map(
    ([domain, score]) => ({ domain: domain as AcademyDomain, score })
  ).sort((a, b) => a.score - b.score);

  return {
    level: progress.currentLevel,
    masteryPct: progress.overallMastery,
    completedLessonsCount: completedCount,
    completedLessonIds: progress.completedLessons,
    unreviewedMistakesCount: unreviewedMistakes.length,
    weakestDomains: domainScores,
    recentMistakes: unreviewedMistakes.slice(0, 3).map(m => ({
      questionId: m.questionId,
      questionText: m.questionText,
      domain: m.domain,
      explanation: m.explanation
    })),
    placementCompleted: progress.placementTestCompleted
  };
}

// ---------------------------------------------------------------------------
// 3. CONCEPT & KNOWLEDGE RETRIEVAL
// ---------------------------------------------------------------------------

export function findMatchingConcept(query: string, userLevel: number): CurriculumConcept {
  const q = query.toLowerCase();

  // Exact or keyword match across registry
  const match = ALL_CURRICULUM_CONCEPTS.find(c => {
    const titleMatch = c.title.toLowerCase().includes(q) || q.includes(c.title.toLowerCase());
    const idMatch = c.id.toLowerCase() === q;
    const catMatch = c.category.toLowerCase().includes(q);
    return titleMatch || idMatch || catMatch;
  });

  if (match) return match;

  // Search by related keyword or formula
  const formulaMatch = TRADING_FORMULAS.find(f => 
    f.name.toLowerCase().includes(q) || f.domain.toLowerCase().includes(q)
  );
  if (formulaMatch) {
    const conceptForDomain = ALL_CURRICULUM_CONCEPTS.find(c => 
      c.domain === formulaMatch.domain || c.title.toLowerCase().includes(formulaMatch.name.toLowerCase())
    );
    if (conceptForDomain) return conceptForDomain;
  }

  // Fallback to primary concept of current level
  const levelConcept = ALL_CURRICULUM_CONCEPTS.find(c => c.level === userLevel);
  return levelConcept || ALL_CURRICULUM_CONCEPTS[0];
}

// ---------------------------------------------------------------------------
// 4. TEACHING METHODOLOGY GENERATOR
// ---------------------------------------------------------------------------

export class AcademyTutorEngine {
  /**
   * Main Dispatcher for User Messages
   */
  static processMessage(
    userQuery: string,
    mode: TutorMode,
    progress: UserAcademyProgress,
    explicitCommand?: TutorCommandId
  ): TutorChatMessage {
    // 1. Run Guardrails
    const guardrail = TutorGuardrails.checkQuery(userQuery);
    if (guardrail.isViolation) {
      return {
        id: `tutor-refusal-${Date.now()}`,
        sender: 'tutor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modeAtGeneration: mode,
        isSafetyRefusal: true,
        sections: [
          {
            methodologyStep: 'CORRECT',
            heading: guardrail.refusalTitle,
            content: guardrail.refusalMessage || '',
            epistemicType: 'FACT'
          }
        ],
        suggestedFollowUpCommands: ['WHAT_NEXT', 'EXPLAIN_SIMPLY', 'TEST_ME']
      };
    }

    const profile = synthesizeUserProfile(progress);
    const concept = findMatchingConcept(userQuery, profile.level);

    // 2. Identify Command Intent
    const command = explicitCommand || this.detectCommand(userQuery);

    // 3. Generate Targeted Pedagogical Response
    switch (command) {
      case 'EXPLAIN_SIMPLY':
        return this.generateExplainSimply(concept, mode);
      case 'EXPLAIN_NUMBERS':
        return this.generateExplainWithNumbers(concept, mode);
      case 'SHOW_EXAMPLE':
        return this.generateExample(concept, mode);
      case 'COUNTEREXAMPLE':
        return this.generateCounterExample(concept, mode);
      case 'COMPARE':
        return this.generateComparison(concept, userQuery, mode);
      case 'TEST_ME':
        return this.generateTest(concept, mode, profile);
      case 'CHALLENGE_ME':
        return this.generateChallenge(concept, mode, profile);
      case 'EXPLAIN_MISTAKE':
        return this.generateExplainMistake(profile, mode);
      case 'WHAT_NEXT':
        return this.generateCurriculumRecommendation(profile, mode);
      case 'TEACH_DEEPER':
        return this.generateTeachDeeper(concept, mode);
      default:
        return this.generateComprehensiveMethodology(concept, userQuery, mode, profile);
    }
  }

  /**
   * Automatic Command Recognition from Natural Language
   */
  static detectCommand(query: string): TutorCommandId | undefined {
    const q = query.toLowerCase();
    if (q.includes('explain this simply') || q.includes('simple terms') || q.includes('eli5') || q.includes('like i am 5')) {
      return 'EXPLAIN_SIMPLY';
    }
    if (q.includes('explain with numbers') || q.includes('with math') || q.includes('calculate this') || q.includes('show the math')) {
      return 'EXPLAIN_NUMBERS';
    }
    if (q.includes('show me an example') || q.includes('real example') || q.includes('give me an example')) {
      return 'SHOW_EXAMPLE';
    }
    if (q.includes('counterexample') || q.includes('counter-example') || q.includes('when does this fail') || q.includes('breakdown case')) {
      return 'COUNTEREXAMPLE';
    }
    if (q.includes('compare') || q.includes('versus') || q.includes('difference between')) {
      return 'COMPARE';
    }
    if (q.includes('test me') || q.includes('quiz me') || q.includes('give me a question')) {
      return 'TEST_ME';
    }
    if (q.includes('challenge me') || q.includes('hard question') || q.includes('advanced scenario')) {
      return 'CHALLENGE_ME';
    }
    if (q.includes('explain my mistake') || q.includes('review my mistakes') || q.includes('why was i wrong')) {
      return 'EXPLAIN_MISTAKE';
    }
    if (q.includes('what should i learn next') || q.includes('what next') || q.includes('recommendation') || q.includes('next lesson')) {
      return 'WHAT_NEXT';
    }
    if (q.includes('teach me deeper') || q.includes('go deeper') || q.includes('institutional depth') || q.includes('more detail')) {
      return 'TEACH_DEEPER';
    }
    return undefined;
  }

  // -------------------------------------------------------------------------
  // 5. PEDAGOGICAL METHODOLOGY IMPLEMENTATIONS
  // -------------------------------------------------------------------------

  /**
   * Full 9-Step Methodology Sequence (Explain -> Visualize -> Example -> Calculate -> Practice -> Test -> Correct -> Reinforce -> Recommend)
   */
  static generateComprehensiveMethodology(
    concept: CurriculumConcept,
    userQuery: string,
    mode: TutorMode,
    profile: UserAcademicProfile
  ): TutorChatMessage {
    const sections: TutorMessageSection[] = [];

    // Step 1: EXPLAIN
    sections.push({
      methodologyStep: 'EXPLAIN',
      heading: `Institutional Framework: ${concept.title}`,
      content: mode === 'BEGINNER' 
        ? concept.simpleExplanation 
        : concept.professionalDefinition,
      epistemicType: 'FACT'
    });

    // Step 2: VISUALIZE
    sections.push({
      methodologyStep: 'VISUALIZE',
      heading: 'Structural Mechanics & Geometry',
      content: this.getConceptualAsciiDiagram(concept.title, mode),
      epistemicType: 'SIMULATION'
    });

    // Step 3: EXAMPLE
    const example = concept.examples[0] || {
      scenario: 'Asset ABC trading at $100.00 with technical support at $96.00.',
      analysis: 'Risk per share is $4.00. Account risk budget is $1,000. Sizing = 250 shares.',
      outcome: 'Technical invalidation is respected without emotional interference.'
    };
    sections.push({
      methodologyStep: 'EXAMPLE',
      heading: 'Live Execution Scenario',
      content: `**Scenario:** ${example.scenario}\n\n**Analysis:** ${example.analysis}\n\n**Expected Outcome:** ${example.outcome || 'Asymmetric payoff profile established with invariant downside.'}`,
      epistemicType: 'EXAMPLE'
    });

    // Step 4: CALCULATE
    const calculation = this.getCalculationForConcept(concept.title);
    sections.push({
      methodologyStep: 'CALCULATE',
      heading: 'Quantitative Derivation',
      content: `Formula: \`${calculation.formula}\``,
      calculationSteps: calculation.steps,
      epistemicType: 'FACT'
    });

    // Step 5: PRACTICE / TEST
    const quizPayload = this.generateQuizPayloadForConcept(concept);
    sections.push({
      methodologyStep: 'TEST',
      heading: 'Institutional Verification Question',
      content: quizPayload.questionText,
      interactiveQuiz: quizPayload,
      epistemicType: 'EXAMPLE'
    });

    // Step 6: REINFORCE
    sections.push({
      methodologyStep: 'REINFORCE',
      heading: 'Core Discipline Mental Model',
      content: `**[FACT] Institutional Axiom:**\nEvery trade is a business transaction under uncertainty. You do not control the market's trajectory; you control only your price of entry, your maximum point of financial invalidation, and your sizing volume.`,
      epistemicType: 'FACT'
    });

    // Step 7: RECOMMEND
    sections.push({
      methodologyStep: 'RECOMMEND',
      heading: 'Recommended Curriculum Step',
      content: `Based on your Level ${profile.level} progression, review **${concept.title}** and proceed to the **${this.getRelatedLabName(concept.category)}** for live parameter testing.`,
      epistemicType: 'HYPOTHESIS'
    });

    return {
      id: `tutor-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      conceptInFocus: {
        id: concept.id,
        title: concept.title,
        level: concept.level,
        domain: concept.domain || 'Market Knowledge'
      },
      sections,
      suggestedFollowUpCommands: ['EXPLAIN_NUMBERS', 'SHOW_EXAMPLE', 'COUNTEREXAMPLE', 'TEST_ME']
    };
  }

  // -------------------------------------------------------------------------
  // 6. SPECIFIC COMMAND HANDLERS
  // -------------------------------------------------------------------------

  static generateExplainSimply(concept: CurriculumConcept, mode: TutorMode): TutorChatMessage {
    return {
      id: `tutor-simply-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'EXPLAIN',
          heading: `Simple Intuition: ${concept.title}`,
          content: `**[FACT] Plain-English Explanation:**\n\n${concept.simpleExplanation}\n\n* **The Everyday Analogy:** Think of this like taking out car insurance. You pay a small, known premium (your stop-loss risk) so that in the event of an unexpected crash, your net worth is protected from catastrophic ruin.`,
          epistemicType: 'EXAMPLE'
        },
        {
          methodologyStep: 'REINFORCE',
          heading: 'Key Takeaway',
          content: `Never complicate what can be understood intuitively: protect your capital first, let statistical probability do the rest.`,
          epistemicType: 'FACT'
        }
      ],
      suggestedFollowUpCommands: ['EXPLAIN_NUMBERS', 'SHOW_EXAMPLE', 'TEST_ME']
    };
  }

  static generateExplainWithNumbers(concept: CurriculumConcept, mode: TutorMode): TutorChatMessage {
    const calc = this.getCalculationForConcept(concept.title);
    return {
      id: `tutor-numbers-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'CALCULATE',
          heading: `Quantitative Breakdown: ${concept.title}`,
          content: `**[FACT] Mathematical Model:**\n\`${calc.formula}\`\n\nLet us calculate step-by-step using institutional baseline inputs:`,
          calculationSteps: calc.steps,
          epistemicType: 'FACT'
        },
        {
          methodologyStep: 'VISUALIZE',
          heading: 'Numerical Sensitivity Matrix',
          content: this.getNumericalSensitivityTable(concept.title),
          epistemicType: 'SIMULATION'
        }
      ],
      suggestedFollowUpCommands: ['SHOW_EXAMPLE', 'COUNTEREXAMPLE', 'TEST_ME']
    };
  }

  static generateExample(concept: CurriculumConcept, mode: TutorMode): TutorChatMessage {
    const ex = concept.examples[0] || {
      scenario: 'Buying breakout above resistance at $210 with stop below structural pivot at $202.',
      analysis: 'Risk is $8.00 per share. Account size $50,000. Risk parameter 1.0% ($500). Units = 62 shares.',
      outcome: 'Target at $234 offers 3.0R payoff ($1,500 profit vs $500 risked).'
    };

    return {
      id: `tutor-example-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'EXAMPLE',
          heading: `Practical Case: ${concept.title}`,
          content: `**[EXAMPLE] Market Execution Setup:**\n\n* **Setup Context:** ${ex.scenario}\n* **Risk Audit:** ${ex.analysis}\n* **Outcome Distribution:** ${ex.outcome || 'Systematic exit triggered according to pre-trade playbook.'}`,
          epistemicType: 'EXAMPLE'
        },
        {
          methodologyStep: 'REINFORCE',
          heading: 'Execution Rule',
          content: `Notice how the trade size was derived backwards from the invalidation distance. Amateur traders pick share counts first; quantitative professionals derive size strictly from downside tolerance.`,
          epistemicType: 'FACT'
        }
      ],
      suggestedFollowUpCommands: ['COUNTEREXAMPLE', 'EXPLAIN_NUMBERS', 'CHALLENGE_ME']
    };
  }

  static generateCounterExample(concept: CurriculumConcept, mode: TutorMode): TutorChatMessage {
    return {
      id: `tutor-counter-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'EXAMPLE',
          heading: `Failure Mode & Counterexample: ${concept.title}`,
          content: `**[HISTORICAL OBSERVATION] Where Assumptions Break Down:**\n\n* **The Flawed Premise:** Assuming stops are guaranteed fills at the exact order price during liquidity vacuums.\n* **The Counter-Scenario:** In a major market gap or flash liquidity collapse (such as the 2015 Swiss Franc unpegging or 2010 Flash Crash), resting stop-loss orders on retail brokerage feeds suffered severe execution slippage of hundreds of pips or points.\n* **Institutional Reality:** A stop order becomes a market order when touched. If the order book is empty beneath your stop, you fill at the next available bid, however distant. Position sizing must account for catastrophic gap risk.`,
          epistemicType: 'HISTORICAL OBSERVATION'
        },
        {
          methodologyStep: 'REINFORCE',
          heading: 'Mitigation Protocol',
          content: `Never size positions so aggressively that a gap or weekend event past your technical stop causes catastrophic equity impairment.`,
          epistemicType: 'FACT'
        }
      ],
      suggestedFollowUpCommands: ['EXPLAIN_NUMBERS', 'CHALLENGE_ME', 'TEST_ME']
    };
  }

  static generateComparison(concept: CurriculumConcept, query: string, mode: TutorMode): TutorChatMessage {
    return {
      id: `tutor-compare-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'EXPLAIN',
          heading: `Comparative Analysis: ${concept.title}`,
          content: `**[FACT] Institutional Contrast Matrix:**\n\n| Dimension | Amateur Trader Conception | Institutional Quantitative Desk |\n| :--- | :--- | :--- |\n| **Core Focus** | Win rate (%) and calling tops/bottoms | Expected Value ($EV$), Sharpe/Sortino, and variance distribution |\n| **Loss Handling** | Personal failure, avoidance, moving stops | Expected cost of acquiring statistical information |\n| **Sizing** | Fixed lot counts or "feeling confident" | Mathematically invariant dollar risk based on stop distance |\n| **Drawdown** | Escalates risk (revenge trading) | Scales down exposure to preserve capital through adverse regimes |\n| **Execution** | Uncontrolled market orders | TCA, limit queue priority, passive spread capture |`,
          epistemicType: 'FACT'
        }
      ],
      suggestedFollowUpCommands: ['TEACH_DEEPER', 'TEST_ME', 'WHAT_NEXT']
    };
  }

  static generateTest(
    concept: CurriculumConcept,
    mode: TutorMode,
    profile: UserAcademicProfile
  ): TutorChatMessage {
    const quiz = this.generateQuizPayloadForConcept(concept);
    return {
      id: `tutor-test-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'TEST',
          heading: `Knowledge Verification: ${concept.title}`,
          content: `Test your operational comprehension of **${concept.title}**. Select the most rigorous institutional response below:`,
          interactiveQuiz: quiz,
          epistemicType: 'EXAMPLE'
        }
      ],
      suggestedFollowUpCommands: ['EXPLAIN_NUMBERS', 'SHOW_EXAMPLE', 'CHALLENGE_ME']
    };
  }

  static generateChallenge(
    concept: CurriculumConcept,
    mode: TutorMode,
    profile: UserAcademicProfile
  ): TutorChatMessage {
    const challengeQuiz: InteractiveQuizPayload = {
      questionId: `challenge-${concept.id}-${Date.now()}`,
      conceptId: concept.id,
      questionText: `Institutional Challenge: You manage a $2,000,000 portfolio with a mandatory maximum daily drawdown ceiling of 1.5% ($30,000). You are already down 0.6% ($12,000) today across two early sessions. A high-conviction 3.5R setup emerges in E-mini S&P futures with a 12.50-point stop ($625 per contract). What is the maximum number of contracts you may enter without risking a mandate breach on this single trade?`,
      options: [
        'A) 28 contracts ($18,000 remaining daily loss budget / $625 = 28.8)',
        'B) 14 contracts (allocating at most 50% of remaining daily budget to a single trade)',
        'C) 48 contracts (allocating the full 1.5% initial budget)',
        'D) 0 contracts (mandate requires trading cessation after any two consecutive morning losses)'
      ],
      correctAnswerIndex: 1,
      explanation: `Correct: Institutional risk desks enforce sub-allocation limits. Risking the entire remaining $18,000 budget on a single trade leaves zero tolerance for execution slippage or adverse gap fills. Allocating 50% ($9,000 / $625 = 14 contracts) respects remaining budget while preserving capital against total mandate lockout.`,
      misconceptionMap: {
        0: 'Risking 100% of the remaining daily loss budget on one trade is reckless: a minor 1-tick slippage breaches the firm mandate.',
        2: 'You failed to deduct the $12,000 already lost today, which would guarantee an immediate mandate breach.',
        3: 'Mandates rarely dictate binary shutdowns after only two losses unless daily risk limit is touched.'
      },
      similarFollowUpQuestion: {
        questionText: `Re-Test: An account has a $10,000 maximum daily loss limit and is down $4,000 today. If maximum single-trade allocation is 40% of remaining buffer, how much dollar risk is permissible on the next setup?`,
        options: [
          'A) $2,400 (40% of $6,000 remaining buffer)',
          'B) $4,000 (40% of initial $10,000 buffer)',
          'C) $6,000 (100% of remaining buffer)',
          'D) $1,600 (remaining buffer minus prior loss)'
        ],
        correctAnswerIndex: 0,
        explanation: `Correct: The remaining buffer is $10,000 - $4,000 = $6,000. 40% of $6,000 is exactly $2,400.`
      }
    };

    return {
      id: `tutor-challenge-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'TEST',
          heading: `Tier-1 Institutional Desk Scenario: Capital Allocation`,
          content: challengeQuiz.questionText,
          interactiveQuiz: challengeQuiz,
          epistemicType: 'SIMULATION'
        }
      ],
      suggestedFollowUpCommands: ['EXPLAIN_NUMBERS', 'EXPLAIN_MISTAKE', 'TEACH_DEEPER']
    };
  }

  static generateExplainMistake(profile: UserAcademicProfile, mode: TutorMode): TutorChatMessage {
    if (profile.recentMistakes.length === 0) {
      return {
        id: `tutor-no-mistake-${Date.now()}`,
        sender: 'tutor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modeAtGeneration: mode,
        sections: [
          {
            methodologyStep: 'EXPLAIN',
            heading: 'Mistake Bank Audit: Clean',
            content: `**[FACT] Zero Pending Unreviewed Mistakes:**\n\nYou currently have no unreviewed mistakes logged in your Mistake Bank! Your quiz attempts and exercises reflect clean comprehension so far.\n\nTo stress-test your knowledge and expose any hidden cognitive or technical blind spots, try asking me to **"Challenge me"** or take a quiz in the Quizzes tab.`,
            epistemicType: 'FACT'
          }
        ],
        suggestedFollowUpCommands: ['CHALLENGE_ME', 'TEST_ME', 'WHAT_NEXT']
      };
    }

    const mistake = profile.recentMistakes[0];
    const reTest: InteractiveQuizPayload = {
      questionId: `retest-${mistake.questionId}-${Date.now()}`,
      questionText: `Targeted Mistake Re-Test (${mistake.domain}): Let's verify you have cleared this misconception:\n\nOriginal Question: "${mistake.questionText}"`,
      options: [
        'A) Focus strictly on win rate percentage as the primary KPI',
        'B) Size positions based on expected value, volatility, and technical invalidation stop distance',
        'C) Add to losing positions to lower the average breakeven price',
        'D) Move stops further away when market enters volatility'
      ],
      correctAnswerIndex: 1,
      explanation: `Correct! Position sizing must be derived backwards from your pre-defined technical invalidation point. ${mistake.explanation}`
    };

    return {
      id: `tutor-mistake-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'CORRECT',
          heading: `Mistake Deconstruction: ${mistake.domain}`,
          content: `**[HISTORICAL OBSERVATION] Missed Concept Review:**\n\n* **The Question You Missed:** "${mistake.questionText}"\n* **Why That Error Occurred:** Amateur traders intuitively equate high win rate with profitability or view stop losses as punitive. In institutional frameworks, stops define the business operating cost of trade validation.\n* **The Correct Institutional Principle:** ${mistake.explanation}`,
          epistemicType: 'FACT'
        },
        {
          methodologyStep: 'TEST',
          heading: 'Immediate Remediation Re-Test',
          content: reTest.questionText,
          interactiveQuiz: reTest,
          epistemicType: 'EXAMPLE'
        }
      ],
      suggestedFollowUpCommands: ['EXPLAIN_NUMBERS', 'SHOW_EXAMPLE', 'WHAT_NEXT']
    };
  }

  static generateCurriculumRecommendation(
    profile: UserAcademicProfile,
    mode: TutorMode
  ): TutorChatMessage {
    const currentLevelInfo = ACADEMY_LEVELS.find(l => l.level === profile.level) || ACADEMY_LEVELS[0];
    const levelConcepts = ALL_CURRICULUM_CONCEPTS.filter(c => c.level === profile.level);
    const uncompleted = levelConcepts.filter(c => !profile.completedLessonIds.includes(c.id));
    const nextConcept = uncompleted[0] || levelConcepts[0] || ALL_CURRICULUM_CONCEPTS[0];

    const weakest = profile.weakestDomains[0] || { domain: 'Risk Management', score: 0 };

    return {
      id: `tutor-recommend-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'RECOMMEND',
          heading: `Academic Path Recommendation: Level ${profile.level}`,
          content: `**[FACT] Your Current Learning State:**\n\n* **Current Level:** Level ${profile.level} — *${currentLevelInfo.title}*\n* **Curriculum Mastery:** ${profile.masteryPct}%\n* **Lessons Completed:** ${profile.completedLessonsCount} lessons\n* **Identified Weakest Domain:** **${weakest.domain}** (${weakest.score}% verified mastery)\n\n**Next Priority Milestone:**\n1. Complete **${nextConcept.title}** (${nextConcept.category})\n2. Review any pending items in your **Mistake Bank** (${profile.unreviewedMistakesCount} pending)\n3. Complete the interactive **Risk Lab** to verify numerical position sizing`,
          epistemicType: 'HYPOTHESIS'
        },
        {
          methodologyStep: 'REINFORCE',
          heading: 'Pedagogical Guidance',
          content: `Progressing through the TradeVault levels requires true conceptual competence, not passive reading. Test yourself on every concept before moving forward.`,
          epistemicType: 'FACT'
        }
      ],
      suggestedFollowUpCommands: ['TEACH_DEEPER', 'TEST_ME', 'CHALLENGE_ME']
    };
  }

  static generateTeachDeeper(concept: CurriculumConcept, mode: TutorMode): TutorChatMessage {
    return {
      id: `tutor-deeper-${Date.now()}`,
      sender: 'tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modeAtGeneration: mode,
      sections: [
        {
          methodologyStep: 'EXPLAIN',
          heading: `Institutional Depth: ${concept.title}`,
          content: `**[FACT] Microstructure & Mathematical Mechanics:**\n\n${concept.professionalDefinition}\n\n**Key Institutional Variables:**\n* **Adverse Selection:** Resting passive limit orders face execution primarily when aggressive informed order flow arrives to cross the spread.\n* **Inventory Skewing:** When an institutional market maker's long inventory grows beyond tolerance, they skew their bid-ask quote lower to discourage buyers and attract sellers.\n* **Liquidity Exhaustion:** Extreme volatility causes passive depth to widen or vanish, leading to non-linear slippage.`,
          epistemicType: 'FACT'
        },
        {
          methodologyStep: 'VISUALIZE',
          heading: 'Order Book Depth Ladder',
          content: `      [ASK DEPTH]
      Price      Size (Lots)   Cumulative
      152.00     1,200         4,150  |████████████|
      151.75       950         2,950  |█████████|
      151.50     1,100         2,000  |██████████|
      151.25       900           900  |████████|
   --- SPREAD = $0.25 (16.5 bps) ---
      151.00     1,400           900  |█████████████|
      150.75       800         2,200  |███████|
      150.50     1,050         3,250  |██████████|
      150.25     1,300         4,550  |████████████|
      [BID DEPTH]`,
          epistemicType: 'SIMULATION'
        }
      ],
      suggestedFollowUpCommands: ['EXPLAIN_NUMBERS', 'CHALLENGE_ME', 'TEST_ME']
    };
  }

  // -------------------------------------------------------------------------
  // 7. REMEDIATION ENGINE (5-STEP INCORRECT ANSWER CORRECTION)
  // -------------------------------------------------------------------------

  /**
   * Implements the 5-step correction workflow:
   * 1. Identify misconception.
   * 2. Explain why it is incorrect.
   * 3. Explain correct reasoning.
   * 4. Give a similar question.
   * 5. Re-test the user.
   */
  static handleIncorrectAnswer(
    quiz: InteractiveQuizPayload,
    userChoiceIndex: number,
    mode: TutorMode
  ): RemediationState {
    const defaultMisconceptions: Record<number, string> = {
      0: 'You selected option A. This typically confuses nominal position size with true risk, or prioritizes win rate over mathematical expectancy.',
      1: 'You selected option B. This overlooks the fundamental interaction between volatility and technical invalidation.',
      2: 'You selected option C. This relies on hope or averaging down, which exponentially increases probability of account ruin.',
      3: 'You selected option D. This breaches risk invariance by widening stops during elevated market volatility.'
    };

    const misconception = quiz.misconceptionMap?.[userChoiceIndex] || 
      defaultMisconceptions[userChoiceIndex] || 
      'You focused on nominal upside potential rather than quantifying maximum downside exposure.';

    const similarQ = quiz.similarFollowUpQuestion || {
      questionText: `Follow-Up Re-Test: Let us re-verify this core concept. If you risk $500 with an entry at $50.00 and a technical stop at $48.00 ($2.00 stop distance), what is the correct position size?`,
      options: [
        'A) 250 shares ($500 risk / $2.00 distance = 250 units)',
        'B) 100 shares (arbitrary round lot sizing)',
        'C) 500 shares ($500 risk / $1.00 assumption)',
        'D) 1,000 shares ($50,000 account balance sizing)'
      ],
      correctAnswerIndex: 0,
      explanation: `Correct: Position size is strictly calculated as Dollar Risk / Stop Distance = $500 / $2.00 = 250 shares.`
    };

    return {
      originalQuestionId: quiz.questionId,
      userWrongChoiceIndex: userChoiceIndex,
      misconceptionIdentified: misconception,
      whyIncorrect: `Your answer failed to enforce mathematical risk invariance. In live markets, treating risk as arbitrary leads to geometric drawdown compounding.`,
      correctReasoning: quiz.explanation,
      reTestQuestion: similarQ
    };
  }

  // -------------------------------------------------------------------------
  // 8. HELPERS & FORMATTING
  // -------------------------------------------------------------------------

  static generateQuizPayloadForConcept(concept: CurriculumConcept): InteractiveQuizPayload {
    if (concept.quizzes && concept.quizzes.length > 0) {
      const q = concept.quizzes[0];
      const correctIdx = q.correctIndex ?? q.correctAnswerIndex ?? 0;
      return {
        questionId: q.id || `quiz-${concept.id}`,
        conceptId: concept.id,
        questionText: q.question,
        options: q.options,
        correctAnswerIndex: correctIdx,
        explanation: q.explanation,
        similarFollowUpQuestion: {
          questionText: `Follow-Up Verification: Regarding ${concept.title}, which statement accurately describes institutional execution practice?`,
          options: [
            'A) Never risk more than pre-determined invariance allows, deriving volume from stop distance.',
            'B) Increase lot sizes after losing trades to recover equity quickly.',
            'C) Widen stop distances during announcements to avoid getting stopped out.',
            'D) Assume that high historical win rate eliminates the need for stop orders.'
          ],
          correctAnswerIndex: 0,
          explanation: 'Risk invariance requires dynamic volume adjustment so dollar risk never exceeds predefined parameters.'
        }
      };
    }

    // Default institutional quiz for this concept
    return {
      questionId: `quiz-${concept.id}-${Date.now()}`,
      conceptId: concept.id,
      questionText: `Institutional Check: Regarding "${concept.title}", which statement represents sound quantitative risk management?`,
      options: [
        'A) The dollar amount lost when your stop is hit must be calculated and invariant before entering.',
        'B) You should trade larger size when you have a strong intuition about market direction.',
        'C) Stop losses should be eliminated when trading fundamentally sound companies.',
        'D) High win rate is sufficient to ensure profitability regardless of risk-to-reward ratio.'
      ],
      correctAnswerIndex: 0,
      explanation: `Correct! Institutional trading demands risk invariance: your downside dollar loss must be capped and calculated prior to order execution.`
    };
  }

  static getCalculationForConcept(conceptTitle: string): {
    formula: string;
    steps: { stepNumber: number; label: string; formula: string; plugIn: string; result: string }[];
  } {
    const lower = conceptTitle.toLowerCase();

    if (lower.includes('expected value') || lower.includes('ev') || lower.includes('expectancy')) {
      return {
        formula: 'EV = (Win Rate × Avg Win R) - (Loss Rate × Avg Loss R)',
        steps: [
          { stepNumber: 1, label: 'Determine Win & Loss Probabilities', formula: 'P(Loss) = 1 - P(Win)', plugIn: 'P(Loss) = 1 - 0.42 = 0.58', result: 'Win: 42%, Loss: 58%' },
          { stepNumber: 2, label: 'Calculate Positive Contribution', formula: 'P(Win) × Avg Win R', plugIn: '0.42 × 2.80R', result: '+1.176 R' },
          { stepNumber: 3, label: 'Calculate Negative Contribution', formula: 'P(Loss) × Avg Loss R', plugIn: '0.58 × 1.00R', result: '-0.580 R' },
          { stepNumber: 4, label: 'Net Mathematical Expectancy', formula: 'EV = +1.176 - 0.580', plugIn: '1.176 - 0.580', result: '+0.596 R per trade' }
        ]
      };
    }

    if (lower.includes('drawdown') || lower.includes('recovery')) {
      return {
        formula: 'Required Gain % = (Drawdown % / (100 - Drawdown %)) × 100',
        steps: [
          { stepNumber: 1, label: 'Identify Peak-to-Trough Loss', formula: 'Drawdown Incurred', plugIn: '50.0% account loss', result: 'Remaining equity = 50.0%' },
          { stepNumber: 2, label: 'Calculate Recovery Multiplier', formula: '100 / Remaining Equity', plugIn: '100 / 50.0', result: '2.00x multiplier' },
          { stepNumber: 3, label: 'Compute Required Percentage Gain', formula: '(50 / 50) × 100', plugIn: '1.00 × 100', result: '+100.0% required gain' }
        ]
      };
    }

    // Default: Fixed-Fractional Sizing Calculation
    return {
      formula: 'Units = (Account Equity × Risk %) / |Entry Price - Stop Price|',
      steps: [
        { stepNumber: 1, label: 'Calculate Permissible Dollar Risk', formula: 'Account Equity × Risk %', plugIn: '$50,000 × 0.01 (1%)', result: '$500.00 dollar risk budget' },
        { stepNumber: 2, label: 'Calculate Technical Stop Distance', formula: '|Entry - Stop|', plugIn: '|$182.50 - $177.50|', result: '$5.00 per share stop distance' },
        { stepNumber: 3, label: 'Derive Exact Invariant Share Size', formula: '$500.00 / $5.00', plugIn: '500 / 5', result: '100 shares / units' }
      ]
    };
  }

  static getConceptualAsciiDiagram(conceptTitle: string, mode: TutorMode): string {
    const lower = conceptTitle.toLowerCase();

    if (lower.includes('drawdown')) {
      return `    DRAWDOWN RECOVERY ASYMMETRY
    Loss %   | Required Gain to Breakeven
    ---------|------------------------------------
    -10%     | +11.1%  |███|
    -20%     | +25.0%  |██████|
    -30%     | +42.9%  |███████████|
    -40%     | +66.7%  |████████████████|
    -50%     | +100.0% |████████████████████████|
    -75%     | +300.0% |████████████████████████████████████████████|
    -90%     | +900.0% |[Catastrophic Ruin Regime]`;
    }

    if (lower.includes('order book') || lower.includes('liquidity') || lower.includes('execution')) {
      return `         ORDER BOOK DEPTH PROFILE
         Price        Size     Cumulative
    ASK  $102.50      800      2,300   |████████|
         $102.00      900      1,500   |█████████|
         $101.50      600        600   |██████|
    --------------------------------------------- SPREAD = $0.50
    BID  $101.00      700        700   |███████|
         $100.50    1,200      1,900   |████████████|
         $100.00    1,500      3,400   |███████████████|`;
    }

    // Default: Asymmetric Payoff Distribution
    return `    ASYMMETRIC RISK-TO-REWARD (1:3 R:R)
    [-1.0R Stop]               [Entry]                     [+3.0R Target]
    <--- $500 Risk ---> | <------------------ $1,500 Reward ------------------>
    [   LOSS REGIME   ] | [                   PROFIT REGIME                   ]
    Mathematical Breakeven Required Win Rate = 1 / (1 + 3.0) = 25.0%`;
  }

  static getNumericalSensitivityTable(conceptTitle: string): string {
    return `SENSITIVITY MATRIX (Risk = $1,000 Invariant)
Stop Distance | Shares Allowed | Nominal Exposure | % Account ($100k)
$1.00         | 1,000 shares   | $100,000         | 100%
$2.50         | 400 shares     | $40,000          | 40%
$5.00         | 200 shares     | $20,000          | 20%
$10.00        | 100 shares     | $10,000          | 10%
Notice: In all rows, if the stop hits, exactly $1,000 is lost. Risk is invariant.`;
  }

  static getRelatedLabName(category: string): string {
    switch (category) {
      case 'RISK MANAGEMENT':
        return 'Risk Lab (Position Sizing & Liquidation)';
      case 'QUANTITATIVE TRADING':
      case 'SYSTEMATIC TRADING':
        return 'Quant Lab (Monte Carlo & Expectancy)';
      case 'EXECUTION':
      case 'MARKET MICROSTRUCTURE':
        return 'Execution Lab (Level 2 Order Book)';
      case 'PORTFOLIO MANAGEMENT':
        return 'Portfolio Lab (Covariance & Markowitz)';
      case 'PSYCHOLOGY':
      case 'BEHAVIORAL FINANCE':
        return 'Psychology Lab (Cognitive Bias Scenarios)';
      default:
        return 'Interactive Labs';
    }
  }
}
