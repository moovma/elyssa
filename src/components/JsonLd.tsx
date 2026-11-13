/** Structured data for search engines (schema.org JSON-LD). Rendered on the server, invisible to visitors. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  // "<" is escaped so the JSON can never close the script tag
  const json = JSON.stringify(data).replace(/</g, '\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
