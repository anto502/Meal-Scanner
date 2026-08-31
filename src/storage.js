import AsyncStorage from '@react-native-async-storage/async-storage';

const K_API = '@mealscanner/apikey';
const K_MEALS = '@mealscanner/meals';
const K_GOAL = '@mealscanner/goal';
const K_USER = '@mealscanner/user';
const K_ONBOARDED = '@mealscanner/onboarded';
const K_PROFILE = '@mealscanner/profile';

export async function getApiKey() {
  return (await AsyncStorage.getItem(K_API)) || '';
}
export const saveApiKey = (key) => AsyncStorage.setItem(K_API, key.trim());

export async function getGoal() {
  const n = parseInt(await AsyncStorage.getItem(K_GOAL), 10);
  return Number.isFinite(n) && n > 0 ? n : 2000;
}
export const saveGoal = (calories) => AsyncStorage.setItem(K_GOAL, String(calories));

export async function getMeals() {
  try { return JSON.parse((await AsyncStorage.getItem(K_MEALS)) || '[]'); }
  catch (e) { return []; }
}
export async function addMeal(meal) {
  const meals = await getMeals();
  meals.unshift({ ...meal, id: String(Date.now()) });
  await AsyncStorage.setItem(K_MEALS, JSON.stringify(meals));
  return meals;
}
export async function deleteMeal(id) {
  const meals = (await getMeals()).filter((m) => m.id !== id);
  await AsyncStorage.setItem(K_MEALS, JSON.stringify(meals));
  return meals;
}

export async function getUser() {
  try { return JSON.parse((await AsyncStorage.getItem(K_USER)) || 'null'); }
  catch (e) { return null; }
}
export const saveUser = (user) => AsyncStorage.setItem(K_USER, JSON.stringify(user));
export const clearUser = () => AsyncStorage.removeItem(K_USER);

export const getOnboarded = async () => (await AsyncStorage.getItem(K_ONBOARDED)) === 'yes';
export const setOnboarded = (v) => AsyncStorage.setItem(K_ONBOARDED, v ? 'yes' : 'no');

export async function getProfile() {
  try { return JSON.parse((await AsyncStorage.getItem(K_PROFILE)) || 'null'); }
  catch (e) { return null; }
}
export const saveProfile = (p) => AsyncStorage.setItem(K_PROFILE, JSON.stringify(p));
