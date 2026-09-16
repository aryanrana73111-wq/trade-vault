import { 
  CurriculumConcept, 
  CurriculumCategory, 
  ConceptDependencyGraph, 
  ConceptDependencyNode,
  ConceptStatus,
  Lesson,
  AcademyConcept,
  AcademyDomain
} from '@/types/academy';
import { CATEGORY_METADATA } from './types';
import { LEVEL_0_CONCEPTS } from './level0';
import { LEVEL_1_CONCEPTS } from './level1';
import { LEVEL_2_CONCEPTS } from './level2';
import { LEVEL_3_CONCEPTS } from './level3';
import { LEVEL_4_CONCEPTS } from './level4';
import { LEVEL_5_CONCEPTS } from './level5';
import { LEVEL_6_CONCEPTS } from './level6';
import { LEVEL_7_CONCEPTS } from './level7';
import { LEVEL_8_CONCEPTS } from './level8';
import { LEVEL_9_CONCEPTS } from './level9';
import { LEVEL_10_CONCEPTS } from './level10';

export * from './types';
export * from './level0';
export * from './level1';
export * from './level2';
export * from './level3';
export * from './level4';
export * from './level5';
export * from './level6';
export * from './level7';
export * from './level8';
export * from './level9';
export * from './level10';

export const ALL_CURRICULUM_CONCEPTS: CurriculumConcept[] = [
  ...LEVEL_0_CONCEPTS,
  ...LEVEL_1_CONCEPTS,
  ...LEVEL_2_CONCEPTS,
  ...LEVEL_3_CONCEPTS,
  ...LEVEL_4_CONCEPTS,
  ...LEVEL_5_CONCEPTS,
  ...LEVEL_6_CONCEPTS,
  ...LEVEL_7_CONCEPTS,
  ...LEVEL_8_CONCEPTS,
  ...LEVEL_9_CONCEPTS,
  ...LEVEL_10_CONCEPTS
];

const CONCEPT_MAP = new Map<string, CurriculumConcept>();
ALL_CURRICULUM_CONCEPTS.forEach(c => CONCEPT_MAP.set(c.id, c));

export class CurriculumRegistry {
  /**
   * Returns all concepts in the registry across Levels 0 through 10
   */
  static getAllConcepts(): CurriculumConcept[] {
    return ALL_CURRICULUM_CONCEPTS;
  }

  /**
   * Find a specific concept by ID
   */
  static getConceptById(id: string): CurriculumConcept | undefined {
    return CONCEPT_MAP.get(id);
  }

  /**
   * Get all concepts belonging to a specific Level (0 - 10)
   */
  static getConceptsByLevel(level: number): CurriculumConcept[] {
    return ALL_CURRICULUM_CONCEPTS.filter(c => c.level === level);
  }

  /**
   * Get all concepts categorized under one of the 15 curriculum categories
   */
  static getConceptsByCategory(category: CurriculumCategory): CurriculumConcept[] {
    return ALL_CURRICULUM_CONCEPTS.filter(c => c.category === category);
  }

  /**
   * Checks if all prerequisite concepts for a given concept are completed
   */
  static isPrerequisiteMet(conceptId: string, completedConceptIds: string[]): boolean {
    const concept = CONCEPT_MAP.get(conceptId);
    if (!concept || concept.prerequisites.length === 0) return true;
    const completedSet = new Set(completedConceptIds);
    return concept.prerequisites.every(prereqId => completedSet.has(prereqId));
  }

  /**
   * Returns an array of prerequisite concepts that the user has not yet completed
   */
  static getMissingPrerequisites(conceptId: string, completedConceptIds: string[]): CurriculumConcept[] {
    const concept = CONCEPT_MAP.get(conceptId);
    if (!concept || concept.prerequisites.length === 0) return [];
    const completedSet = new Set(completedConceptIds);
    return concept.prerequisites
      .filter(prereqId => !completedSet.has(prereqId))
      .map(id => CONCEPT_MAP.get(id))
      .filter((c): c is CurriculumConcept => c !== undefined);
  }

