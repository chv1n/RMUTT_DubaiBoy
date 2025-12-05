import { apiClient } from '../lib/api/core/client';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface IPostService {
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post>;
  createPost(post: Omit<Post, 'id'>): Promise<Post>;
}

class PostService implements IPostService {
  private readonly endpoint = '/posts';

  async getPosts(): Promise<Post[]> {
    return apiClient.get<Post[]>(this.endpoint);
  }

  async getPost(id: number): Promise<Post> {
    return apiClient.get<Post>(`${this.endpoint}/${id}`);
  }

  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    return apiClient.post<Post>(this.endpoint, post);
  }
}

export const postService = new PostService();
