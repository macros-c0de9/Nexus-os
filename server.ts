import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Real-time YouTube Search API (extracts videoId, thumbnails, titles, channels, duration)
  app.get('/api/youtube/search', async (req, res) => {
    const query = ((req.query.q as string) || '').trim();
    if (!query) {
      return res.json({ query: '', results: [] });
    }

    try {
      const results: Array<{
        id: string;
        title: string;
        channel: string;
        duration: string;
        views: string;
        published: string;
        description: string;
        thumbnail: string;
        embedUrl: string;
      }> = [];

      const seenIds = new Set<string>();

      // 1. Direct YouTube HTML Scraping & ytInitialData extraction
      try {
        const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`; // Video filter
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const ytResponse = await fetch(ytSearchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (ytResponse.ok) {
          const html = await ytResponse.text();
          
          // Match ytInitialData script
          const jsonMatch =
            html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s) ||
            html.match(/window\["ytInitialData"\]\s*=\s*({.+?});/s);

          if (jsonMatch && jsonMatch[1]) {
            try {
              const ytData = JSON.parse(jsonMatch[1]);
              
              // Recursive function to locate all videoRenderer objects
              const findVideoRenderers = (obj: any, collected: any[] = []) => {
                if (!obj || typeof obj !== 'object') return collected;
                if (obj.videoRenderer && obj.videoRenderer.videoId) {
                  collected.push(obj.videoRenderer);
                }
                if (Array.isArray(obj)) {
                  for (const item of obj) {
                    findVideoRenderers(item, collected);
                  }
                } else {
                  for (const k of Object.keys(obj)) {
                    // Skip certain heavy metadata
                    if (k !== 'playerOverlays' && k !== 'trackingParams') {
                      findVideoRenderers(obj[k], collected);
                    }
                  }
                }
                return collected;
              };

              const videoRenderers = findVideoRenderers(ytData);

              for (const vr of videoRenderers) {
                const id = vr.videoId;
                if (id && !seenIds.has(id) && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
                  seenIds.add(id);

                  let title = 'YouTube Video';
                  if (vr.title?.runs && vr.title.runs.length > 0) {
                    title = vr.title.runs.map((r: any) => r.text).join('');
                  } else if (vr.title?.simpleText) {
                    title = vr.title.simpleText;
                  }

                  let channel = 'YouTube Creator';
                  if (vr.ownerText?.runs?.[0]?.text) {
                    channel = vr.ownerText.runs[0].text;
                  } else if (vr.shortBylineText?.runs?.[0]?.text) {
                    channel = vr.shortBylineText.runs[0].text;
                  }

                  let duration = 'HD';
                  if (vr.lengthText?.simpleText) {
                    duration = vr.lengthText.simpleText;
                  } else if (vr.lengthText?.runs?.[0]?.text) {
                    duration = vr.lengthText.runs[0].text;
                  } else if (vr.badges?.some((b: any) => b.metadataBadgeRenderer?.label === 'LIVE')) {
                    duration = 'LIVE';
                  }

                  let views = 'Popular';
                  if (vr.shortViewCountText?.simpleText) {
                    views = vr.shortViewCountText.simpleText;
                  } else if (vr.viewCountText?.simpleText) {
                    views = vr.viewCountText.simpleText;
                  }

                  let published = '';
                  if (vr.publishedTimeText?.simpleText) {
                    published = vr.publishedTimeText.simpleText;
                  }

                  let description = '';
                  if (vr.detailedMetadataSnippets?.[0]?.snippetText?.runs) {
                    description = vr.detailedMetadataSnippets[0].snippetText.runs.map((r: any) => r.text).join('');
                  } else if (vr.descriptionSnippet?.runs) {
                    description = vr.descriptionSnippet.runs.map((r: any) => r.text).join('');
                  }

                  const thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                  const embedUrl = `https://www.youtube.com/embed/${id}`;

                  results.push({
                    id,
                    title,
                    channel,
                    duration,
                    views,
                    published,
                    description,
                    thumbnail,
                    embedUrl,
                  });
                }
              }
            } catch (jsonErr) {
              console.warn('ytInitialData JSON parse warning:', jsonErr);
            }
          }

          // Fallback regex scan on HTML if json parse didn't get enough
          if (results.length < 5) {
            const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
            let m;
            while ((m = regex.exec(html)) !== null && results.length < 20) {
              const videoId = m[1];
              if (!seenIds.has(videoId)) {
                seenIds.add(videoId);
                results.push({
                  id: videoId,
                  title: `${query} Video (${videoId})`,
                  channel: 'YouTube Creator',
                  duration: 'HD',
                  views: 'YouTube Video',
                  published: 'Uploaded',
                  description: `Watch "${query}" on YouTube`,
                  thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                  embedUrl: `https://www.youtube.com/embed/${videoId}`,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('YouTube direct scrape warning:', err);
      }

      // 2. DuckDuckGo / Invidious fallback if scrape returned 0 items
      if (results.length === 0) {
        try {
          const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:youtube.com/watch')}`;
          const ddgRes = await fetch(ddgUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
          if (ddgRes.ok) {
            const ddgHtml = await ddgRes.text();
            const idRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g;
            let match;
            while ((match = idRegex.exec(ddgHtml)) !== null && results.length < 15) {
              const id = match[1];
              if (!seenIds.has(id)) {
                seenIds.add(id);
                results.push({
                  id,
                  title: `${query} - Video Result`,
                  channel: 'YouTube Channel',
                  duration: 'HD',
                  views: 'Verified',
                  published: 'YouTube',
                  description: `Search result for ${query}`,
                  thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
                  embedUrl: `https://www.youtube.com/embed/${id}`,
                });
              }
            }
          }
        } catch (ddgErr) {
          console.warn('DuckDuckGo YouTube fallback warning:', ddgErr);
        }
      }

      return res.json({
        query,
        count: results.length,
        results: results.slice(0, 30),
      });
    } catch (error: any) {
      console.error('YouTube search route error:', error);
      return res.status(500).json({
        query,
        count: 0,
        results: [],
        error: error.message || 'Failed to fetch YouTube search results',
      });
    }
  });

  // Real-time Web Search API for Google / Aura Search Engine
  app.get('/api/search', async (req, res) => {
    const query = ((req.query.q as string) || '').trim();
    if (!query) {
      return res.json({
        query: '',
        abstract: '',
        abstractSource: '',
        abstractUrl: '',
        image: '',
        results: [],
        related: [],
      });
    }

    try {
      const results: Array<{ title: string; url: string; snippet: string; domain: string }> = [];
      let abstract = '';
      let abstractSource = '';
      let abstractUrl = '';
      let image = '';
      const related: string[] = [];

      // 1. Check if it's a basic math calculation
      if (/^[0-9\s\+\-\*\/\^\(\)\.\%]+$/.test(query) && query.length < 50) {
        try {
          // Safe math evaluator
          const sanitized = query.replace(/[^-()\d/*+.]/g, '');
          // eslint-disable-next-line no-eval
          const mathResult = Function(`'use strict'; return (${sanitized})`)();
          if (typeof mathResult === 'number' && !isNaN(mathResult)) {
            abstract = `${query} = ${mathResult}`;
            abstractSource = 'Aura Calculator';
            results.push({
              title: `Calculation: ${query} = ${mathResult}`,
              url: 'https://www.google.com/search?q=' + encodeURIComponent(query),
              snippet: `Instant math result for expression: ${query} equals ${mathResult}.`,
              domain: 'calculator.google.com',
            });
          }
        } catch {}
      }

      // 2. Query DuckDuckGo Instant Answer API (Parallel with Wikipedia)
      const ddgPromise = fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=0`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuraOS/1.0' },
          signal: AbortSignal.timeout(3500),
        }
      )
        .then((r) => r.json())
        .catch(() => null);

      // 3. Query Wikipedia OpenSearch & Summary API
      const wikiSearchPromise = fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
          query
        )}&limit=6&namespace=0&format=json`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuraOS/1.0' },
          signal: AbortSignal.timeout(3500),
        }
      )
        .then((r) => r.json())
        .catch(() => null);

      const [ddgData, wikiData] = await Promise.all([ddgPromise, wikiSearchPromise]);

      // Process DuckDuckGo Data
      if (ddgData) {
        if (ddgData.AbstractText) {
          abstract = ddgData.AbstractText;
          abstractSource = ddgData.AbstractSource || 'DuckDuckGo';
          abstractUrl = ddgData.AbstractURL || '';
          if (ddgData.Image) {
            image = ddgData.Image.startsWith('http')
              ? ddgData.Image
              : `https://duckduckgo.com${ddgData.Image}`;
          }
        }

        // Process Related Topics / Search Results
        if (Array.isArray(ddgData.RelatedTopics)) {
          for (const item of ddgData.RelatedTopics) {
            if (item.Text && item.FirstURL) {
              const u = item.FirstURL;
              let domain = 'duckduckgo.com';
              try {
                domain = new URL(u).hostname.replace(/^www\./, '');
              } catch {}

              const parts = item.Text.split(' - ');
              const title = parts[0] || item.Text.slice(0, 60);
              const snippet = parts.length > 1 ? parts.slice(1).join(' - ') : item.Text;

              results.push({
                title,
                url: u,
                snippet,
                domain,
              });
            } else if (Array.isArray(item.Topics)) {
              for (const sub of item.Topics) {
                if (sub.Text && sub.FirstURL) {
                  let domain = 'web';
                  try {
                    domain = new URL(sub.FirstURL).hostname.replace(/^www\./, '');
                  } catch {}
                  results.push({
                    title: sub.Text.slice(0, 70),
                    url: sub.FirstURL,
                    snippet: sub.Text,
                    domain,
                  });
                }
              }
            }
          }
        }

        // Related queries
        if (Array.isArray(ddgData.Results)) {
          for (const resItem of ddgData.Results) {
            if (resItem.FirstURL && resItem.Text) {
              let domain = 'web';
              try {
                domain = new URL(resItem.FirstURL).hostname.replace(/^www\./, '');
              } catch {}
              results.unshift({
                title: resItem.Text,
                url: resItem.FirstURL,
                snippet: resItem.Text,
                domain,
              });
            }
          }
        }
      }

      // Process Wikipedia Data
      if (Array.isArray(wikiData) && wikiData.length >= 4) {
        const titles = wikiData[1] || [];
        const descriptions = wikiData[2] || [];
        const urls = wikiData[3] || [];

        for (let i = 0; i < titles.length; i++) {
          if (titles[i] && urls[i]) {
            const isFirst = i === 0;
            if (isFirst && !abstract && descriptions[i]) {
              abstract = descriptions[i];
              abstractSource = 'Wikipedia';
              abstractUrl = urls[i];
            }

            results.push({
              title: `${titles[i]} - Wikipedia`,
              url: urls[i],
              snippet: descriptions[i] || `Read comprehensive encyclopedia article about ${titles[i]} on Wikipedia.`,
              domain: 'en.wikipedia.org',
            });
            related.push(titles[i]);
          }
        }
      }

      // Add high-value web links if list is sparse
      if (results.length === 0) {
        results.push(
          {
            title: `${query} - Google Search`,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: `Explore all top search results, images, discussions, and updates for "${query}" on Google.`,
            domain: 'google.com',
          },
          {
            title: `${query} - Wikipedia Search`,
            url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
            snippet: `Search Wikipedia articles, history, and definitions for "${query}".`,
            domain: 'wikipedia.org',
          },
          {
            title: `${query} - GitHub Open Source Repositories`,
            url: `https://github.com/search?q=${encodeURIComponent(query)}`,
            snippet: `Find open source code, developer projects, and libraries for "${query}".`,
            domain: 'github.com',
          },
          {
            title: `${query} - Reddit Discussions & Communities`,
            url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
            snippet: `Discover real community discussions, opinions, and user reviews on Reddit.`,
            domain: 'reddit.com',
          },
          {
            title: `${query} - YouTube Videos`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            snippet: `Watch video guides, tutorials, reviews, and explanations about "${query}".`,
            domain: 'youtube.com',
          }
        );
      }

      // Fill in default related suggestions if empty
      if (related.length === 0) {
        related.push(
          `${query} tutorial`,
          `${query} official website`,
          `${query} online tool`,
          `${query} wiki`,
          `${query} documentation`
        );
      }

      return res.json({
        query,
        abstract,
        abstractSource,
        abstractUrl,
        image,
        results: results.slice(0, 15),
        related: related.slice(0, 8),
      });
    } catch (err: any) {
      // Fallback search response
      return res.json({
        query,
        abstract: '',
        abstractSource: '',
        abstractUrl: '',
        image: '',
        results: [
          {
            title: `${query} - Web Search`,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: `Search Google for ${query}`,
            domain: 'google.com',
          },
          {
            title: `${query} on Wikipedia`,
            url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
            snippet: `Search the free encyclopedia for ${query}`,
            domain: 'en.wikipedia.org',
          },
        ],
        related: [`${query} guide`, `${query} examples`],
      });
    }
  });

  // Open Source Node.js IFrame Proxy - Strips X-Frame-Options, CSP, and rewrites relative links & navigation
  app.get('/api/proxy', async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).send('Missing target URL parameter.');
    }

    try {
      let targetUrl = rawUrl.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const parsedUrl = new URL(targetUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      // Fetch the remote website with standard desktop browser signature
      const response = await fetch(parsedUrl.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'cross-site',
        },
        redirect: 'follow',
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      const contentType = response.headers.get('content-type') || 'text/html';

      // 1. Remove all blocking HTTP headers (X-Frame-Options, CSP, COOP, COEP)
      res.removeHeader('X-Frame-Options');
      res.removeHeader('x-frame-options');
      res.removeHeader('Frame-Options');
      res.removeHeader('frame-options');
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('content-security-policy');
      res.removeHeader('Content-Security-Policy-Report-Only');
      res.removeHeader('Cross-Origin-Opener-Policy');
      res.removeHeader('cross-origin-opener-policy');
      res.removeHeader('Cross-Origin-Embedder-Policy');
      res.removeHeader('cross-origin-embedder-policy');
      res.removeHeader('Cross-Origin-Resource-Policy');
      res.removeHeader('cross-origin-resource-policy');
      res.removeHeader('X-Content-Type-Options');

      // 2. Set permissive framing and CORS headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Expose-Headers', '*');

      if (contentType.includes('text/html')) {
        let html = await response.text();
        const finalUrl = response.url || parsedUrl.toString();

        // 3. Inject <base href="..."> and In-Frame Navigation & Sandbox Script
        const baseTag = `<base href="${finalUrl}">`;
        const cspMeta = `<meta http-equiv="Content-Security-Policy" content="frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;">`;
        const proxyClientScript = `
          <script>
            // AuraOS Open Source Node.js Proxy Bridge
            (function() {
              // Neutralize frame-busting scripts
              try {
                if (window.top !== window.self) {
                  window.top = window.self;
                }
              } catch (e) {}

              // Intercept in-page hyperlink clicks to route through proxy
              document.addEventListener('click', function(e) {
                var target = e.target;
                while (target && target.tagName !== 'A') {
                  target = target.parentElement;
                }
                if (target && target.tagName === 'A' && target.href) {
                  var href = target.getAttribute('href');
                  if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                    return;
                  }
                  e.preventDefault();
                  try {
                    var absoluteUrl = new URL(href, '${finalUrl}').toString();
                    window.location.href = '/api/proxy?url=' + encodeURIComponent(absoluteUrl);
                  } catch (err) {
                    window.location.href = '/api/proxy?url=' + encodeURIComponent(target.href);
                  }
                }
              }, true);

              // Intercept form submissions
              document.addEventListener('submit', function(e) {
                var form = e.target;
                if (form && form.action) {
                  try {
                    var actionUrl = new URL(form.action, '${finalUrl}').toString();
                    form.action = '/api/proxy?url=' + encodeURIComponent(actionUrl);
                  } catch (err) {}
                }
              }, true);
            })();
          </script>
        `;

        const injection = `\n  ${baseTag}\n  ${cspMeta}\n  ${proxyClientScript}\n`;

        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>${injection}`);
        } else if (html.includes('<HEAD>')) {
          html = html.replace('<HEAD>', `<HEAD>${injection}`);
        } else {
          html = `<head>${injection}</head>\n${html}`;
        }

        return res.send(html);
      } else {
        // Stream binary or media assets
        const buffer = await response.arrayBuffer();
        return res.send(Buffer.from(buffer));
      }
    } catch (_err: any) {
      // Return a clean fallback page with proxy gateway information
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AuraOS Proxy Gateway</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 1.25rem; padding: 2rem; max-width: 500px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    h2 { color: #60a5fa; margin-top: 0; margin-bottom: 0.75rem; font-size: 1.25rem; }
    p { color: #9ca3af; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; word-break: break-all; }
    .btn-group { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #2563eb; color: #ffffff; text-decoration: none; padding: 0.65rem 1.25rem; border-radius: 0.75rem; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <h2>AuraOS IFrame Proxy Gateway</h2>
    <p>Connecting to <strong>${req.query.url || 'Target Website'}</strong> via Open Source Node.js Proxy.</p>
    <div class="btn-group">
      <a class="btn" href="${req.query.url}" target="_blank" rel="noopener noreferrer">↗ Open Direct in New Tab</a>
      <a class="btn" style="background:#374151;" href="/api/proxy?url=${encodeURIComponent(String(req.query.url || ''))}">↻ Retry Proxy</a>
    </div>
  </div>
</body>
</html>`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
