
import { CoffeeBean, BrewLog } from '../types';

const STORAGE_KEYS = {
  COFFEES: 'barista_journal_coffees',
  BREW_LOGS: 'barista_journal_brew_logs',
};

export const storage = {
  saveCoffees: (coffees: CoffeeBean[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.COFFEES, JSON.stringify(coffees));
    } catch (error) {
      console.error('Error saving coffees to localStorage:', error);
    }
  },

  getCoffees: (): CoffeeBean[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COFFEES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading coffees from localStorage:', error);
      return null;
    }
  },

  saveBrewLogs: (logs: BrewLog[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.BREW_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving brew logs to localStorage:', error);
    }
  },

  getBrewLogs: (): BrewLog[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BREW_LOGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading brew logs from localStorage:', error);
      return null;
    }
  },
};
