export const cognitiveDistortions = [
  {
    id: "all-or-nothing",
    name: "All-or-Nothing Thinking",
    definition: "Seeing things in black and white categories. If your performance falls short of perfect, you see yourself as a total failure."
  },
  {
    id: "overgeneralization",
    name: "Overgeneralization",
    definition: "Seeing a single negative event as a never-ending pattern of defeat."
  },
  {
    id: "mental-filter",
    name: "Mental Filter",
    definition: "Picking out a single negative detail and dwelling on it exclusively so that your vision of all reality becomes darkened."
  },
  {
    id: "disqualifying-positive",
    name: "Disqualifying the Positive",
    definition: "Rejecting positive experiences by insisting they 'don't count' for some reason or other."
  },
  {
    id: "jumping-to-conclusions",
    name: "Jumping to Conclusions",
    definition: "Making a negative interpretation even though there are no definite facts that convincingly support your conclusion."
  },
  {
    id: "magnification",
    name: "Magnification (Catastrophizing)",
    definition: "Exaggerating the importance of things (such as your goof-up or someone else's achievement)."
  },
  {
    id: "emotional-reasoning",
    name: "Emotional Reasoning",
    definition: "Assuming that your negative emotions necessarily reflect the way things really are: 'I feel it, therefore it must be true.'"
  },
  {
    id: "should-statements",
    name: "Should Statements",
    definition: "Trying to motivate yourself with shoulds and shouldn'ts, as if you had to be whipped and punished before you could be expected to do anything."
  },
  {
    id: "labeling",
    name: "Labeling and Mislabeling",
    definition: "An extreme form of overgeneralization. Instead of describing your error, you attach a negative label to yourself."
  },
  {
    id: "personalization",
    name: "Personalization",
    definition: "Seeing yourself as the cause of some negative external event which in fact you were not primarily responsible for."
  }
];

export const getCognitiveDistortionById = (id) => {
  return cognitiveDistortions.find(distortion => distortion.id === id);
};