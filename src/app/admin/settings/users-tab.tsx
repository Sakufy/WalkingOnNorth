"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";

export default function UsersTab() {
  const [users, setUsers] = useState<Array<{
    id: string; nickname: string; email: string; role: string;
    isHighValue: boolean; createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleHighValue = async (user: typeof users[0]) => {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHighValue: !user.isHighValue }),
    });
    fetchUsers();
  };

  if (loading) return <div className="text-center py-12" style={{ color: "#9C9590" }}>加载中…</div>;

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-[#F5F1EB]"
          style={{ borderColor: "#E8E3DC" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm" style={{ color: "#2D2A26" }}>{u.nickname}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: u.role === "admin" ? "#A67C5220" : "#9C959020",
                  color: u.role === "admin" ? "#A67C52" : "#9C9590",
                }}
              >{u.role === "admin" ? "管理员" : "用户"}</span>
              {u.isHighValue && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#A67C5220", color: "#A67C52" }}>高价值</span>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: "#9C9590" }}>
              {u.email} · {new Date(u.createdAt).toLocaleDateString("zh-CN")} 加入
            </p>
          </div>
          <button
            onClick={() => toggleHighValue(u)}
            className="p-2 rounded hover:bg-[#F5F1EB] shrink-0 transition-colors"
            style={{ color: u.isHighValue ? "#A67C52" : "#9C9590" }}
            title={u.isHighValue ? "取消高价值" : "设为高价值"}
          >
            <Star size={18} fill={u.isHighValue ? "#A67C52" : "none"} />
          </button>
        </div>
      ))}
      {users.length === 0 && <p className="text-center py-8" style={{ color: "#9C9590" }}>暂无用户</p>}
    </div>
  );
}
