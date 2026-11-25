'use client';

import styles from './organization-effects.module.css';

const classes = {
  popup: styles.popup,
  title: styles.title,
  confirmButton: styles.confirm,
  cancelButton: styles.cancel,
};

export async function showOrgToast(message: string) {
  const { default: Swal } = await import('sweetalert2');

  await Swal.fire({
    toast: true,
    icon: 'success',
    title: message,
    position: 'top-end',
    timer: 2600,
    timerProgressBar: true,
    showConfirmButton: false,
    customClass: {
      popup: styles.toast,
    },
    showClass: {
      popup: styles.popIn,
    },
    hideClass: {
      popup: styles.popOut,
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
}

export async function showOrgError(message: string) {
  const { default: Swal } = await import('sweetalert2');

  await Swal.fire({
    icon: 'error',
    title: 'Operasi gagal',
    text: message,
    confirmButtonText: 'Mengerti',
    buttonsStyling: false,
    customClass: classes,
    showClass: {
      popup: styles.popIn,
    },
    hideClass: {
      popup: styles.popOut,
    },
  });
}

export async function confirmOrgDelete(
  name: string,
  slug: string,
) {
  const { default: Swal } = await import('sweetalert2');

  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus organisasi?',
    text:
      `Organisasi “${name}” akan dihapus permanen ` +
      'jika tidak memiliki anggota. ' +
      'Ketik slug untuk mengonfirmasi.',
    input: 'text',
    inputLabel: `Slug: ${slug}`,
    inputPlaceholder: slug,
    inputAttributes: {
      autocapitalize: 'off',
      autocomplete: 'off',
    },
    inputValidator: (value) =>
      value.trim() === slug
        ? undefined
        : 'Slug tidak cocok.',
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonText: 'Hapus permanen',
    cancelButtonText: 'Batal',
    focusCancel: true,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      ...classes,
      input: styles.input,
    },
    showClass: {
      popup: styles.popIn,
    },
    hideClass: {
      popup: styles.popOut,
    },
  });

  return result.isConfirmed;
}
