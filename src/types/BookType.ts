
type BookType = {
  id: number;
  title: string;
  price: number;
  is_active: boolean;
  image?: string;
  authorIds: number[]; 
  publication_year?: number;
};

export { BookType };