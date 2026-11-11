import { Github, Instagram, Linkedin, Youtube } from 'lucide-react';

const ICONS = {
  github: Github,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
} as const;

export type SocialId = keyof typeof ICONS;

export default function SocialIcon({ id, size = 18 }: { id: string; size?: number }) {
  const Icon = ICONS[id as SocialId];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}
