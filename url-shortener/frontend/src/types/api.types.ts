export interface URLData{
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  lastClickedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}