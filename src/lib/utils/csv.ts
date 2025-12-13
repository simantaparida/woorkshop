/**
 * CSV Sanitization Utilities
 *
 * Protects against CSV injection attacks where malicious formulas
 * are embedded in CSV fields and executed by spreadsheet applications.
 *
 * Attack vectors:
 * - Formulas starting with =, +, -, @
 * - Tab character (\t)
 * - Carriage return (\r)
 *
 * References:
 * - https://owasp.org/www-community/attacks/CSV_Injection
 * - https://www.we45.com/blog/csv-injection-the-silent-killer
 */

/**
 * Sanitizes a CSV cell value to prevent formula injection
 *
 * @param value - The cell value to sanitize
 * @returns Sanitized value safe for CSV export
 *
 * @example
 * sanitizeCSVCell("=1+1")           // Returns "'=1+1"
 * sanitizeCSVCell("Normal text")    // Returns "Normal text"
 * sanitizeCSVCell("@SUM(A1:A10)")   // Returns "'@SUM(A1:A10)"
 */
export function sanitizeCSVCell(value: string | number | null | undefined): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  const strValue = String(value);

  // Empty strings are safe
  if (strValue.trim() === '') {
    return '';
  }

  // Check if value starts with dangerous characters
  const dangerousChars = /^[=+\-@\t\r]/;

  if (dangerousChars.test(strValue)) {
    // Prefix with single quote to neutralize formula
    // This tells Excel/Sheets to treat it as literal text
    return `'${escapeCSVValue(strValue)}`;
  }

  // For safe values, just escape normally
  return escapeCSVValue(strValue);
}

/**
 * Escapes special CSV characters (quotes, commas, newlines)
 *
 * @param value - The value to escape
 * @returns Escaped value
 */
function escapeCSVValue(value: string): string {
  // If value contains quotes, double them (CSV standard)
  let escaped = value.replace(/"/g, '""');

  // If value contains comma, quote, or newline, wrap in quotes
  if (/[",\n]/.test(escaped)) {
    escaped = `"${escaped}"`;
  }

  return escaped;
}

/**
 * Converts an array of objects to CSV format with sanitization
 *
 * @param data - Array of objects to convert
 * @param headers - Optional array of header names (defaults to object keys)
 * @returns CSV string
 *
 * @example
 * const data = [
 *   { name: "=malicious", score: 100 },
 *   { name: "safe", score: 90 }
 * ];
 * arrayToCSV(data) // Returns safe CSV with sanitized values
 */
export function arrayToCSV(
  data: Record<string, any>[],
  headers?: string[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const columnHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = columnHeaders
    .map(header => sanitizeCSVCell(header))
    .join(',');

  // Create data rows
  const dataRows = data.map(row =>
    columnHeaders
      .map(header => sanitizeCSVCell(row[header]))
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Validates that a CSV string doesn't contain dangerous patterns
 * Use this as additional validation before serving CSV downloads
 *
 * @param csv - CSV string to validate
 * @returns Object with validation result and any warnings
 */
export function validateCSVSafety(csv: string): {
  safe: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const lines = csv.split('\n');

  lines.forEach((line, index) => {
    // Check for unescaped dangerous characters at start of cells
    const cells = line.split(',');

    cells.forEach((cell, cellIndex) => {
      const trimmed = cell.trim().replace(/^"|"$/g, ''); // Remove wrapping quotes

      if (/^[=+\-@]/.test(trimmed) && !trimmed.startsWith("'")) {
        warnings.push(
          `Line ${index + 1}, Cell ${cellIndex + 1}: Potential formula injection (${trimmed.substring(0, 20)}...)`
        );
      }
    });
  });

  return {
    safe: warnings.length === 0,
    warnings
  };
}
