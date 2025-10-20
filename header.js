document.addEventListener("DOMContentLoaded", function() {
  const headerContainer = document.getElementById("header-placeholder");

  // Only fetch if it’s empty
  if (headerContainer && headerContainer.innerHTML.trim() === "") {
    fetch("header.html")
      .then(res => res.text())
      .then(data => {
        headerContainer.innerHTML = data;

        // Highlight current page link
        const links = headerContainer.querySelectorAll("a");
        links.forEach(link => {
          if (link.href === window.location.href) {
            link.classList.add("active");
          }
        });
      })
      .catch(err => console.error("Header load error:", err));
  }
});
let searching = false; // use let, not const

function search() {
  const searchEl = document.getElementById("search");

  if (!searching) {
    searchEl.style.transform = "translateX(100px) rotate(360deg)";
    searching = true;
  } else {
    searchEl.style.transform = "translateX(0) rotate(0deg)";
    searching = false;
  }
}

