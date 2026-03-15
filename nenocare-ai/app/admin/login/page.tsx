import RoleLoginForm from "@/components/RoleLoginForm";

export default function AdminLoginPage() {
  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Admin Login</h1>
      <RoleLoginForm role="ADMIN" callbackUrl="/admin" />
    </main>
  );
}
