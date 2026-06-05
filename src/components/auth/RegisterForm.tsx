"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("请填写所有字段");
      return;
    }

    if (password.length < 8) {
      setError("密码至少需要 8 个字符");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "注册失败，请稍后再试");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError("账号已创建，请登录");
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderBottomColor = "var(--bx-tertiary)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderBottomColor = "rgba(45, 42, 38, 0.2)";
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
          type="text"
          placeholder="你的名字或昵称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="密码（至少 8 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
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

      <div style={{ position: "relative" }}>
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="确认密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
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
          {showConfirm ? "隐藏" : "显示"}
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
        {loading ? "正在创建账号…" : "开始北行"}
      </button>
    </form>
  );
}