  /**
   * Computes the exact operational state of a concept:
   * - 'completed': user has already mastered or finished this concept
   * - 'in-progress': currently being studied by user
   * - 'unlocked': all prerequisites are met, ready to learn
   * - 'locked': one or more prerequisites are missing
   */
  static getConceptStatus(
    conceptId: string, 
    completedConceptIds: string[], 
    inProgressId?: string
  ): ConceptStatus {
    const completedSet = new Set(completedConceptIds);
    if (completedSet.has(conceptId)) {
      return 'completed';
    }
    if (inProgressId === conceptId) {
      return 'in-progress';
    }
    const isMet = this.isPrerequisiteMet(conceptId, completedConceptIds);
    return isMet ? 'unlocked' : 'locked';
  }

  /**
   * Generates the complete Concept Dependency Graph with directional edges and resolved statuses
   */
  static getDependencyGraph(completedConceptIds: string[]): ConceptDependencyGraph {
    const nodes: Record<string, ConceptDependencyNode> = {};
    const adjacencyList: Record<string, string[]> = {};

    // Initialize nodes and adjacency
    for (const concept of ALL_CURRICULUM_CONCEPTS) {
      nodes[concept.id] = {
        id: concept.id,
        title: concept.title,
        category: concept.category,
        level: concept.level,
        prerequisites: concept.prerequisites,
        dependents: [],
        status: this.getConceptStatus(concept.id, completedConceptIds),
        missingPrerequisites: this.getMissingPrerequisites(concept.id, completedConceptIds).map(c => c.id)
      };
      adjacencyList[concept.id] = [];
    }

    // Populate dependent edges (concept -> dependents)
    for (const concept of ALL_CURRICULUM_CONCEPTS) {
      for (const prereqId of concept.prerequisites) {
        if (nodes[prereqId]) {
          nodes[prereqId].dependents.push(concept.id);
        }
        if (!adjacencyList[prereqId]) {
          adjacencyList[prereqId] = [];
        }
        adjacencyList[prereqId].push(concept.id);
      }
    }

    return { nodes, adjacencyList };
  }

  /**
   * "Start Here": The foundational starting concept for a new student (Level 0, zero prerequisites)
   */
  static getStartHere(completedConceptIds: string[] = []): CurriculumConcept {
    const completedSet = new Set(completedConceptIds);
    // Find first incomplete concept in Level 0
    const level0Incomplete = LEVEL_0_CONCEPTS.find(c => !completedSet.has(c.id));
    if (level0Incomplete) return level0Incomplete;
    // Fallback to very first concept
    return LEVEL_0_CONCEPTS[0];
  }

  /**
   * "Continue Learning": The next active or in-progress concept that is currently unlocked
   */
  static getContinueLearning(
    completedConceptIds: string[], 
    inProgressId?: string
  ): CurriculumConcept | undefined {
    if (inProgressId && !completedConceptIds.includes(inProgressId)) {
      const active = CONCEPT_MAP.get(inProgressId);
      if (active) return active;
    }
    // Otherwise, find the lowest-level unlocked, incomplete concept
    const recommended = this.getRecommendedNext(completedConceptIds, 1);
    return recommended.length > 0 ? recommended[0] : undefined;
  }

  /**
   * "Recommended Next": List of concepts whose prerequisites are 100% completed, but are not yet mastered
   */
  static getRecommendedNext(completedConceptIds: string[], limit: number = 4): CurriculumConcept[] {
    const completedSet = new Set(completedConceptIds);
    const eligible = ALL_CURRICULUM_CONCEPTS.filter(concept => {
      // Must not already be completed
      if (completedSet.has(concept.id)) return false;
      // All prerequisites must be met
      return this.isPrerequisiteMet(concept.id, completedConceptIds);
    });

    // Sort by level ascending, then by order in registry
    eligible.sort((a, b) => a.level - b.level);
    return eligible.slice(0, limit);
  }

