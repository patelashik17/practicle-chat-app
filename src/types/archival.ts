export interface ArchivalRunResult {
  id: string;
  runDate: Date;
  roomsArchived: string[];
  createdAt: Date;
  skipped: boolean;
}

export interface ArchivalHistoryItem {
  id: string;
  runDate: Date;
  roomsArchived: string[];
  roomsArchivedCount: number;
  createdAt: Date;
}
