import Swal from "sweetalert2";

export const ok = message => {
  Swal.fire({
    icon: "success",
    title: "OK",
    text: message, //"Registo creado exitosamente",
    showConfirmButton: false,
    timer: 1500,
  });
};

export const oops = message => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message, // "No se pudo guardar el registro. Por favor, inténtelo de nuevo",
    confirmButtonText: "OK",
  });
};

export const deleteConfirmation = async () => {
  const result = await Swal.fire({
    title: "¿Está seguro?",
    text: "Esta acción eliminará el registro seleccionado. ¿Desea continuar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};

export const info = message => {
  Swal.fire({
    icon: "info",
    text: message,
    confirmButtonText: "OK",
  });
};

export const warning = message => {
  Swal.fire({
    title: "Oops",
    icon: "warning",
    text: message,
    showConfirmButton: false,
    timer: 1500,
  });
};
