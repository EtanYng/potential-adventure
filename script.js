

const posts = [
    "This is the first post. Click to read more!",
    "Here's the second post. It has some interesting content.",
    "Finally, this is the third post. Hope you enjoyed reading!"
];
const postTitles = [
    "What the",
    "Second Post",
    "Third Post"
];

// Check if we're on a post page and update immediately
const params = new URLSearchParams(window.location.search);
const postIndex = params.get('post');

if (postIndex !== null) {
    if (postIndex >= 0 && postIndex < posts.length){
        const index = parseInt(postIndex);
        updatePostPage(index);
    }
    else {
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