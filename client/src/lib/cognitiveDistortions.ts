export interface CognitiveDistortion {
  id: string;
  name: string;
  definition: string;
}

export const cognitiveDistortions: CognitiveDistortion[] = [
  {
    id: "all-or-nothing",
    name: "All-or-nothing thinking",
    definition: "Viewing situations in extremes, as either completely good or bad, without acknowledging the gray areas."
  },
  {
    id: "overgeneralization",
    name: "Overgeneralization",
    definition: "Drawing broad conclusions based on a single negative event, applying it to all situations."
  },
  {
    id: "mental-filtering",
    name: "Mental filtering",
    definition: "Focusing solely on the negative aspects of a situation while ignoring the positive ones."
  },
  {
    id: "discounting-positive",
    name: "Discounting the positive",
    definition: "Dismissing or downplaying positive experiences, as if they don't matter."
  },
  {
    id: "jumping-conclusions",
    name: "Jumping to conclusions",
    definition: "Making negative interpretations without sufficient evidence."
  },
  {
    id: "catastrophizing",
    name: "Catastrophizing",
    definition: "Anticipating the worst possible outcome in any situation."
  },
  {
    id: "emotional-reasoning",
    name: "Emotional reasoning",
    definition: "Assuming that emotional feelings reflect reality, even if there's no factual basis."
  },
  {
    id: "personalization",
    name: "Personalization",
    definition: "Taking responsibility for events or behaviors that are not under your control."
  },
  {
    id: "should-statements",
    name: "Should statements",
    definition: "Placing unrealistic demands or expectations on oneself or others using phrases like \"I should\" or \"I must\"."
  },
  {
    id: "magnification",
    name: "Magnification and Minimization",
    definition: "Exaggerating the importance of negative events or downplaying positive ones."
  },
  {
    id: "labeling",
    name: "Labeling",
    definition: "Attributing broad, negative labels to oneself based on specific actions or behaviors."
  },
  {
    id: "mind-reading",
    name: "Mind Reading",
    definition: "Believing you know what others are thinking, often negatively."
  }
];

export const getCognitiveDistortionById = (id: string): CognitiveDistortion | undefined => {
  return cognitiveDistortions.find(distortion => distortion.id === id);
};
