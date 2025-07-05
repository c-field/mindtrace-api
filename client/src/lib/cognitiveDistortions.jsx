export const cognitiveDistortions = [
  {
    id: "all-or-nothing",
    name: "All-or-Nothing Thinking",
    description: "Viewing situations in absolute, black-and-white terms (e.g., success or failure, good or bad).",
    example: "If I don't get a perfect score, I'm a complete failure."
  },
  {
    id: "overgeneralization", 
    name: "Overgeneralization",
    description: "Drawing broad conclusions from a single event or piece of evidence.",
    example: "I made one mistake, so I'm terrible at everything."
  },
  {
    id: "mental-filtering",
    name: "Mental Filtering", 
    description: "Focusing only on the negative aspects of a situation and ignoring the positives.",
    example: "Getting one criticism and forgetting all the compliments received."
  },
  {
    id: "disqualifying-positive",
    name: "Disqualifying the Positive",
    description: "Rejecting positive experiences or achievements as irrelevant or unearned.",
    example: "That compliment doesn't count because they were just being nice."
  },
  {
    id: "jumping-conclusions",
    name: "Jumping to Conclusions",
    description: "Making assumptions without evidence, including mind reading and fortune-telling.",
    example: "They didn't text back immediately, so they must be angry with me."
  },
  {
    id: "mind-reading",
    name: "Mind Reading",
    description: "Assuming others are thinking negatively about you without evidence.",
    example: "I know they think I'm incompetent, even though they haven't said anything."
  },
  {
    id: "fortune-telling",
    name: "Fortune-Telling",
    description: "Predicting a negative future as inevitable without considering other possibilities.",
    example: "I'll never find love because this relationship didn't work out."
  },
  {
    id: "magnification",
    name: "Magnification (Catastrophizing)",
    description: "Exaggerating the importance of problems or perceived flaws beyond their actual significance.",
    example: "Making a small mistake and thinking it will ruin my entire career."
  },
  {
    id: "minimization",
    name: "Minimization",
    description: "Downplaying the importance of positive qualities or accomplishments.",
    example: "Getting promoted was just luck, it doesn't mean I'm actually good at my job."
  },
  {
    id: "emotional-reasoning",
    name: "Emotional Reasoning",
    description: "Believing that negative emotions reflect objective reality rather than subjective experience.",
    example: "I feel like a failure, so I must be a failure."
  },
  {
    id: "should-statements",
    name: "Should Statements",
    description: "Using rigid rules about how you or others must behave, creating unrealistic expectations.",
    example: "I should always be perfect and never make mistakes."
  },
  {
    id: "labeling",
    name: "Labeling",
    description: "Assigning global, negative labels to yourself or others based on specific behaviors.",
    example: "I made a mistake, so I'm a failure as a person."
  },
  {
    id: "mislabeling",
    name: "Mislabeling",
    description: "Using emotionally loaded and inaccurate language to describe events or people.",
    example: "Calling a minor setback a 'complete disaster' or 'total catastrophe'."
  },
  {
    id: "personalization",
    name: "Personalization",
    description: "Blaming yourself for things outside your control or taking responsibility for others' actions.",
    example: "My friend is upset, so it must be something I did wrong."
  },
  {
    id: "blame",
    name: "Blame",
    description: "Holding others responsible for your emotions or circumstances without taking personal accountability.",
    example: "I'm unhappy because of what other people do to me."
  }
];

export const getCognitiveDistortionById = (id) => {
  return cognitiveDistortions.find(distortion => distortion.id === id);
};