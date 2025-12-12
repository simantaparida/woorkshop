'use client';

import { Check } from 'lucide-react';

interface SessionTimelineProps {
    currentStep: number;
    size?: 'default' | 'compact';
}

export function SessionTimeline({ currentStep, size = 'default' }: SessionTimelineProps) {
    const steps = [
        { id: 1, label: 'Setup' },
        { id: 2, label: 'Input' },
        { id: 3, label: 'Review' },
        { id: 4, label: 'Finalize' },
        { id: 5, label: 'Complete' },
    ];

    const sizeStyles = {
        default: {
            circle: 'w-10 h-10',
            icon: 'w-5 h-5',
            text: 'text-sm',
            connector: 'w-12 sm:w-16',
            connectorHeight: 'h-0.5',
            connectorMargin: 'mx-2',
            labelTop: 'top-12',
            containerMargin: 'mb-12',
        },
        compact: {
            circle: 'w-[22px] h-[22px]',
            icon: 'w-3 h-3',
            text: 'text-xs',
            connector: 'w-8 sm:w-12',
            connectorHeight: 'h-[1.5px]',
            connectorMargin: 'mx-1',
            labelTop: 'top-8',
            containerMargin: 'mb-8',
        }
    };

    const styles = sizeStyles[size];

    return (
        <div className={`flex items-center justify-center w-full ${styles.containerMargin}`}>
            <div className="flex items-center relative z-10">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={`${styles.circle} rounded-full flex items-center justify-center ${styles.text} font-bold transition-all duration-300 border-2 ${isActive
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                        : isCompleted
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-white text-gray-400 border-gray-200'
                                        }`}
                                >
                                    {isCompleted ? <Check className={styles.icon} /> : step.id}
                                </div>
                                <span
                                    className={`absolute ${styles.labelTop} ${styles.text} font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {!isLast && (
                                <div className={`${styles.connector} ${styles.connectorHeight} ${styles.connectorMargin} transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
