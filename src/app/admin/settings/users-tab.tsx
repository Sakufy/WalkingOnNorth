"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#E8E3DC" }}>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#E8E3DC" }}>
            <TableHead style={{ color: "#2D2A26" }}>昵称</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>邮箱</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>角色</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>注册时间</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>高价值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} style={{ borderColor: "#E8E3DC" }}>
              <TableCell style={{ color: "#2D2A26" }}>{u.nickname}</TableCell>
              <TableCell className="text-sm" style={{ color: "#9C9590" }}>{u.email}</TableCell>
              <TableCell>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                  backgroundColor: u.role === "admin" ? "#A67C5220" : "#9C959020",
                  color: u.role === "admin" ? "#A67C52" : "#9C9590",
                }}>
                  {u.role === "admin" ? "管理员" : "用户"}
                </span>
              </TableCell>
              <TableCell className="text-xs" style={{ color: "#9C9590" }}>
                {new Date(u.createdAt).toLocaleDateString("zh-CN")}
              </TableCell>
              <TableCell>
                <button onClick={() => toggleHighValue(u)} style={{ color: u.isHighValue ? "#A67C52" : "#9C9590" }}>
                  <Star size={16} fill={u.isHighValue ? "#A67C52" : "none"} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.length === 0 && <p className="text-center py-8" style={{ color: "#9C9590" }}>暂无用户</p>}
    </div>
  );
}
