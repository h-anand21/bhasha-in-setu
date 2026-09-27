export interface OnboardingSlideItem {
  id: string;
  image: any;
  title: string;
  description: string;
  button: string;
  buttonColor: string;
}

export const onboardingData: OnboardingSlideItem[] = [
  {
    id: "1",
    image: require("../../assets/onboarding/onboarding_1.png"),
    title: "A Stronger Classroom\nfor Every Child",
    description: "Simple tools to bridge Hindi/English\nwith tribal languages in Jharkhand.",
    button: "Next →",
    buttonColor: "#FF5A00",
  },
  {
    id: "2",
    image: require("../../assets/onboarding/onboarding_2.png"),
    title: "Translate Instantly\nin the Classroom",
    description: "Speak, type or scan Hindi text and get\nclear translations with native audio.",
    button: "Next →",
    buttonColor: "#FF5A00",
  },
  {
    id: "3",
    image: require("../../assets/onboarding/onboarding_3.png"),
    title: "Learn Anywhere\nEven Offline",
    description: "Download lessons, worksheets and\naudio to teach anytime, even without internet.",
    button: "Get Started →",
    buttonColor: "#005B49",
  },
];
