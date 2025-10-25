// Generate or get user ID (stored in localStorage for vote tracking)
function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 16) + Date.now();
    localStorage.setItem('userId', userId);
  }
  return userId;
}

let postsData = [];
const API_BASE = '/api';

// Check if we're using API or localStorage (fallback)
const USE_API = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Load posts from API or localStorage
async function loadPosts() {
  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/posts`);
      if (!response.ok) throw new Error('API not available');
      postsData = await response.json();
      return postsData;
    } catch (error) {
      console.log('API not available, using localStorage fallback');
      return loadPostsFromLocalStorage();
    }
  } else {
    return loadPostsFromLocalStorage();
  }
}

// Fallback to localStorage
function loadPostsFromLocalStorage() {
  const defaultPosts = [
    { id: 1, title: "The impact of Coal on the industrial revolution", content: "This is the first post. Click to read more!", upvotes: 1, created_at: new Date().toISOString() },
    { id: 2, title: "Second Post", content: "Here's the second post. It has some interesting content.", upvotes: 2, created_at: new Date().toISOString() },
    { id: 3, title: "Third Post", content: "Finally, this is the third post. Hope you enjoyed reading!", upvotes: 3, created_at: new Date().toISOString() },
    { id: 4, title: "Fourth Post", content: "Wait, I can just.... do this all day!", upvotes: 4, created_at: new Date().toISOString() },
    { id: 5, title: "Fifth Post", content: "Fifth post here with more content to explore.", upvotes: 5, created_at: new Date().toISOString() }
  ];
  
  const stored = localStorage.getItem('posts');
  postsData = stored ? JSON.parse(stored) : defaultPosts;
  return postsData;
}

function savePostsToLocalStorage() {
  localStorage.setItem('posts', JSON.stringify(postsData));
}

// Check if user has voted
function hasVoted(postId) {
  const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
  return votes[postId] === true;
}

function markVoted(postId) {
  const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
  votes[postId] = true;
  localStorage.setItem('userVotes', JSON.stringify(votes));
}

// Upvote a post
async function upvotePost(postId) {
  if (hasVoted(postId)) {
    return { success: false, message: 'Already voted' };
  }

  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postId,
          userId: getUserId()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        markVoted(postId);
        // Update local cache
        const post = postsData.find(p => p.id === postId);
        if (post) post.upvotes = data.upvotes;
        return { success: true, upvotes: data.upvotes };
      } else {
        const error = await response.json();
        return { success: false, message: error.error };
      }
    } catch (error) {
      console.log('API error, using localStorage');
      return upvotePostLocalStorage(postId);
    }
  } else {
    return upvotePostLocalStorage(postId);
  }
}

function upvotePostLocalStorage(postId) {
  const post = postsData.find(p => p.id === postId);
  if (post) {
    post.upvotes += 1;
    savePostsToLocalStorage();
    markVoted(postId);
    return { success: true, upvotes: post.upvotes };
  }
  return { success: false, message: 'Post not found' };
}

// Create new post
async function createNewPost(title, content) {
  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      
      if (response.ok) {
        const newPost = await response.json();
        postsData.unshift(newPost);
        return { success: true, post: newPost };
      }
    } catch (error) {
      console.log('API error, using localStorage');
      return createPostLocalStorage(title, content);
    }
  } else {
    return createPostLocalStorage(title, content);
  }
}

function createPostLocalStorage(title, content) {
  const newPost = {
    id: Date.now(),
    title,
    content,
    upvotes: 0,
    created_at: new Date().toISOString()
  };
  postsData.unshift(newPost);
  savePostsToLocalStorage();
  return { success: true, post: newPost };
}

// Render posts on index page
function renderPosts() {
  const gridContainer = document.getElementById("grids");
  if (!gridContainer) return;
  
  gridContainer.innerHTML = ''; // Clear existing
  
  postsData.forEach((post, index) => {
    const button = document.createElement("button");
    
    const titlePara = document.createElement("p");
    titlePara.textContent = post.title;
    titlePara.style.marginBottom = "8px";
    
    const voteCountElement = document.createElement("p");
    voteCountElement.textContent = post.upvotes;
    voteCountElement.className = "vote-count";
    voteCountElement.id = `vote-count-${post.id}`;
    voteCountElement.style.fontSize = "14px";
    voteCountElement.style.color = "#8b7355";
    
    button.appendChild(titlePara);
    button.appendChild(voteCountElement);
    
    const upVote = document.createElement("button");
    upVote.className = "mini-button";
    upVote.innerHTML = '<img src="assets/upArrow.png" alt="upvote">';
    upVote.dataset.postId = post.id;
    upVote.title = hasVoted(post.id) ? "Already voted" : "Upvote this post";
    
    if (hasVoted(post.id)) {
      upVote.style.background = "#d4c5b0";
      upVote.style.cursor = "not-allowed";
    }
    
    upVote.onclick = async function(event) {
      event.stopPropagation();
      const postId = parseInt(this.dataset.postId);
      
      const result = await upvotePost(postId);
      
      if (result.success) {
        voteCountElement.textContent = result.upvotes;
        this.style.background = "#d4c5b0";
        this.style.cursor = "not-allowed";
        this.title = "Already voted";
        
        // Animation
        this.style.transform = "scale(1.2)";
        setTimeout(() => {
          this.style.transform = "";
        }, 200);
      } else {
        // Already voted animation
        this.style.transform = "scale(0.9)";
        setTimeout(() => {
          this.style.transform = "";
        }, 200);
      }
    };
    
    button.className = "mbutton";
    button.dataset.postId = post.id;
    button.onclick = function() {
      const postId = parseInt(this.dataset.postId);
      window.location.href = `post.html?post=${postId}`;
    };
    
    button.appendChild(upVote);
    gridContainer.appendChild(button);
  });
}

// Handle post page
async function loadPostPage() {
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get('post'));
  
  await loadPosts();
  
  const post = postsData.find(p => p.id === postId);
  
  if (post) {
    document.title = post.title;
    
    const postTitleElement = document.getElementById('postTitle');
    const postContentElement = document.getElementById('fullPostContent');
    
    if (postTitleElement) {
      postTitleElement.textContent = post.title;
    }
    if (postContentElement) {
      postContentElement.textContent = post.content;
    }

    // Add upvote button to post page
    const buttonContainer = document.getElementById('postButtons');
    if (buttonContainer) {
      buttonContainer.innerHTML = '';
      buttonContainer.style.marginLeft = "25px";
      buttonContainer.style.marginTop = "20px";
      
      const voteDisplay = document.createElement('span');
      voteDisplay.textContent = `${post.upvotes} upvotes`;
      voteDisplay.style.marginRight = '15px';
      voteDisplay.style.fontSize = '18px';
      voteDisplay.style.fontWeight = '600';
      voteDisplay.id = 'post-vote-display';
      
      const upvoteBtn = document.createElement('button');
      upvoteBtn.className = 'mini-button';
      upvoteBtn.innerHTML = '<img src="assets/upArrow.png" alt="upvote">';
      upvoteBtn.dataset.postId = post.id;
      upvoteBtn.title = hasVoted(post.id) ? "Already voted" : "Upvote this post";
      
      if (hasVoted(post.id)) {
        upvoteBtn.style.background = "#d4c5b0";
        upvoteBtn.style.cursor = "not-allowed";
      }
      
      upvoteBtn.onclick = async function() {
        const postId = parseInt(this.dataset.postId);
        const result = await upvotePost(postId);
        
        if (result.success) {
          document.getElementById('post-vote-display').textContent = `${result.upvotes} upvotes`;
          this.style.background = "#d4c5b0";
          this.style.cursor = "not-allowed";
          this.title = "Already voted";
          
          this.style.transform = "scale(1.2)";
          setTimeout(() => {
            this.style.transform = "";
          }, 200);
        } else {
          this.style.transform = "scale(0.9)";
          setTimeout(() => {
            this.style.transform = "";
          }, 200);
        }
      };
      
      buttonContainer.appendChild(voteDisplay);
      buttonContainer.appendChild(upvoteBtn);
    }
  } else {
    document.title = "Post not found";
    const postTitleElement = document.getElementById('postTitle');
    const postContentElement = document.getElementById('fullPostContent');
    
    if (postTitleElement) {
      postTitleElement.textContent = "Oops!";
    }
    if (postContentElement) {
      postContentElement.textContent = "The post you were looking for could not be found.";
    }
  }
}

// Initialize page
window.onload = async function() {
  const isIndexPage = window.location.pathname.endsWith("index.html") || 
                       window.location.pathname === "/" ||
                       window.location.pathname.endsWith("/");
  
  const isPostPage = window.location.pathname.includes("post.html");
  
  if (isIndexPage) {
    await loadPosts();
    renderPosts();
  } else if (isPostPage) {
    await loadPostPage();
  }
};

// Modal functions
function openNewPostModal() {
  const modal = document.getElementById('postModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeNewPostModal() {
  const modal = document.getElementById('postModal');
  if (modal) {
    modal.style.display = 'none';
    // Clear form
    document.getElementById('postTitleInput').value = '';
    document.getElementById('postContentInput').value = '';
  }
}

// Handle new post form submission
async function handleNewPost(event) {
  event.preventDefault();
  
  const title = document.getElementById('postTitleInput').value.trim();
  const content = document.getElementById('postContentInput').value.trim();
  
  if (!title || !content) {
    alert('Please fill in both title and content');
    return;
  }
  
  const result = await createNewPost(title, content);
  
  if (result.success) {
    closeNewPostModal();
    window.location.reload();
  } else {
    alert('Error creating post. Please try again.');
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('postModal');
  if (event.target === modal) {
    closeNewPostModal();
  }
}

// Open post function
function openPost(index) {
  if (index !== "main") {
    window.location.href = `post.html?post=${index}`;
  } else {
    window.location.href = "index.html";
  }
}