'use client';

import { Check } from 'lucide-react';

interface SessionTimelineProps {
    currentStep: number;
}

export function SessionTimeline({ currentStep }: SessionTimelineProps) {
    const steps = [
        { id: 1, label: 'Define' },
        { id: 2, label: 'Input' },
        { id: 3, label: 'Review' },
        { id: 4, label: 'Consensus' },
    ];

    return (
        <div className="flex items-center justify-center w-full mb-8">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isActive
                                            ? 'bg-blue-600 text-white ring-4 ring-blue-50'
                                            : isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                                </div>
                                <span
                                    className={`absolute top-10 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {!isLast && (
                                <div className={`w-16 sm:w-24 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
