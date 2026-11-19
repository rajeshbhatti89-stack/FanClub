// Cloudflare Pages Function: /api/cricheroes
// Proxies CricHeroes queries on Cloudflare Edge to prevent browser CORS blocks

interface Env {
  // Cloudflare environment bindings if needed
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const query = url.searchParams.get('q') || url.searchParams.get('id') || '';
  const profileUrl = url.searchParams.get('url') || '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (!query && !profileUrl) {
    return new Response(JSON.stringify({ error: 'Missing query or url parameter' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    let targetUrl = profileUrl;
    if (!targetUrl && query) {
      if (/^CH-\d+/i.test(query) || /^\d+$/.test(query)) {
        const id = query.replace(/^CH-/i, '');
        targetUrl = `https://cricheroes.com/player-profile/${id}`;
      } else {
        targetUrl = `https://cricheroes.com/search?q=${encodeURIComponent(query)}`;
      }
    }

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ found: false, status: res.status }), {
        headers: corsHeaders,
      });
    }

    const html = await res.text();

    // Extract OpenGraph / Meta information
    const getMeta = (prop: string) => {
      const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:)?${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
                    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:)?${prop}["']`, 'i'));
      return match ? match[1] : null;
    };

    const title = getMeta('title') || '';
    const description = getMeta('description') || '';
    const image = getMeta('image') || '';

    return new Response(
      JSON.stringify({
        found: true,
        url: targetUrl,
        title,
        description,
        image,
      }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, found: false }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
