'use client';

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  Building2,
  CircleDollarSign,
  Globe2,
  LoaderCircle,
  Save,
  Sparkles,
  X,
} from 'lucide-react';

import type { Organization } from '../api/organizations.api';

import {
  createOrganizationAction,
  updateOrganizationAction,
} from '../actions/organization.actions';

import {
  showOrgError,
  showOrgToast,
} from './organization-alerts';

import styles from './organization-effects.module.css';

function makeSlug(input: string) {
  return input
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

  const firstInput = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLElement>(null);

  const [name, setName] = useState(organization?.name ?? '');
  const [slug, setSlug] = useState(organization?.slug ?? '');

  const [currency, setCurrency] = useState(
    organization?.defaultCurrency ?? 'IDR',
  );

  const [slugEdited, setSlugEdited] = useState(
    Boolean(organization),
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(organization);

  useEffect(() => {
    const previous = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    firstInput.current?.focus();

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }

      if (event.key !== 'Tab') return;

      const items = dialog.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled])',
      );

      if (!items?.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', handler);
    };
  }, [busy, onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy || !enabled) return;

    setBusy(true);
    setError('');

    const form = new FormData();

    form.set('name', name.trim());
    form.set('slug', slug.trim().toLowerCase());
    form.set('defaultCurrency', currency);

    try {
      const result = organization
        ? await updateOrganizationAction(organization.id, form)
        : await createOrganizationAction(form);

      if (!result.ok) {
        setError(result.message);
        await showOrgError(result.message);
        return;
      }

      onSaved(result.message);
      void showOrgToast(result.message);
      router.refresh();
    } catch {
      const message =
        'Gagal menyimpan organisasi. Periksa koneksi API.';

      setError(message);
      await showOrgError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`${styles.backdrop} fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[#101a30]/70 p-3 backdrop-blur-sm sm:p-6`}
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !busy
        ) {
          onClose();
        }
      }}
    >
      <section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="org-modal-title"
        className={`${styles.panel} my-auto max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-2xl`}
      >
        <header className="relative overflow-hidden bg-gradient-to-br from-[#202943] via-[#2b3a5e] to-[#287b9d] px-5 py-6 text-white sm:px-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full border border-white/15 bg-white/5"
          />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
                <Building2 size={23} />
              </span>

              <div>
                <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-sky-100">
                  <Sparkles size={13} />
                  LEDGERCORE WORKSPACE
                </div>

                <h2
                  id="org-modal-title"
                  className="text-xl font-bold"
                >
                  {isEdit
                    ? 'Edit Organisasi'
                    : 'Tambah Organisasi'}
                </h2>

                <p className="mt-1 text-xs text-sky-100">
                  {isEdit
                    ? 'Perbarui data perusahaan secara aman.'
                    : 'Daftarkan perusahaan baru.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Tutup modal"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg p-2 transition hover:rotate-90 hover:bg-white/15 disabled:opacity-40"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        <form
          onSubmit={(event) => void submit(event)}
          className="space-y-4 px-5 py-6 sm:px-7"
        >
          {!enabled && (
            <p
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
              API organisasi belum siap.
              Penyimpanan dinonaktifkan.
            </p>
          )}

          <p className="rounded-lg bg-[#f3f8ff] px-4 py-3 text-xs text-slate-600">
            Pastikan nama, slug dan mata uang organisasi
            sudah benar.
          </p>

          <label className="block text-xs font-bold text-[#34415d]">
            <span className="mb-2 flex items-center gap-2">
              <Building2
                size={15}
                className="text-sky-600"
              />
              Nama organisasi *
            </span>

            <input
              ref={firstInput}
              required
              minLength={3}
              maxLength={160}
              value={name}
              onChange={(e) => {
                setName(e.target.value);

                if (!slugEdited) {
                  setSlug(makeSlug(e.target.value));
                }
              }}
              placeholder="PT LedgerCore Indonesia"
              className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
            />
          </label>

          <label className="block text-xs font-bold text-[#34415d]">
            <span className="mb-2 flex items-center gap-2">
              <Globe2
                size={15}
                className="text-sky-600"
              />
              Slug unik *
            </span>

            <input
              required
              minLength={3}
              maxLength={80}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value.toLowerCase());
              }}
              placeholder="pt-ledgercore-indonesia"
              className="h-11 w-full rounded-xl border border-slate-300 px-4 font-mono text-xs outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
            />

            <span className="mt-1 block text-[11px] font-normal text-slate-500">
              Huruf kecil, angka, dan tanda hubung.
            </span>
          </label>

          <label className="block text-xs font-bold text-[#34415d]">
            <span className="mb-2 flex items-center gap-2">
              <CircleDollarSign
                size={15}
                className="text-sky-600"
              />
              Mata uang utama
            </span>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-sky-500"
            >
              <option value="IDR">IDR — Rupiah Indonesia</option>
              <option value="USD">USD — Dollar Amerika</option>
              <option value="SGD">SGD — Dollar Singapura</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-300 px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={!enabled || busy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#293553] px-6 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#354568] disabled:opacity-50"
            >
              {busy ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save size={16} />
              )}

              {busy
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Tambah Organisasi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
