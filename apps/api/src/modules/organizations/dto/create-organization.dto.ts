import { BadRequestException } from '@nestjs/common';

export type OrganizationPayload = {
  name: string;
  slug: string;
  defaultCurrency: string;
};

export function parseOrganizationPayload(value: unknown): OrganizationPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Data organisasi tidak valid.');
  }

  const data = value as Record<string, unknown>;

  if (Object.keys(data).some(
    (key) => !['name', 'slug', 'defaultCurrency'].includes(key),
  )) {
    throw new BadRequestException('Field organisasi tidak dikenal.');
  }

  if (
    typeof data.name !== 'string' ||
    typeof data.slug !== 'string' ||
    typeof data.defaultCurrency !== 'string'
  ) {
    throw new BadRequestException(
      'Nama, slug, dan mata uang wajib diisi.',
    );
  }

  const name = data.name.trim();
  const slug = data.slug.trim().toLowerCase();
  const defaultCurrency = data.defaultCurrency.trim().toUpperCase();

  if (name.length < 3 || name.length > 160) {
    throw new BadRequestException(
      'Nama organisasi harus 3–160 karakter.',
    );
  }

  if (
    slug.length < 3 ||
    slug.length > 80 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    throw new BadRequestException(
      'Slug harus 3–80 karakter, huruf kecil, angka dan tanda hubung.',
    );
  }

  if (!/^[A-Z]{3}$/.test(defaultCurrency)) {
    throw new BadRequestException(
      'Kode mata uang harus tiga huruf kapital.',
    );
  }

  return { name, slug, defaultCurrency };
}
