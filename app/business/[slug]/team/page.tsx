'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';

export default function BusinessTeam() {
  const { user, token } = useAuth();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const fetchBusinessAndTeam = async () => {
    if (!token || !slug) {
      setLoading(false);
      return;
    }

    try {
      // First get the business by slug
      const businessResponse = await fetch('/api/stores?owner=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        const currentBusiness = businessData.stores?.find((store: any) => store.slug === slug);
        
        if (currentBusiness) {
          setBusiness(currentBusiness);
          
          // TODO: Fetch team members when team API is available
          // For now, we'll show a placeholder
          setTeamMembers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user || !slug) return;
    fetchBusinessAndTeam();
  }, [token, user, slug]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="page-title">Team & Staff</h1>
        <p className="text-gray-600 text-sm">Manage your team members and their permissions</p>
        {business && <p className="text-sm text-gray-500">{business.name}</p>}
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="empty-state-title">Team Management</div>
          <p className="empty-state-description">Team management features coming soon. You'll be able to invite staff members, set roles and permissions, and manage your team from here.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Invite Team Member
            </button>
            <button className="btn btn-secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Roles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}