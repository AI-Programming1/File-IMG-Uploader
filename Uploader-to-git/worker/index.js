export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle uploads
    if (url.pathname === "/upload" && request.method === "POST") {
      const formData = await request.formData();
      const expiry = formData.get("expiry");
      const files = formData.getAll("files");
      const results = [];

      for (const file of files) {
        const id = generateShortId();
        const arrayBuffer = await file.arrayBuffer();

        await env.FILES.put(id, arrayBuffer, {
          expirationTtl: expiry ? parseInt(expiry, 10) : undefined,
          metadata: { filename: file.name, contentType: file.type }
        });

        results.push({
          id,
          url: `${env.BASE_URL}/special.html?id=${id}`
        });
      }

      return new Response(JSON.stringify({ files: results }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Handle retrieval
    if (url.pathname.startsWith("/file/")) {
      const id = url.pathname.split("/").pop();
      const value = await env.FILES.getWithMetadata(id, { type: "arrayBuffer" });
      if (!value || !value.value) {
        return new Response("Not found", { status: 404 });
      }

      const headers = new Headers();
      headers.set("Content-Type", value.metadata?.contentType || "application/octet-stream");
      headers.set("Content-Disposition", `inline; filename="${value.metadata?.filename || id}"`);
      headers.set("Access-Control-Allow-Origin", "*");

      return new Response(value.value, { headers });
    }

    return new Response("Not found", { status: 404 });
  },
};

function generateShortId(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
