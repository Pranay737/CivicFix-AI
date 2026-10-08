import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { User, Department } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, Shield, Building2, CheckCircle2, XCircle, Search, Edit2 } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [newDeptId, setNewDeptId] = useState<number | ''>('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch users
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => adminApi.getUsers(roleFilter === 'ALL' ? undefined : roleFilter, 0, 100),
  });

  // Fetch departments for assignment dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['admin-departments'],
    queryFn: () => adminApi.getDepartments(),
  });

  const users = data?.content || [];

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return (
      u.email.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q)
    );
  });

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: () => adminApi.updateUserRole(selectedUser!.id, newRole),
    onSuccess: () => {
      setSuccessMsg('Role updated successfully.');
      refetch();
    },
  });

  // Assign Dept Mutation
  const assignDeptMutation = useMutation({
    mutationFn: () => adminApi.assignUserDepartment(selectedUser!.id, Number(newDeptId)),
    onSuccess: () => {
      setSuccessMsg('Department assigned successfully.');
      refetch();
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminApi.toggleUserStatus(id, active),
    onSuccess: () => refetch(),
  });

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewDeptId(user.departmentId || user.department?.id || '');
    setSuccessMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          User & RBAC Role Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Provision user roles, map field officers to municipal departments, and control account status.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SYSTEM_ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === r
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {u.departmentName || u.department?.name || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          toggleStatusMutation.mutate({ id: u.id, active: !u.active })
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          u.active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title="Click to toggle account status"
                      >
                        {u.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-slate-700 dark:text-slate-200 hover:text-primary-600 font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit Role/Dept
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Modify User Permissions
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <div className="text-xs space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">
                {selectedUser.fullName ||
                  `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() ||
                  selectedUser.email}
              </div>
              <div className="text-slate-400 font-mono">{selectedUser.email}</div>
            </div>

            {/* Role dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                System Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="CITIZEN">CITIZEN</option>
                <option value="OFFICER">OFFICER</option>
                <option value="DEPARTMENT_ADMIN">DEPARTMENT_ADMIN</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
              </select>
            </div>

            {/* Department dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department Assignment
              </label>
              <select
                value={newDeptId}
                onChange={(e) => setNewDeptId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- No Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Done
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (newRole !== selectedUser.role) {
                    await updateRoleMutation.mutateAsync();
                  }
                  if (
                    newDeptId &&
                    newDeptId !== (selectedUser.departmentId || selectedUser.department?.id)
                  ) {
                    await assignDeptMutation.mutateAsync();
                  }
                }}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
