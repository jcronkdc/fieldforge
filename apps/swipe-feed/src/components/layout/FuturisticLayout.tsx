import React from 'react';
import { Session } from '@supabase/supabase-js';
import { MainLayout } from './MainLayout';

interface FuturisticLayoutProps {
  session: Session;
}

export const FuturisticLayout: React.FC<FuturisticLayoutProps> = ({ session }) => {
  return <MainLayout session={session} />;
};
