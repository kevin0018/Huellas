// postsSeeder.ts
import { PostCategory, PostStatus, PrismaClient } from '@prisma/client';

type SeedPost = {
  title: string;
  content: string;
  authorEmail: string;
  category: PostCategory;
  status: PostStatus;        // usamos PUBLISHED y ponemos published_at = now() sólo al crear
  expiresAt?: Date | null;   // por defecto null
};

export async function seedVolunteerPosts(prisma: PrismaClient) {
  // Posts que ya existen en tu BD (ids actuales no se fuerzan)
  const basePosts: SeedPost[] = [
    {
      title: 'Prueba desde Front',
      content: 'Contenido de prueba',
      authorEmail: 'test@test.com',
      category: 'PET_SITTING',
      status: 'PUBLISHED',
    },
    {
      title: 'Probando PostF',
      content: 'Testing',
      authorEmail: 'test@test.com',
      category: 'GENERAL',
      status: 'PUBLISHED',
    },
    {
      title: 'Paseo por Gracia',
      content:
        'Tengo disponibilidad para pasear a perros los Lunes, Miércoles y Viernes a las 8pm',
      authorEmail: 'test@test.com',
      category: 'GENERAL',
      status: 'PUBLISHED',
    },
    {
      title: 'Voluntario en Refugio',
      content:
        'Me ofrezco para ayudar en refugios de animales para cuidar de ellos',
      authorEmail: 'juan@email.com',
      category: 'GENERAL',
      status: 'PUBLISHED',
    },
    {
      title: 'Voluntario en Refugio 2',
      content: 'Me ofrezco para cualquier ayuda necesitada',
      authorEmail: 'juan@email.com',
      category: 'SHELTER_SUPPORT',
      status: 'PUBLISHED',
      expiresAt: new Date('2025-09-05T00:00:00.000Z'),
    },
  ];

  // 5 posts extra en otras categorías (más datos para el tablero)
  const extraPosts: SeedPost[] = [
    {
      title: 'Paseos en la Barceloneta',
      content:
        'Salidas de 45–60 minutos por la playa y el paseo marítimo. Perros sociables y con correa.',
      authorEmail: 'test@test.com',
      category: 'WALKING_EXERCISE',
      status: 'PUBLISHED',
    },
    {
      title: 'Transporte al veterinario (Gràcia → Clínic)',
      content:
        'Coche con transportín. Ida y vuelta, puedo esperar durante la consulta si es breve.',
      authorEmail: 'juan@email.com',
      category: 'VET_TRANSPORT',
      status: 'PUBLISHED',
    },
    {
      title: 'Adiestramiento básico para cachorro',
      content:
        'Sesiones cortas en positivo: sentado, quieto, venir al llamado y pasear sin tirar.',
      authorEmail: 'test@test.com',
      category: 'TRAINING_BEHAVIOR',
      status: 'PUBLISHED',
    },
    {
      title: 'Soporte médico post-operatorio fin de semana',
      content:
        'Control de medicación oral, limpieza de puntos (según indicación veterinaria) y vigilancia.',
      authorEmail: 'juan@email.com',
      category: 'MEDICAL_SUPPORT',
      status: 'PUBLISHED',
    },
    {
      title: 'Baño y cepillado suave a domicilio',
      content:
        'Higiene básica para perros pequeños/medianos. Uso champú neutro y toalla (sin máquina).',
      authorEmail: 'test@test.com',
      category: 'GROOMING_HYGIENE',
      status: 'PUBLISHED',
    },
  ];

  const posts = [...basePosts, ...extraPosts];
  const authorEmails = [...new Set(posts.map((post) => post.authorEmail))];
  const authors = await prisma.user.findMany({
    where: { email: { in: authorEmails } },
    select: { id: true, email: true },
  });
  const authorIds = new Map(authors.map((author) => [author.email, author.id]));

  const missingAuthors = authorEmails.filter((email) => !authorIds.has(email));
  if (missingAuthors.length > 0) {
    throw new Error(`Missing seed authors: ${missingAuthors.join(', ')}`);
  }

  const results = [];

  for (const p of posts) {
    const authorId = authorIds.get(p.authorEmail)!;

    // Idempotente por (title, author). No creamos duplicados.
    const existing = await prisma.volunteerPost.findFirst({
      where: { title: p.title, author_id: authorId },
      select: { id: true, published_at: true },
    });

    if (existing) {
      // Actualizamos campos de contenido/categoría/estado/expiración.
      // Respetamos published_at existente (no lo sobreescribimos).
      const updated = await prisma.volunteerPost.update({
        where: { id: existing.id },
        data: {
          content: p.content,
          category: p.category,
          status: p.status,
          expires_at: p.expiresAt ?? null,
        },
      });
      results.push(updated);
    } else {
      // Insert nuevo. published_at = now() si está PUBLISHED.
      const created = await prisma.volunteerPost.create({
        data: {
          title: p.title,
          content: p.content,
          category: p.category,
          status: p.status,
          published_at: p.status === 'PUBLISHED' ? new Date() : null,
          expires_at: p.expiresAt ?? null,
          author: { connect: { id: authorId } },
        },
      });
      results.push(created);
    }
  }

  return results;
}
