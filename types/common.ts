interface User {
  id: number;
}

interface Note {
  id: number;
  user_id: number;
  title: string;
  text: string;
  created_at: string;
  is_public: number;
  username: string;
}
