'use client';

import { Check } from 'lucide-react';

interface SessionTimelineProps {
    currentStep: number;
}

export function SessionTimeline({ currentStep }: SessionTimelineProps) {
    const steps = [
        { id: 1, label: 'Setup' },
        { id: 2, label: 'Input' },
        { id: 3, label: 'Review' },
        { id: 4, label: 'Finalize' },
        { id: 5, label: 'Complete' },
    ];

    return (
        <div className="flex items-center justify-center w-full mb-12">
            <div className="flex items-center relative z-10">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${isActive
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                        : isCompleted
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-white text-gray-400 border-gray-200'
                                        }`}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                                </div>
                                <span
                                    className={`absolute top-12 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {!isLast && (
                                <div className={`w-12 sm:w-16 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
