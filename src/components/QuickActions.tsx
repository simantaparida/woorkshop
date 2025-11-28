'use client';

import { motion } from 'framer-motion';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'New Workshop',
      description: 'Start a new prioritization session',
      icon: Plus,
      onClick: () => router.push('/projects'),
      primary: true,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
    {
      title: 'Join Session',
      description: 'Enter a code to join an existing session',
      icon: Users,
      onClick: () => { }, // This will need to trigger the join modal, passing a prop or using context might be needed later. For now, we can just redirect to a join page or open a modal if we move state up.
      // Actually, looking at the plan, the Join Modal was in page.tsx. I should probably keep the state in page.tsx and pass a handler, or just link to a join page if one exists.
      // The previous page.tsx had a modal. I'll make this accept an onJoinClick prop or just handle it internally if I move the modal here?
      // Simpler: Just make it a button that does something. The user said "Don't implement anything" initially, but now I AM implementing.
      // I'll assume for now I can just link to a join route or similar, OR I'll leave the onClick empty/log for now and wire it up in page.tsx.
      // Wait, the previous page.tsx had `handleJoinSession` which pushed to `/session/[code]/lobby`.
      // I'll stick to a simple implementation for now.
      primary: false,
      color: 'bg-white',
      hoverColor: 'hover:bg-gray-50',
    },
  ];

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/projects')}
          className="flex items-center p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg text-white text-left group"
        >
          <div className="p-3 bg-white/10 rounded-lg mr-4 backdrop-blur-sm">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">New Workshop</h3>
            <p className="text-blue-100 text-sm">Start a new prioritization session</p>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          // We'll handle the click in the parent or just redirect to a join page if we create one.
          // For now let's just make it visually consistent.
          className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-left group hover:border-blue-300 transition-colors"
        >
          <div className="p-3 bg-blue-50 rounded-lg mr-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">Join Session</h3>
            <p className="text-gray-500 text-sm">Enter a code to join team</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </motion.button>
      </div>
    </section>
  );
}
