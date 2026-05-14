export const SELECTED_DISHES_KEY = "san-zhuo-cai:home-selected-dishes:v2";
export const VISIBLE_DISHES_KEY = "san-zhuo-cai:home-visible-dishes:v2";
export const VISIBLE_DISHES_DATE_KEY = "san-zhuo-cai:home-visible-dishes-date:v2";
export const SAVED_DISHES_KEY = "san-zhuo-cai:home-saved-dishes";
export const LAST_FORM_KEY = "san-zhuo-cai:last-form";
export const LAST_CHOICE_KEY = "san-zhuo-cai:last-choice";
export const USER_ID_KEY = "san-zhuo-cai:home-user-id";

export type LastChoice = {
  title: string;
  type: string;
  planIndex: number;
  resultUrl: string;
  selectedDishes: string[];
  savedAt: string;
};
