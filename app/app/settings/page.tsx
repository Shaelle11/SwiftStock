'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'account', name: 'Account', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔐' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50 border-r border-gray-200">
                <nav className="p-4 space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3 text-lg">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-8">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                    <form className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            defaultValue={user.firstName}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            defaultValue={user.lastName}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Account Type</h3>
                        <p className="text-gray-600 mb-4">Your account type determines the features available to you.</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {user.userType?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Danger Zone</h3>
                        <p className="text-gray-600 mb-4">Permanently delete your account and all associated data.</p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
                        <p className="text-gray-600 mb-4">Update your password to keep your account secure.</p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notifications</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Email Preferences</h3>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-3" />
                            <span className="text-gray-700">Order updates</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-3" />
                            <span className="text-gray-700">Marketing emails</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-3" />
                            <span className="text-gray-700">Security alerts</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}