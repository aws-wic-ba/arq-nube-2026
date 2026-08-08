import * as yup from "yup";

const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg"];
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const PHONE = /^[+\d][\d\s-]{6,}$/;
const CITY_NAME = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s'-]*$/;
const PASSWORD_MIN_LENGTH = 8;

export interface JoinFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactPhone: string;
  city: string;
  description: string;
  primaryColor: string;
  secondaryColor?: string;
  logo: FileList;
  termsAccepted: boolean;
}

export const joinFormSchema: yup.ObjectSchema<JoinFormValues> = yup.object({
  name: yup
    .string()
    .trim()
    .required("Ingresá el nombre de tu refugio")
    .min(3, "Debe tener al menos 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  email: yup
    .string()
    .trim()
    .required("Ingresá un email de contacto")
    .email("Ingresá un email válido"),

  password: yup
    .string()
    .required("Ingresá una contraseña")
    .min(PASSWORD_MIN_LENGTH, `Debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
    .matches(/[A-Za-z]/, "Debe incluir al menos una letra")
    .matches(/[0-9]/, "Debe incluir al menos un número"),

  confirmPassword: yup
    .string()
    .required("Repetí la contraseña")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),

  contactPhone: yup
    .string()
    .trim()
    .required("Ingresá un teléfono de contacto")
    .matches(PHONE, "Ingresá un teléfono válido"),

  city: yup
    .string()
    .trim()
    .required("Ingresá la ciudad de tu refugio")
    .matches(CITY_NAME, "La ciudad no puede contener números ni símbolos"),

  description: yup
    .string()
    .trim()
    .required("Contanos sobre tu refugio")
    .min(20, "Contanos un poco más (mínimo 20 caracteres)")
    .max(500, "Máximo 500 caracteres"),

  primaryColor: yup
    .string()
    .required("Elegí un color primario")
    .matches(HEX_COLOR, "Color inválido"),

  secondaryColor: yup
    .string()
    .optional()
    .matches(HEX_COLOR, {
      message: "Color inválido",
      excludeEmptyString: true,
    }),

  logo: yup
    .mixed<FileList>()
    .required("Subí el logo de tu refugio")
    .test(
      "required",
      "Subí el logo de tu refugio",
      (value) => !!value && value.length > 0,
    )
    .test(
      "fileType",
      "El logo debe ser PNG o JPG",
      (value) => !value?.length || ACCEPTED_LOGO_TYPES.includes(value[0].type),
    )
    .test(
      "fileSize",
      "El logo no puede superar los 5MB",
      (value) => !value?.length || value[0].size <= MAX_LOGO_SIZE,
    ),

  termsAccepted: yup
    .boolean()
    .required()
    .oneOf([true], "Tenés que aceptar los Términos y Condiciones"),
});
