'use server';

import { getUser } from './auth';
import { PostRepository } from '@/lib/repositories/post.repository';
import { revalidatePath } from 'next/cache';

export async function createPost(content: string, images?: string[]) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const post = await PostRepository.create({
    userId: user.id,
    content,
    images,
  });

  if (!post) {
    throw new Error('Failed to create post');
  }

  revalidatePath('/board');
  return post;
}

export async function likePost(postId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await PostRepository.likePost(postId, user.id);
  
  if (!success) {
    throw new Error('Failed to like post');
  }

  revalidatePath('/board');
}

export async function unlikePost(postId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await PostRepository.unlikePost(postId, user.id);
  
  if (!success) {
    throw new Error('Failed to unlike post');
  }

  revalidatePath('/board');
}

export async function deletePost(postId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await PostRepository.deletePost(postId, user.id);
  
  if (!success) {
    throw new Error('Failed to delete post');
  }

  revalidatePath('/board');
}

export async function savePost(postId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await PostRepository.savePost(postId, user.id);
  
  if (!success) {
    throw new Error('Failed to save post');
  }

  revalidatePath('/board');
}

export async function unsavePost(postId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await PostRepository.unsavePost(postId, user.id);
  
  if (!success) {
    throw new Error('Failed to unsave post');
  }

  revalidatePath('/board');
}

export async function addComment(postId: string, content: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await PostRepository.addComment({
    postId,
    userId: user.id,
    content,
  });
  
  if (!success) {
    throw new Error('Failed to add comment');
  }

  revalidatePath('/board');
}