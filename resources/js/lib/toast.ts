import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'swal2-toast',
  },
});

// Configuración base para modales de confirmación
const ConfirmModal = MySwal.mixin({
  customClass: {
    container: 'swal2-container-high-z',
    popup: 'swal2-popup-confirm',
  },
  backdrop: true,
  allowOutsideClick: false, // Evitar cerrar accidentalmente
  allowEscapeKey: true,
  buttonsStyling: true,
  focusConfirm: true,
  reverseButtons: false,
  // Z-index alto para asegurar que esté por encima de todo
  heightAuto: true,
  width: '32rem',
});

export const showToast = {
  success: (message: string, title = 'Éxito') =>
    Toast.fire({
      icon: 'success',
      title,
      text: message,
    }),

  error: (message: string, title = 'Error') =>
    Toast.fire({
      icon: 'error',
      title,
      text: message,
    }),

  info: (message: string, title = 'Información') =>
    Toast.fire({
      icon: 'info',
      title,
      text: message,
    }),

  warning: (message: string, title = 'Advertencia') =>
    Toast.fire({
      icon: 'warning',
      title,
      text: message,
    }),

  /**
   * Confirmación reutilizable mejorada
   */
  confirm: (title: string, text?: string): Promise<boolean> => {
    // Deshabilitar interacciones problemáticas antes de mostrar el modal
    disableFileInputs();
    
    return ConfirmModal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      willClose: () => {
        // Rehabilitar interacciones al cerrar
        enableFileInputs();
      }
    }).then((result) => {
      // Asegurar que las interacciones se rehabiliten
      enableFileInputs();
      return result.isConfirmed;
    });
  },

  /**
   * Confirmación con opciones personalizadas
   */
  confirmCustom: (options: {
    title: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: 'warning' | 'question' | 'info' | 'error' | 'success';
    dangerMode?: boolean;
  }): Promise<boolean> => {
    disableFileInputs();
    
    return ConfirmModal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon || 'warning',
      showCancelButton: true,
      confirmButtonColor: options.dangerMode ? '#dc2626' : '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: options.confirmText || 'Confirmar',
      cancelButtonText: options.cancelText || 'Cancelar',
      willClose: () => {
        enableFileInputs();
      }
    }).then((result) => {
      enableFileInputs();
      return result.isConfirmed;
    });
  },

  /**
   * Modal de confirmación para acciones destructivas
   */
  confirmDelete: (itemName?: string): Promise<boolean> => {
    return showToast.confirmCustom({
      title: '¿Estás seguro?',
      text: itemName 
        ? `Esta acción eliminará "${itemName}" permanentemente.`
        : 'Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      icon: 'warning',
      dangerMode: true
    });
  }
};
function disableFileInputs() {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  const fileLabels = document.querySelectorAll('label[for*="file"]');
  
  fileInputs.forEach((input) => {
    (input as HTMLInputElement).disabled = true;
  });
  
  fileLabels.forEach((label) => {
    (label as HTMLElement).style.pointerEvents = 'none';
    (label as HTMLElement).style.opacity = '0.6';
    (label as HTMLElement).setAttribute('data-disabled-by-swal', 'true');
  });
}

function enableFileInputs() {
  // Pequeño delay para asegurar que el modal se haya cerrado completamente
  setTimeout(() => {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fileLabels = document.querySelectorAll('label[data-disabled-by-swal="true"]');
    
    fileInputs.forEach((input) => {
      (input as HTMLInputElement).disabled = false;
    });
    
    fileLabels.forEach((label) => {
      (label as HTMLElement).style.pointerEvents = 'auto';
      (label as HTMLElement).style.opacity = '1';
      (label as HTMLElement).removeAttribute('data-disabled-by-swal');
    });
  }, 100);
}

// Función para verificar si hay un modal de SweetAlert abierto
export const isSweetAlertOpen = (): boolean => {
  return !!document.querySelector('.swal2-container');
};

// Hook personalizado para React (opcional)
export const useSweetAlertState = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkSweetAlert = () => {
      setIsOpen(isSweetAlertOpen());
    };

    const observer = new MutationObserver(checkSweetAlert);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return isOpen;
};