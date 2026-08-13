import { PasswordForm } from "./PasswordForm";

export default function LoginPage() {
  return (
    <div className="center-wrap">
      <div className="center-card">
        <div className="brand">
          <b>大栄製作所</b>
          <span>製作・現場管理</span>
        </div>
        <div className="card">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
