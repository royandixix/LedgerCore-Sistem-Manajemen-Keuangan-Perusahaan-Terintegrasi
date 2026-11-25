'use client';

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import type { Organization } from '../api/organizations.api';

import {
  createOrganizationAction,
  updateOrganizationAction,
} from '../actions/organization.actions';

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function OrganizationEditor({
  organization,
  enabled,
  onClose,
  onSaved,
}: {
  organization: Organization | null;
  enabled: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(organization?.name ?? '');
  const [slug, setSlug] = useState(organization?.slug ?? '');
  const [currency, setCurrency] = useState(
    organization?.defaultCurrency ?? 'IDR',
  );

  const [slugEdited, setSlugEdited] = useState(Boolean(organization));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    inputRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [busy, onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy || !enabled) return;

    setError('');
    setBusy(true);

    const data = new FormData();

    data.set('name', name.trim());
    data.set('slug', slug.trim().toLowerCase());
    data.set('defaultCurrency', currency.toUpperCase());

    try {
      const result = organization
        ? await updateOrganizationAction(organization.id, data)
        : await createOrganizationAction(data);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      onSaved(result.message);
      router.refresh();
    } catch {
      setError('Gagal mengirim data organisasi. Coba kembali.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111a30]/70 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="org-editor-title"
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="org-editor-title"
            className="text-lg font-bold text-[#2b3650]"
          >
            {organization ? 'Edit Organisasi' : 'Tambah Organisasi'}
          </h2>

          <button
            type="button"
            aria-label="Tutup form"
            disabled={busy}
            onClick={onClose}
            className="rounded-md p-1 hover:bg-slate-100 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {!enabled && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            Database belum siap atau API tidak tersedia.
            Form dapat dilihat, tetapi penyimpanan dinonaktifkan
            sampai migration selesai.
          </p>
        )}

        <form
          onSubmit={(event) => void submit(event)}
          className="mt-5 space-y-4"
        >
          <label className="block text-xs font-semibold text-[#3a4762]">
            Nama Organisasi
            <input
              ref={inputRef}
              required
              minLength={3}
              maxLength={160}
              value={name}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);

                if (!slugEdited) {
                  setSlug(toSlug(value));
                }
              }}
              placeholder="Contoh: PT LedgerCore Indonesia"
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-400"
            />
          </label>

          <label className="block text-xs font-semibold text-[#3a4762]">
            Slug unik
            <input
              required
              minLength={3}
              maxLength={80}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value.toLowerCase());
              }}
              placeholder="pt-ledgercore-indonesia"
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-400"
            />
          </label>

          <label className="block text-xs font-semibold text-[#3a4762]">
            Mata uang default
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="IDR">IDR — Rupiah</option>
              <option value="USD">USD — US Dollar</option>
              <option value="SGD">SGD — Singapore Dollar</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-rose-50 p-3 text-xs text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-xs font-semibold disabled:opacity-40"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={!enabled || busy}
              className="rounded-md bg-[#29314b] px-5 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy
                ? 'Menyimpan...'
                : organization
                  ? 'Simpan Perubahan'
                  : 'Tambah Organisasi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
