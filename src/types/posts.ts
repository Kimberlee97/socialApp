export interface Post {
  id: number;
  title: string;
  author: string;
  description: string | null;
  image: string | null; 
  created_at: string;
}