  /**
   * Converts a structured CurriculumConcept into a standard Lesson model
   * to ensure 100% interoperability with all existing Academy views & modals.
   */
  static toLesson(concept: CurriculumConcept): Lesson {
    const domain: AcademyDomain = concept.domain || CATEGORY_METADATA[concept.category]?.domain || 'Market Knowledge';
    const primaryFormula = concept.formulas?.[0];
    const primaryExample = concept.examples?.[0];

    return {
      id: concept.id,
      level: concept.level,
      title: concept.title,
      slug: concept.id,
      domain,
      difficulty: concept.difficulty,
      estimatedMinutes: concept.estimatedLearningTime,
      prerequisites: concept.prerequisites,
      objectives: concept.learningObjectives,
      learningObjectives: concept.learningObjectives,
      whatIsIt: concept.simpleExplanation,
      description: concept.description,
      professionalDefinition: concept.professionalDefinition,
      whyItMatters: concept.description,
      visualExplanation: `Analytical model and microstructure representation for ${concept.title}. Examine structural dynamics, execution mechanics, and invariant edge criteria.`,
      artifact: concept.artifacts?.[0] || {
        type: 'market-structure',
        title: `${concept.title} Interactive Model`,
        description: `Explore dynamic scenarios and parameters for ${concept.title}.`
      },
      numericalExample: primaryExample ? {
        setup: primaryExample.scenario,
        calculation: primaryExample.analysis,
        result: primaryExample.outcome || 'Calculated invariant outcome.',
        takeaway: 'Mathematical consistency protects portfolio longevity.'
      } : undefined,
      tradingExample: {
        context: `${concept.category} Market Scenario`,
        scenario: primaryExample?.scenario || `Evaluating institutional flow in ${concept.title}.`,
        outcome: primaryExample?.analysis || `Rules-based execution enforces discipline.`
      },
      professionalPerspective: concept.professionalDefinition,
      commonMistakes: concept.commonMistakes,
      practiceExercise: {
        prompt: `Apply the core principle of ${concept.title} to an active trade setup.`,
        solution: `Verify all prerequisite criteria, confirm structural invalidation, and execute with fixed fractional sizing.`,
        hint: `Check ${concept.category} risk constraints before entering orders.`
      },
      quiz: concept.quizzes || [],
      quizQuestions: concept.quizzes || [],
      masteryCriteria: `Master all concepts in ${concept.title} with >= 80% quiz score and zero unhedged risk exposure.`,
      explainLikeIm10: concept.simpleExplanation,
      formula: primaryFormula ? {
        name: primaryFormula.name,
        expression: primaryFormula.expression,
        variables: primaryFormula.variables || [],
        notes: primaryFormula.notes
      } : undefined,
      relatedConceptIds: concept.relatedConcepts
    };
  }

  /**
   * Converts a structured CurriculumConcept into an AcademyConcept model
   */
  static toAcademyConcept(concept: CurriculumConcept): AcademyConcept {
    const domain: AcademyDomain = concept.domain || CATEGORY_METADATA[concept.category]?.domain || 'Market Knowledge';
    const primaryFormula = concept.formulas?.[0];
    const primaryExample = concept.examples?.[0];

    return {
      id: concept.id,
      name: concept.title,
      title: concept.title,
      level: concept.level,
      domain,
      difficulty: concept.difficulty,
      shortDefinition: concept.simpleExplanation,
      summary: concept.description,
      professionalDefinition: concept.professionalDefinition,
      whyItMatters: concept.description,
      formula: primaryFormula?.expression,
      mathematicalFormula: primaryFormula?.expression,
      numericalExample: primaryExample?.analysis,
      tradingExample: primaryExample?.scenario,
      institutionalPerspective: concept.professionalDefinition,
      commonMistakes: concept.commonMistakes,
      explainLikeIm10: concept.simpleExplanation,
      prerequisites: concept.prerequisites,
      relatedConceptIds: concept.relatedConcepts,
      lessonId: concept.id
    };
  }
}
