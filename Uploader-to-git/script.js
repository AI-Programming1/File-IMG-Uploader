const WORKER_UPLOAD_URL = "https://cloudflare-subdomain-worker-url.workers.dev/upload"; // replace with your worker

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const files = document.getElementById("fileInput").files;
  const expiry = document.getElementById("expiry").value;
  const linksDiv = document.getElementById("links");
  linksDiv.innerHTML = "Uploading...";

  if (!files.length) {
    linksDiv.textContent = "Please select at least one file.";
    return;
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("expiry", expiry);

  try {
    const res = await fetch(WORKER_UPLOAD_URL, { method: "POST", body: formData });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    linksDiv.innerHTML = "<h3>Share Links</h3>";
    data.files.forEach(f => {
      const p = document.createElement("p");
      p.className = "link-item";
      const a = document.createElement("a");
      a.href = f.url;
      a.textContent = f.url;
      a.target = "_blank";
      p.appendChild(a);
      linksDiv.appendChild(p);
    });
  } catch (err) {
    linksDiv.textContent = "Error: " + err.message;
  }
});
