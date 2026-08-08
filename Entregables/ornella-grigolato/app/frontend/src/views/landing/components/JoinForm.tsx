import { useRef, useState, type ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { joinFormSchema, type JoinFormValues } from "./joinFormSchema";
import type { Association } from "../../../Types/Association";
import { createAssociation } from "../../../services/associationService";
import { uploadLogo } from "../../../services/uploadService";
import { endSession } from "../../../services/session";
import JoinSuccessModal from "./JoinSuccessModal";
import { signIn } from "aws-amplify/auth";

interface TextFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: LucideIcon;
  required?: boolean;
  className?: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

function TextField({
  id,
  label,
  type,
  placeholder,
  icon: Icon,
  required,
  className,
  error,
  registration,
}: TextFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={17}
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          id={id}
          type={type}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-colors ${
            error
              ? "border-red-300 focus:ring-red-500/30 focus:border-red-400"
              : "border-gray-200 focus:ring-terracotta-500/30 focus:border-terracotta-400"
          }`}
          {...registration}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

interface ColorFieldProps {
  id: string;
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

function ColorField({ id, label, error, registration }: ColorFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="color"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full rounded-xl border p-1.5 cursor-pointer bg-white focus:outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:ring-red-500/30"
            : "border-gray-200 focus:ring-terracotta-500/30"
        }`}
        {...registration}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

function PasswordField({
  id,
  label,
  placeholder,
  error,
  registration,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={17}
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full border rounded-xl pl-10 pr-11 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-colors ${
            error
              ? "border-red-300 focus:ring-red-500/30 focus:border-red-400"
              : "border-gray-200 focus:ring-terracotta-500/30 focus:border-terracotta-400"
          }`}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <EyeOff size={17} strokeWidth={2} />
          ) : (
            <Eye size={17} strokeWidth={2} />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

interface CreatedShelter {
  name: string;
  slug: string;
}

export default function JoinForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdShelter, setCreatedShelter] = useState<CreatedShelter | null>(
    null,
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  // Cada selección de archivo incrementa el id: así descarto respuestas de
  // subidas viejas si el usuario cambia de imagen mientras una está en vuelo.
  const uploadId = useRef(0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<JoinFormValues>({
    resolver: yupResolver(joinFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      primaryColor: "#c15f3a",
      secondaryColor: "#1c1917",
    },
  });

  const logoRegistration = register("logo");
  const logoFile = watch("logo")?.[0];

  const uploadSelectedLogo = async (file: File) => {
    const currentUploadId = ++uploadId.current;
    const isStale = () => currentUploadId !== uploadId.current;

    setLogoUrl(null);
    setLogoError(null);
    setLogoUploading(true);

    try {
      const publicUrl = await uploadLogo(file);
      if (isStale()) return;
      setLogoUrl(publicUrl);
    } catch (error) {
      if (isStale()) return;
      setLogoError(
        error instanceof Error
          ? error.message
          : "No pudimos subir el logo. Intentá de nuevo.",
      );
    } finally {
      if (!isStale()) setLogoUploading(false);
    }
  };

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await logoRegistration.onChange(event);

    setSubmitError(null);
    setCreatedShelter(null);

    const file = event.target.files?.[0];

    if (!file) {
      uploadId.current++;
      setLogoUrl(null);
      setLogoError(null);
      setLogoUploading(false);
      return;
    }

    const isValidLogo = await trigger("logo");
    if (!isValidLogo) {
      uploadId.current++;
      setLogoUrl(null);
      setLogoError(null);
      setLogoUploading(false);
      return;
    }

    await uploadSelectedLogo(file);
  };

  // El slug del refugio sale del token, así que el panel ya sabe cuál abrir.
  const goToDashboard = () => navigate("/dashboard");

  const onSubmit = async (values: JoinFormValues) => {
    setSubmitError(null);
    setCreatedShelter(null);

    if (logoUploading) {
      setSubmitError("Esperá a que termine de subirse el logo.");
      return;
    }

    if (!logoUrl) {
      setSubmitError("Necesitamos el logo de tu refugio para crear la página.");
      if (!logoError) setLogoError("Volvé a elegir el logo para subirlo.");
      return;
    }

    let association: Association;

    try {
      ({ association } = await createAssociation({
        email: values.email,
        password: values.password,
        name: values.name,
        description: values.description,
        city: values.city,
        contactPhone: values.contactPhone,
        logoUrl,
        primaryColor: values.primaryColor,
        secondaryColor: values.secondaryColor || undefined,
      }));
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado. Intentá de nuevo.",
      );
      return;
    }

    try {
      await endSession();

      const { isSignedIn, nextStep } = await signIn({
        username: values.email,
        password: values.password,
      });

      // signIn también resuelve cuando Cognito pide un paso extra (MFA, cambio
      // de contraseña): resolver no es lo mismo que estar autenticado.
      if (!isSignedIn) {
        console.warn("Login pendiente de un paso extra:", nextStep.signInStep);
        navigate("/login");
        return;
      }
    } catch (error) {
      console.error("Falló el auto-login post registro:", error);
      navigate("/login");
      return;
    }

    reset();
    uploadId.current++;
    setLogoUrl(null);
    setLogoError(null);
    setCreatedShelter({ name: association.name, slug: association.slug });
    setIsSuccessModalOpen(true);
  };

  return (
    <section id="unite" className="bg-cream-200">
      <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-900/5 border border-gray-100 p-8 md:p-12">
          <div className="flex flex-col gap-3 mb-10">
            <span className="w-fit text-xs font-semibold uppercase tracking-wide text-terracotta-500">
              Sumate a MORAR
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Creá la página de tu refugio
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Completá estos datos y en minutos vas a tener tu refugio online,
              con su propia identidad y listo para gestionar.
            </p>
          </div>

          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <TextField
              id="name"
              label="Nombre de la Asociación"
              type="text"
              placeholder="Refugio Huellas de Esperanza"
              icon={Building2}
              required
              className="md:col-span-2"
              error={errors.name?.message}
              registration={register("name")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                id="email"
                label="Email"
                type="email"
                placeholder="contacto@turefugio.org"
                icon={Mail}
                required
                error={errors.email?.message}
                registration={register("email")}
              />
              <TextField
                id="contactPhone"
                label="Teléfono"
                type="tel"
                placeholder="+54 9 11 1234-5678"
                icon={Phone}
                required
                error={errors.contactPhone?.message}
                registration={register("contactPhone")}
              />
              <TextField
                id="city"
                label="Ciudad"
                type="text"
                placeholder="Buenos Aires"
                icon={MapPin}
                required
                error={errors.city?.message}
                registration={register("city")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PasswordField
                id="password"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                registration={register("password")}
              />
              <PasswordField
                id="confirmPassword"
                label="Repetí la contraseña"
                placeholder="Volvé a escribirla"
                error={errors.confirmPassword?.message}
                registration={register("confirmPassword")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorField
                id="primaryColor"
                label="Color primario de marca"
                error={errors.primaryColor?.message}
                registration={register("primaryColor")}
              />
              <ColorField
                id="secondaryColor"
                label="Color secundario de marca"
                error={errors.secondaryColor?.message}
                registration={register("secondaryColor")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="logo"
                className="text-sm font-semibold text-gray-700"
              >
                Logo
              </label>
              <label
                htmlFor="logo"
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-colors ${
                  errors.logo || logoError
                    ? "border-red-300 hover:border-red-400 hover:bg-red-50/40"
                    : "border-gray-200 hover:border-terracotta-300 hover:bg-terracotta-50/40"
                }`}
              >
                {logoUploading ? (
                  <Loader2
                    size={22}
                    strokeWidth={2}
                    className="animate-spin text-terracotta-500"
                  />
                ) : logoUrl ? (
                  <CheckCircle2
                    size={22}
                    strokeWidth={2}
                    className="text-green-600"
                  />
                ) : (
                  <ImageIcon
                    size={22}
                    strokeWidth={2}
                    className="text-gray-400"
                  />
                )}
                <span className="text-sm font-semibold text-gray-700">
                  {logoFile ? logoFile.name : "Subí el logo de tu refugio"}
                </span>
                <span className="text-xs text-gray-400">
                  {logoUploading
                    ? "Subiendo el logo..."
                    : logoUrl
                      ? "Logo subido. Tocá acá si querés cambiarlo."
                      : "PNG o JPG, hasta 5MB"}
                </span>
                <input
                  id="logo"
                  type="file"
                  accept="image/png, image/jpeg"
                  aria-invalid={!!errors.logo || !!logoError}
                  aria-describedby={
                    errors.logo
                      ? "logo-error"
                      : logoError
                        ? "logo-upload-error"
                        : undefined
                  }
                  className="hidden"
                  {...logoRegistration}
                  onChange={handleLogoChange}
                />
              </label>
              {errors.logo && (
                <p id="logo-error" className="text-xs font-medium text-red-500">
                  {errors.logo.message}
                </p>
              )}
              {!errors.logo && logoError && (
                <p
                  id="logo-upload-error"
                  className="flex flex-wrap items-center gap-2 text-xs font-medium text-red-500"
                >
                  {logoError}
                  {logoFile && (
                    <button
                      type="button"
                      onClick={() => uploadSelectedLogo(logoFile)}
                      className="inline-flex items-center gap-1 font-semibold text-terracotta-600 hover:text-terracotta-700 underline"
                    >
                      <RotateCcw size={12} strokeWidth={2.5} />
                      Reintentar
                    </button>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-sm font-semibold text-gray-700"
              >
                Descripción
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Contanos sobre tu refugio: su misión, su historia y a quiénes ayuda."
                aria-invalid={!!errors.description}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                  errors.description
                    ? "border-red-300 focus:ring-red-500/30 focus:border-red-400"
                    : "border-gray-200 focus:ring-terracotta-500/30 focus:border-terracotta-400"
                }`}
                {...register("description")}
              />
              {errors.description && (
                <p
                  id="description-error"
                  className="text-xs font-medium text-red-500"
                >
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  aria-invalid={!!errors.termsAccepted}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-terracotta-500"
                  {...register("termsAccepted")}
                />
                Acepto los Términos y Condiciones y la Política de Privacidad de
                MORAR.
              </label>
              {errors.termsAccepted && (
                <p className="text-xs font-medium text-red-500">
                  {errors.termsAccepted.message}
                </p>
              )}
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            {/* El modal se puede cerrar con "Quizás más tarde": este cartel deja el
                acceso al panel a mano para que el camino no se pierda. */}
            {createdShelter && (
              <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">
                    ¡{createdShelter.name} ya está online!
                  </span>{" "}
                  Podés entrar al panel cuando quieras.
                </p>
                <button
                  type="button"
                  onClick={goToDashboard}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-green-700 underline decoration-green-300 underline-offset-2 transition-colors hover:text-green-900"
                >
                  Ir a mi panel
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || logoUploading}
              className="inline-flex items-center justify-center gap-2 bg-terracotta-500 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-md shadow-terracotta-500/25 hover:bg-terracotta-600 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {logoUploading ? (
                <>
                  Subiendo el logo...
                  <Loader2
                    size={16}
                    strokeWidth={2.5}
                    className="animate-spin"
                  />
                </>
              ) : isSubmitting ? (
                <>
                  Creando tu refugio...
                  <Loader2
                    size={16}
                    strokeWidth={2.5}
                    className="animate-spin"
                  />
                </>
              ) : (
                <>
                  Crear mi refugio
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {isSuccessModalOpen && createdShelter && (
        <JoinSuccessModal
          associationName={createdShelter.name}
          slug={createdShelter.slug}
          onGoToDashboard={goToDashboard}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </section>
  );
}
