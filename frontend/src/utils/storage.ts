/**
 * SafeStorage - Усовершенствованный модуль для безопасной работы с localStorage
 * Предотвращает ошибки JSON.parse и другие проблемы с хранилищем
 */

export interface StorageOptions {
  /** Включить шифрование данных (будущая функциональность) */
  encrypt?: boolean;
  /** Включить сжатие для экономии места (будущая функциональность) */
  compress?: boolean;
  /** Время жизни в миллисекундах */
  ttl?: number;
}

interface StorageItem<T> {
  /** Сохраненные данные */
  data: T;
  /** Метка времени сохранения */
  timestamp: number;
  /** Время истечения (если указано) */
  expires?: number;
  /** Версия формата хранения */
  version: number;
}

const STORAGE_VERSION = 1;

/**
 * SafeStorage - Безопасный механизм работы с localStorage с защитой от ошибок
 */
class SafeStorage {
  /**
   * Проверяет доступность localStorage
   * @returns true если localStorage доступен
   */
  public isAvailable(): boolean {
    try {
      const testKey = '_test_storage_';
      localStorage.setItem(testKey, 'test');
      const result = localStorage.getItem(testKey) === 'test';
      localStorage.removeItem(testKey);
      return result;
    } catch (error) {
      console.warn('📦 SafeStorage: localStorage недоступен', error);
      return false;
    }
  }

  /**
   * Безопасно сохраняет данные в localStorage
   * @param key Ключ
   * @param data Данные (любого типа)
   * @param options Дополнительные опции
   * @returns true если операция выполнена успешно
   */
  public set<T>(key: string, data: T, options: StorageOptions = {}): boolean {
    if (!this.isAvailable()) return false;

    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        version: STORAGE_VERSION,
      };

      if (options.ttl) {
        item.expires = Date.now() + options.ttl;
      }

      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`📦 SafeStorage: Ошибка при сохранении ${key}`, error);
      return false;
    }
  }

  /**
   * Безопасно получает данные из localStorage
   * @param key Ключ
   * @param defaultValue Значение по умолчанию
   * @returns Данные или значение по умолчанию в случае ошибки
   */
  public get<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isAvailable()) return defaultValue;

    try {
      const rawItem = localStorage.getItem(key);
      if (!rawItem) return defaultValue;

      const item = JSON.parse(rawItem) as StorageItem<T>;

      // Проверка на просроченность
      if (item.expires && item.expires < Date.now()) {
        this.remove(key);
        return defaultValue;
      }

      return item.data;
    } catch (error) {
      console.warn(`📦 SafeStorage: Ошибка при получении ${key}`, error);
      
      // Автоматически удаляем поврежденные данные
      try {
        this.remove(key);
      } catch {}
      
      return defaultValue;
    }
  }

  /**
   * Безопасно удаляет данные из localStorage
   * @param key Ключ
   * @returns true если операция выполнена успешно
   */
  public remove(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`📦 SafeStorage: Ошибка при удалении ${key}`, error);
      return false;
    }
  }

  /**
   * Полностью очищает localStorage
   * @returns true если операция выполнена успешно
   */
  public clear(): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('📦 SafeStorage: Ошибка при очистке хранилища', error);
      return false;
    }
  }

  /**
   * Получает все ключи из localStorage
   * @returns Массив ключей или пустой массив в случае ошибки
   */
  public keys(): string[] {
    if (!this.isAvailable()) return [];

    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('📦 SafeStorage: Ошибка при получении ключей', error);
      return [];
    }
  }

  /**
   * Проверяет наличие ключа в localStorage
   * @param key Ключ
   * @returns true если ключ существует
   */
  public has(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`📦 SafeStorage: Ошибка при проверке наличия ${key}`, error);
      return false;
    }
  }
}

// Экспортируем singleton экземпляр
export const safeStorage = new SafeStorage();

// Re-экспортируем для удобного использования
export default safeStorage;
