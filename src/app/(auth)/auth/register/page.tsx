import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

const registerMetadata = {
  title: "注册",
};

export { registerMetadata as metadata };

export default function RegisterPage() {
  return (
    <div
      className="mx-auto flex min-h-[80vh] max-w-[480px] flex-col justify-center px-5 py-16"
    >
      <div className="mb-10 text-center">
        <h1
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "2rem",
            letterSpacing: "-0.01em",
            color: "var(--bx-primary)",
            marginBottom: "0.5rem",
          }}
        >
          开始北行
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--bx-secondary)",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
          }}
        >
          踏上你的成长之路
        </p>
      </div>

      <RegisterForm />

      <p
        className="mt-8 text-center"
        style={{
          fontSize: "0.9375rem",
          color: "var(--bx-secondary)",
          fontFamily: '"Noto Sans SC", Inter, sans-serif',
        }}
      >
        已有账号？{" "}
        <Link
          href="/auth/login"
          style={{
            color: "var(--bx-tertiary)",
            transition: "color 150ms ease",
          }}
        >
          继续旅程
        </Link>
      </p>
    </div>
  );
}
