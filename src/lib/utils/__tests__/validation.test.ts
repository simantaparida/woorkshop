import { describe, it, expect } from 'vitest';
import {
  validateSessionName,
  validatePlayerName,
  validateFeatureTitle,
  validateEffortImpact,
  validateFeatures,
  validateVotes,
  sanitizeString,
} from '../validation';

describe('validateSessionName', () => {
  it('should return null for valid session names', () => {
    expect(validateSessionName('My Session')).toBeNull();
    expect(validateSessionName('Product Planning 2025')).toBeNull();
    expect(validateSessionName('A'.repeat(50))).toBeNull();
  });

  it('should reject empty or whitespace-only names', () => {
    expect(validateSessionName('')).toBe('Session name is required');
    expect(validateSessionName('   ')).toBe('Session name is required');
    expect(validateSessionName('\t\n')).toBe('Session name is required');
  });

  it('should reject names shorter than 3 characters', () => {
    expect(validateSessionName('AB')).toBe('Session name must be at least 3 characters');
    expect(validateSessionName('A ')).toBe('Session name must be at least 3 characters');
  });

  it('should reject names longer than 100 characters', () => {
    const longName = 'A'.repeat(101);
    expect(validateSessionName(longName)).toBe('Session name must be less than 100 characters');
  });

  it('should handle names with leading/trailing whitespace', () => {
    expect(validateSessionName('  Valid Name  ')).toBeNull();
    expect(validateSessionName(' AB ')).toBe('Session name must be at least 3 characters');
  });
});

describe('validatePlayerName', () => {
  it('should return null for valid player names', () => {
    expect(validatePlayerName('John')).toBeNull();
    expect(validatePlayerName('Alice Smith')).toBeNull();
    expect(validatePlayerName('AB')).toBeNull(); // minimum 2 chars
  });

  it('should reject empty or whitespace-only names', () => {
    expect(validatePlayerName('')).toBe('Name is required');
    expect(validatePlayerName('   ')).toBe('Name is required');
  });

  it('should reject names shorter than 2 characters', () => {
    expect(validatePlayerName('A')).toBe('Name must be at least 2 characters');
    expect(validatePlayerName(' ')).toBe('Name is required');
  });

  it('should reject names longer than 50 characters', () => {
    const longName = 'A'.repeat(51);
    expect(validatePlayerName(longName)).toBe('Name must be less than 50 characters');
  });

  it('should handle names at boundary (50 characters)', () => {
    const exactName = 'A'.repeat(50);
    expect(validatePlayerName(exactName)).toBeNull();
  });
});

describe('validateFeatureTitle', () => {
  it('should return null for valid feature titles', () => {
    expect(validateFeatureTitle('Feature A')).toBeNull();
    expect(validateFeatureTitle('Dark mode support')).toBeNull();
    expect(validateFeatureTitle('A'.repeat(100))).toBeNull();
  });

  it('should reject empty or whitespace-only titles', () => {
    expect(validateFeatureTitle('')).toBe('Feature title is required');
    expect(validateFeatureTitle('   ')).toBe('Feature title is required');
  });

  it('should reject titles shorter than 3 characters', () => {
    expect(validateFeatureTitle('AB')).toBe('Feature title must be at least 3 characters');
  });

  it('should reject titles longer than 200 characters', () => {
    const longTitle = 'A'.repeat(201);
    expect(validateFeatureTitle(longTitle)).toBe('Feature title must be less than 200 characters');
  });

  it('should handle titles at boundary (200 characters)', () => {
    const exactTitle = 'A'.repeat(200);
    expect(validateFeatureTitle(exactTitle)).toBeNull();
  });
});

describe('validateEffortImpact', () => {
  it('should return null for valid effort/impact values', () => {
    expect(validateEffortImpact(0)).toBeNull();
    expect(validateEffortImpact(5)).toBeNull();
    expect(validateEffortImpact(10)).toBeNull();
  });

  it('should return null for null or undefined (optional field)', () => {
    expect(validateEffortImpact(null)).toBeNull();
    expect(validateEffortImpact(undefined as any)).toBeNull();
  });

  it('should reject values below 0', () => {
    expect(validateEffortImpact(-1)).toBe('Value must be between 0 and 10');
    expect(validateEffortImpact(-10)).toBe('Value must be between 0 and 10');
  });

  it('should reject values above 10', () => {
    expect(validateEffortImpact(11)).toBe('Value must be between 0 and 10');
    expect(validateEffortImpact(100)).toBe('Value must be between 0 and 10');
  });

  it('should accept decimal values within range', () => {
    expect(validateEffortImpact(5.5)).toBeNull();
    expect(validateEffortImpact(9.9)).toBeNull();
  });
});

