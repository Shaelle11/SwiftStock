import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  backgroundColor?: string;
}

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  icon, 
  backgroundColor = 'from-blue-50 to-indigo-50' 
}: AuthLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundColor} flex flex-col`}>
      <Header showAuth={false} />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              {icon}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}