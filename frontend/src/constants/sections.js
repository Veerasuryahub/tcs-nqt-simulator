export const EXAM_SECTIONS = [
  { 
    id: 'verbal', 
    name: 'Verbal Ability', 
    duration: 25 * 60, // 25 minutes
    totalQuestions: 25,
    type: 'foundation'
  },
  { 
    id: 'reasoning', 
    name: 'Reasoning Ability', 
    duration: 25 * 60, // 25 minutes
    totalQuestions: 20,
    type: 'foundation'
  },
  { 
    id: 'numerical', 
    name: 'Numerical/Quantitative Ability', 
    duration: 25 * 60, // 25 minutes
    totalQuestions: 20,
    type: 'foundation'
  },
  { 
    id: 'advanced_quant_reasoning', 
    name: 'Advanced Quantitative & Reasoning', 
    duration: 25 * 60, // 25 minutes
    totalQuestions: 15,
    type: 'advanced'
  },
  { 
    id: 'coding', 
    name: 'Advanced Coding', 
    duration: 90 * 60, // 90 minutes
    totalQuestions: 2,
    type: 'advanced'
  }
];

export const TOTAL_TIME = EXAM_SECTIONS.reduce((acc, section) => acc + section.duration, 0);
