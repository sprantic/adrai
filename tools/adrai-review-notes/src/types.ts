/**
 * adrAI Review Notes - Type Definitions
 *
 * Core data structures for the review annotation system.
 */

/**
 * Type of review note - ordered by urgency (low to high)
 */
export type NoteType =
  | 'bookmark'      // Come back to this later (lowest urgency)
  | 'uncertainty'   // Not sure yet, need more context
  | 'question'      // Need answer/clarification
  | 'concern'       // Potential issue to investigate
  | 'pre-debate';   // Might warrant formal DEB-NNNN (highest urgency)

/**
 * Note types in urgency order (low to high) - use for UI ordering
 */
export const NOTE_TYPES_ORDERED: NoteType[] = [
  'bookmark',
  'uncertainty',
  'question',
  'concern',
  'pre-debate'
];

/**
 * Status of a review note through its lifecycle
 */
export type NoteStatus =
  | 'open'          // Newly created, needs attention
  | 'investigating' // Being researched/explored
  | 'promote'       // Marked for debate promotion
  | 'resolved';     // Closed, no longer active

/**
 * A specific location in a file that a note references
 */
export interface NoteLocation {
  /** Absolute or workspace-relative file path */
  file: string;
  /** 1-indexed line number */
  line: number;
  /** Optional section name for semantic reference */
  section?: string;
  /** Preview of the text at this location */
  preview?: string;
}

/**
 * A review note with optional multi-location references
 */
export interface ReviewNote {
  /** Unique identifier (UUID v4) */
  id: string;
  /** The note content/question */
  content: string;
  /** Type classification */
  type: NoteType;
  /** Current status */
  status: NoteStatus;
  /** ISO 8601 creation timestamp */
  created: string;
  /** ISO 8601 last update timestamp */
  updated: string;
  /** One or more file locations */
  locations: NoteLocation[];
  /** Optional tags for filtering */
  tags?: string[];
  /** DEB-NNNN identifier if promoted to debate */
  promoted_to?: string;
  /** Git branch when note was created (null/undefined = visible in all branches) */
  branch?: string;
}

/**
 * Root schema for the review notes YAML file
 */
export interface ReviewNotesStorage {
  /** Schema version for migration support */
  version: string;
  /** Array of all review notes */
  notes: ReviewNote[];
}

/**
 * Configuration options from VS Code settings
 */
export interface AdtsConfiguration {
  /** Path to review notes YAML file */
  storageLocation: string;
  /** Path to debate templates directory */
  debateTemplateDir: string;
  /** Path to debates directory */
  debatesDir: string;
  /** Grouping mode for the panel */
  groupBy: 'status' | 'type' | 'file';
}

/**
 * Icons for each note type (VS Code Codicons)
 */
export const NOTE_TYPE_ICONS: Record<NoteType, string> = {
  'bookmark': 'bookmark',
  'uncertainty': 'question',
  'question': 'search',
  'concern': 'warning',
  'pre-debate': 'flame'
};

/**
 * Display labels for note types
 */
export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  'bookmark': 'Bookmark',
  'uncertainty': 'Uncertainty',
  'question': 'Question',
  'concern': 'Concern',
  'pre-debate': 'Pre-debate'
};

/**
 * Icons for each status
 */
export const STATUS_ICONS: Record<NoteStatus, string> = {
  'open': 'circle-outline',
  'investigating': 'sync',
  'promote': 'rocket',
  'resolved': 'check'
};

/**
 * Display labels for statuses
 */
export const STATUS_LABELS: Record<NoteStatus, string> = {
  'open': 'Open',
  'investigating': 'Investigating',
  'promote': 'Promote',
  'resolved': 'Resolved'
};

/**
 * Default empty storage structure
 */
export const DEFAULT_STORAGE: ReviewNotesStorage = {
  version: '1.1',
  notes: []
};

/**
 * Current schema version
 */
export const CURRENT_SCHEMA_VERSION = '1.1';
