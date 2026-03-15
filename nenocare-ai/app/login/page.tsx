import RoleLoginForm from "@/components/RoleLoginForm";

export default function PatientLoginPage() {
  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Patient Login</h1>
      <RoleLoginForm role="PATIENT" callbackUrl="/patient/exercises" />
    </main>
  );
}
