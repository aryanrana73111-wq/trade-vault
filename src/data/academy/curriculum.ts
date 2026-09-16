import { Lesson, AcademyConcept } from '@/types/academy';
import { CurriculumRegistry, ALL_CURRICULUM_CONCEPTS } from './registry';

export * from './registry';

/**
 * Master Registry of all Academy Lessons across Levels 0 through 10.
 * Populated directly from the structured content registry.
 */
export const ACADEMY_LESSONS: Lesson[] = ALL_CURRICULUM_CONCEPTS.map(concept => 
  CurriculumRegistry.toLesson(concept)
);

/**
 * Master Registry of all Academy Concepts across Levels 0 through 10.
 * Populated directly from the structured content registry.
 */
export const ACADEMY_CONCEPTS: AcademyConcept[] = ALL_CURRICULUM_CONCEPTS.map(concept => 
  CurriculumRegistry.toAcademyConcept(concept)
);
