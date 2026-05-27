export default async function DemoPage({ params }: { params: { slug: string } }) {
  // El backend sirve el HTML directamente en /demo/:slug
  // Esta página es un pass-through para el router de Next.js
  return null;
}