describe('validateFeatures', () => {
  it('should return null for valid feature arrays', () => {
    expect(validateFeatures([{ title: 'Feature 1' }])).toBeNull();
    expect(validateFeatures([
      { title: 'Feature 1' },
      { title: 'Feature 2' },
      { title: 'Feature 3' },
    ])).toBeNull();
  });

  it('should reject empty feature arrays', () => {
    expect(validateFeatures([])).toBe('At least one feature is required');
  });

  it('should reject feature arrays exceeding MAX_FEATURES (10)', () => {
    const features = Array.from({ length: 11 }, (_, i) => ({ title: `Feature ${i + 1}` }));
    expect(validateFeatures(features)).toBe('Maximum 10 features allowed');
  });

  it('should accept exactly MAX_FEATURES (10) features', () => {
    const features = Array.from({ length: 10 }, (_, i) => ({ title: `Feature ${i + 1}` }));
    expect(validateFeatures(features)).toBeNull();
  });
});

describe('validateVotes', () => {
  it('should return null for valid vote arrays', () => {
    expect(validateVotes([
      { featureId: 'f1', points: 50 },
      { featureId: 'f2', points: 50 },
    ])).toBeNull();

    expect(validateVotes([
      { featureId: 'f1', points: 100 },
    ])).toBeNull();
  });

  it('should accept total points exactly at TOTAL_POINTS (100)', () => {
    expect(validateVotes([
      { featureId: 'f1', points: 30 },
      { featureId: 'f2', points: 40 },
      { featureId: 'f3', points: 30 },
    ])).toBeNull();
  });

  it('should reject votes exceeding TOTAL_POINTS (100)', () => {
    expect(validateVotes([
      { featureId: 'f1', points: 60 },
      { featureId: 'f2', points: 50 },
    ])).toBe('Total points cannot exceed 100');
  });

  it('should reject negative points', () => {
    expect(validateVotes([
      { featureId: 'f1', points: -10 },
    ])).toBe('Points cannot be negative');

    expect(validateVotes([
      { featureId: 'f1', points: 50 },
      { featureId: 'f2', points: -5 },
    ])).toBe('Points cannot be negative');
  });

  it('should reject individual feature points exceeding TOTAL_POINTS', () => {
    // Note: This also triggers the total points check, but the individual check happens in the loop
    // Since 101 > 100, the total check fires first
    expect(validateVotes([
      { featureId: 'f1', points: 101 },
    ])).toBe('Total points cannot exceed 100');

    // But the individual check would catch it in the loop if total was within bounds
    // (though that's not possible with our current validation order)
  });

  it('should accept empty vote array', () => {
    expect(validateVotes([])).toBeNull();
  });

  it('should accept votes with 0 points', () => {
    expect(validateVotes([
      { featureId: 'f1', points: 0 },
      { featureId: 'f2', points: 100 },
    ])).toBeNull();
  });

  it('should validate complex voting scenarios', () => {
    // Multiple features with varying points
    expect(validateVotes([
      { featureId: 'f1', points: 10 },
      { featureId: 'f2', points: 20 },
      { featureId: 'f3', points: 30 },
      { featureId: 'f4', points: 40 },
    ])).toBeNull();

    // Exactly at limit
    expect(validateVotes([
      { featureId: 'f1', points: 25 },
      { featureId: 'f2', points: 25 },
      { featureId: 'f3', points: 25 },
      { featureId: 'f4', points: 25 },
    ])).toBeNull();
  });
});

describe('sanitizeString', () => {
  it('should trim whitespace from both ends', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('\t\nworld\n\t')).toBe('world');
  });

  it('should collapse multiple spaces into single space', () => {
    expect(sanitizeString('hello    world')).toBe('hello world');
    expect(sanitizeString('a  b  c')).toBe('a b c');
  });

  it('should handle combined trimming and collapsing', () => {
    expect(sanitizeString('  hello    world  ')).toBe('hello world');
    expect(sanitizeString('\t multiple   \n  spaces \t')).toBe('multiple spaces');
  });

  it('should handle strings with no extra whitespace', () => {
    expect(sanitizeString('hello world')).toBe('hello world');
    expect(sanitizeString('test')).toBe('test');
  });

  it('should handle empty strings and whitespace-only strings', () => {
    expect(sanitizeString('')).toBe('');
    expect(sanitizeString('   ')).toBe('');
    expect(sanitizeString('\t\n')).toBe('');
  });

  it('should handle newlines and tabs', () => {
    expect(sanitizeString('hello\n\nworld')).toBe('hello world');
    expect(sanitizeString('hello\tworld')).toBe('hello world');
  });
});
