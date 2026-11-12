import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Buat Akun" };

export default function RegisterPage() {
  return <RegisterForm />;
}
