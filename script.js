

const posts = [
    "This is the first post. Click to read more!",
    "Here's the second post. It has some interesting content.",
    "Finally, this is the third post. Hope you enjoyed reading!",
    "wait",
    "i can just.... do this all"
];
const postTitles = [
    "The impact of Coal on the industrial revolution",
    "Second Post",
    "Third Post"
];


// Check if we're on a post page and update immediately
const params = new URLSearchParams(window.location.search);
const postIndex = params.get('post');

window.onload = function() {
  // Check if we’re on index.html
  const isIndexPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

  if (!isIndexPage) return; // stop if not index.html

  const gridContainer = document.getElementById("grids");
  if (!gridContainer) return; // safety check

  for (let i = 0; i < posts.length; i++) {
    const button = document.createElement("button");
    button.innerHTML = `<p>${postTitles[i]}</p>`;
    button.className = "mbutton"
    button.onclick = function(){
        openPost(i);
    }
    gridContainer.appendChild(button);
  }
};

if (postIndex !== null) {
    if (postIndex >= 0 && postIndex < posts.length){
        const index = parseInt(postIndex);
        updatePostPage(index);
    
    } else {
        updatePostPage("error");
    }
}
        




function updatePostPage(index) {  
    if (index != "error") {
        
  
        // Update the title tag
        document.title = postTitles[index];
        
        // Update the content on the page (if elements exist)
        const postTitleElement = document.getElementById('postTitle');
        const postContentElement = document.getElementById('fullPostContent');
        
        if (postTitleElement) {
            postTitleElement.textContent = postTitles[index];
        }
        if (postContentElement) {
            postContentElement.textContent = posts[index];
        }
    }
    else {
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

// Open post function - just redirects to post.html
function openPost(index) {
    if (index != "main"){
        window.location.href = `post.html?post=${index}`;
    }
    else{
        window.location.href = "index.html";
    }
}