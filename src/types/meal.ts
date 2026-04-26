export type MealType = "lunch" | "dinner" | "lateNight";

export const mealLabels: Record<MealType, string> = {
  lunch: "점심",
  dinner: "저녁",
  lateNight: "야식"
};
