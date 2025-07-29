import type { CognitiveDistortion } from '../types';

export const cognitiveDistortions: CognitiveDistortion[] = [
  {
    id: 'all-or-nothing',
    name: 'All-or-Nothing Thinking',
    description: 'Viewing situations in absolute terms, without recognizing middle ground or nuance.',
    example: 'If I make one mistake, I\'m a complete failure.',
  },
  {
    id: 'overgeneralization',
    name: 'Overgeneralization',
    description: 'Drawing broad conclusions from a single incident or piece of evidence.',
    example: 'I failed this test, so I\'ll never be good at anything.',
  },
  {
    id: 'mental-filter',
    name: 'Mental Filter',
    description: 'Focusing exclusively on negative details while ignoring positive aspects.',
    example: 'Despite receiving many compliments, I only focus on one criticism.',
  },
  {
    id: 'discounting-positive',
    name: 'Discounting the Positive',
    description: 'Dismissing positive experiences as unimportant or accidental.',
    example: 'They only said I did well to be nice, not because I actually did.',
  },
  {
    id: 'jumping-to-conclusions',
    name: 'Jumping to Conclusions',
    description: 'Making negative assumptions without sufficient evidence.',
    example: 'My friend didn\'t text back immediately, so they must be angry with me.',
  },
  {
    id: 'magnification',
    name: 'Magnification (Catastrophizing)',
    description: 'Exaggerating the importance or severity of negative events.',
    example: 'Making a mistake at work means I\'ll definitely get fired.',
  },
  {
    id: 'minimization',
    name: 'Minimization',
    description: 'Downplaying the significance of positive events or personal strengths.',
    example: 'Getting promoted was just luck, anyone could have done it.',
  },
  {
    id: 'emotional-reasoning',
    name: 'Emotional Reasoning',
    description: 'Believing something is true based solely on how you feel about it.',
    example: 'I feel guilty, so I must have done something wrong.',
  },
  {
    id: 'should-statements',
    name: 'Should Statements',
    description: 'Using rigid rules about how you or others "should" behave.',
    example: 'I should be perfect at everything I do.',
  },
  {
    id: 'labeling',
    name: 'Labeling',
    description: 'Assigning negative labels to yourself or others based on specific behaviors.',
    example: 'I made a mistake, so I\'m an idiot.',
  },
  {
    id: 'personalization',
    name: 'Personalization',
    description: 'Taking responsibility for events that are outside your control.',
    example: 'My team lost the game because I didn\'t play well enough.',
  },
  {
    id: 'fortune-telling',
    name: 'Fortune Telling',
    description: 'Predicting negative outcomes without reasonable evidence.',
    example: 'I know this presentation will go terribly.',
  },
  {
    id: 'mind-reading',
    name: 'Mind Reading',
    description: 'Assuming you know what others are thinking without checking.',
    example: 'I can tell they think I\'m boring.',
  },
  {
    id: 'control-fallacies',
    name: 'Control Fallacies',
    description: 'Believing you have too much or too little control over situations.',
    example: 'Everything that goes wrong is my fault (or nothing is ever my fault).',
  },
  {
    id: 'fairness-fallacy',
    name: 'Fairness Fallacy',
    description: 'Expecting life to always be fair and becoming upset when it isn\'t.',
    example: 'It\'s not fair that others seem to have it easier than me.',
  },
];

export const getCognitiveDistortionById = (id: string): CognitiveDistortion | undefined => {
  return cognitiveDistortions.find(distortion => distortion.id === id);
};

export const getCognitiveDistortionNames = (): string[] => {
  return cognitiveDistortions.map(distortion => distortion.name);
};