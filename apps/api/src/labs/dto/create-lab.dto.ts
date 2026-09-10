export class CreateLabDto {
  title!: string;
  slug!: string;
  description!: string;
  category!: string;
  difficulty!: 'EASY' | 'MEDIUM' | 'HARD';
  points!: number;
  target_type!: 'WEB' | 'LINUX' | 'NETWORK' | 'CRYPTO';
  target_url?: string | null;
  docker_image?: string | null;
}