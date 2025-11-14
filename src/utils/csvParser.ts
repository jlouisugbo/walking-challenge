import type { CSVEntry, CSVParseResult, HistoricalImport } from '../types';

/**
 * Parse CSV format: Name, Steps
 * Handles both comma and period as decimal separators
 * Example: "Nadia, 57.323" or "Nadia,57,323"
 */
export const parseCSV = (text: string): CSVParseResult => {
  const errors: string[] = [];
  const entries: CSVEntry[] = [];

  try {
    const lines = text
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return {
        success: false,
        entries: [],
        errors: ['No data to parse. Please paste CSV data.'],
      };
    }

    lines.forEach((line, index) => {
      // Split by comma
      const parts = line.split(',').map((p) => p.trim());

      if (parts.length < 2) {
        errors.push(`Line ${index + 1}: Invalid format. Expected "Name, Steps"`);
        return;
      }

      const name = parts[0];
      let stepsStr = parts.slice(1).join(''); // Join remaining parts in case there are commas in number

      // Convert period to comma for European format (e.g., 57.323 -> 57323)
      // Remove all periods and commas, then parse
      stepsStr = stepsStr.replace(/[.,]/g, '');

      const steps = parseInt(stepsStr, 10);

      if (!name || name.length === 0) {
        errors.push(`Line ${index + 1}: Invalid name`);
        return;
      }

      if (isNaN(steps) || steps < 0) {
        errors.push(`Line ${index + 1}: Invalid steps "${parts.slice(1).join(',')}" for ${name}`);
        return;
      }

      entries.push({ name, steps });
    });

    return {
      success: entries.length > 0,
      entries,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      entries: [],
      errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
};

/**
 * Parse historical CSV with date
 * Format: Date,Name1,Steps1,Name2,Steps2,...
 * Or: Date
 *     Name1,Steps1
 *     Name2,Steps2
 */
export const parseHistoricalCSV = (text: string): HistoricalImport[] => {
  const imports: HistoricalImport[] = [];
  const lines = text
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  let currentDate = '';
  const currentEntries: CSVEntry[] = [];

  lines.forEach((line) => {
    // Check if line is a date (YYYY-MM-DD or MM/DD/YYYY)
    const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/);

    if (dateMatch) {
      // Save previous date's entries
      if (currentDate && currentEntries.length > 0) {
        imports.push({
          date: currentDate,
          entries: [...currentEntries],
        });
        currentEntries.length = 0;
      }

      // Normalize date to YYYY-MM-DD
      let normalizedDate = dateMatch[1];
      if (normalizedDate.includes('/')) {
        const [month, day, year] = normalizedDate.split('/');
        normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      currentDate = normalizedDate;
    } else {
      // Parse as Name,Steps entry
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        let stepsStr = parts.slice(1).join('').replace(/[.,]/g, '');
        const steps = parseInt(stepsStr, 10);

        if (name && !isNaN(steps) && steps >= 0) {
          currentEntries.push({ name, steps });
        }
      }
    }
  });

  // Save last date's entries
  if (currentDate && currentEntries.length > 0) {
    imports.push({
      date: currentDate,
      entries: [...currentEntries],
    });
  }

  return imports;
};

/**
 * Generate sample CSV text for reference
 */
export const generateSampleCSV = (): string => {
  return `Nadia, 57449
Joel, 55709
Shreya, 50499
Anjali, 42883
Grace, 42716`;
};

/**
 * Generate sample historical CSV
 */
export const generateSampleHistoricalCSV = (): string => {
  return `2025-11-10
Nadia, 8234
Joel, 7892
Shreya, 7123

2025-11-11
Nadia, 15678
Joel, 14234
Shreya, 13892

2025-11-12
Nadia, 23456
Joel, 21678
Shreya, 20234`;
};
