"use client";

import { usePosts } from "../../hooks/api/usePosts";

export default function TestApiPage() {
  const { posts, loading, error, refetch } = usePosts();

  if (loading) return <div className="p-4">Loading posts...</div>;
  
  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h1>Error</h1>
        <p>{error.message}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Client Test (JSONPlaceholder)</h1>
      <div className="grid gap-4">
        {posts.slice(0, 5).map((post) => (
          <div key={post.id} className="p-4 border rounded shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-semibold text-lg mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-sm text-gray-500">
        Showing 5 of {posts.length} posts
      </div>
    </div>
  );
}
