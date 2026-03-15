import RoleLoginForm from "@/components/RoleLoginForm";

export default function DoctorLoginPage() {
  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Doctor Login</h1>
      <RoleLoginForm role="DOCTOR" callbackUrl="/doctor/exercises" />
    </main>
  );
}
