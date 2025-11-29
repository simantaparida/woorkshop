'use client';

import { AppLayout } from '@/components/AppLayout';
import { ToolsCatalog } from '@/components/ToolsCatalog';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Target, Users } from 'lucide-react';
import Link from 'next/link';

export default function WorkshopsPage() {
    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Premium Templates</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                                    Facilitate World-Class Workshops
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    Choose from our curated collection of proven workshop templates.
                                    Whether you need to align stakeholders, prioritize features, or frame complex problems,
                                    we have a structured flow for you.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button
                                        size="lg"
                                        onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Browse Templates
                                    </Button>
                                    <Link href="/projects/new">
                                        <Button variant="secondary" size="lg">
                                            Start from Scratch
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <Feature
                            icon={Zap}
                            title="Ready in Seconds"
                            description="Launch a fully configured workspace instantly. No setup required."
                        />
                        <Feature
                            icon={Target}
                            title="Proven Methodologies"
                            description="Built on industry-standard frameworks like RICE, MoSCoW, and Design Sprints."
                        />
                        <Feature
                            icon={Users}
                            title="Collaborative by Design"
                            description="Engage your team with real-time voting, commenting, and results."
                        />
                    </div>

                    {/* Templates Section */}
                    <div id="templates" className="scroll-mt-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Workshop Templates</h2>
                                <p className="text-gray-600 mt-1">Select a template to start your session</p>
                            </div>
                            {/* Categories could go here if we want tabs */}
                        </div>

                        <ToolsCatalog layout="grid" />
                    </div>

                    {/* CTA Section */}
                    <div className="mt-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl font-bold mb-4">Ready to lead better meetings?</h2>
                            <p className="text-blue-100 text-lg mb-8">
                                Stop wasting time in unstructured discussions. Use our tools to drive decisions and get alignment faster.
                            </p>
                            <Link href="/projects/new">
                                <Button
                                    className="bg-white text-blue-600 hover:bg-blue-50 border-transparent"
                                    size="lg"
                                >
                                    Create Custom Session
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-20 -mb-20 w-60 h-60 bg-blue-500/20 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Feature({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
