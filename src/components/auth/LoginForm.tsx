"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("邮箱或密码不正确");
      return;
    }

    router.push("/");
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 0",
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "var(--bx-primary)",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(45, 42, 38, 0.2)",
    outline: "none",
    transition: "border-color 150ms ease",
    fontFamily: '"Noto Sans SC", Inter, sans-serif',
    borderRadius: 0,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <p
          className="text-sm py-2"
          style={{ color: "var(--bx-error)", fontFamily: '"Noto Sans SC", Inter, sans-serif' }}
        >
          {error}
        </p>
      )}

      <div>
        <input
          type="email"
          placeholder="邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderBottomColor = "var(--bx-tertiary)"; }}
          onBlur={(e) => { e.currentTarget.style.borderBottomColor = "rgba(45, 42, 38, 0.2)"; }}
        />
      </div>

      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderBottomColor = "var(--bx-tertiary)"; }}
          onBlur={(e) => { e.currentTarget.style.borderBottomColor = "rgba(45, 42, 38, 0.2)"; }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            padding: "4px 8px",
            fontSize: "0.8125rem",
            color: "var(--bx-secondary)",
            cursor: "pointer",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
          }}
        >
          {showPassword ? "隐藏" : "显示"}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          lineHeight: "1.5",
          fontWeight: 500,
          color: "var(--bx-on-primary)",
          backgroundColor: "var(--bx-primary)",
          border: "none",
          borderRadius: "9999px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 150ms ease",
          fontFamily: '"Noto Sans SC", Inter, sans-serif',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "正在验证…" : "继续旅程"}
      </button>
    </form>
  );
}
