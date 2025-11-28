'use client';

import { motion } from 'framer-motion';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickActionsProps {
  onJoinSession: () => void;
}

export function QuickActions({ onJoinSession }: QuickActionsProps) {
  const router = useRouter();

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/projects')}
          className="flex items-center p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-200/50 text-white text-left group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

          <div className="p-3 bg-white/20 rounded-lg mr-4 backdrop-blur-sm relative z-10">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="font-bold text-lg">New Workshop</h3>
            <p className="text-blue-100 text-sm mt-1">Start a new prioritization session</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onJoinSession}
          className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-left group hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="p-3 bg-blue-50 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">Join Session</h3>
            <p className="text-gray-500 text-sm mt-1">Enter a code to join team</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </motion.button>
      </div>
    </section>
  );
}
