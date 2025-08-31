// postsSeeder.ts
import { PrismaClient } from '@prisma/client';

type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'EXPIRED';
type PostCategory =
  | 'GENERAL'
  | 'WALKING_EXERCISE'
  | 'PET_SITTING'
  | 'VET_TRANSPORT'
  | 'FOSTER_CARE'
  | 'TRAINING_BEHAVIOR'
  | 'SHELTER_SUPPORT'
  | 'GROOMING_HYGIENE'
  | 'MEDICAL_SUPPORT'
  | 'ADOPTION_REHOMING'
  | 'LOST_AND_FOUND';

type SeedPost = {
  title: string;
  content: string;
  authorId: number;          // FK exacta (no cambiamos relaciones)
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
      authorId: 6, // Fernanda
      category: 'PET_SITTING',
      status: 'PUBLISHED',
    },
    {
      title: 'Probando PostF',
      content: 'Testing',
      authorId: 6, // Fernanda
      category: 'GENERAL',
      status: 'PUBLISHED',
    },
    {
      title: 'Paseo por Gracia',
      content:
        'Tengo disponibilidad para pasear a perros los Lunes, Miércoles y Viernes a las 8pm',
      authorId: 6, // Fernanda
      category: 'GENERAL',
      status: 'PUBLISHED',
    },
    {
      title: 'Voluntario en Refugio',
      content:
        'Me ofrezco para ayudar en refugios de animales para cuidar de ellos',
      authorId: 2, // Juan
      category: 'GENERAL',
      status: 'PUBLISHED',
    },
    {
      title: 'Voluntario en Refugio 2',
      content: 'Me ofrezco para cualquier ayuda necesitada',
      authorId: 2, // Juan
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
      authorId: 6, // Fernanda
      category: 'WALKING_EXERCISE',
      status: 'PUBLISHED',
    },
    {
      title: 'Transporte al veterinario (Gràcia → Clínic)',
      content:
        'Coche con transportín. Ida y vuelta, puedo esperar durante la consulta si es breve.',
      authorId: 2, // Juan
      category: 'VET_TRANSPORT',
      status: 'PUBLISHED',
    },
    {
      title: 'Adiestramiento básico para cachorro',
      content:
        'Sesiones cortas en positivo: sentado, quieto, venir al llamado y pasear sin tirar.',
      authorId: 6, // Fernanda
      category: 'TRAINING_BEHAVIOR',
      status: 'PUBLISHED',
    },
    {
      title: 'Soporte médico post-operatorio fin de semana',
      content:
        'Control de medicación oral, limpieza de puntos (según indicación veterinaria) y vigilancia.',
      authorId: 2, // Juan
      category: 'MEDICAL_SUPPORT',
      status: 'PUBLISHED',
    },
    {
      title: 'Baño y cepillado suave a domicilio',
      content:
        'Higiene básica para perros pequeños/medianos. Uso champú neutro y toalla (sin máquina).',
      authorId: 6, // Fernanda
      category: 'GROOMING_HYGIENE',
      status: 'PUBLISHED',
    },
  ];

  const posts = [...basePosts, ...extraPosts];

  const results = [];

  for (const p of posts) {
    // Idempotente por (title, authorId). No creamos duplicados.
    const existing = await prisma.volunteerPost.findFirst({
      where: { title: p.title, author_id: p.authorId },
      select: { id: true, published_at: true },
    });

    if (existing) {
      // Actualizamos campos de contenido/categoría/estado/expiración.
      // Respetamos published_at existente (no lo sobreescribimos).
      const updated = await prisma.volunteerPost.update({
        where: { id: existing.id },
        data: {
          content: p.content,
          category: p.category as any,
          status: p.status as any,
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
          category: p.category as any,
          status: p.status as any,
          published_at: p.status === 'PUBLISHED' ? new Date() : null,
          expires_at: p.expiresAt ?? null,
          author: { connect: { id: p.authorId } },
        },
      });
      results.push(created);
    }
  }

  return results;
}