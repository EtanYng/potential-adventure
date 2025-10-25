import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Fetch all posts
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase GET error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json(data);
    }
    
    // POST - Create new post
    if (req.method === 'POST') {
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content required' });
      }
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          title: title.trim(), 
          content: content.trim(),
          upvotes: 0
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase POST error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json(data);
    }
    
    // PUT - Upvote post
    if (req.method === 'PUT') {
      const { postId, userId } = req.body;
      
      if (!postId || !userId) {
        return res.status(400).json({ error: 'postId and userId required' });
      }
      
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('user_votes')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();
      
      if (existingVote) {
        return res.status(400).json({ error: 'Already voted' });
      }
      
      // Record vote
      const { error: voteError } = await supabase
        .from('user_votes')
        .insert([{ 
          user_id: userId, 
          post_id: postId 
        }]);
      
      if (voteError) {
        console.error('Vote recording error:', voteError);
        return res.status(500).json({ error: voteError.message });
      }
      
      // Get current upvotes and increment
      const { data: currentPost } = await supabase
        .from('posts')
        .select('upvotes')
        .eq('id', postId)
        .single();
      
      const newUpvotes = (currentPost?.upvotes || 0) + 1;
      
      // Update upvotes count
      const { data, error } = await supabase
        .from('posts')
        .update({ upvotes: newUpvotes })
        .eq('id', postId)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase UPDATE error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json(data);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}