'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { getOrganization, addMember, type AddMemberInput } from '@/lib/organization';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, RefreshCw } from 'lucide-react';

const addMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'STAFF', 'RIDER']).default('STAFF'),
  whatsappNumber: z.string().optional(),
});

type AddMemberForm = z.infer<typeof addMemberSchema>;

export default function TeamPage() {
  const { organization, setOrganization } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      role: 'STAFF',
    },
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const org = await getOrganization();
      setOrganization(org as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AddMemberForm) => {
    try {
      setError(null);
      setSuccess(null);
      await addMember(data);
      setSuccess('Member added successfully!');
      reset();
      setShowAddForm(false);
      await loadOrganization();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization members and their roles
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadOrganization}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Add Team Member</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  {...register('role')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                >
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                  <option value="RIDER">Rider</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">
                  WhatsApp Number
                </label>
                <input
                  {...register('whatsappNumber')}
                  type="tel"
                  placeholder="+254700000000"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Add Member</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Organization Members</h2>
          {organization?._count && (
            <p className="mt-1 text-sm text-gray-600">
              {organization._count.members} member{organization._count.members !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="divide-y">
          {organization?.members && organization.members.length > 0 ? (
            organization.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    {member.role}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No members found. Add your first team member above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

